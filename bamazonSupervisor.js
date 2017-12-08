var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

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
        "View all departments and products",
        "View products by department",
        "View total profit",
        "view product sales by department",
        "Create new Department",
      ]
    }) // when they give you an answer run the function affiliated
    .then(function(answer) {
      switch (answer.action) {

        case "View all departments and products":
          displayTable();
          break;

        case "View products by department":
          searchDepartments();
          break;

        case "View total profit":
          viewTotalProfit();
          break;

        case "view product sales by department":
          salesByDepartment();
          break;

        case "Create new Department":
          addNewDepartment();
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
  })
}


function searchDepartments() {

  connection.query("SELECT * FROM products GROUP BY department_name", function(err, results) {
    if (err) throw err; // show them all the departments
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].department_name);
    }

    // ask which department
    inquirer
      .prompt([{
          name: "select",
          type: "input",
          // then ask them what they want
          message: "Input the name of the department you wish to view? \n"
        }

      ])
      .then(function(answer) {
        console.log(answer.select);

        // get the information of that departmenT
        var chosenDepartment; // get the products in that department
        for (var i = 0; i < results.length; i++) {
          if (results[i].department_name == answer.select) {
            chosenDepartment = results[i].department_name; // chosen department is now that department
          }
        }
        connection.query("SELECT * FROM products WHERE department_name = '" + chosenDepartment + "'", function(err, res) {
          for (var i = 0; i < res.length; i++) { // show the product and how many units remain
            console.log(res[i].product_name + ", " + res[i].stock_quantity + " units remaining");
          }
          runSearch();
        });
      });

  });
}


// total profits
function viewTotalProfit() {
  // query the database for all items
  connection.query("SELECT * FROM departments", function(err, results) {
      if (err) throw err;

      var totalProfit = 0
      for (var i = 0; i < results.length; i++) { // get each departments sales and add them up
        totalProfit += parseInt(results[i].product_sales)
      } // tell them the total
      console.log("The total profit is: " + totalProfit);

      runSearch();
    }

  );

}


// add a new department
function addNewDepartment() {
  inquirer
    .prompt([

      { // ask the name of this new department
        name: "department_name",
        type: "input",
        message: "What is the name of the new department?"
      },
      { // ask the name of a product that will be in the department
        name: "over_head_costs",
        type: "input",
        message: "Please insert the over head costs of this department?"

      },


    ])
    .then(function(result) {
      // collect the variables
      var department_name = result.department_name;
      var over_head_costs = result.over_head_costs;


      // update the database
      connection.query('INSERT INTO departments SET ?', {
        department_name: department_name,
        over_head_costs: over_head_costs,
        product_sales: 0
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



function salesByDepartment() {
  // build a table
  var table = new Table({
    chars: {
      'top': '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      'bottom': '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      'left': '║',
      'left-mid': '╟',
      'mid': '─',
      'mid-mid': '┼',
      'right': '║',
      'right-mid': '╢',
      'middle': '│'
    }
  });

  table.push(
    ['department_id', 'department_name', 'over_head_costs', 'product_sales']


  );

  // get stuff going into table
  connection.query("SELECT * FROM departments GROUP BY department_name", function(err, results) {
    if (err) throw err; // show all department info in the table
    for (var i = 0; i < results.length; i++) {
      table.push( // put into the table
        [results[i].department_id, results[i].department_name, results[i].over_head_costs, results[i].product_sales])
    }

    console.log("\n" + table.toString());

  });

  runSearch();

}