'use strict';

function addProduct() {
  var name      =  document.getElementById('name').value;
  var number    =  document.getElementById('number').value;
  var category  =  document.getElementById('category').value;
  var quantity  =  document.getElementById('quantity').value;
  var available =  document.getElementById('available').value;
  var price     =  document.getElementById('price').value;
  var info      =  document.getElementById('info').value;
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
        document.getElementById("newproductresults").innerHTML = this.responseText;
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
      info      !== '') {
        formData.append('action', "new");
        formData.append('tName', "products");
        formData.append('name', name);
        formData.append('number', number);
        formData.append('category', category);
        formData.append('quantity', quantity);
        formData.append('available', available);
        formData.append('price', price);
        formData.append('info', info); 
        
        xhttp.send(formData);
        
        document.getElementById('name').value = '';
        document.getElementById('number').value = '';
        document.getElementById('category').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('available').value = '';
        document.getElementById('price').value = '';
        document.getElementById('info').value = '';
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
        document.getElementById("searchresults").innerHTML = this.responseText;
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
        document.getElementById("sellproductresults").innerHTML = this.responseText;
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
        document.getElementById("bancustomerresults").innerHTML = this.responseText;
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
        console.log(data);
        document.getElementById("productissues").innerHTML = data.length;
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
        console.log(data);
        document.getElementById("usermessages").innerHTML = data.length;
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

