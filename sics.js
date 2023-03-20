'use strict';

//console.clear(); // generates Lighthouse error if enabled

// code minification
var $ = document;
// end of code minification
//var lang = "EN";
var lang  = "BG";
var obj   = JSON.parse(translations);
// perfopt: minimize DOM access
var elementsForTranslation = [];
for (let elem in obj[lang]) {
  var el = document.getElementById(obj[lang][elem].id);
  if (el !== null || el !== "undefined") {
    elementsForTranslation[el.id] = el;
  }
}
// end of perfopt
var success = new Audio('success.mp3');
var failure = new Audio('failure.mp3');
var message = new Audio('message.mp3');
var Monitored = null;
var outofstock = null;
var styleCSSHash = "0";
//var productsMonState = [];
var multipleClicksState = 0;
var maintenanceElem = document.getElementById("maintenance");
var maintenanceMode = 0;
maintenanceElem.className = "maintenanceOff";

function playSuccess() {
  success.pause();
  success.currentTime = 0;
  success.play();
}

function playFailure() {
  failure.pause();
  failure.currentTime = 0;
  failure.play();
}

function playMessage() {
  message.pause();
  message.currentTime = 0;
  message.play();
}

function switchLang() {
  //if (window.location.pathname !== "/index.html") {
    //document.getElementById("searchproduct").innerHTML = obj[lang]["searchproduct"].translation; // Throws undefined, dunno why
  //}
  for (let elem in obj[lang]) {
    if (elem) {
      if (obj[lang][elem].property) {
        switch (obj[lang][elem].property) {
          case "innerHTML":   elementsForTranslation[obj[lang][elem].id].innerHTML   = obj[lang][elem].translation; break;
          case "textContent": elementsForTranslation[obj[lang][elem].id].textContent = obj[lang][elem].translation; break;
          case "placeholder": elementsForTranslation[obj[lang][elem].id].placeholder = obj[lang][elem].translation; break;
          case "title":       elementsForTranslation[obj[lang][elem].id].title       = obj[lang][elem].translation; break;
        }
      }
    }
  }

  //playSuccess();
  //playFailure();
}

function sysInfo() {
  //;
}

function loadPreview() {
  var image = document.getElementById('prodpicture');
	image.src = URL.createObjectURL(event.target.files[0]);
  if (event.target.id === "changepic") {
    changePicture();
  }
}

function imgNotAvail() {
  var image = document.getElementById('prodpicture');
  if (image.src != 'image-not-available.jpg') {
    image.src = 'image-not-available.jpg';
  }
}

function classSwitch(state) {
  Monitored = state;
  
  if (state === "1") {
    if (document.getElementById("setmonitoring").classList.contains("productmonitoringdisabled")) {
      document.getElementById("setmonitoring").classList.remove("productmonitoringdisabled");
    }
    document.getElementById("setmonitoring").classList.add("productmonitoringenabled");
  }
  
  if (state === "0")  {
    if (document.getElementById("setmonitoring").classList.contains("productmonitoringenabled")) {
      document.getElementById("setmonitoring").classList.remove("productmonitoringenabled");
    }
    document.getElementById("setmonitoring").classList.add("productmonitoringdisabled");
  }
}

function classSwitchIssues(stateIssues, stateButtonID) {
  if (stateIssues === "1") {
    if (document.getElementById(stateButtonID).classList.contains("productmonitoringdisabled")) {
      document.getElementById(stateButtonID).classList.remove("productmonitoringdisabled");
    } else document.getElementById(stateButtonID).classList.add("productmonitoringenabled");
  }
  
  if (stateIssues === "0")  {
    if (document.getElementById(stateButtonID).classList.contains("productmonitoringenabled")) {
      document.getElementById(stateButtonID).classList.remove("productmonitoringenabled");
    } else document.getElementById(stateButtonID).classList.add("productmonitoringdisabled");
  }
}

function classSwitchOutOfStock(state) {
  outofstock = state;
  
  // Reversed: 0 when is 'in stock', 1 is when the products is 'out of stock'
  if (state === "0") {
    if (document.getElementById("setoutofstock").classList.contains("productoutofstockdisabled")) {
      document.getElementById("setoutofstock").classList.remove("productoutofstockdisabled");
    }
    document.getElementById("setoutofstock").classList.add("productoutofstockenabled");
  }
  
  if (state === "1")  {
    if (document.getElementById("setoutofstock").classList.contains("productoutofstockenabled")) {
      document.getElementById("setoutofstock").classList.remove("productoutofstockenabled");
    }
    document.getElementById("setoutofstock").classList.add("productoutofstockdisabled");
  }
}

function classSwitchIssuesOutOfStock(stateIssues, stateButtonID) {
  // Reversed: 0 when is 'in stock', 1 is when the products is 'out of stock'
  if (stateIssues === "0") {
    if (document.getElementById(stateButtonID).classList.contains("productoutofstockdisabled")) {
      document.getElementById(stateButtonID).classList.remove("productoutofstockdisabled");
    } else document.getElementById(stateButtonID).classList.add("productoutofstockenabled");
  }
  
  if (stateIssues === "1")  {
    if (document.getElementById(stateButtonID).classList.contains("productoutofstockenabled")) {
      document.getElementById(stateButtonID).classList.remove("productoutofstockenabled");
    } else document.getElementById(stateButtonID).classList.add("productoutofstockdisabled");
  }
}

function addProduct() {
  var number      =  document.getElementById('number').value;
  if (number.length > 7) {
    alert("Maximum allowed number of symbols is 7!");
    playFailure();
    return;
  }
  var name        =  document.getElementById('name').value;
  //var category    =  document.getElementById('category').value;
  var quantity    =  document.getElementById('quantity').value;
  var warehouseqty =  document.getElementById('warehouseqty').value;
  var contractor  =  document.getElementById('contractor').value;
  var price       =  document.getElementById('price').value;
  //var info        =  document.getElementById('info').value;
  //var prodlinks   =  document.getElementById('prodlinks').value;
  var pictures    =  document.getElementById('pictures');
  
  // Create a FormData object
  var formData = new FormData();
  
  // Get the files from the form input
  var files = pictures.files;
  
  // Select only the first file from the input array
  var file = files[0];
 
  if (file.size > 0) {
    if (["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"].includes(file.type)) {
      formData.append('pictures', file, file.name); // Add the file to the AJAX request
    } else {
      pictures.value = '';
      document.getElementById("prodpicuploadbuttontext").textContent = "This picture format is not supported";
      document.getElementById("prodpicuploadbuttontext").style.backgroundColor = "red";
      playFailure();
      return false;
    }
  } else { pictures.value = ''; playFailure(); return false; }
  
  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        document.getElementById("newproductresults").innerHTML = systemErrors[lang]['sellprod'][this.responseText];
        switch (this.responseText) {
          case "0": document.getElementById("newproductresults").style.backgroundColor = "red", 
                    document.getElementById('prodpicture').src = '',
                    document.getElementById('pictures').value = '', 
                    playFailure(); 
                    break;
          case "1": document.getElementById("newproductresults").style.backgroundColor = "green",
                    document.getElementById('prodpicture').src = '', 
                    document.getElementById('pictures').value = '', 
                    playSuccess(); 
                    break;
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  /*(name        !== '' && 
      number      !== '' && 
      category    !== '' && 
      quantity    !== '' && 
      contractor  !== '' && 
      price       !== '' && 
      info        !== '' && 
      prodlinks   !== '')*/
  
  if (name        !== '' && 
      number      !== '' && 
      quantity    !== '' && 
      warehouseqty !== '' &&
      contractor  !== '' && 
      price       !== '') {
        formData.append('action', "new");
        formData.append('name', name);
        formData.append('number', number);
        //formData.append('category', category);
        formData.append('quantity', quantity);
        formData.append('warehouseqty', warehouseqty);
        formData.append('contractor', contractor);
        formData.append('price', price);
        //formData.append('info', info);
        //formData.append('prodlinks', prodlinks);
        
        xhttp.send(formData);
        
        document.getElementById('name').value = '';
        document.getElementById('number').value = '';
        //document.getElementById('category').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('warehouseqty').value = '';
        document.getElementById('contractor').value = '';
        document.getElementById('price').value = '';
        //document.getElementById('info').value = '';
        //document.getElementById('prodlinks').value = '';
        document.getElementById('pictures').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

function changePicture() {
  var changepic   =  document.getElementById('changepic');
  var number      =  document.getElementById('number').value;
  if (number.length > 7) {
    alert("Maximum allowed number of symbols is 7!");
    playFailure();
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();
  
  // Get the files from the form input
  var files = changepic.files;
  
  // Select only the first file from the input array
  var file = files[0];
 
  if (file.size > 0) {
    if (["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"].includes(file.type)) {
      formData.append('changepic', file, file.name); // Add the file to the AJAX request
      formData.append('uplfiletype', file.type); // Add the filetype to the AJAX request to search for the original file extension
    } else {
      changepic.value = '';
      document.getElementById("changeprodpicbuttontext").textContent = "This picture format is not supported";
      document.getElementById("changeprodpicbuttontext").style.backgroundColor = "red";
      playFailure();
      return false;
    }
  } else { changepic.value = ''; playFailure(); return false; }
  
  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        document.getElementById("newproductresults").innerHTML = systemErrors[lang]['changepic'][this.responseText];
        switch (this.responseText) {
          case "0": document.getElementById("newproductresults").style.backgroundColor = "red", 
                    document.getElementById('prodpicture').src = '',
                    document.getElementById('changepic').value = '', 
                    playFailure();
                    break;
          case "1": document.getElementById("newproductresults").style.backgroundColor = "green", 
                    document.getElementById('changepic').value = '', 
                    playSuccess();
                    break;
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  /*(name        !== '' && 
      number      !== '' && 
      category    !== '' && 
      quantity    !== '' && 
      contractor  !== '' && 
      price       !== '' && 
      info        !== '' && 
      prodlinks   !== '')*/
  
  if (number      !== '') {
        formData.append('action', "changepic");
        formData.append('number', number);
        
        xhttp.send(formData);
        
        document.getElementById('changepic').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Search for a product in the database
function searchProduct() {
  var searchNumber = document.getElementById('number').value;
  if (searchNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        var i;
        
        // Check if returned data is "No product found!"
        if (this.responseText === "0") {
          document.getElementById("newproductresults").innerHTML = systemErrors[lang]['searchprod'][this.responseText];
          document.getElementById("newproductresults").style.backgroundColor  = "red";
          document.getElementById("prodpicture").src                          = '';
          document.getElementById("name").value                               = '';
          document.getElementById("quantity").value                           = '';
          document.getElementById("warehouseqty").value                       = '';
          document.getElementById("contractor").value                         = '';
          document.getElementById("price").value                              = '';
          document.getElementById("hiddenaddinput").style.visibility          = "visible"; // show input fields
          document.getElementById("addproduct").style.visibility              = "visible"; // show 'Add product' button when product isn't found
          document.getElementById("prodpicuploadbutton").style.visibility     = "visible"; // show 'Choose product pictures' button when product isn't found
          document.getElementById("changeprodpicbutton").style.visibility     = "hidden"; // hide 'Change product picture' button when product isn't found
          document.getElementById("setmonitoring").style.visibility           = "hidden"; // hide 'Monitor' button when product isn't found, it will be automatically enabled in the database
          document.getElementById("setoutofstock").style.visibility           = "hidden"; // hide 'Out of stock' button when product isn't found, it will be automatically enabled in the database
          playFailure();
        } else {
          document.getElementById("hiddenaddinput").style.visibility          = "visible"; // show input fields
          document.getElementById("addproduct").style.visibility              = "hidden"; // hide 'Add product' button when product is found
          document.getElementById("prodpicuploadbutton").style.visibility     = "hidden"; // hide 'Choose product pictures' button when product is found
          document.getElementById("changeprodpicbutton").style.visibility     = "visible"; // show 'Change product picture' button when product is found
          document.getElementById("setmonitoring").style.visibility           = "visible"; // show 'Monitor' button when product is found, so the user can set the option
          document.getElementById("setoutofstock").style.visibility           = "visible"; // show 'Out of stock' button when product is found, so the user can set the option
          document.getElementById("newproductresults").innerHTML              = '';
          document.getElementById("newproductresults").style.backgroundColor  = 'transparent';
          document.getElementById("prodpicture").src                          = '';
          document.getElementById("prodpicture").style.backgroundColor        = "black";
          playSuccess();
          for (i of data) {
            switch (Object.keys(i)[0]) {
              case "Name":                    document.getElementById("name").value             = i[Object.keys(i)[0]]; break;
              case "Quantity in shop":        document.getElementById("quantity").value         = i[Object.keys(i)[0]]; break;
              case "Warehouse":           document.getElementById("warehouseqty").value         = i[Object.keys(i)[0]]; break;
              case "Contractor":              document.getElementById("contractor").value       = i[Object.keys(i)[0]]; break;
              case "Price":                   document.getElementById("price").value            = i[Object.keys(i)[0]]; break;
              case "Monitored":               classSwitch(i[Object.keys(i)[0]]);                                        break;
              case "outofstock":              classSwitchOutOfStock(i[Object.keys(i)[0]]);                              break;
              case "Picture":                 document.getElementById("prodpicture").src        = i[Object.keys(i)[0]]; break;
            }
          }
        }
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (searchNumber !== '') {
        formData.append('action', "search");
        formData.append('number', searchNumber);
        
        xhttp.send(formData);
        
        //document.getElementById('number').value = '';
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

// Search a product for warehouse employees
function searchWarehouse() {
  var productName = document.getElementById('name').value;
  if (productName === '') {
    playFailure();
    alert("Product name is empty!");
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        var i, j;
        
        // Check if returned data is "No product found!"
        /*if (lang === "BG") {
        } else {
        }*/
        
        if (data !== 0) {
          for (j of data) {
            var number        = j[0];
            var name          = j[1];
            var warehouseqty  = j[2];
            var info          = j[3];
            var piclinks      = j[4]; // image src="${j[4]}", maybe it's better to load images from url than sending base64 encoded data from db
            var prodlinks     = j[5];
            i += `<div class="warehouseitems">
                    <img loading="lazy" decoding="async" src="${piclinks}" alt="Product picture is not available" class="warehousepics" onclick="itemRemovalFromWarehouse(this.name); return false;" name="${number}"/>
                    <div class="warehousedata">${number}</div>
                    <div class="warehousedata">${name}</div>
                    <div class="warehousedata">${warehouseqty}</div>
                    <div class="warehousedata">${info}</div>
                    <div class="warehousedata">${prodlinks}</div>
                  </div>`;
          }
          var el = document.getElementById("searchproductresults");
          el.querySelectorAll("*").forEach(el => el.remove());
          document.getElementById("searchproductresults").innerHTML = i;
          playSuccess();
        } else {
          document.getElementById("searchproductresults").innerHTML = systemErrors[lang]['searchprod'][this.responseText];
          document.getElementById("searchproductresults").style.backgroundColor  = "red";
          document.getElementById("name").value                               = '';
          playFailure()
        }
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);

  if (productName !== '') {
        formData.append('action', "warehouse");
        formData.append('name', productName);
        
        xhttp.send(formData);
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

function itemRemovalFromWarehouse(productNumber) {
  // ACCIDENTAL DOUBLE-CLICK PREVENTION, YAY!
  if (multipleClicksState == 0) {
    multipleClicksState = 1;
  } else if (multipleClicksState == 1) {
    event.preventDefault();
    return;
  }
  var productNumber    = productNumber;
  if (productNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols for SKU is 7!");
    return;
  }

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        document.getElementById("searchproductresults").innerHTML = this.responseText; //systemErrors[lang]['sellprod'][this.responseText];
        switch (this.responseText) {
          case "0": alert("SOMETHING'S WRONG!"); /* Output the error */; break;//document.getElementById("searchproductresults").style.backgroundColor = "red", playFailure(); break;
          case "1": alert("PRODUCT WAS SUCCESSFULLY WRITTEN OFF FROM THE WAREHOUSE!"); /* Close popup here on success */; break;//document.getElementById("searchproductresults").style.backgroundColor = "green", playSuccess(); break;
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
      document.getElementById('qty').value = 1;
      multipleClicksState = 0; // ACCIDENTAL DOUBLE-CLICK PREVENTION, YAY!
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  var remquantity = document.getElementById("qty").value;
  
  if (productNumber !== '' &&
      remquantity   !== '') {
        formData.append('action', "itemremoval");
        formData.append('number', productNumber);
        formData.append('remquantity', remquantity);
        
        xhttp.send(formData);
        
        //document.getElementById('number').value   = '';
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Set the product to be monitored or not for problems
function setProductMonitoring() {
  var prodNumber = document.getElementById('number').value;
  if (prodNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() { 
    if (this.readyState == 4) {
      if (this.status == 200) {
        //var data = JSON.parse(this.responseText);
        var data = this.responseText;
      
        // Check if there is some data returned
        if (data) {
          playSuccess();
          classSwitch(data);
        } else {
          playFailure();
          alert("Error: returned status code " + this.status + " " + this.statusText);
        }
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (prodNumber !== '') {
    switch (Monitored) {
      case "1": Monitored = "0"; break;
      case "0": Monitored = "1"; break;
    }
    formData.append('action', "setmonitoring");
    formData.append('number', prodNumber);
    formData.append('Monitored', Monitored);
    
    xhttp.send(formData);
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

function setProductMonitoringIssues(sku, stateIssues, stateButtonID) {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() { 
    if (this.readyState == 4) {
      if (this.status == 200) {
        //var data = JSON.parse(this.responseText);
        var data = this.responseText;
        stateIssues = data;
      
        // Check if there is some data returned
        if (data) {
          playSuccess();
          classSwitchIssues(stateIssues, stateButtonID);
        } else {
          playFailure();
          alert("Error: returned status code " + this.status + " " + this.statusText);
        }
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (sku !== '' && stateIssues !== '') {
    switch (stateIssues) {
      case "1": stateIssues = "0"; break;
      case "0": stateIssues = "1"; break;
    }
    formData.append('action', "setmonitoring");
    formData.append('number', sku);
    formData.append('Monitored', stateIssues);
    
    xhttp.send(formData);
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

// Set product's availability
function setOutOfStock() {
  var prodNumber = document.getElementById('number').value;
  if (prodNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() { 
    if (this.readyState == 4) {
      if (this.status == 200) {
        //var data = JSON.parse(this.responseText);
        var data = this.responseText;
      
        // Check if there is some data returned
        if (data) {
          playSuccess();
          classSwitchOutOfStock(data);
        } else {
          playFailure();
          alert("Error: returned status code " + this.status + " " + this.statusText);
        }
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (prodNumber !== '') {
    switch (outofstock) {
      case "1": outofstock = "0"; break;
      case "0": outofstock = "1"; break;
    }
    formData.append('action', "setoutofstock");
    formData.append('number', prodNumber);
    formData.append('outofstock', outofstock);
    
    xhttp.send(formData);
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

function setOutOfStockIssues(sku, stateIssues, stateButtonID) {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() { 
    if (this.readyState == 4) {
      if (this.status == 200) {
        //var data = JSON.parse(this.responseText);
        var data = this.responseText;
        stateIssues = data;
      
        // Check if there is some data returned
        if (data) {
          playSuccess();
          classSwitchIssuesOutOfStock(stateIssues, stateButtonID);
        } else {
          playFailure();
          alert("Error: returned status code " + this.status + " " + this.statusText);
        }
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (sku !== '' && stateIssues !== '') {
    switch (stateIssues) {
      case "1": stateIssues = "0"; break;
      case "0": stateIssues = "1"; break;
    }
    formData.append('action', "setoutofstock");
    formData.append('number', sku);
    formData.append('outofstock', stateIssues);
    
    xhttp.send(formData);
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

// Restock a product and update the quantity left in the database
function restockProduct() {
  var restockNumber    = document.getElementById('restocknumber').value;
  if (restockNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  var restockQuantity  = document.getElementById('restockquantity').value;
  if (restockQuantity < 1) {
    playFailure();
    alert("Minimum allowed quantity is 1 !");
    return;
  }

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        document.getElementById("restockproductresults").innerHTML = `<div>` + systemErrors[lang]['restock'][data[0]] + `</div>`;
        if (data[0] === 1) {
          document.getElementById("restockproductresults").style.backgroundColor = "green";
          document.getElementById("restockproductresults").innerHTML += `<img loading="lazy" decoding="async" src="` + data[1] + `" alt="Product picture is not available" class="restockprodpic" />`;
          playSuccess();
        } else if (data[0] === 0) {
          document.getElementById("restockproductresults").style.backgroundColor = "red";
          playFailure();
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (restockNumber    !== '' &&
      restockQuantity  !== '') {
        if (restockQuantity < 1) {
          playFailure();
          alert("Minimum allowed quantity is 1 !");
          return;
        }
        
        var itemReturned = 0;
        
        if (document.getElementById("itemreturned").checked === true) {
          itemReturned = 1;
        }
        
        formData.append('action', "restock");
        formData.append('restocknumber', restockNumber);
        formData.append('restockquantity', restockQuantity);
        formData.append('itemreturned', itemReturned);
        
        xhttp.send(formData);
        
        document.getElementById('restocknumber').value   = '';
        document.getElementById('restockquantity').value = '';
        document.getElementById("itemreturned").checked = false;
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Restock a product for Warehouse and update the quantity left in the database
function restockWarehouseProduct() {
  var restockWarehouseNumber    = document.getElementById('restockwarehousenumber').value;
  if (restockWarehouseNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  
  var restockWarehouseQuantity  = document.getElementById('restockwarehousequantity').value;
  // Check if quantity is not 0
  if (restockWarehouseQuantity < 1) {
    playFailure();
    alert("Minimum allowed quantity is 1 !");
    return;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        document.getElementById("restockproductresults").innerHTML = `<div>` + systemErrors[lang]['restock'][data[0]] + `</div>`;
        if (data[0] === 1) {
          document.getElementById("restockproductresults").style.backgroundColor = "green";
          document.getElementById("restockproductresults").innerHTML += `<img loading="lazy" decoding="async" src="` + data[1] + `" alt="Product picture is not available" class="restockprodpic" />`;
          playSuccess();
        } else if (data[0] === 0) {
          document.getElementById("restockproductresults").style.backgroundColor = "red";
          playFailure();
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (restockWarehouseNumber    !== '' &&
      restockWarehouseQuantity  !== '') {
        if (restockWarehouseQuantity < 1) {
          playFailure();
          alert("Minimum allowed quantity is 1 !");
          return;
        } else {
          formData.append('action', "restockwarehouse");
          formData.append('restockwarehousenumber', restockWarehouseNumber);
          formData.append('restockwarehousequantity', restockWarehouseQuantity);
          
          xhttp.send(formData);
          
          document.getElementById('restockwarehousenumber').value   = '';
          document.getElementById('restockwarehousequantity').value = '';
        }
  } else {
    playFailure();
    alert("Error: Some fields are empty!");
  }
}

// Sell a product and update the quantity left in the database
function sellProduct() {
  var sellNumber    = document.getElementById('sellnumber').value;
  if (sellNumber.length > 7) {
    playFailure();
    alert("Maximum allowed number of symbols is 7!");
    return;
  }
  var sellquantity  = document.getElementById('sellquantity').value;
  var soldin  = document.getElementById('soldin').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        document.getElementById("sellproductresults").innerHTML = `<div>` + systemErrors[lang]['sellprod'][data[0]] + `</div>`;
        if (data[0] === 1) {
          document.getElementById("sellproductresults").style.backgroundColor = "green";
          document.getElementById("sellproductresults").innerHTML += `<img loading="lazy" decoding="async" src="` + data[1] + `" alt="Product picture is not available" class="sellprodpic" />`;
          playSuccess();
        } else if (data[0] === 0) {
          document.getElementById("sellproductresults").style.backgroundColor = "red";
          playFailure();
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
    
  if (sellNumber    !== '' &&
      sellquantity  !== '' &&
      soldin        !== '') {
        formData.append('action', "sell");
        formData.append('sellnumber', sellNumber);
        formData.append('sellquantity', sellquantity);
        formData.append('soldin', soldin);
        
        xhttp.send(formData);
        
        document.getElementById('sellnumber').value   = '';
        document.getElementById('sellquantity').value = '';
        document.getElementById('soldin').value = 'a';
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Show sales per a given date
function checkSales(market) {
  document.getElementById("soldproductsresults").innerHTML = '';
  
  var soldproductsfrom    = document.getElementById('soldproductsfrom').value;
  var soldproductsto      = document.getElementById('soldproductsto').value;
  
  if (soldproductsfrom === '' && soldproductsto === '') {
    var currDate = new Date();
    var currYear      = currDate.getFullYear();
    var currMonth     = currDate.getMonth();
    var currDay       = currDate.getDate();
    
    currMonth += 1;
    if (currMonth < 10) {
      currMonth = "0" + currMonth;
    }
    
    if (currDay < 10) {
      currDay = "0" + currDay;
    }
    
    soldproductsfrom  = soldproductsto = currYear + "-" + currMonth + "-" + currDay;
  }
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        var i, j, SaleDate, SKU, ItemDescription, Quantity, TotalPrice, SoldIn;
        if (lang === "BG") {
          SaleDate        = "Дата";
          SKU             = "Арт. номер";
          ItemDescription = "Описание на продукта";
          Quantity        = "Брой";
          TotalPrice      = "Крайна сума";
          SoldIn          = "Продадено в";
        } else {
          SaleDate        = "Date";
          SKU             = "SKU";
          ItemDescription = "Item description";
          Quantity        = "Quantity";
          TotalPrice      = "Total Price";
          SoldIn          = "Sold in";
        }

        if (data !== 0) {
          var totalSum = 0;
          j = `<table><tr class='tableheader'><th>${SaleDate}</th><th>${SKU}</th><th>${ItemDescription}</th><th>${Quantity}</th><th>${TotalPrice}` + ` ` + currency[lang] + `</th><th>${SoldIn}</th></tr>`;
          for (i of data) {
            j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td><td>${i[4]}</td><td>${i[5]}</td></tr>`;
            totalSum += parseFloat(i[4]);
          }
          j += `<tr class='totalSum'><td></td><td></td><td>${data.length} products were sold ... Total Sum -></td><td></td><td>${totalSum}</td><td></td></tr>`;
          j += "</table>";
          document.getElementById("soldproductsresults").innerHTML = j;
          playSuccess();
        } else {
          document.getElementById("soldproductsresults").innerHTML = "No sales are recorded at this date!";
          playSuccess();
        }
        document.getElementById("soldproductsresults").style.display = "inline"; //compress the results visual zone a bit
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (soldproductsfrom !== '' && soldproductsto !== '') {
        formData.append('action', "sales");
        formData.append('soldproductsfrom', soldproductsfrom);
        formData.append('soldproductsto', soldproductsto);
        formData.append('market', market);
        
        xhttp.send(formData);
        
        document.getElementById('soldproductsfrom').value = '';
        document.getElementById('soldproductsto').value   = '';
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Check if the customer is marked as dishonest ie not picking their order, not paying the shipping fee for returning or breaking the products
function searchCustomer() {
  var searchNumber = document.getElementById('customerphonenumber').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        document.getElementById("customerbanlistresults").innerHTML = this.responseText;
        playSuccess();
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (searchNumber !== '') {
        formData.append('action', "searchcustomer");
        formData.append('customerphonenumber', searchNumber);
        
        xhttp.send(formData);
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
function banCustomer() {
  var customernames           = document.getElementById('customernames').value;
  var customerphonenumber     = document.getElementById('customerphonenumber').value;
  var customeraddress         = document.getElementById('customeraddress').value;
  var trackingnumber          = document.getElementById('trackingnumber').value;
  var orderdate               = document.getElementById('orderdate').value;
  var wherewasordered         = document.getElementById('wherewasordered').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (lang === "BG") {
          document.getElementById("bancustomerresults").innerHTML = "Клиентът беше успешно добавен в черния списък!";
        } else document.getElementById("bancustomerresults").innerHTML = this.responseText;
        playSuccess();
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  if (customerphonenumber     !== '' && 
      customernames           !== '' && 
      customeraddress         !== '' && 
      orderdate               !== '' && 
      wherewasordered         !== '') {
        formData.append('action', "bancustomer");
        formData.append('customerphonenumber', customerphonenumber);
        formData.append('customernames', customernames);
        formData.append('customeraddress', customeraddress);
        formData.append('trackingnumber', trackingnumber);
        formData.append('orderdate', orderdate);
        formData.append('wherewasordered', wherewasordered);

        xhttp.send(formData);
        
        document.getElementById('customerphonenumber').value = '';
        document.getElementById('customernames').value   = '';
        document.getElementById('customeraddress').value = '';
        document.getElementById('trackingnumber').value = '';
        document.getElementById('orderdate').value = '';
        document.getElementById('wherewasordered').value = 'a';
        
  } else {
      playFailure();
      alert("Error: Some fields are empty!");
  }
}

// Check for product issues
function checkIssues() {
  // Check if the array is created or populated
  /*if (!productsMonState || productsMonState.length == 0) {
    productsMonState = [];
  }*/
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to check for product issues like out of stock, missing info or pictures
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        //var i, j, SKU, Name, Problem, From, Actions, Picture;
        var i, j;
        /*if (lang === "BG") { // future feature, not needed for now; [FUTFEAT]
          SKU       = "Арт. номер";
          Name      = "Име на продукта";
          Problem   = "Проблем";
          From      = "Доставчик";
          Picture   = "Снимка";
        } else {
          SKU       = "SKU";
          Name      = "Name";
          Problem   = "Problem";
          From      = "Contractor";
          Picture   = "Picture";
        }*/
        
        if (data !== 0) {
          /*j = `<div class="divtable">
                <div class="divtablebody">
                  <div class="divrow tableheader">
                    <div class="divtableheadcell">${SKU}</div>
                    <div class="divtableheadcell">${Name}</div>
                    <div class="divtableheadcell">${Problem}</div>
                    <div class="divtableheadcell">${From}</div>
                    <div class="divtableheadcell">${Picture}</div>
                  </div>`;*/
          j = "";
          for (i of data) {
            var outofstockColor = "background-color: #32CD32";
            if (i[5] == 1) { outofstockColor = "background-color: #ff0000"; }
            var chatMsg = '';
            chatMsg = `${i[4]} - ${i[1]} - ${warehouseChat[lang]}`;
            //var actionSKU       = i[0];
            //var actionMonState  = i[4];
            //var stateButtonID   = `p${actionSKU}`;
            //var stateButton = `<button id="${stateButtonID}" class="setmonitoringbutton" type="submit" onclick="setProductMonitoringIssues(${actionSKU}, ${actionMonState}, this.id); return false;" title="Enable/Disable product monitoring"></button>`;
            //for i[3] -> <div class="divtablecell">${stateButton}</div>
            //<div class="divtablecell">${i[3]} <button class="warehouserequest" type="submit" onclick="requestToWarehouse(this); return false;" value="${i[4]}"></button></div>
            /*j += `<div class="divrow">
                    <div class="divtablecell">${i[0]}</div>
                    <div class="divtablecell">${i[1]}</div>
                    <div class="divtablecell">${i[2]}</div>
                    <div class="divtablecell">${i[3]} <button class="warehouserequest" type="submit" onclick="requestToWarehouse(this); return false;" value="${chatMsg}"></button></div>
                    <div class="divtablecell"><img loading="lazy" decoding="async" src="${i[4]}" alt="Product picture is not available" class="prodissuepic" /></div>
                  </div>`;*/
            // j += `<div class="issuesitem" style="background-image: url(${i[4]});" loading="lazy" decoding="async">
            j += `<div class="issuesitem"><div>${i[0]} &#13;&#10; ${i[1]}</div><img loading="lazy" decoding="async" src="${i[4]}" class="prodissuepic" alt="Product picture is not available" />
            <div class="issuesitem-bottomleft">${i[2]}</div>
            <div class="issuesitem-bottomright" style="${outofstockColor}">${i[3]}</div>
            </div>`;
          }
          //j += "</div></div>";
          var el = document.getElementById("issuesresults");
          el.querySelectorAll("*").forEach(el => el.remove()); // this removes or clears something but can't remember what; ERRORLEVEL: LOL
          document.getElementById("issuesresults").innerHTML = j;
          
          document.getElementById("productissues").innerHTML = data.length;
          document.getElementById("productissues").classList.add("blink");
          playSuccess();
        } else {
          if (document.getElementById("productissues").classList.contains("blink")) {
            document.getElementById("productissues").classList.remove("blink"); // disable blinking when no problems found
          }
          document.getElementById("productissues").innerHTML = ''; // remove counter when no problems found
          document.getElementById("issuesresults").innerHTML = systemErrors[lang]['issues'][this.responseText];
        }
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  formData.append('action', "checkissues");
        
  xhttp.send(formData);
}

// Show issues popup
function checkissuespopupshowModal() {
  document.getElementById("overlayissues").style.display = "block";
}

// Close issues popup
function checkissuespopupclose() {
  document.getElementById("overlayissues").style.display = "none";
}

// Get user messages
function checkMessages() {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to check for product issues like out of stock, missing info or pictures
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        if (data !== 0) {
          var i, j, Date, User, Message, Status;
          if (lang === "BG") {
            j = "<table><tr><th>Дата</th><th>Потребител</th><th>Съобщение</th><th>Статус</th></tr>";
          } else {
            j = "<table><tr><th>Date</th><th>User</th><th>Message</th><th>Status</th></tr>";
          }
          for (i of data) {
            j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
          }
          j += "</table>";
          document.getElementById("usermessagesresults").innerHTML = j;
          
          document.getElementById("usermessages").innerHTML = data.length;
          document.getElementById("usermessages").classList.add("blink");
          playMessage();
        } else {
            if (document.getElementById("usermessagesresults").classList.contains("blink")) {
              document.getElementById("usermessagesresults").classList.remove("blink"); // disable blinking when no messages found
            }
            document.getElementById("usermessagesresults").innerHTML = ''; // remove counter when no messages found
            document.getElementById("usermessagesresults").innerHTML = "NO NEW MESSAGES!";
        }
      }
      else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  formData.append('action', "checkmessages");
  formData.append('tName', "messages");
        
  xhttp.send(formData);
}

// Show messages popup
function usermessagespopupshowModal() {
  document.getElementById("overlaymessages").style.display = "block";
}

// Close messages popup
function usermessagespopupclose() {
  document.getElementById("overlaymessages").style.display = "none";
}

// Send user message
function sendMessage() {
  //playSuccess();
  //playFailure();
}

// Check for updated files
function checkFileHash() {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to check for product issues like out of stock, missing info or pictures
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        if (data === 0) {
          //console.log("File not changed");
          //console.log("data-> " + data);
          //console.log("local-> " + styleCSSHash);
          //console.log("----------");
          document.getElementById("sysinfodata").innerHTML = ''; // remove notification when there are no updates
          if (document.getElementById("sysinfodata").classList.contains("blink")) {
            document.getElementById("sysinfodata").classList.remove("blink"); // disable blinking when there are no updates
          }
        } else if (styleCSSHash !== data) {
          var oldhash = styleCSSHash;
          styleCSSHash = data;
          //location.reload();
          //console.log("File changed");
          //console.log("data-> " + data);
          //console.log("old-> " + oldhash);
          //console.log("new-> " + styleCSSHash);
          //console.log("----------");
          document.getElementById("sysinfodata").innerHTML = "!";
          document.getElementById("sysinfodata").style.color = "red";
          document.getElementById("sysinfodata").style.fontWeight = "bold";
          document.getElementById("sysinfodata").classList.add("blink");
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  formData.append('action', "checkFileHash");
  formData.append('styleCSSHash', styleCSSHash);
        
  xhttp.send(formData);
}

// Get/Set current system information and settings
function sysInfo() {
  ;
}

// Check system's maintenance status
function checkMaintenanceStatus() {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = parseInt(this.responseText);
        maintenanceMode = data;
        
        if (maintenanceMode === 1) {
          maintenanceElem.className = "maintenanceOn";
        } else if (maintenanceMode === 0) {
          maintenanceElem.className = "maintenanceOff";
        }
      } else {
        playFailure();
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  formData.append('action', "checkMnStatus");
  xhttp.send(formData);
}

// Create ready-to-paste message for our warehouse
// in HTML use onclick="this.select();" inside the element that has a value="productimagelink" property
// example element: <input onclick="this.select();" type='text' value='copy me' />
function requestToWarehouse(data) {
  //data.select();
  //document.execCommand('copy');
  // or
  //clipboardData.setData('text/plain', data.value);
  // or
  //navigator.clipboard.writeText(data.value + "\n" + warehouseChat[lang]); // only in HTTPS?
  // or a lot simpler
  navigator.clipboard.writeText(data.value); // only in HTTPS?
  data.classList.add("warehouserequestchecked");
}

// Directly switch UI to the local translation
switchLang();

/*var marked      = document.getElementsByClassName("translationmarker");
var markedSize  = marked.length;
for (let i = 0; i < markedSize; i++) {
  console.log(marked[i]);
  if      ("innerHTML" in marked[i])    { marked[i].innerHTML   = "B"; console.log("innerHTML -> B"); }
  else if ("textContent" in marked[i])  { marked[i].textContent = "B"; console.log("textContent -> B"); }
  else if ("placeholder" in marked[i])  { marked[i].placeholder = "B"; console.log("placeholder -> B"); }
  else if ("title" in marked[i])        { marked[i].title       = "B"; console.log("title -> B"); }
}*/

document.addEventListener("error", function() {
  e = e || window.event;
  var target = e.target || e.srcElement;
  if (target.nodeName.toLowerCase() === "img") {
    target.src = "image-not-available.jpg";
  }
}, false);

checkMaintenanceStatus();

// Automatically check issues and messages at given time interval
/*setInterval(function () {
  checkIssues();
  checkMessages();
}, 30 * 60 * 1000);*/ // first 30 is for 30min

// Automatically check for file changes at given interval and reload the page if any
/*setInterval(function () {
  checkFileHash();
}, 1 * 10 * 1000);*/ // check for file changes each 15 mins
