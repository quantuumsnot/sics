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
$db = new PDO('sqlite:sics.db');
//PHP bug: if you don't specify PDO::PARAM_INT for INT values, PDO may enclose the argument in quotes. This can mess up some MySQL queries that don't expect integers to be quoted.
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_PERSISTENT, false);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulated prepares to prevent injection, see http://stackoverflow.com/a/12202218/1196983
$db->exec("CREATE TABLE IF NOT EXISTS {$_POST['tName']}({$productsColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `sales`(${salesColumns})");


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

      $name       = $_POST['name'];
      $number     = $_POST['number'];
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
      //$result = null;
      //unset($db, $result); //close database handler
      //$row = $db->fetch(PDO::FETCH_ASSOC);
      //echo "Done!<br />"; //just for testing, leave it commented to stop pollution with echoes
      //print_r($db->errorInfo());
      //header("Location: ../index.html");
      //fclose($fhandler);
      echo "Done! <br />";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function searchProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $searchNumber = $_POST['searchnumber'];
      
      $result = $db->prepare("SELECT quantity, pictures FROM {$_POST['tName']} WHERE number=?");
      $result->execute(array($searchNumber));
      $result->bindColumn(1, $qty);
      $result->bindColumn(2, $lob);
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        echo "Quantity: " . $qty . "<br />";
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

// Add item to database
if ($_POST['action'] === "new") {
  addProduct();
}

// Search an item in the database
if ($_POST['action'] === "search") {
  searchProduct();
}

// Sell an item and exclude it from the database
if ($_POST['action'] === "sell") {
  sellProduct();
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
