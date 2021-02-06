<?php

error_reporting(-1); //Rasmus Lerdorf said to use this
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
//mb_internal_encoding('UTF-8');
//mb_http_output('UTF-8');
gc_enable(); //enables Garbage Collector
/*IMPORTANT - after each include of external file get the memory allocated by OS
 with memory_get_peak_usage(true) to get correct memory usage*/

header("Content-type: text/plain");

// Simple IP filtering, not hacker-resistant
//$whitelist = array("127.0.0.1", "192.168.100.3", "192.168.0.102"); // list of allowed IPs
/*if(!in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
  echo $_SERVER['REMOTE_ADDR'] . " - This IP address is banned from accessing this service";
  exit();
}*/

//global vars
$phpVersionNumber = PHP_VERSION_ID;
$phpVersionType   = PHP_INT_SIZE * 8 . "bit";

$action = $_POST['action'];

// Open database
$productsColumns            = "name TEXT, number TEXT, category TEXT, quantity INTEGER, contractor TEXT, price REAL, info TEXT, prodlinks TEXT, pictures BLOB";
//$productsColumnsNoDataType  = "name, number, category, quantity, contractor, price, info, prodlinks, pictures";
$productsColumnsNoDataType  = "name, number, quantity, contractor, price, pictures";
$salesColumns               = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER, soldin TEXT";
$salesColumnsNoDataType     = "date, number, itemdescription, quantity, soldin";
$restocksColumns            = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER";
$restocksColumnsNoDataType  = "date, number, itemdescription, quantity";
$messagesColumns            = "date TEXT, user TEXT, message TEXT, status INTEGER";
$messagesColumnsNoDataType  = "date, user, message, status";
$banlistColumns             = "customernames TEXT, customerphonenumber TEXT, customeraddress TEXT, customerorderdate TEXT, wherewasordered TEXT";
$banlistNoDataType          = "customernames, customerphonenumber, customeraddress, customerorderdate, wherewasordered";
$usersColumns               = "username TEXT, password TEXT";
$usersNoDataType            = "username, password";
$db = new PDO('sqlite:sics.db');
//PHP bug: if you don't specify PDO::PARAM_INT for INT values, PDO may enclose the argument in quotes. This can mess up some MySQL queries that don't expect integers to be quoted.
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_PERSISTENT, false);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulated prepares to prevent injection, see http://stackoverflow.com/a/12202218/1196983
$db->exec("CREATE TABLE IF NOT EXISTS `products`({$productsColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `sales`(${salesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `restocks`(${restocksColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `messages`(${messagesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `customerbanlist`(${banlistColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `users`(${usersColumns})");


//Peak memory usage for output, see http://stackoverflow.com/a/2510468/1196983
function getMemoryUsageUnits($bytes) {
  if ($bytes > 0) {
    $base   = log($bytes) / log(1024);
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
        //$category   = $_POST['category'];
        $quantity   = $_POST['quantity'];
        $contractor = $_POST['contractor'];
        $price      = $_POST['price'];
        //$info       = $_POST['info'];
        //$prodlinks  = $_POST['prodlinks'];
        $fhandler   = file_get_contents($_FILES['pictures']['tmp_name']);
             
        $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$productsColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $name);
        $result->bindValue(2, $number);
        //$result->bindValue(3, $category);
        $result->bindValue(3, $quantity);
        $result->bindValue(4, $contractor);
        $result->bindValue(5, $price);
        //$result->bindValue(7, $info);
        //$result->bindValue(8, $prodlinks);
        $result->bindValue(6, $fhandler, PDO::PARAM_LOB);
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

      $searchNumber = $_POST['number'];
      
      //$result = $db->prepare("SELECT name, number, category, quantity, contractor, info, prodlinks, price, pictures FROM {$_POST['tName']} WHERE number=?");
      $result = $db->prepare("SELECT name, number, quantity, contractor, price, pictures FROM {$_POST['tName']} WHERE number=?");
      $result->execute(array($searchNumber));
      $result->bindColumn(1, $name);
      $result->bindColumn(2, $number);
      //$result->bindColumn(3, $category);
      $result->bindColumn(3, $quantity);
      $result->bindColumn(4, $contractor);
      //$result->bindColumn(6, $info);
      //$result->bindColumn(7, $prodlinks);
      $result->bindColumn(5, $price);
      $result->bindColumn(6, $lob);
      
      $output = [];
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        $output [] = array("Name" => $name);
        $output [] = array("Number" => $number);
        //$output [] = array("Category" => $category);
        $output [] = array("Quantity in shop" => $quantity);
        $output [] = array("Contractor" => $contractor);
        $output [] = array("Price" => $price);
        //$output [] = array("Info" => $info);
        //$output [] = array("Product links" => $prodlinks);
        $output [] = array("Picture" => "data:image/jpg;base64,"  . base64_encode($lob));
        echo json_encode($output);
      } else {
        echo json_encode(array("No product found!"));
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
			
			usleep(100);
			
			$result = $db->prepare("SELECT name FROM products WHERE number=?");
      $result->execute(array($sellNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        $itemName = $name;
      }
      
			usleep(100);
      
      $actionDate = date('d M Y H-i-s');
			
      $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$salesColumnsNoDataType}) VALUES (?, ?, ?, ?, ?)");
      $result->bindValue(1, $actionDate);
      $result->bindValue(2, $sellNumber);
			$result->bindValue(3, $itemName);
      $result->bindValue(4, $sellQuantity);
      $result->bindValue(5, $soldIn);
      $result->execute();
      
      $fileName = $_SERVER['DOCUMENT_ROOT'] . "/" . date('d M Y') . ".txt";
      if (!is_file($fileName)) {
        $newFile = fopen($fileName, 'w');
        fclose($newFile);
        chown($fileName, 'automd');
        chgrp($fileName, 'www-data');
        //chmod($fileName, 0664);
        chmod($fileName, 0777);
      }
      $fileLine = $actionDate . " | " . $sellNumber . " | " . $itemName . " | " . $sellQuantity . " | " . $soldIn . PHP_EOL;
      file_put_contents($fileName, $fileLine, FILE_APPEND);
      
      echo "The given qty of a product was succesfully marked as sold!";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function checkSales() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      $date = "'%" . date("d M Y", strtotime($_POST['soldproductsdate'])) . "%'";

			$result = $db->prepare("SELECT number, itemdescription, quantity, soldin FROM sales WHERE date LIKE " . $date);
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $output[$i] = array($product['number'], $product['itemdescription'], $product['quantity'], $product['soldin']);
          $i++;
        }
        //echo json_encode(count($result));
        echo json_encode($output);
      } else {
        echo json_encode(0);
      }

      //echo "The given qty of a product was succesfully marked as sold!";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function restockProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $restocksColumnsNoDataType;

      $restockNumber    = $_POST['restocknumber'];
      $restockQuantity  = $_POST['restockquantity'];
      
      $result = $db->prepare("SELECT name FROM products WHERE number=?");
      $result->execute(array($restockNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        $itemName = $name;
      }
      
      $result = $db->prepare("UPDATE products SET quantity=quantity+{$_POST['restockquantity']} WHERE number=?");
      $result->bindValue(1, $restockNumber);
      //$result->bindValue(1, date('d M Y H-i-s'));
      
      $result->execute();
      
      $actionDate = date('d M Y H-i-s');
			
      $result = $db->prepare("INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES (?, ?, ?, ?)");
      $result->bindValue(1, $actionDate);
      $result->bindValue(2, $restockNumber);
			$result->bindValue(3, $itemName);
      $result->bindValue(4, $restockQuantity);
      $result->execute();
      
      echo "The product's quantity was succesfully updated!";
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
          $output[$i] = array($product['number'], $product['name'], null, $product['contractor']);
          
          if ($product['quantity'] < 2) {
            $output[$i][2] = "_LESS THAN 2 (currently {$product['quantity']} qty)";
          }
          
          if ($product['info'] === null) {
            $output[$i][2] .= "_NOINFO";
          }
          
          if ($product['pictures'] === null) {
            $output[$i][2] .= "_NOPICTURES";
          }
          
          $i++;
        }
        //echo json_encode(count($result));
        echo json_encode($output);
      } else {
        echo json_encode(0);
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
          $output [] = array($message['date'], $message['user'], $message['message'], $message['status']);
        }

        echo json_encode($output);
      } else {
        echo json_encode(0);
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function sendMessage() {
  ;
}

// Our main loop
switch ($_POST['action']) {
  case "new"            : addProduct();     break; // Add item to database
  case "check"          : checkProduct();   break; // Check if an item is in the database
  case "search"         : searchProduct();  break; // Search for item in the database
  case "sell"           : sellProduct();    break; // Sell an item and exclude it from the database
  case "sales"          : checkSales();   break; // Show sales per a given date
  case "restock"        : restockProduct(); break; // Restock an item
  case "searchcustomer" : searchCustomer(); break; // Check if the customer is marked as dishonest ie not picking their order, not paying the shipping fee for returning or breaking the products
  case "bancustomer"    : banCustomer();    break; // Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
  case "checkissues"    : checkIssues();    break; // Check for product issues
  case "checkmessages"  : checkMessages();  break; // Check for important messages or tasks
  case "sendmessage"    : sendMessage();    break; // Send important message or task
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
