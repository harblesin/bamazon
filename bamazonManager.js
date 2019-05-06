//The two appropriate modules are imported, two spacing variables are declared,
//and one one global variable for referenceing.
var mysql = require('mysql');
var inquirer = require('inquirer');
var spacer = "=============================================================";
var update;
var bf = " | ";

//Data for the connection that will be connected to is defined.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '123',
    database: 'bamazon'
});

//Database server connection is established, a welcome message displayed,
//and the first function is run, asking the user what they want to do.
connection.connect(function (err) {
    if (err) {
        console.log(err);
    }
    console.log('Welcome Manager!');
    prompt();
});

//Defining of the first function and the one that will be placed throughout at the end
//of other functions, prompting either exit or a restart. A navigator function.
function prompt(){
    inquirer.prompt([{
        type: 'list',
        name: 'menu',
        message: 'What would you like to do?',
        choices: ['View Products For Sale',
            'View Low Inventory',
            'Add To Inventory',
            'Add New Product',
            'Exit'
        ]
    }])
    .then(res => {

        switch (res.menu) {

            case "View Products For Sale":
                grabProducts();
                break;

            case "View Low Inventory":
                lowInv();
                break;

            case "Add To Inventory":
                addToChoice();
                break;

            case "Add New Product":
                addNew();
                break;
            
            case "Exit":
                exit();
                break;

            default:
                exit();
        };
    });
};

//Function that simply grabs all items from the table and displays them for the user.
function grabProducts() {
    connection.query('SELECT * FROM products', function (err, res, fields) {
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < res.length; i++) {
            console.log(spacer);
            console.log("Item ID: " + res[i].item_id + bf +
                    "Product: " + res[i].product_name + bf +
                    "Department: " + res[i].department_name + bf +
                    "Price: " + res[i].price + bf +
                    "Stock: " + res[i].stock_quantity +bf);
            console.log(spacer);
        };
        prompt();
    });
};

//Function that does the same as grabProducts but limits the search to that of products
//with a stock_quantity less that 10.
function lowInv() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 10',
        function (err, res, fields) {
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < res.length; i++) {
                console.log(spacer);
                console.log("Item ID: " + res[i].item_id + bf +
                    "Product: " + res[i].product_name + bf +
                    "Department: " + res[i].department_name + bf +
                    "Price: " + res[i].price + bf +
                    "Stock: " + res[i].stock_quantity +bf);
                console.log(spacer);
            };
            prompt();
        });
};

//This function when called prompts the user for a choice item, and amount they
//want to add to the stock_quantity.
function addToChoice() {
    inquirer.prompt([{
                type: 'input',
                name: 'id',
                message: 'Please type the item ID to which you would like to add.'
            },
            {
                type: 'input',
                name: 'amount',
                message: 'How much would you like to add?'
            }
        ])
        .then(res => {
            var id = res.id;
            var addAmount = parseInt(res.amount);
            
            //Callback function called passing in the arguments to grab the correct
            //item the user wants to change, and passes in the amount the user enters to
            //add, into a variable within the function to be used in another function
            //within. Also it's turned into a integer before its passed in.
            grabStock(id, addAmount);
        });
};

//This when called passes in the id of the item it would like to modify for the query, and the 
//amount by which they want to change it, and store it in a variable which is passes into the
//addToUpdate function upon completing the query and grabbing the correct item from the table.
function grabStock(id, addAmount){
    connection.query('SELECT stock_quantity FROM products WHERE item_id = ?', id,
             function (err, response, field) {
                var stock = response[0].stock_quantity
                update = stock + addAmount;

                //Function taking in the updated stock amount, and the id 
                //of the item it wants to change.
                addToUpdate(update,id);
            });
};

//Function at the bottom of the pile, once all corresponding variables are passed in, calls a 
//query to the database, changing the stock value to the updated value.
function addToUpdate(update,id){
    connection.query("UPDATE products SET stock_quantity = " +update+ " WHERE item_id = ?", id,
                    function (err, res, fields) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(spacer);
                        console.log("Item stock successfully replenished!");
                        console.log(spacer);
                        prompt();
                    });
};

//This function prompts the user for the values required to add a new row in the table.
function addNew(){
    inquirer.prompt([{
        type: "input",
        name: "product",
        message: "What is the product you would like to add?"
    },
    {
        type: "input",
        name: "department",
        message: "What department is the product?"
    },
    {
        type: "input",
        name: "price",
        message: "Please set the price for the new product."
    },
    {
        type: "input",
        name: "stock",
        message: "Please enter the amount of the product in stock."
    }])
    .then(res => {

        //Creates an array and pushes the answers from the prompt so they can be put into
        //the following query to the database in a simpler statement.
        var values = [];
        values.push(res.product);
        values.push(res.department);
        values.push(res.price);
        values.push(parseInt(res.stock)); 

        //Queries the database creates a new row with the corresponding values the user enters.
        connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?)",
        [values],function(err, results){
            if(err){
                console.log(err)
            }
            console.log("New Product Added!");
            prompt();
        });
    });  
};

//This is called to close the connection and exit the program and is prompted to
//the user in between each of the other functions.
function exit() {
    connection.end(function (err) {
        if (err) {
            console.log('Error disconnecting.');
        }
        console.log(spacer);
        console.log("Logging out . . .");
    });
};