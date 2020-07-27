'use strict';

function addProduct() {
  var name      =  document.getElementById('name').value;
  var number    =  document.getElementById('number').value;
  var category  =  document.getElementById('category').value;
  var quantity  =  document.getElementById('quantity').value;
  var available =  document.getElementById('available').value;
  var price =  document.getElementById('price').value;
  var info      =  document.getElementById('info').value;

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
  
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  
  if (name !== '' && 
      number !== '' && 
      category !== '' && 
      quantity !== '' && 
      available !== '' && 
      price !== '' && 
      info !== '') {
        xhttp.send("tName=products" + 
                   "&name="       + name + 
                   "&number="     + number + 
                   "&category="   + category + 
                   "&quantity="   + quantity + 
                   "&available="  + available + 
                   "&price="      + price + 
                   "&info="       + info); /*+ 
                   "&pictures=" + data.pictures);*/
                   
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
  
  //executerequest();
  
  /*executerequest.onsuccess = function(e) {
    if(e.state === true) {
      // Create a list item, h3, and p to put each data item inside when displaying it
      // structure the HTML fragment, and append it inside the list
      let listItem = document.createElement('li');
      let h3 = document.createElement('h3');
      let para = document.createElement('p');

      listItem.appendChild(h3);
      listItem.appendChild(para);
      list.appendChild(listItem);

      // Put the data from the cursor inside the h3 and para
      h3.textContent = cursor.value.title;
      para.textContent = cursor.value.body;

      // Create a button and place it inside each listItem
      let deleteBtn = document.createElement('button');
      listItem.appendChild(deleteBtn);
      deleteBtn.textContent = 'Delete';

      // Add an event handler for deleting a product from the database
      deleteBtn.onclick = deleteProduct;

      // Iterate to the next item in the cursor
      cursor.continue();
    } else {
      // Again, if list item is empty, display a 'No notes stored' message
      if(!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent = 'No products found';
        list.appendChild(listItem);
      }
    }
  };*/
}

// Sell a product and update the quantity left in the database
function sellProduct() {
  
  //executerequest();
  
  /*executerequest.onsuccess = function(e) {
    if(e.state === true) {
      // Create a list item, h3, and p to put each data item inside when displaying it
      // structure the HTML fragment, and append it inside the list
      let listItem = document.createElement('li');
      let h3 = document.createElement('h3');
      let para = document.createElement('p');

      listItem.appendChild(h3);
      listItem.appendChild(para);
      list.appendChild(listItem);

      // Put the data from the cursor inside the h3 and para
      h3.textContent = cursor.value.title;
      para.textContent = cursor.value.body;

      // Create a button and place it inside each listItem
      let deleteBtn = document.createElement('button');
      listItem.appendChild(deleteBtn);
      deleteBtn.textContent = 'Delete';

      // Add an event handler for deleting a product from the database
      deleteBtn.onclick = deleteProduct;

      // Iterate to the next item in the cursor
      cursor.continue();
    } else {
      // Again, if list item is empty, display a 'No notes stored' message
      if(!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent = 'No products found';
        list.appendChild(listItem);
      }
    }
  };*/
}