<?php

error_reporting(-1); //Rasmus Lerdorf said to use this
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
gc_enable(); //enables Garbage Collector
/*IMPORTANT - after each include of external file get the memory allocated by OS
 with memory_get_peak_usage(true) to get correct memory usage*/

//try { }
//catch(Exception $e) { echo 'Message: ' . $e->getMessage(); }

//global vars
$phpVersionNumber = PHP_VERSION_ID;
$phpVersionType = PHP_INT_SIZE * 8 . "bit";
//$div = "<div class='center'>{{content}}</div>";

//Peak memory usage for output, see http://stackoverflow.com/a/2510468/1196983
function getMemoryUsageUnits($bytes) {
  if ($bytes > 0) {
    $base = log($bytes) / log(1024);
    $suffix = array("", "KB", "MB", "GB", "TB")[(int)floor($base)];
    return number_format(round(pow(1024, $base - floor($base)), 3), 3)  . " {$suffix}";
  } else return 0;
}

//save test results to database
try {
  $columns = "name TEXT, number TEXT, category TEXT, quantity TEXT, available TEXT, pictures BLOB";
  $pdo = new PDO('sqlite:sics.db');
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_PERSISTENT, false);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulated prepares to prevent injection, see http://stackoverflow.com/a/12202218/1196983
  //$statement = $pdo->query("SELECT some_field FROM some_table");
  $pdo->exec("CREATE TABLE IF NOT EXISTS {$_POST['tName'])}({$columns})");
  $pdo = $pdo->prepare("INSERT INTO {$_POST['tName']} (name, number, category, quantity, available, pictures) values (?, ?, ?, ?, ?, ?)");
  //PHP bug: if you don't specify PDO::PARAM_INT for INT values, PDO may enclose the argument in quotes. This can mess up some MySQL queries that don't expect integers to be quoted.
  $pdo->execute();
  $pdo = null;
  unset($pdo); //close database handler
  //$row = $pdo->fetch(PDO::FETCH_ASSOC);
  //echo "Done!<br />"; //just for testing, leave it commented to stop pollution with echoes
} catch(PDOException $e) { echo $e->getMessage(); $pdo = null; unset($pdo); /*and close database handler*/ }

//$pageStart = microtime(true);

/*$div = str_ireplace('{{content}}', $tableResults, $div);
echo $tempDiv . "<br />";*/

//show which web-server you're using
echo $webserver = isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : phpversion();

/*echo "<p style='text-align: center'>Webserver: PHP {$webserver} ... PHP Version: " . phpversion() . "<br />
Report table generated for " . number_format(microtime(true) - $pageStart, 3) . " seconds on " . date('d M Y @ H:i:s');*/

exit();

?>
