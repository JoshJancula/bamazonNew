var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"

});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  runSearch();
});



// initial intro to the app
function runSearch() {
  inquirer
    .prompt({ // ask user what they want to do
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [ // these are the options
        "View products for sale",
        "View low inventory",
        "Add new inventory",
        "Add new product",
      ]
    }) // when they give you an answer run the function affiliated
    .then(function(answer) {
      switch (answer.action) {
        case "View products for sale":
          displayTable();
          break;

        case "View low inventory":
          lowInventory();
          break;

        case "Add new inventory":
          addInventory();
          break;

        case "Add new product":
          addProduct();
          break;
      }
    });
}


// shows all the stuff we have for sale
function displayTable(results) {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // get each thing and display its info
    for (var i = 0; i < results.length; i++) {
      console.log("Item ID: " + results[i].item_id + ")" + " Product: " + results[i].product_name + " Price: " +
        results[i].price + " Units Available: " + results[i].stock_quantity);
    }
    runSearch();
  });
}

// shows every item with low inventory
function lowInventory() { // we want with quantity less than 10
  var query = "SELECT * FROM products WHERE stock_quantity < 10";
  connection.query(query, function(err, res) {
    for (var i = 0; i < res.length; i++) { // show the product and how many units remain
      console.log(res[i].product_name + ", " + res[i].stock_quantity + " units remaining");
    }
    runSearch();
  });
}



function addInventory() {
  // query the database for all items being sod
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    displayTable(results); // show them all items inventory
    // ask what they want to update
    inquirer
      .prompt([{
          name: "select",
          type: "input",
          // then ask them which products inventory they want to replinish
          message: "Which product would you like to add to?"
        },
        { // then ask how many units they want to add to inventory
          name: "quantity",
          type: "input",
          message: "How many units would you like to add?"
        }
      ])
      .then(function(answer) {
        console.log(answer.select);
        console.log(answer.quantity);
        var chosenItem; // get the item id of that chosen product
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id == answer.select) {
            chosenItem = results[i]; // chosen item is now the id of that item
          }
        }

        // update the stock quantity for the product
        connection.query(
          "UPDATE products SET ? WHERE ?", [{
              stock_quantity: parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity)
            },
            {
              item_id: chosenItem.item_id
            }
          ],
          function(error) {

            if (error) throw err;
            console.log("Got it!");
            runSearch();
          }
        );


      });
  });
}

// add a new product
function addProduct() {
  inquirer
    .prompt([

      { // then ask new product name
        name: "product_name",
        type: "input",
        message: "What is the new product_name?"
      },
      {
        name: "department_name",
        type: "input",
        message: "What department does it belong to?"
      },
      { // then ask the new price
        name: "price",
        type: "input",
        message: "What is the price?"
      },
      { // then ask how many units they want to add to inventory
        name: "stock_quantity",
        type: "input",
        message: "How many units are in stock?"
      }

    ])
    .then(function(result) {
      // collect the variables
      var product_name = result.product_name;
      var department_name = result.department_name;
      var price = result.price;
      var stock_quantity = result.stock_quantity;

      // update the database
      connection.query('INSERT INTO products SET ?', {
        product_name: product_name,
        department_name: department_name,
        price: price,
        stock_quantity: stock_quantity
      }, function(err, res) {
        // we experience an error
        if (err) {
          console.log("there was an error");
          connection.end(); // end the connection
        }
        else {
          console.log("Update Successfull!")
          connection.end(); // end the connection
          runSearch();

        }
      });
    });
}