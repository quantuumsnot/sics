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

// Open database
$productsColumns            = "number TEXT, name TEXT, category TEXT, quantity INTEGER, contractor TEXT, price REAL, weight REAL, info TEXT, prodlinks TEXT, monitored INTEGER, pictures BLOB";
//$productsColumnsNoDataType  = "number, name, category, quantity, contractor, price, weight, info, prodlinks, monitored, pictures";
$productsColumnsNoDataType  = "number, name, quantity, contractor, price, monitored, pictures";
$salesColumns               = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER, soldin TEXT";
$salesColumnsNoDataType     = "date, number, itemdescription, quantity, soldin";
$restocksColumns            = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER";
$restocksColumnsNoDataType  = "date, number, itemdescription, quantity";
$messagesColumns            = "date TEXT, user TEXT, message TEXT, status INTEGER";
$messagesColumnsNoDataType  = "date, user, message, status";
$banlistColumns             = "customerphonenumber TEXT, customernames TEXT, customeraddress TEXT, trackingnumber TEXT, orderdate TEXT, wherewasordered TEXT";
$banlistNoDataType          = "customerphonenumber, customernames, customeraddress, trackingnumber, orderdate, wherewasordered";
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

// atm log only UPDATE and INSERT queries
function logQuery($queryforsave) {
  $fileName = "logs/" . date('d M Y') . ".txt";
  if (!is_file($fileName)) {
    $newFile = fopen($fileName, 'w');
    fclose($newFile);
  }
  file_put_contents($fileName, $queryforsave, FILE_APPEND);
}

function addProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $productsColumnsNoDataType;

      $number     = $_POST['number'];
      
      $result = $db->prepare("SELECT * FROM products WHERE number=?");
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
             
        $result = $db->prepare("INSERT INTO products ({$productsColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $number);
        $result->bindValue(2, $name);
        //$result->bindValue(3, $category);
        $result->bindValue(3, $quantity);
        $result->bindValue(4, $contractor);
        $result->bindValue(5, $price);
        //$result->bindValue(6, $weight);
        //$result->bindValue(7, $info);
        //$result->bindValue(8, $prodlinks);
        $result->bindValue(6, 1); // automatically set monitored state to ON
        $result->bindValue(7, $fhandler, PDO::PARAM_LOB);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "INSERT INTO products ({$productsColumnsNoDataType}) VALUES ('{$number}', '{$name}', '{$quantity}', '{$contractor}', '{$price}', 1, NULL)" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        // Save the picture in the productpics folder as a future-proof backup
        $imageFileType = strtolower(pathinfo(basename($_FILES['pictures']['name']), PATHINFO_EXTENSION));
        $target_file = "productpics/" . $number . "." . $imageFileType;
        
        // Check if the image file already exists then make a backup copy with the current datetime
        if (file_exists($target_file)) {
          //rename($target_file, "productpics/" . $number . "_" . date('Y M D H-i-s') . "." . $imageFileType); // not safe when there are no rights to write files
          copy($target_file, "productpics/" . $number . "_bak_" . date('Y M D H-i-s') . "." . $imageFileType);
          unlink($target_file);
        }

        // Save the image file to directory as another level of backup
        if (getimagesize($_FILES["pictures"]["tmp_name"]) !== false) {
          if (!file_exists($target_file)) {
            if ($_FILES["pictures"]["size"] > 1) {
              if (in_array($imageFileType, array("jpg", "jpeg", "png", "gif", "bmp", "webp"))) {
                move_uploaded_file($_FILES["pictures"]["tmp_name"], $target_file);
              }
            }
          }
        }
        
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
      
      //$result = $db->prepare("SELECT number, name, category, quantity, contractor, price, weight, info, prodlinks, monitored, pictures FROM products WHERE number=?");
      $result = $db->prepare("SELECT number, name, quantity, contractor, price, monitored, pictures FROM products WHERE number=?");
      $result->execute(array($searchNumber));
      $result->bindColumn(1, $number);
      $result->bindColumn(2, $name);
      //$result->bindColumn(3, $category);
      $result->bindColumn(3, $quantity);
      $result->bindColumn(4, $contractor);
      $result->bindColumn(5, $price);
      //$result->bindColumn(6, $weight);
      //$result->bindColumn(7, $info);
      //$result->bindColumn(8, $prodlinks);
      $result->bindColumn(6, $monitored);
      $result->bindColumn(7, $lob);
      
      $output = [];
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        $output [] = array("Name" => $name);
        $output [] = array("Number" => $number);
        //$output [] = array("Category" => $category);
        $output [] = array("Quantity in shop" => $quantity);
        $output [] = array("Contractor" => $contractor);
        $output [] = array("Price" => $price);
        //$output [] = array("Weight" => $weight);
        //$output [] = array("Info" => $info);
        //$output [] = array("Product links" => $prodlinks);
        $output [] = array("Monitored" => $monitored);
        // Detect image filetype and send it properly to the browser
        $finfo    = new finfo(FILEINFO_MIME);
        $mimeType = $finfo->buffer($lob);
        $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
        $output [] = array("Picture" => "data:" . $mimeType . ";base64,"  . base64_encode($lob));
        //$output [] = array("Picture" => "data:" . $imgType . ";base64,"  . base64_encode($lob));
        echo json_encode($output);
      } else {
        echo json_encode(array("No product found!"));
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result, $finfo, $mimeType); /*and close database handler*/ }
}

function setProductMonitoring() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $prodNumber = $_POST['number'];
      $Monitored  = $_POST['Monitored'];
      
      $result = $db->prepare("UPDATE products SET monitored={$Monitored} WHERE number=?");
      $result->bindValue(1, $prodNumber);
      $result->execute();
  
      // Start logging the query
      $queryforsave = "UPDATE products SET monitored={$Monitored} WHERE number={$prodNumber}" . PHP_EOL;
      logQuery($queryforsave);
      // End logging the query
      
      echo $Monitored;
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
			
			$result = $db->prepare("SELECT name FROM products WHERE number=?");
      $result->execute(array($sellNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        $result = $db->prepare("UPDATE products SET quantity=quantity-{$_POST['sellquantity']} WHERE number=?");
        $result->bindValue(1, $sellNumber);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "UPDATE products SET quantity=quantity-{$_POST['sellquantity']} WHERE number={$sellNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        $itemName = $name;
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
        
        $result = $db->prepare("INSERT INTO sales ({$salesColumnsNoDataType}) VALUES (?, ?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $sellNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $sellQuantity);
        $result->bindValue(5, $soldIn);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "INSERT INTO sales ({$salesColumnsNoDataType}) VALUES ('{$actionDate}', '{$sellNumber}', '{$itemName}', '{$sellQuantity}', '{$soldIn}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        $fileName = $_SERVER['DOCUMENT_ROOT'] . "/sales/" . date('d M Y') . ".txt";
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
        
        echo "The product was succesfully marked as sold!";
      } else {
        echo "The product wasn't found in the database!";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function checkSales() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      //$date = "'%" . date("d M Y", strtotime($_POST['soldproductsdate'])) . "%'";
      $dateFrom = date("Y-m-d", strtotime($_POST['soldproductsfrom'])); //ISO-8601 format for SQLite without Hours Mins Secs 
      $dateTo   = date("Y-m-d", strtotime($_POST['soldproductsto'])); //ISO-8601 format for SQLite without Hours Mins Secs
      $market   = $_POST['market'];
      
      if ($market === "all" || $market === "today") {
        $market = '';
      } else {
        $market = "soldin=('{$market}') AND ";
      }

      $result = $db->prepare("SELECT date, number, itemdescription, quantity, soldin FROM sales WHERE " . $market . "date BETWEEN date('{$dateFrom}') AND date('{$dateTo}')");
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $output[$i] = array(date("d M Y", strtotime($product['date'])), $product['number'], $product['itemdescription'], $product['quantity'], $product['soldin']);
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
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        $itemName = $name;
        
        $result = $db->prepare("UPDATE products SET quantity=quantity+{$_POST['restockquantity']} WHERE number=?");
        $result->bindValue(1, $restockNumber);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "UPDATE products SET quantity=quantity+{$_POST['restockquantity']} WHERE number={$restockNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
        
        $result = $db->prepare("INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES (?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $restockNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $restockQuantity);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES ('{$actionDate}', '{$restockNumber}', '{$itemName}', '{$restockQuantity}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        echo "The product's quantity was succesfully updated!";
      } else {
        echo "The product wasn't found in the database!";
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function searchCustomer() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $customerphonenumber = $_POST['customerphonenumber'];
      
      $result = $db->prepare("SELECT customerphonenumber, customernames, customeraddress, trackingnumber, orderdate, wherewasordered FROM customerbanlist WHERE customerphonenumber=?");
      $result->execute(array($customerphonenumber));
      $result->bindColumn(1, $phonenumber);
      $result->bindColumn(2, $customernames);
      $result->bindColumn(3, $customeraddress);
      $result->bindColumn(4, $trackingnumber);
      $result->bindColumn(5, $orderdate);
      $result->bindColumn(6, $wherewasordered);
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        echo "Phone number: "       . $phonenumber      . "<br />" . 
             "Names: "              . $customernames    . "<br />" . 
             "Address: "            . $customeraddress  . "<br />" . 
             "Tracking Number: "    . $trackingnumber   . "<br />" . 
             "Order date: "         . $orderdate        . "<hr />" . 
             "Where was ordered: "  . $wherewasordered  . "<hr />";
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

      $customerphonenumber  = $_POST['customerphonenumber'];
      $customernames        = $_POST['customernames'];
      $customeraddress      = $_POST['customeraddress'];
      $trackingnumber       = $_POST['trackingnumber'];
      $orderdate            = date("d M Y", strtotime($_POST['orderdate']));
      $wherewasordered      = $_POST['wherewasordered'];
      
      $result = $db->prepare("INSERT INTO customerbanlist ({$banlistNoDataType}) VALUES (?, ?, ?, ?, ?, ?)");
      $result->bindValue(1, $customerphonenumber);
      $result->bindValue(2, $customernames);
      $result->bindValue(3, $customeraddress);
      $result->bindValue(4, $trackingnumber);
      $result->bindValue(5, $orderdate);
      $result->bindValue(6, $wherewasordered);
      $result->execute();
      
      // Start logging the query
      $queryforsave = "INSERT INTO customerbanlist ({$banlistNoDataType}) VALUES ('{$customerphonenumber}', '{$customernames}', '{$customeraddress}', '{$trackingnumber}', '{$orderdate}', '{$wherewasordered}')" . PHP_EOL;
      logQuery($queryforsave);
      // End logging the query
      
      echo "The customer was succesfully added to banlist!";
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function checkIssues() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      $result = $db->prepare("SELECT * FROM products WHERE monitored = 1 AND quantity < 2");
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);

      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $output[$i] = array($product['number'], $product['name'], null, $product['contractor'], $product['monitored']);
          
          if ($product['quantity'] < 2) {
            $output[$i][2] = "_LESS THAN 2 (currently {$product['quantity']} qty)" . "<br />"; //check product's current qty
          }
          
          /*if ($product['contractor'] === null || $product['contractor'] === "") { //check if product has contractor
            $output[$i][2] .= "_NOCONTRACTOR" . "<br />";
          }*/
          
          /*if ($product['prodlinks'] === null || $product['prodlinks'] === "") { //check if product has additional links
            $output[$i][2] .= "_NOLINKS" . "<br />";
          }*/
          
          /*if ($product['weight'] === null || $product['weight'] === "") { //check if product has weight
            $output[$i][2] .= "_NOWEIGHT" . "<br />";
          }*/
          
          /*if ($product['info'] === null || $product['info'] === "") { //check if product has info
            $output[$i][2] .= "_NOINFO" . "<br />";
          }*/
          
          /*if ($product['pictures'] === null || $product['pictures'] === "") { //check if product has picture
            $output[$i][2] .= "_NOPICTURES" . "<br />";
          }*/
          
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
      
      $result = $db->prepare("SELECT * FROM messages WHERE status == 0");
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
  case "new"            : addProduct();             break; // Add item to database
  case "search"         : searchProduct();          break; // Search for item in the database
  case "setmonitoring"  : setProductMonitoring();   break; // Search for item in the database
  case "sell"           : sellProduct();            break; // Sell an item and exclude it from the database
  case "sales"          : checkSales();             break; // Show sales per a given date
  case "restock"        : restockProduct();         break; // Restock an item
  case "searchcustomer" : searchCustomer();         break; // Check if the customer is marked as dishonest ie not picking their order, not paying the shipping fee for returning or breaking the products
  case "bancustomer"    : banCustomer();            break; // Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
  case "checkissues"    : checkIssues();            break; // Check for product issues
  case "checkmessages"  : checkMessages();          break; // Check for important messages or tasks
  case "sendmessage"    : sendMessage();            break; // Send important message or task
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
