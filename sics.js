'use strict';

// Create needed constants
const pName = document.getElementsByName('productName');
const pNumber = document.getElementsByName('productNumber');
const pCategory = document.getElementsByName('productCategory');
const pQuantity = document.getElementsByName('productQuantity');
const pAvailable = document.getElementsByName('productAvailable');
const pPictures = document.getElementsByName('productPictures');
const pAdd = document.getElementsByName('addproduct');


// Add products to the database
function addProduct(e) {
  // Prevent default - we don't want the form to submit in the conventional way
  e.preventDefault();

  // Grab the values entered into the form fields and store them in an object ready for being inserted into the DB
  let newProduct = { 	productName: 			pName.value, 
											productNumber: 		pNumber.value, 
											productCategory: 	pCategory.value, 
											productQuantity: 	pQuantity.value,
                      productAvailable: pAvailable, 
                      productPictures: 	pPictures.value
										};

  // Make a request to add the product
  var request = function () {
    xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("searchresults").innerHTML = this.responseText;
      }
    };
    
    xhttp.open("POST", "http://127.0.0.1:8000/sics/index.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("tName=" + "products" + 
               "&pName=" + newProduct.productName + 
               "&pNumber=" + newProduct.productNumber + 
               "&pCategory=" + newProduct.productCategory + 
               "&pQuantity=" + newProduct.productQuantity + 
               "&pAvailable=" + newProduct.productAvailable + 
               "&pPictures=" + newProduct.productPictures);
  };
  
  request();
  
  // On successfull insert, clear the form to be ready for adding a new entry
  request.onsuccess = function() {
		pName.value = '';
		pNumber.value = '';
		pCategory.value = '';
		pQuantity.value = '';
    pAvailable.value = '';
    pPictures.value = '';
  };

  // Report when there's a problem with adding new product
  request.onerror = function() {
    console.log('Transaction not opened due to an error');
  };
}

// Search for a product in the database
function searchProduct() {
  
  executerequest();
  
  executerequest.onsuccess = function(e) {
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
  };
}

window.onload = function() {
	pAdd.onclick = addProduct();
  //pSearch.onclick = displayProducts;
};