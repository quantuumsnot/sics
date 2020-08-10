<?php

error_reporting(-1); //Rasmus Lerdorf said to use this
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
gc_enable(); //enables Garbage Collector
/*IMPORTANT - after each include of external file get the memory allocated by OS
 with memory_get_peak_usage(true) to get correct memory usage*/

header("Content-type: text/plain");

// Simple IP filtering, not hacker-resistant
$whitelist = array("127.0.0.1", "192.168.100.3"); // list of allowed IPs
if(!in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
  echo $_SERVER['REMOTE_ADDR'];
  exit("This IP address is banned from accessing this service");
}

//global vars
$phpVersionNumber = PHP_VERSION_ID;
$phpVersionType = PHP_INT_SIZE * 8 . "bit";

$action = $_POST['action'];

// Open database
$productsColumns = "name TEXT, number TEXT, category TEXT, quantity TEXT, available TEXT, price TEXT, info TEXT, pictures BLOB";
$productsColumnsNoDataType = "name, number, category, quantity, available, price, info, pictures";
$salesColumns = "date TEXT, number TEXT, quantity TEXT, soldin TEXT";
$salesColumnsNoDataType = "date, number, quantity, soldin";
$messagesColumns = "date TEXT, user TEXT, message TEXT, status TEXT";
$messagesColumnsNoDataType = "date, user, message, status";
$banlistColumns = "customernames TEXT, customerphonenumber TEXT, customeraddress TEXT, customerorderdate TEXT, wherewasordered TEXT";
$banlistNoDataType = "customernames, customerphonenumber, customeraddress, customerorderdate, wherewasordered";
$db = new PDO('sqlite:sics.db');
//PHP bug: if you don't specify PDO::PARAM_INT for INT values, PDO may enclose the argument in quotes. This can mess up some MySQL queries that don't expect integers to be quoted.
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_PERSISTENT, false);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulated prepares to prevent injection, see http://stackoverflow.com/a/12202218/1196983
$db->exec("CREATE TABLE IF NOT EXISTS `products`({$productsColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `sales`(${salesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `messages`(${messagesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `customerbanlist`(${banlistColumns})");


//Peak memory usage for output, see http://stackoverflow.com/a/2510468/1196983
function getMemoryUsageUnits($bytes) {
  if ($bytes > 0) {
    $base = log($bytes) / log(1024);
    $suffix = array("", "KB", "MB", "GB", "TB")[(int)floor($base)];
    return number_format(round(pow(1024, $base - floor($base)), 3), 3)  . " {$suffix}";
  } else return 0;
}

function addProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $productsColumnsNoDataType;

      $number     = $_POST['number'];
      
      $result = $db->prepare("SELECT * FROM {$_POST['tName']} WHERE number=?");
      $result->execute(array($number));
      $result->bindColumn(1, $number);
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) === 0) {
        $name       = $_POST['name'];
        $category   = $_POST['category'];
        $quantity   = $_POST['quantity'];
        $available  = $_POST['available'];
        $price      = $_POST['price'];
        $info       = $_POST['info'];
        $fhandler   = file_get_contents($_FILES['pictures']['tmp_name']);
             
        $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$productsColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $name);
        $result->bindValue(2, $number);
        $result->bindValue(3, $category);
        $result->bindValue(4, $quantity);
        $result->bindValue(5, $available);
        $result->bindValue(6, $price);
        $result->bindValue(7, $info);
        $result->bindValue(8, $fhandler, PDO::PARAM_LOB);
        $result->execute();
        
        echo "The product was succesfully added!";
      } else {
        echo "This product is already in the database!";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function searchProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $searchNumber = $_POST['searchnumber'];
      
      $result = $db->prepare("SELECT category, quantity, available, info, price, pictures FROM {$_POST['tName']} WHERE number=?");
      $result->execute(array($searchNumber));
      $result->bindColumn(1, $category);
      $result->bindColumn(2, $quantity);
      $result->bindColumn(3, $available);
      $result->bindColumn(4, $info);
      $result->bindColumn(5, $price);
      $result->bindColumn(6, $lob);
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        echo "Category: " . $category . "<br />";
        echo "Quantity in shop: " . $quantity . "<br />";
        echo "Available in warehouse: " . (($available == 1) ? "In stock" : "Out of stock") . "<br />";
        echo "Price: " . $price . " лева". "<hr />";
        echo $info . "<br />";
        echo '<img alt="" src="data:image/jpg;base64,' . base64_encode($lob) . '"/>';
      } else {
        echo "No product found!";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function sellProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $salesColumnsNoDataType;

      $sellNumber = $_POST['sellnumber'];
      $sellQuantity = $_POST['sellquantity'];
      $soldIn = $_POST['soldin'];
      
      $result = $db->prepare("UPDATE products SET quantity=quantity-{$_POST['sellquantity']} WHERE number=?");
      $result->bindValue(1, $sellNumber);
      $result->execute();
      
      $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$salesColumnsNoDataType}) VALUES (?, ?, ?, ?)");
      $result->bindValue(1, date('d M Y H-i-s'));
      $result->bindValue(2, $sellNumber);
      $result->bindValue(3, $sellQuantity);
      $result->bindValue(4, $soldIn);
      $result->execute();
      
      echo "The given qty of a product was succesfully marked as sold!";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function searchCustomer() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $customerphonenumber = $_POST['customerphonenumber'];
      
      $result = $db->prepare("SELECT customernames, customerphonenumber, customeraddress, customerorderdate, wherewasordered FROM {$_POST['tName']} WHERE customerphonenumber=?");
      $result->execute(array($customerphonenumber));
      $result->bindColumn(1, $customernames);
      $result->bindColumn(2, $customerphonenumber);
      $result->bindColumn(3, $customeraddress);
      $result->bindColumn(4, $customerorderdate);
      $result->bindColumn(5, $wherewasordered);
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        echo "Names: " . $customernames . "<br />";
        echo "Phone number: " . $customerphonenumber . "<br />";
        echo "Address: " . $customeraddress . "<br />";
        echo "Order date: " . $customerorderdate . "<hr />";
        echo "Where was ordered: " . $wherewasordered . "<hr />";
      } else {
        echo "The customer was not found in the banlist!";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function banCustomer() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $banlistNoDataType;

      $customernames        = $_POST['bancustomernames'];
      $customerphonenumber  = $_POST['bancustomerphonenumber'];
      $customeraddress      = $_POST['bancustomeraddress'];
      $customerorderdate    = date("d M Y", strtotime($_POST['bancustomerorderdate']));
      $wherewasordered      = $_POST['wherewasordered'];
      
      $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$banlistNoDataType}) VALUES (?, ?, ?, ?, ?)");
      $result->bindValue(1, $customernames);
      $result->bindValue(2, $customerphonenumber);
      $result->bindValue(3, $customeraddress);
      $result->bindValue(4, $customerorderdate);
      $result->bindValue(5, $wherewasordered);
      $result->execute();
      
      echo "The customer was succesfully added to banlist!";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function checkIssues() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      $result = $db->prepare("SELECT * FROM {$_POST['tName']} WHERE quantity < 2 OR info IS NULL OR pictures IS NULL");
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);

      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $output [] = array($product['number'], $product['name']);
          
          if ($product['quantity'] < 2) {
            $output[$i][] = "LESS THAN 2";
          }
          
          if ($product['info'] === null) {
            $output[$i][] = "NOINFO";
          }
          
          if ($product['pictures'] === null) {
            $output[$i][] = "NOPICTURES";
          }
          $i++;
        }
        //echo json_encode(count($result));
        echo json_encode($output);
      } else {
        echo "";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function checkMessages() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      $result = $db->prepare("SELECT * FROM {$_POST['tName']} WHERE status == 0");
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);

      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $message) {
          $output [] = array($message['user'], $message['message']);
        }

        echo json_encode($output);
      } else {
        echo "";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function sendMessage() {
  ;
}

// Add item to database
if ($_POST['action'] === "new") {
  addProduct();
}

// Search for item in the database
if ($_POST['action'] === "search") {
  searchProduct();
}

// Sell an item and exclude it from the database
if ($_POST['action'] === "sell") {
  sellProduct();
}

// Check if the customer is marked as dishonest ie not picking their order, not paying the shipping fee for returning or breaking the products
if ($_POST['action'] === "searchcustomer") {
  searchCustomer();
}

// Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
if ($_POST['action'] === "bancustomer") {
  banCustomer();
}

// Check for product issues
if ($_POST['action'] === "checkissues") {
  checkIssues();
}

// Check for important messages or tasks
if ($_POST['action'] === "checkmessages") {
  checkMessages();
}

// Send important message or task
if ($_POST['action'] === "sendmessage") {
  sendMessage();
}

// Some script performance metrics
//$pageStart = microtime(true);

/*$div = str_ireplace('{{content}}', $tableResults, $div);
echo $tempDiv . "<br />";*/

//show which web-server you're using
//echo $webserver = isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : phpversion();

/*echo "<p style='text-align: center'>Webserver: PHP {$webserver} ... PHP Version: " . phpversion() . "<br />
Report table generated for " . number_format(microtime(true) - $pageStart, 3) . " seconds on " . date('d M Y @ H:i:s');*/

exit();

?>
