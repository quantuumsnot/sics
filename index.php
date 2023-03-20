<?php

declare(strict_types = 1);

error_reporting(-1); //Rasmus Lerdorf said to use this
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
//ini_set('max_execution_time', 0); //we assume that our scrapper will download the whole Internet so be polite and set the max execution time to Infinite
//mb_internal_encoding('UTF-8');
//mb_http_output('UTF-8');
gc_enable(); //enables Garbage Collector
//gc_disable(); //disables Garbage Collector to improve/test performance
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

$styleCSSHash = hash_file("haval160,4", "style.css"); //haval160,4 seems to be the fastest atm

// Load settings
$ini_array = parse_ini_file("sics.ini", true);
$maintenanceMode = intval($ini_array["main"]["maintenance"]);

// Open database
$productsColumns                = "number TEXT, name TEXT, category TEXT, quantity INTEGER, warehouseqty INTEGER, contractor TEXT, price REAL, weight REAL, info TEXT, prodlinks TEXT, monitored INTEGER, outofstock INTEGER, piclinks TEXT, pictures BLOB";
//$productsColumnsNoDataType    = "number, name, category, quantity, warehouseqty, contractor, price, weight, info, prodlinks, monitored, piclinks, pictures";
$productsColumnsNoDataType      = "number, name, quantity, warehouseqty, contractor, price, monitored, outofstock, pictures";
$salesColumns                   = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER, totalprice TEXT, soldin TEXT";
$salesColumnsNoDataType         = "date, number, itemdescription, quantity, totalprice, soldin";
$restocksColumns                = "date TEXT, number TEXT, itemdescription TEXT, quantity INTEGER, user TEXT, origin TEXT, status INTEGER";
$restocksColumnsNoDataType      = "date, number, itemdescription, quantity, user, origin, status";
$replacementsColumns            = "date TEXT, number TEXT, itemdescription TEXT, user TEXT, quantity INTEGER, replaced INTEGER";
$replacementsColumnsNoDataType  = "date, number, itemdescription, user, quantity, replaced";
$messagesColumns                = "date TEXT, user TEXT, message TEXT, status INTEGER";
$messagesColumnsNoDataType      = "date, user, message, status";
$banlistColumns                 = "customerphonenumber TEXT, customernames TEXT, customeraddress TEXT, trackingnumber TEXT, orderdate TEXT, wherewasordered TEXT";
$banlistNoDataType              = "customerphonenumber, customernames, customeraddress, trackingnumber, orderdate, wherewasordered";
$usersColumns                   = "username TEXT, password TEXT";
$usersNoDataType                = "username, password";
$db = new PDO('sqlite:sics.db');
//PHP bug: if you don't specify PDO::PARAM_INT for INT values, PDO may enclose the argument in quotes. This can mess up some MySQL queries that don't expect integers to be quoted.
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_PERSISTENT, false);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulated prepares to prevent injection, see http://stackoverflow.com/a/12202218/1196983
$db->exec("CREATE TABLE IF NOT EXISTS `products`({$productsColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `sales`({$salesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `restocks`({$restocksColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `replacements`({$replacementsColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `messages`({$messagesColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `customerbanlist`({$banlistColumns})");
$db->exec("CREATE TABLE IF NOT EXISTS `users`({$usersColumns})");


//Peak memory usage for output, see http://stackoverflow.com/a/2510468/1196983
/*function getMemoryUsageUnits($bytes) {
  if ($bytes > 0) {
    $base   = log($bytes) / log(1024);
    $suffix = array("", "KB", "MB", "GB", "TB")[(int)floor($base)];
    return number_format(round(pow(1024, $base - floor($base)), 3), 3)  . " {$suffix}";
  } else return 0;
}*/

// atm log only UPDATE and INSERT queries
function logQuery($queryforsave) {
  $fileName = "logs/" . date('d M Y') . ".txt";
  /*if (!is_file($fileName)) { //fopen is disabled
    $newFile = fopen($fileName, 'w');
    fclose($newFile);
  }*/
  file_put_contents($fileName, $queryforsave, FILE_APPEND);
}

// Create text file for printing written off products from the warehouse
function warehouseReports($queryforsave) {
  $fileName = "warehouse/" . date('d M Y') . ".txt";
  /*if (!is_file($fileName)) { //fopen is disabled
    $newFile = fopen($fileName, 'w');
    fclose($newFile);
  }*/
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
        $warehouseqty = $_POST['warehouseqty'];
        $contractor = $_POST['contractor'];
        $price      = $_POST['price'];
        //$info       = $_POST['info'];
        //$prodlinks  = $_POST['prodlinks'];
        $fhandler   = file_get_contents($_FILES['pictures']['tmp_name']);
             
        $result = $db->prepare("INSERT INTO products ({$productsColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $number);
        $result->bindValue(2, $name);
        //$result->bindValue(3, $category);
        $result->bindValue(3, $quantity);
        $result->bindValue(4, $warehouseqty);
        $result->bindValue(5, $contractor);
        $result->bindValue(6, $price);
        //$result->bindValue(6, $weight);
        //$result->bindValue(7, $info);
        //$result->bindValue(8, $prodlinks);
        $result->bindValue(7, 1); // automatically set monitored state to ON
        $result->bindValue(8, 0); // automatically set product's availability to 'in stock'
        $result->bindValue(9, $fhandler, PDO::PARAM_LOB);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "New product added >> INSERT INTO products ({$productsColumnsNoDataType}) VALUES ('{$number}', '{$name}', '{$quantity}', '{$warehouseqty}', '{$contractor}', '{$price}', 1, 0, NULL)" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        // Save the picture in the productpics folder as a future-proof backup
        $imageFileType = strtolower(pathinfo(basename($_FILES['pictures']['name']), PATHINFO_EXTENSION));
        $target_file = "productpics/" . $number . "." . $imageFileType;
        
        // Check if the image file already exists then make a backup copy with the current datetime
        if (file_exists($target_file)) {
          //rename($target_file, "productpics/" . $number . "_" . date('Y M d H-i-s') . "." . $imageFileType); // not safe when there are no rights to write files
          copy($target_file, "productpics/" . $number . "_bak_" . date('Y M d H-i-s') . "." . $imageFileType);
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
        
        echo 1;
      } else {
        echo 0;
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function changePic() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $salesColumnsNoDataType;

      $number         = $_POST['number'];
      $fhandler       = file_get_contents($_FILES['changepic']['tmp_name']);
      $uplfiletype    = ($_POST['uplfiletype']);
      $uplfiletype    = explode("/", $uplfiletype);
      $uplfiletype    = $uplfiletype[1];
			
			$result = $db->prepare("SELECT * FROM products WHERE number=?");
      $result->execute(array($number)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        $result = $db->prepare("UPDATE products SET pictures=? WHERE number=?");
        $result->bindValue(1, $fhandler, PDO::PARAM_LOB);
        $result->bindValue(2, $number);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Product's picture was changed >> UPDATE products SET pictures=1 WHERE number={$number}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        // Save the picture in the productpics folder as a future-proof backup
        //$imageFileType = strtolower(pathinfo(basename($_FILES['changepic']['name']), PATHINFO_EXTENSION));
        $imageFileType = $uplfiletype;
        $target_file = "productpics/" . $number . "." . $imageFileType;
        
        // Check if the image file already exists then make a backup copy with the current datetime
        if (file_exists($target_file)) {
          //rename($target_file, "productpics/" . $number . "_" . date('Y M d H-i-s') . "." . $imageFileType); // not safe when there are no rights to write files
          copy($target_file, "productpics/" . $number . "_bak_" . date('Y M d H-i-s') . "." . $imageFileType);
          unlink($target_file);
        }

        // Save the image file to directory as another level of backup
        if (getimagesize($_FILES["changepic"]["tmp_name"]) !== false) {
          if (!file_exists($target_file)) {
            if ($_FILES["changepic"]["size"] > 1) {
              if (in_array($imageFileType, array("jpg", "jpeg", "png", "gif", "bmp", "webp"))) {
                move_uploaded_file($_FILES["changepic"]["tmp_name"], $target_file);
              }
            }
          }
        }
        
        echo 1;
      } else {
        echo 0;
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
      $result = $db->prepare("SELECT number, name, quantity, warehouseqty, contractor, price, monitored, outofstock, pictures FROM products WHERE number=?");
      $result->execute(array($searchNumber));
      $result->bindColumn(1, $number);
      $result->bindColumn(2, $name);
      //$result->bindColumn(3, $category);
      $result->bindColumn(3, $quantity);
      $result->bindColumn(4, $warehouseqty);
      $result->bindColumn(5, $contractor);
      $result->bindColumn(6, $price);
      //$result->bindColumn(6, $weight);
      //$result->bindColumn(7, $info);
      //$result->bindColumn(8, $prodlinks);
      $result->bindColumn(7, $monitored);
      $result->bindColumn(8, $outofstock);
      $result->bindColumn(9, $lob);
      
      $output = [];
      
      if (count($result->fetchAll(PDO::FETCH_ASSOC)) > 0) {
        $output [] = array("Name" => $name);
        $output [] = array("Number" => $number);
        //$output [] = array("Category" => $category);
        $output [] = array("Quantity in shop" => $quantity);
        $output [] = array("Warehouse" => $warehouseqty);
        $output [] = array("Contractor" => $contractor);
        $output [] = array("Price" => $price);
        //$output [] = array("Weight" => $weight);
        //$output [] = array("Info" => $info);
        //$output [] = array("Product links" => $prodlinks);
        $output [] = array("Monitored" => $monitored);
        $output [] = array("outofstock" => $outofstock);
        // Detect image filetype and send it properly to the browser
        $finfo    = new finfo(FILEINFO_MIME);
        $mimeType = $finfo->buffer($lob); //PHP 8.1 broke this line, damn it! Deprecated demons everywhere, fixed with adding a picture in the column which was NULL
        $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
        // Checks if file exist physically in the productpics directory and creates it if not
        $imageFileType = explode("/", $mimeType);
        $imageFileType = strtolower($imageFileType[1]);
        $target_file = "productpics/" . $number . "." . $imageFileType;
        if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
          if(!file_exists($target_file)) {
            $imageFileType = "jpg"; // create files with .jpg only extension for brevity
            $target_file = "productpics/" . $number . "." . $imageFileType;
          }
        }
        // Checks if file exist physically in the productpics directory and creates it if not
        if(!file_exists($target_file)) {
          file_put_contents($target_file, $lob);
        }
        //---
        $output [] = array("Picture" => "data:" . $mimeType . ";base64,"  . base64_encode($lob));
        echo json_encode($output);
      } else {
        echo 0;
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result, $finfo, $mimeType); /*and close database handler*/ }
}

function searchWarehouse() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;
      
      $name     = mb_strtolower($_POST['name']);
      
      // Workaround for SQLite ASCII only support for UPPERCASE
      // UNION removes duplicate rows while UNION ALL doesn't
      //$query = "SELECT number, name, info, prodlinks, piclinks, pictures FROM products WHERE name LIKE '%" . $name . "%' UNION
      //          SELECT number, name, info, prodlinks, piclinks, pictures FROM products WHERE name LIKE '%" . mb_strtoupper($name) . "%' UNION 
      //          SELECT number, name, info, prodlinks, piclinks, pictures FROM products WHERE number LIKE '%" . mb_strtoupper($name) . "%' ORDER BY name";
      // shorter variant with OR clause
      $query = "SELECT number, name, warehouseqty, info, prodlinks, piclinks, pictures FROM products WHERE (name LIKE '%" . $name . "%' OR name LIKE '%" . mb_strtoupper($name) . "%') OR (number LIKE '%" . mb_strtoupper($name) . "%')";
      
      $result = $db->prepare($query);
      $result->execute();
      $result->bindColumn(1, $number);
      $result->bindColumn(2, $name);
      $result->bindColumn(3, $warehouseqty);
      $result->bindColumn(4, $info);
      $result->bindColumn(5, $prodlinks);
      $result->bindColumn(6, $piclinks);
      $result->bindColumn(7, $pictures);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $picdata = $product['pictures'];
          $output[$i] = array($product['number'], $product['name'], $product['warehouseqty'], $product['info'], $product['piclinks'], $product['prodlinks']);

          if ($product['info'] === null || $product['info'] === "") { //check if product has info
            $output[$i][2] = "_NOINFO";
          }
          
          if ($product['prodlinks'] === null || $product['prodlinks'] === "") { //check if product has additional links
            $output[$i][3] = "_NOLINKS";
          }
          
          if ($product['piclinks'] === null || $product['piclinks'] === "") { //check if product has piclinks
            //$output[$i][4] = "_NOPICLINKS";
            // temp fix
            $finfo    = new finfo(FILEINFO_MIME);
            $mimeType = $finfo->buffer($picdata);
            $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
            $imageFileType = explode("/", $mimeType);
            $imageFileType = strtolower($imageFileType[1]);
            $target_file = "productpics/" . $product['number'] . "." . $imageFileType;
            
            if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
              if(!file_exists($target_file)) {
                $imageFileType = "jpg"; // create files with .jpg only extension for brevity
                $target_file = "productpics/" . $product['number'] . "." . $imageFileType;
              }
            }
            
            // Checks if file exist physically in the productpics directory and creates it if not
            if(!file_exists($target_file)) {
              file_put_contents($target_file, $picdata);
            }
            
            $output[$i][4] = $target_file;
          }
          
          /*if ($product['pictures'] === null || $product['pictures'] === "") { //check if product has picture
            $output[$i][5] = "_NOPICTURES";
          } else {
            $finfo    = new finfo(FILEINFO_MIME);
            $mimeType = $finfo->buffer($product['pictures']);
            $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
            $product['pictures'] = "data:" . $mimeType . ";base64,"  . base64_encode($product['pictures']);
            $output[$i][5] = $product['pictures'];
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

function itemRemovalFromWarehouse() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $restocksColumnsNoDataType;
      
      $itemNumber = $_POST['number'];
      $qty        = $_POST['remquantity'];
      
      $result = $db->prepare("SELECT name FROM products WHERE number=?");
      $result->execute(array($itemNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        // Auto restock in the store
        $result = $db->prepare("UPDATE products SET quantity=quantity+{$qty} WHERE number=?");
        $result->bindValue(1, $itemNumber);
        $result->execute();
        
        // Auto-write out from warehouse qty
        $result = $db->prepare("UPDATE products SET warehouseqty=warehouseqty-{$qty} WHERE number=?");
        $result->bindValue(1, $itemNumber);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Product was taken from warehouse >> UPDATE products SET quantity=quantity+{$qty} WHERE number={$itemNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        $itemName = $name;
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
        
        $result = $db->prepare("INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES (?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $itemNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $qty);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Product was restocked in the store >> INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES ('{$actionDate}', '{$itemNumber}', '{$itemName}', '{$qty}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        // Generate list of written off products from the warehouse for printing
        $queryforsave = "| " . $itemName . " | " . $qty . " |" . PHP_EOL;
        warehouseReports($queryforsave);

        echo 1; // success
      } else {
        echo 0; // fail
      }
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
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
      $queryforsave = "Product monitoring status was updated >> UPDATE products SET monitored={$Monitored} WHERE number={$prodNumber}" . PHP_EOL;
      logQuery($queryforsave);
      // End logging the query
      
      echo $Monitored;
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function setOutOfStock() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db;

      $prodNumber = $_POST['number'];
      $outOfStock = $_POST['outofstock'];
      
      $result = $db->prepare("UPDATE products SET outofstock={$outOfStock} WHERE number=?");
      $result->bindValue(1, $prodNumber);
      $result->execute();
  
      // Start logging the query
      $queryforsave = "Product status for availability was updated >> UPDATE products SET outofstock={$outOfStock} WHERE number={$prodNumber}" . PHP_EOL;
      logQuery($queryforsave);
      // End logging the query
      
      echo $outOfStock;
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function sellProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $salesColumnsNoDataType;

      $sellNumber   = $_POST['sellnumber'];
      $sellQuantity = $_POST['sellquantity'];
      $soldIn       = $_POST['soldin'];
			
			$result = $db->prepare("SELECT name, price, pictures FROM products WHERE number=?");
      $result->execute(array($sellNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result->bindColumn(2, $price);
      $result->bindColumn(3, $pictures);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        // Get product pic file url
        foreach ($result as $product) {
          $picdata  = $product['pictures'];
          $finfo    = new finfo(FILEINFO_MIME);
          $mimeType = $finfo->buffer($picdata);
          $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
          $imageFileType = explode("/", $mimeType);
          $imageFileType = strtolower($imageFileType[1]);
          $target_file = "productpics/" . $sellNumber . "." . $imageFileType;
          
          if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
            if(!file_exists($target_file)) {
              $imageFileType = "jpg"; // create files with .jpg only extension for brevity
              $target_file = "productpics/" . $sellNumber . "." . $imageFileType;
            }
          }
        }
        
        $result = $db->prepare("UPDATE products SET quantity=quantity-{$_POST['sellquantity']} WHERE number=? AND quantity>0");
        $result->bindValue(1, $sellNumber);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Product was sold in {$soldIn} >> UPDATE products SET quantity=quantity-{$_POST['sellquantity']} WHERE number={$sellNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        $itemName = $name;
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
        
        $totalPrice = $sellQuantity * $price;
        
        $result = $db->prepare("INSERT INTO sales ({$salesColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $sellNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $sellQuantity);
        $result->bindValue(5, $totalPrice);
        $result->bindValue(6, $soldIn);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Sold product was saved in sales >> INSERT INTO sales ({$salesColumnsNoDataType}) VALUES ('{$actionDate}', '{$sellNumber}', '{$itemName}', '{$sellQuantity}', '{$totalPrice}', '{$soldIn}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        $fileName = $_SERVER['DOCUMENT_ROOT'] . "/sales/" . date('d M Y') . ".txt";
        /*if (!is_file($fileName)) { /fopen is disabled
          $newFile = fopen($fileName, 'w');
          fclose($newFile);
          chown($fileName, 'automd');
          chgrp($fileName, 'www-data');
          //chmod($fileName, 0664);
          chmod($fileName, 0777);
        }*/
        $fileLine = $actionDate . " | " . $sellNumber . " | " . $itemName . " | " . $sellQuantity . " | " . $soldIn . PHP_EOL;
        file_put_contents($fileName, $fileLine, FILE_APPEND);
        //chown($fileName, 'automd');
        //chgrp($fileName, 'www-data');
        //chmod($fileName, 0777);
        
        //echo 1;
        $output[0] = 1; // success
        $output[1] = $target_file; // product pic url
      } else {
        $output[0] = 0; //fail
      }
      
      echo json_encode($output);
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
      
      // Check if dateFrom and dateTo are valid dates
      $currentDate = getdate();
      $currentDate = $currentDate["year"] . "-" . $currentDate["mon"] . "-" . $currentDate["mday"];
      $currentDate = date("Y-m-d", strtotime($currentDate));
      if (!isset($dateFrom) || $dateFrom === "") {
        $dateFrom = $currentDate;
      }
      if (!isset($dateTo) || $dateTo === "") {
        $dateTo = $currentDate;
      }
      
      $dateFromCheck  = date_parse($dateFrom);
      $dateToCheck    = date_parse($dateTo);
      if ($dateFromCheck["warning_count"] != 0 && $dateFromCheck["error_count"] != 0 && !empty($dateFromCheck["is_localtime"])) {
        $dateFrom = $dateFromCheck["year"] . "-" . $dateFromCheck["month"] . "-" . $dateFromCheck["day"];
        $dateFrom = date("Y-m-d", strtotime($dateFrom));
      }
      if ($dateToCheck["warning_count"] != 0 && $dateToCheck["error_count"] != 0 && !empty($dateToCheck["is_localtime"])) {
        $dateTo = $dateToCheck["year"] . "-" . $dateToCheck["month"] . "-" . $dateToCheck["day"];
        $dateTo = date("Y-m-d", strtotime($dateTo));
      }
      // End of date validity checking
      
      $market   = $_POST['market'];

      switch ($market){
        case "all":     $market = ''; break;
        case "online":  $market = "soldin != ('store') AND "; break;
        default:        $market = "soldin = ('{$market}') AND ";
      }
      
      $result = $db->prepare("SELECT date, number, itemdescription, quantity, totalprice, soldin FROM sales WHERE " . $market . "date BETWEEN date('{$dateFrom}') AND date('{$dateTo}')");
      $result->execute();
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          $output[$i] = array(date("d M Y", strtotime($product['date'])), $product['number'], $product['itemdescription'], $product['quantity'], $product['totalprice'], $product['soldin']);
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
      $restockType      = $_POST['itemreturned'];
      
      $result = $db->prepare("SELECT name, pictures FROM products WHERE number=?");
      $result->execute(array($restockNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result->bindColumn(2, $pictures);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        foreach ($result as $product) {
          $picdata  = $product['pictures'];
          $finfo    = new finfo(FILEINFO_MIME);
          $mimeType = $finfo->buffer($picdata);
          $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
          $imageFileType = explode("/", $mimeType);
          $imageFileType = strtolower($imageFileType[1]);
          $target_file = "productpics/" . $restockNumber . "." . $imageFileType;
          
          if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
            if(!file_exists($target_file)) {
              $imageFileType = "jpg"; // create files with .jpg only extension for brevity
              $target_file = "productpics/" . $restockNumber . "." . $imageFileType;
            }
          }
        }
        
        $itemName = $name;
        
        // Add to the quantity in the store
        $result = $db->prepare("UPDATE products SET quantity=quantity+{$_POST['restockquantity']} WHERE number=?");
        $result->bindValue(1, $restockNumber);
        $result->execute();
        
        // Sub it from the quantity in the warehouse
        if ($restockType == 0) { // Check if the restocked item is a returned from the courier; 0 for warehouse, 1 for courier
          $result = $db->prepare("UPDATE products SET warehouseqty=warehouseqty-{$_POST['restockquantity']} WHERE number=? AND warehouseqty>=0");
          $result->bindValue(1, $restockNumber);
          $result->execute();
        }
        
        // Start logging the query
        $queryforsave = "Product was restocked in store >> UPDATE products SET quantity=quantity+{$_POST['restockquantity']} WHERE number={$restockNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        // Set product's place of origin, ie when sent from the warehouse or when returned
        $productPlaceOfOrigin = "";
        if ($restockType == 0) { $productPlaceOfOrigin = "warehouse"; }
        if ($restockType == 1) { $productPlaceOfOrigin = "returned"; }
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
                
        $result = $db->prepare("INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $restockNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $restockQuantity);
        $result->bindValue(5, "admin");
        $result->bindValue(6, $productPlaceOfOrigin);
        $result->bindValue(7, 0);
        $result->execute();
        
        // Start logging the query
      $queryforsave = "Restocked product was saved in restocks >> INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES ('{$actionDate}', '{$restockNumber}', '{$itemName}', '{$restockQuantity}' , '{$productPlaceOfOrigin}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        //echo 1;
        $output[0] = 1; // success
        $output[1] = $target_file; // product pic url
      } else {
        $output[0] = 0; //fail
      }
      
      echo json_encode($output);
    }
  } catch(PDOException $e) { echo $e->getMessage(); $db = null; unset($db, $result); /*and close database handler*/ }
}

function restockWarehouseProduct() {
  try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
      global $db, $restocksColumnsNoDataType;

      $restockNumber    = $_POST['restockwarehousenumber'];
      $restockQuantity  = $_POST['restockwarehousequantity'];
      
      $result = $db->prepare("SELECT name, pictures FROM products WHERE number=?");
      $result->execute(array($restockNumber)); //this line first or bindColumn won't work
      $result->bindColumn(1, $name);
      $result->bindColumn(2, $pictures);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      if (count($result) > 0) {
        foreach ($result as $product) {
          $picdata  = $product['pictures'];
          $finfo    = new finfo(FILEINFO_MIME);
          $mimeType = $finfo->buffer($picdata);
          $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
          $imageFileType = explode("/", $mimeType);
          $imageFileType = strtolower($imageFileType[1]);
          $target_file = "productpics/" . $restockNumber . "." . $imageFileType;
          
          if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
            if(!file_exists($target_file)) {
              $imageFileType = "jpg"; // create files with .jpg only extension for brevity
              $target_file = "productpics/" . $restockNumber . "." . $imageFileType;
            }
          }
        }
        
        $itemName = $name;
        
        $result = $db->prepare("UPDATE products SET warehouseqty=warehouseqty+{$_POST['restockwarehousequantity']} WHERE number=?");
        $result->bindValue(1, $restockNumber);
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Product was restocked in Warehouse >> UPDATE products SET quantity=quantity+{$_POST['restockwarehousequantity']} WHERE number={$restockNumber}" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        
        //$actionDate = date('d M Y H-i-s');
        $actionDate = date('Y-m-d'); //ISO-8601 format for SQLite without Hours Mins Secs
        
        $result = $db->prepare("INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES (?, ?, ?, ?, ?)");
        $result->bindValue(1, $actionDate);
        $result->bindValue(2, $restockNumber);
        $result->bindValue(3, $itemName);
        $result->bindValue(4, $restockQuantity);
        $result->bindValue(5, "admin");
        $result->execute();
        
        // Start logging the query
        $queryforsave = "Restocked product was saved in restocks >> INSERT INTO restocks ({$restocksColumnsNoDataType}) VALUES ('{$actionDate}', '{$restockNumber}', '{$itemName}', '{$restockQuantity}')" . PHP_EOL;
        logQuery($queryforsave);
        // End logging the query
        
        //echo 1;
        $output[0] = 1; // success
        $output[1] = $target_file; // product pic url
      } else {
        $output[0] = 0; //fail
      }
      
      echo json_encode($output);
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
      $queryforsave = "Customer was banlisted >> INSERT INTO customerbanlist ({$banlistNoDataType}) VALUES ('{$customerphonenumber}', '{$customernames}', '{$customeraddress}', '{$trackingnumber}', '{$orderdate}', '{$wherewasordered}')" . PHP_EOL;
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
      
      $result = $db->prepare("SELECT number, name, quantity, warehouseqty, contractor, monitored, outofstock, piclinks, pictures FROM products WHERE monitored = 1 AND quantity < 3");
      $result->execute();
      $result->bindColumn(1, $number);
      $result->bindColumn(2, $name);
      $result->bindColumn(3, $quantity);
      $result->bindColumn(4, $warehouseqty);
      $result->bindColumn(5, $contractor);
      $result->bindColumn(6, $outofstock);
      $result->bindColumn(7, $piclinks);
      $result->bindColumn(8, $pictures);
      $result = $result->fetchAll(PDO::FETCH_ASSOC);

      
      if (count($result) > 0) {
        $output = [];
        $i = 0;
        foreach ($result as $product) {
          //$finfo    = new finfo(FILEINFO_MIME);
          //$mimeType = $finfo->buffer($product['pictures']);
          //$mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
          //$product['pictures'] = "data:" . $mimeType . ";base64,"  . base64_encode($product['pictures']);
          //$product['piclinks'] = "OPA";
          $picdata = $product['pictures'];
          
          //$output[$i] = array($product['number'], $product['name'], null, $product['contractor'], $product['monitored'], $product['piclinks'], $product['pictures']);
          // null array element is product's quantity in the shop
          $output[$i] = array($product['number'], $product['name'], null, $product['warehouseqty'], $product['contractor'], $product['outofstock'], $product['piclinks']);
          
          // Default min qty: 2
          if ($product['quantity'] < 3) {
            $output[$i][2] = $product['quantity']; //check product's current qty
          }
          
          if ($product['piclinks'] === null || $product['piclinks'] === "") { //check if product has piclinks
            //$output[$i][4] = "_NOPICLINKS";
            // temp fix
            $finfo    = new finfo(FILEINFO_MIME);
            $mimeType = $finfo->buffer($picdata);
            $mimeType = substr($mimeType, 0, strpos($mimeType, ";"));
            $imageFileType = explode("/", $mimeType);
            $imageFileType = strtolower($imageFileType[1]);
            $target_file = "productpics/" . $product['number'] . "." . $imageFileType;
            
            if ($imageFileType === "jpeg") { // small fix when file extension is .jpg or .jpeg
              if(!file_exists($target_file)) {
                $imageFileType = "jpg"; // create files with .jpg only extension for brevity
                $target_file = "productpics/" . $product['number'] . "." . $imageFileType;
              }
            }
            
            // Checks if file exist physically in the productpics directory and creates it if not
            if(!file_exists($target_file)) {
              file_put_contents($target_file, $picdata);
            }
            
            $output[$i][4] = $target_file;
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

function checkFileHash() {
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    global $styleCSSHash;
    
    $hashToCheck = $_POST["styleCSSHash"];
    
    if (!hash_equals($hashToCheck, $styleCSSHash)) {
      echo json_encode($styleCSSHash);
    } else {
      echo json_encode(0);
    }
  }
}

function checkMnStatus() {
  global $maintenanceMode;
  echo json_encode($maintenanceMode);
}

// Our main loop
switch ($_POST['action']) {
  case "new"              : addProduct();               break; // Add item to database
  case "changepic"        : changePic();                break; // Change picture of the item
  case "search"           : searchProduct();            break; // Search for item in the database
  case "warehouse"        : searchWarehouse();          break; // Search for item in the database
  case "itemremoval"      : itemRemovalFromWarehouse(); break; // Remove item from warehouse and update its qty in the database
  case "setmonitoring"    : setProductMonitoring();     break; // Set product monitoring
  case "setoutofstock"    : setOutOfStock();            break; // Set product's availability
  case "sell"             : sellProduct();              break; // Sell an item and exclude it from the database
  case "sales"            : checkSales();               break; // Show sales per a given date
  case "restock"          : restockProduct();           break; // Restock an item
  case "restockwarehouse" : restockWarehouseProduct();  break; // Restock an item into Warehouse
  case "searchcustomer"   : searchCustomer();           break; // Check if the customer is marked as dishonest ie not picking their order, not paying the shipping fee for returning or breaking the products
  case "bancustomer"      : banCustomer();              break; // Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
  case "checkissues"      : checkIssues();              break; // Check for product issues
  case "checkmessages"    : checkMessages();            break; // Check for important messages or tasks
  case "sendmessage"      : sendMessage();              break; // Send important message or task
  case "checkFileHash"    : checkFileHash();            break; // Send file hash string if the file is changed
  case "checkMnStatus"    : checkMnStatus();            break; // Check if maintenance mode is enabled
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
