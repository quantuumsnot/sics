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
//$div = "<div class='center'>{{content}}</div>";
$name = $_POST['name'];
$number = $_POST['number'];
$category = $_POST['category'];
$quantity = $_POST['quantity'];
$available = $_POST['available'];
$price = $_POST['price'];
$info = $_POST['info'];

// Open database
$productsColumns = "name TEXT, number TEXT, category TEXT, quantity TEXT, available TEXT, price TEXT, info TEXT";//pictures BLOB";
$productsColumnsNoDataType = "name, number, category, quantity, available, price, info";
$salesColumns = "date TEXT, number TEXT, quantity TEXT";
$salesColumnsNoDataType = "date, number, quantity";
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

// Search for item in the database
//$statement = $pdo->query("SELECT some_field FROM some_table");

// Add item to database
try {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $result = $db->prepare("INSERT INTO {$_POST['tName']} ({$productsColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $result->bindValue(1, $name);
    $result->bindValue(2, $number);
    $result->bindValue(3, $category);
    $result->bindValue(4, $quantity);
    $result->bindValue(5, $available);
    $result->bindValue(6, $price);
    $result->bindValue(7, $info);
    /*$result->bindValue(7, $_POST['pictures']);*/
    $result->execute();
    //$result = null;
    //unset($db, $result); //close database handler
    //$row = $db->fetch(PDO::FETCH_ASSOC);
    //echo "Done!<br />"; //just for testing, leave it commented to stop pollution with echoes
    //print_r($db->errorInfo());
    //header("Location: ../index.html");
    echo "Done! <br />";
  }
} catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }

// Sell item and exclude it from the database
//blabla

//$pageStart = microtime(true);

/*$div = str_ireplace('{{content}}', $tableResults, $div);
echo $tempDiv . "<br />";*/

//show which web-server you're using
//echo $webserver = isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : phpversion();

/*echo "<p style='text-align: center'>Webserver: PHP {$webserver} ... PHP Version: " . phpversion() . "<br />
Report table generated for " . number_format(microtime(true) - $pageStart, 3) . " seconds on " . date('d M Y @ H:i:s');*/

exit();

?>
