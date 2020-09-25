'use strict';

console.clear();

var langs = ["EN", "BG", "RU", "FR", "DE"];
//var localization = "EN";
var localization = "BG";

function setLocalization() {
  if (localization === "BG") {
    var x = document.querySelectorAll("input");
    var y = document.querySelectorAll("label");
    
    var i, j;
    
    // Localize software name in main h1 element
    document.getElementById("softwarename").innerHTML = "Система за контрол на продажбите и наличностите";
    
    // Localize notification area buttons
    document.getElementById("checkissuesbutton").title    = "Покажи всички продукти с проблеми";
    document.getElementById("checkmessagesbutton").title  = "Покажи всички съобщения или събития";
    
    // Localize input fields for Add New Product tab
    for (i of x) {
      switch (i.placeholder) {
        case "Name":                    i.placeholder = "Име на продукта"; break;
        case "Category":                i.placeholder = "Категория"; break;
        case "Additional product info": i.placeholder = "Информация за продукта"; break;
        case "Product Links":           i.placeholder = "Линкове към продукта"; break;
        case "SKU":                     i.placeholder = "Артикулен номер"; break;
        case "Quantity":                i.placeholder = "Брой"; break;
        case "Available":               i.placeholder = "Наличност в склада"; break;
        case "Price":                   i.placeholder = "Цена"; break;
        case "Customer names":          i.placeholder = "Имена на клиента"; break;
        case "Customer Phone Number":   i.placeholder = "Телефонен номер на клиента"; break;
        case "Customer Address":        i.placeholder = "Адрес на клиента"; break;
      }
    }
    
    // BUG 2: If enabled this leads to t Uncaught TypeError: Cannot set property 'value' of null at XMLHttpRequest.xhttp.onreadystatechange (sics.js:214)
    // Localize labels for input fields in Product Search tab search results
    /*document.getElementById("searchlabelname").textContent      = "Име на продукта";
    document.getElementById("searchlabelnumber").textContent    = "Артикулен номер";
    document.getElementById("searchlabelcategory").textContent  = "Категория";
    document.getElementById("searchlabelquantity").textContent  = "Брой";
    document.getElementById("searchlabelavailable").textContent = "Наличност в склада";
    document.getElementById("searchlabelprice").textContent     = "Цена";
    document.getElementById("searchlabelinfo").textContent      = "Информация за продукта";
    document.getElementById("searchlabelprodlinks").textContent = "Линкове към продукта";*/
    
    // Localize upload picture button
    document.getElementById("prodpicuploadbuttontext").textContent = "Добави снимка";
    
    // Localize labels
    for (j of y) {
      switch (j.getAttribute("for")) {
        case "tabone":   j.innerHTML = "Добави продукт"; break;
        case "tabtwo":   j.innerHTML = "Търсене"; break;
        case "tabthree": j.innerHTML = "Продажби"; break;
        case "tabfour":  j.innerHTML = "Некоректни"; break;
        case "tabfive":  j.innerHTML = "Добави некоректен"; break;
        case "tabsix":   j.innerHTML = "Зареждане"; break;
      }
    }
    
    // Localize action buttons
    document.getElementById("addproduct").innerHTML       = "ЗАПИС";
    document.getElementById("searchproduct").innerHTML    = "ТЪРСИ";
    document.getElementById("sellproduct").innerHTML      = "ОТЧЕТИ ПРОДАЖБА";
    document.getElementById("customerbanlist").innerHTML  = "ТЪРСИ";
    document.getElementById("bancustomer").innerHTML      = "ЗАПИС";
    document.getElementById("restockproduct").innerHTML   = "ЗАПИС";
    
    // Localize drop-down select button for Sell action
    var soldinselect = document.getElementById("soldin").options;
    for (let aaa of soldinselect) {
      switch (aaa.value) {
        case "a":     aaa.textContent = "Избери къде е продаден продукта"; break;
        case "store": aaa.textContent = "МАГАЗИН"; break;
        case "site":  aaa.textContent = "САЙТ"; break;
        case "fb":    aaa.textContent = "Фейсбук"; break;
        case "olx":   aaa.textContent = "ОЛХ"; break;
        case "bazar": aaa.textContent = "Базар.БГ"; break;
        case "phone": aaa.textContent = "ТЕЛЕФОН"; break;
        case "viber": aaa.textContent = "Вайбър"; break;
      }
    }
    
    // Localize drop-down select button for Ban Customer action
    var wherewasorderedselect = document.getElementById("wherewasordered").options;
    for (let bbb of wherewasorderedselect) {
      switch (bbb.value) {
        case "a":     bbb.textContent = "Избери от къде е поръчан продукта"; break;
        case "store": bbb.textContent = "МАГАЗИН"; break;
        case "site":  bbb.textContent = "САЙТ"; break;
        case "fb":    bbb.textContent = "Фейсбук"; break;
        case "olx":   bbb.textContent = "ОЛХ"; break;
        case "bazar": bbb.textContent = "Базар.БГ"; break;
        case "phone": bbb.textContent = "ТЕЛЕФОН"; break;
        case "viber": bbb.textContent = "Вайбър"; break;
      }
    }
  }
}

function addProduct() {
  var name      =  document.getElementById('name').value;
  var number    =  document.getElementById('number').value;
  var category  =  document.getElementById('category').value;
  var quantity  =  document.getElementById('quantity').value;
  var available =  document.getElementById('available').value;
  var price     =  document.getElementById('price').value;
  var info      =  document.getElementById('info').value;
  var prodlinks =  document.getElementById('prodlinks').value;
  var pictures  =  document.getElementById('pictures');
  
  // Create a FormData object
  var formData = new FormData();
  
  // Get the files from the form input
  var files = pictures.files;
  
  // Select only the first file from the input array
  var file = files[0];
 
  if (file.size > 0) {
    if (["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
      formData.append('pictures', file, file.name); // Add the file to the AJAX request
    } else {
      pictures.value = ''; return false;
    }
  } else { pictures.value = ''; return false; }
  
  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (localization === "BG") {
          document.getElementById("newproductresults").innerHTML = "Продуктът беше успешно добавен!";
        } else document.getElementById("newproductresults").innerHTML = this.responseText;
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (name      !== '' && 
      number    !== '' && 
      category  !== '' && 
      quantity  !== '' && 
      available !== '' && 
      price     !== '' && 
      info      !== '' && 
      prodlinks !== '') {
        formData.append('action', "new");
        formData.append('tName', "products");
        formData.append('name', name);
        formData.append('number', number);
        formData.append('category', category);
        formData.append('quantity', quantity);
        formData.append('available', available);
        formData.append('price', price);
        formData.append('info', info);
        formData.append('prodlinks', prodlinks);
        
        xhttp.send(formData);
        
        document.getElementById('name').value = '';
        document.getElementById('number').value = '';
        document.getElementById('category').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('available').value = '';
        document.getElementById('price').value = '';
        document.getElementById('info').value = '';
        document.getElementById('prodlinks').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Search for a product in the database
function searchProduct() {
  var searchNumber = document.getElementById('searchnumber').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        //console.log(data);
        
        var i, j;
        /*j = `<table class="maintable">`;
        for (i of data) {
          if (Object.keys(i)[0] === "Picture") {
            j += `<tr><td colspan="2">` + i[Object.keys(i)[0]] + `</tr>`;
          } else {
            j += `<tr><td>`+ Object.keys(i)[0] + `</td><td>` + i[Object.keys(i)[0]] + `</td></tr>`;
          }
        }
        j += "</table>";*/
        
        for (i of data) {
          switch (Object.keys(i)[0]) {
            case "Name":                    document.getElementById("search-results-name").value      = i[Object.keys(i)[0]]; break;
            case "Number":                  document.getElementById("search-results-number").value    = i[Object.keys(i)[0]]; break;
            case "Category":                document.getElementById("search-results-category").value  = i[Object.keys(i)[0]]; break;
            case "Quantity in shop":        document.getElementById("search-results-quantity").value  = i[Object.keys(i)[0]]; break;
            case "Available in warehouse":  document.getElementById("search-results-available").value = i[Object.keys(i)[0]]; break;
            case "Price":                   document.getElementById("search-results-price").value     = i[Object.keys(i)[0]]; break;
            case "Info":                    document.getElementById("search-results-info").value      = i[Object.keys(i)[0]]; break;
            case "Product links":           document.getElementById("search-results-prodlinks").value = i[Object.keys(i)[0]]; break;
            case "Picture":                 document.getElementById("prodpicture").innerHTML          = i[Object.keys(i)[0]]; break;
          }
        }
        
        document.getElementById("searchresults").style.display = 'flex';
        document.getElementById("searchresults").classList.remove("testtest");
        document.getElementById("searchresults").classList.add("testtest");
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (searchNumber !== '') {
        formData.append('action', "search");
        formData.append('tName', "products");
        formData.append('searchnumber', searchNumber);
        
        xhttp.send(formData);
        
        document.getElementById('searchnumber').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Restock a product and update the quantity left in the database
function restockProduct() {
  var restockNumber    = document.getElementById('restocknumber').value;
  var restockQuantity  = document.getElementById('restockquantity').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (localization === "BG") {
          document.getElementById("restockproductresults").innerHTML = "Продуктовата наличност беше успешно обновена!";
        } else document.getElementById("restockproductresults").innerHTML = this.responseText;
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (restockNumber    !== '' &&
      restockQuantity  !== '') {
        formData.append('action', "restock");
        formData.append('tName', "products");
        formData.append('restocknumber', restockNumber);
        formData.append('restockquantity', restockQuantity);
        
        xhttp.send(formData);
        
        document.getElementById('restocknumber').value   = '';
        document.getElementById('restockquantity').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Sell a product and update the quantity left in the database
function sellProduct() {
  var sellNumber    = document.getElementById('sellnumber').value;
  var sellquantity  = document.getElementById('sellquantity').value;
  var soldin  = document.getElementById('soldin').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (localization === "BG") {
          document.getElementById("sellproductresults").innerHTML = "Продуктът беше успешно записан като продаден!";
        } else document.getElementById("sellproductresults").innerHTML = this.responseText;
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (sellNumber    !== '' &&
      sellquantity  !== '' &&
      soldin        !== '') {
        formData.append('action', "sell");
        formData.append('tName', "sales");
        formData.append('sellnumber', sellNumber);
        formData.append('sellquantity', sellquantity);
        formData.append('soldin', soldin);
        
        xhttp.send(formData);
        
        document.getElementById('sellnumber').value   = '';
        document.getElementById('sellquantity').value = '';
        document.getElementById('soldin').value = '';
  } else {
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
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (searchNumber !== '') {
        formData.append('action', "searchcustomer");
        formData.append('tName', "customerbanlist");
        formData.append('customerphonenumber', searchNumber);
        
        xhttp.send(formData);
        
        document.getElementById('customerphonenumber').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Ban the customer if not picking their order, not paying the shipping fee for returning or breaking the products
function banCustomer() {
  var bancustomernames        = document.getElementById('bancustomernames').value;
  var bancustomerphonenumber  = document.getElementById('bancustomerphonenumber').value;
  var bancustomeraddress      = document.getElementById('bancustomeraddress').value;
  var bancustomerorderdate    = document.getElementById('bancustomerorderdate').value;
  var wherewasordered         = document.getElementById('wherewasordered').value;

  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (localization === "BG") {
          document.getElementById("bancustomerresults").innerHTML = "Клиентът беше успешно добавен в черния списък!";
        } else document.getElementById("bancustomerresults").innerHTML = this.responseText;
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (bancustomernames        !== '' && 
      bancustomerphonenumber  !== '' && 
      bancustomeraddress      !== '' && 
      bancustomerorderdate    !== '' && 
      wherewasordered         !== '') {
        formData.append('action', "bancustomer");
        formData.append('tName', "customerbanlist");
        formData.append('bancustomernames', bancustomernames);
        formData.append('bancustomerphonenumber', bancustomerphonenumber);
        formData.append('bancustomeraddress', bancustomeraddress);
        formData.append('bancustomerorderdate', bancustomerorderdate);
        formData.append('wherewasordered', wherewasordered);

        xhttp.send(formData);
        
        document.getElementById('bancustomernames').value   = '';
        document.getElementById('bancustomerphonenumber').value = '';
        document.getElementById('bancustomeraddress').value = '';
        document.getElementById('bancustomerorderdate').value = '';
        document.getElementById('wherewasordered').value = '';
        
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Check for product issues
function checkIssues() {
  // Create a FormData object
  var formData = new FormData();

  // Make a request to check for product issues like out of stock, missing info or pictures
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        var i, j, SKU, Name, Problem;
        if (localization === "BG") {
          SKU     = "Арт. номер";
          Name    = "Име на продукта";
          Problem = "Проблем";
        } else {
          SKU     = "SKU";
          Name    = "Name";
          Problem = "Problem";
        }
        var itemproblem = "";
        
        j = `<table><tr><th>${SKU}</th><th>${Name}</th><th>${Problem}</th></tr>`;
        for (i of data) {
          /*if (localization === "BG") {
            if (i.includes("LESS THAN 2")) {
              itemproblem = `ПО-МАЛКО ОТ 2 БРОЙКИ В МАГАЗИНА (в момента ${i[length - 1]} бр)`;
            }
            
            if (i.includes("NOPICTURES")) {
              itemproblem += " | ПРОДУКТА НЯМА СНИМКА";
            }
          }*/
          j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td></tr>`;
        }
        j += "</table>";
        document.getElementById("checkissuespopup").innerHTML = j;
        
        document.getElementById("productissues").innerHTML = data.length;
        document.getElementById("productissues").classList.add("blink");
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  formData.append('action', "checkissues");
  formData.append('tName', "products");
        
  xhttp.send(formData);
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
        
        var i, j, Date, User, Message, Status;
        if (localization === "BG") {
          j = "<table><tr><th>Дата</th><th>Потребител</th><th>Съобщение</th><th>Статус</th></tr>";
        } else {
          j = "<table><tr><th>Date</th><th>User</th><th>Message</th><th>Status</th></tr>";
        }
        for (i of data) {
          j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
        }
        j += "</table>";
        document.getElementById("usermessagespopup").innerHTML = j;
        
        document.getElementById("usermessages").innerHTML = data.length;
        document.getElementById("usermessages").classList.add("blink");
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  formData.append('action', "checkmessages");
  formData.append('tName', "messages");
        
  xhttp.send(formData);
}

// Send user message
function sendMessage() {
  ;
}

setLocalization();
