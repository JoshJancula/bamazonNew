var mysql = require("mysql");
var inquirer = require("inquirer");
var totalCost = 0;

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
  purchase();
});

function displayTable(results) {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

    for (var i = 0; i < results.length; i++) {
      console.log("Item ID: " + results[i].item_id + ")" + " Product: " + results[i].product_name + " Price: " +
        results[i].price + " Units Available: " + results[i].stock_quantity);
    }
  })
}


function purchase() {
  // query the database for all items being sod
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err; // show them all the junk they can purchase
    displayTable(results);

    // once you have the items, ask the user what thye want to purchase
    inquirer
      .prompt([{
          name: "select",
          type: "input",
          // then ask them what they want
          message: "Enter the number of the item you'd like to purchase? \n"
        },
        { // then ask how many they want
          name: "quantity",
          type: "input",
          message: "How many units would you like?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem; // get the item id of that chosen product
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id == answer.select) {
            chosenItem = results[i]; // chosen item is now the id of that item
          }
        }

        // determine if we have enough units
        if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
          // var newQuantity = chosenItem.stock_quantity - answer.quantity;
          // we have enough in stock, so update db, let the user know, and start over
          connection.query(
            "UPDATE products SET ? WHERE ?", [{
                stock_quantity: parseInt(chosenItem.stock_quantity) - parseInt(answer.quantity)
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              totalCost = parseInt(chosenItem.price) * parseInt(answer.quantity)
              console.log("Thank you for your purchase!\nYour total cost is $" + totalCost + "\n");
              // updates department sales
              connection.query(
                "UPDATE departments SET product_sales = product_sales + " + totalCost +
                " WHERE departments.department_name = '" + chosenItem.department_name + "'",

                function(error) {
                  if (error) throw err;
                  purchase();
                }
              );
            }
          );

        }
        else {
          // we don't got that many
          console.log("Sorry we don't have enough units in stock to fulfill your order");
          purchase();
        }
      });
  });
}
