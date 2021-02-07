'use strict';

console.clear();

//var lang = "EN";
var lang = "BG";
var obj = JSON.parse(translations);

function switchLang() {
  for (var elem in obj[lang]) {
    switch (obj[lang][elem].property) {
      case "innerHTML":   document.getElementById(obj[lang][elem].id).innerHTML   = obj[lang][elem].translation; break;
      case "textContent": document.getElementById(obj[lang][elem].id).textContent = obj[lang][elem].translation; break;
      case "placeholder": document.getElementById(obj[lang][elem].id).placeholder = obj[lang][elem].translation; break;
      case "title":       document.getElementById(obj[lang][elem].id).title       = obj[lang][elem].translation; break;
    }
  }
}

function loadPreview() {
  var image = document.getElementById('prodpicture');
	image.src = URL.createObjectURL(event.target.files[0]);
}

function imgNotAvail() {
  var image = document.getElementById('prodpicture');
  if (image.src != 'image-not-available.jpg') {
    image.src = 'image-not-available.jpg';
  }
}

function addProduct() {
  var name        =  document.getElementById('name').value;
  var number      =  document.getElementById('number').value;
  //var category    =  document.getElementById('category').value;
  var quantity    =  document.getElementById('quantity').value;
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
    if (["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
      formData.append('pictures', file, file.name); // Add the file to the AJAX request
      //document.getElementById("prodpicuploadbuttontext").textContent = "Снимката беше добавена успешно";
      //document.getElementById("prodpicuploadbuttontext").style.backgroundColor = "green";
    } else {
      pictures.value = '';
      document.getElementById("prodpicuploadbuttontext").textContent = "This picture format is not supported";
      document.getElementById("prodpicuploadbuttontext").style.backgroundColor = "red";
      return false;
    }
  } else { pictures.value = ''; return false; }
  
  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (lang === "BG") {
          if (this.responseText.includes("added")) {
            document.getElementById("newproductresults").innerHTML = "Продуктът беше успешно добавен!";
            document.getElementById("newproductresults").style.backgroundColor = "green";
            document.getElementById('prodpicture').src = '';
          } else {
              document.getElementById("newproductresults").innerHTML = "Продукт със същия арт. номер е вече качен!";
              document.getElementById("newproductresults").style.backgroundColor = "red";
              document.getElementById('prodpicture').src = '';
            }
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
      contractor  !== '' && 
      price       !== '') {
        formData.append('action', "new");
        formData.append('tName', "products");
        formData.append('name', name);
        formData.append('number', number);
        //formData.append('category', category);
        formData.append('quantity', quantity);
        formData.append('contractor', contractor);
        formData.append('price', price);
        //formData.append('info', info);
        //formData.append('prodlinks', prodlinks);
        
        xhttp.send(formData);
        
        document.getElementById('name').value = '';
        document.getElementById('number').value = '';
        //document.getElementById('category').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('contractor').value = '';
        document.getElementById('price').value = '';
        //document.getElementById('info').value = '';
        //document.getElementById('prodlinks').value = '';
  } else {
      alert("Error: Some fields are empty!");
  }
}

// Search for a product in the database
function searchProduct() {
  //var searchNumber = document.getElementById('searchnumber').value;
  var searchNumber = document.getElementById('number').value;

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
        if (Object.keys(data).length == 1) {
          document.getElementById("newproductresults").innerHTML              = data;
          document.getElementById("newproductresults").style.backgroundColor  = "red";
          document.getElementById("prodpicture").src                          = '';
          document.getElementById("name").value                               = '';
          document.getElementById("quantity").value                           = '';
          document.getElementById("contractor").value                         = '';
          document.getElementById("price").value                              = '';
        } else {
          document.getElementById("newproductresults").innerHTML                = '';
          document.getElementById("newproductresults").style.backgroundColor    = 'transparent';
          document.getElementById("prodpicture").src                            = '';
          document.getElementById("prodpicture").style.backgroundColor          = "black";
          document.getElementById("search-results-form").style.backgroundColor  = "black";
          for (i of data) {
            switch (Object.keys(i)[0]) {
              case "Name":                    document.getElementById("name").value             = i[Object.keys(i)[0]]; break;
              case "Quantity in shop":        document.getElementById("quantity").value         = i[Object.keys(i)[0]]; break;
              case "Contractor":              document.getElementById("contractor").value       = i[Object.keys(i)[0]]; break;
              case "Price":                   document.getElementById("price").value            = i[Object.keys(i)[0]]; break;
              case "Picture":                 document.getElementById("prodpicture").src        = i[Object.keys(i)[0]]; break;
            }
          }
        }
        /*document.getElementById("searchresults").classList.remove("testtest");
        document.getElementById("searchresults").classList.add("testtest");*/
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
        formData.append('number', searchNumber);
        
        xhttp.send(formData);
        
        //document.getElementById('number').value = '';
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
        if (lang === "BG") {
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
        if (lang === "BG") {
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

// Show sales per a given date
function checkSales() {
  document.getElementById("soldproductsresults").innerHTML = '';
  
  var soldproductsdate    = document.getElementById('soldproductsdate').value;
  
  // Create a FormData object
  var formData = new FormData();

  // Make a request to add the product
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        
        var i, j, SKU, ItemDescription, Quantity, SoldIn;
        if (lang === "BG") {
          SKU             = "Арт. номер";
          ItemDescription = "Описание на продукта";
          Quantity        = "Брой";
          SoldIn          = "Продадено в";
        } else {
          SKU             = "SKU";
          ItemDescription = "Item description";
          Quantity        = "Quantity";
          SoldIn          = "Sold in";
        }
      
        if (data !== 0) {
          j = `<table><tr><th>${SKU}</th><th>${ItemDescription}</th><th>${Quantity}</th><th>${SoldIn}</th></tr>`;
          for (i of data) {
            /*if (lang === "BG") {
              if (i.includes("LESS THAN 2")) {
                itemproblem = `ПО-МАЛКО ОТ 2 БРОЙКИ В МАГАЗИНА (в момента ${i[length - 1]} бр)`;
              }
              
              if (i.includes("NOPICTURES")) {
                itemproblem += " | ПРОДУКТА НЯМА СНИМКА";
              }
            }*/
            j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
          }
          j += "</table>";
          document.getElementById("soldproductsresults").innerHTML = j;
        } else document.getElementById("soldproductsresults").innerHTML = "No sales are recorded at this date!";
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (soldproductsdate !== '') {
        formData.append('action', "sales");
        formData.append('tName', "sales");
        formData.append('soldproductsdate', soldproductsdate);
        
        xhttp.send(formData);

        document.getElementById('soldproductsdate').value = '';
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
      }
      else {
        alert("Error: returned status code " + this.status + " " + this.statusText);
      }
    }
  };
    
  xhttp.open("POST", "index.php", true);
  
  //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhttp.setRequestHeader("Content-type", "multipart/form-data; charset=utf-8; boundary=---------------------------974767299852498929531610575");
  
  if (customerphonenumber     !== '' && 
      customernames           !== '' && 
      customeraddress         !== '' && 
      orderdate               !== '' && 
      wherewasordered         !== '') {
        formData.append('action', "bancustomer");
        formData.append('tName', "customerbanlist");
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
        
        var i, j, SKU, Name, Problem, From;
        if (lang === "BG") {
          SKU     = "Арт. номер";
          Name    = "Име на продукта";
          Problem = "Проблем";
          From    = "Доставчик";
        } else {
          SKU     = "SKU";
          Name    = "Name";
          Problem = "Problem";
          From    = "Contractor";
        }
        //var itemproblem = "";
        
        if (data !== 0) {
          j = `<table><tr><th>${SKU}</th><th>${Name}</th><th>${Problem}</th><th>${From}</th></tr>`;
          for (i of data) {
            /*if (lang === "BG") {
              if (i.includes("LESS THAN 2")) {
                itemproblem = `ПО-МАЛКО ОТ 2 БРОЙКИ В МАГАЗИНА (в момента ${i[length - 1]} бр)`;
              }
              
              if (i.includes("NOPICTURES")) {
                itemproblem += " | ПРОДУКТА НЯМА СНИМКА";
              }
            }*/
            j += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${i[3]}</td></tr>`;
          }
          j += "</table>";
          document.getElementById("issuesresults").innerHTML = j;
          
          document.getElementById("productissues").innerHTML = data.length;
          document.getElementById("productissues").classList.add("blink");
        } else document.getElementById("issuesresults").innerHTML = "NO PROBLEMS FOUND!";
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
        } else document.getElementById("usermessagesresults").innerHTML = "NO NEW MESSAGES!";
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

switchLang();
