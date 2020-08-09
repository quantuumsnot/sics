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
  
  // Get the files from the form input
  var files = pictures.files;

  // Create a FormData object
  var formData = new FormData();
  
  // Select only the first file from the input array
  var file = files[0];

  if (file.type !== "image/jpg" || file.type !== "image/jpeg" ) { 
    alert('The file selected is not an image!'); 
    pictures.value = '';
    return false; 
  }
  
  // Add the file to the AJAX request
  formData.append('pictures', file, file.name);

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
  
  if (number !== '') {
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
  
  if (number !== '') {
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

