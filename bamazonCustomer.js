//importing modules and declaring a variable used for spacing logs, as well as a couple variables to
//overcome functional scopes. I need to look up and learn a better way to solve this problem.
var mysql = require('mysql');
var inquirer = require('inquirer');
var spacer = '========================================================';
var bf = " | ";
var choice;
var stock;
var dataList;

//establishing a connection to my hosted connection for my database of mySQL workbench
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '123',
    database: 'bamazon'
});

//Once the connection is established a query is initiated and within it a welcome message is displayed
//(a little too big of one), and the only explicitly called function that will be called, as all
//other are then called within it
connection.connect(function (err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log(`
    #  !▄█!!!!!█▄!!!!!▄████████!!▄█!!!!!!!!▄████████!!▄██████▄!!!!!▄▄▄▄███▄▄▄▄!!!!!!▄████████!!!
    #  ███!!!!!███!!!███!!!!███!███!!!!!!!███!!!!███!███!!!!███!!▄██▀▀▀███▀▀▀██▄!!!███!!!!███!!!
    #  ███!!!!!███!!!███!!!!█▀!!███!!!!!!!███!!!!█▀!!███!!!!███!!███!!!███!!!███!!!███!!!!█▀!!!!
    #  ███!!!!!███!!▄███▄▄▄!!!!!███!!!!!!!███!!!!!!!!███!!!!███!!███!!!███!!!███!!▄███▄▄▄!!!!!!!
    #  ███!!!!!███!▀▀███▀▀▀!!!!!███!!!!!!!███!!!!!!!!███!!!!███!!███!!!███!!!███!▀▀███▀▀▀!!!!!!!
    #  ███!!!!!███!!!███!!!!█▄!!███!!!!!!!███!!!!█▄!!███!!!!███!!███!!!███!!!███!!!███!!!!█▄!!!!
    #  ███!▄█▄!███!!!███!!!!███!███▌!!!!▄!███!!!!███!███!!!!███!!███!!!███!!!███!!!███!!!!███!!!
    #  !▀███▀███▀!!!!██████████!█████▄▄██!████████▀!!!▀██████▀!!!!▀█!!!███!!!█▀!!!!██████████!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!▀!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!███!!!!!!▄██████▄!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!▀█████████▄!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!▀███▀▀██!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!███!!!▀!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!███!!!!!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!███!!!!!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!███!!!!!███!!!!███!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!▄████▀!!!!▀██████▀!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #  ▀█████████▄!!!!!▄████████!!!!▄▄▄▄███▄▄▄▄!!!!!!▄████████!!▄███████▄!!!▄██████▄!!███▄▄▄▄!!!
    #  !!███!!!!███!!!███!!!!███!!▄██▀▀▀███▀▀▀██▄!!!███!!!!███!██▀!!!!!▄██!███!!!!███!███▀▀▀██▄!
    #  !!███!!!!███!!!███!!!!███!!███!!!███!!!███!!!███!!!!███!!!!!!!▄███▀!███!!!!███!███!!!███!
    #  !▄███▄▄▄██▀!!!!███!!!!███!!███!!!███!!!███!!!███!!!!███!!▀█▀▄███▀▄▄!███!!!!███!███!!!███!
    #  ▀▀███▀▀▀██▄!!▀███████████!!███!!!███!!!███!▀███████████!!!▄███▀!!!▀!███!!!!███!███!!!███!
    #  !!███!!!!██▄!!!███!!!!███!!███!!!███!!!███!!!███!!!!███!▄███▀!!!!!!!███!!!!███!███!!!███!
    #  !!███!!!!███!!!███!!!!███!!███!!!███!!!███!!!███!!!!███!███▄!!!!!▄█!███!!!!███!███!!!███!
    #  ▄█████████▀!!!!███!!!!█▀!!!!▀█!!!███!!!█▀!!!!███!!!!█▀!!!▀████████▀!!▀██████▀!!!▀█!!!█▀!!
    #  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    startUp();
    
})

//A checkpoint function that is called at the end of all others to prompt the user if they want to exit,
//or begin the process over.
function continueShop(){
    inquirer.prompt([{
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to continue shopping?'
    }])
    .then(function(res){
        switch(res.continue){
            case true:   
            displayItems();
            break;
            
            case false:
            exit();
            break;
        }
    })
}

//This function after the query has populated the list of items in the database, prompts the user 
//for a choice of item to purchase.
function pickItem() {
    inquirer.prompt([{
            type: "input",
            name: "start",
            message: "Please enter the ID of the item you wish to purchase."
        }])
        .then(function (ans) {

            //Placing the users choice in a variable first declared globally, its placed into another query
            //to grab specified values for use later.
            choice = ans.start;
            connection.query('SELECT * FROM products WHERE item_id = ? ORDER BY item_id', choice, function (err, results) {
                if (err) {
                    console.log(err);
                    return;
                }

                //A validation check, if they choose a number not in the database, it restarts,
                //prompting again.
                else if(choice > dataList || choice < 1){
                    
                console.log(spacer);
                console.log("No item exists with the Item ID!\n");
                console.log("Please enter another Item ID");
                console.log(spacer);
                pickItem();

                //Here the values that were grabbed are placed into the variables and the price
                //is calculated and pushed into a callback function.
                }else if (results) {
                    stock = results[0].stock_quantity;
                    var price = results[0].price;
                    buy(price, stock);
                
                //If somehow neither of these requirements are meant the program exits.
                } else {
                    exit();
                }
            })
        })
}

//Here is the callback function which passes the arguments in, and upon recieving a response from
//the following prompt, calcutes the price and passes it the user, calling the continueShop function
//once again, asking if to exit, or restart.
function buy(price, stock) {
    inquirer.prompt([{
            type: 'input',
            name: 'amount',
            message: 'How many would you like to purchase?'
        }])
        .then(function (res) {
            
            //Before the cost is calculated, the amount is tested against a conditional
            //to make sure it is not above the stock_quantity, if so, alerts such to the user,
            //and prompts the user again for a number that fulfills the limit. 
            var amount = res.amount;
            if (res.amount > stock) {
                console.log(spacer);
                console.log("You want more than we have available!\n");
                console.log("Please enter another amount.");
                console.log(spacer);
                buy(price, stock);
            } else {
                var cost = res.amount * price;
                var updated = stock - amount;
                console.log(spacer);
                console.log("You're total cost is: $" + cost);
                deduct(updated, choice);
                console.log("We're down to " + updated + " of that product!");
                console.log(spacer);
                continueShop();
            }
        })
}

//Quick small callback function of a query to update the database with the new amount following the sale.
function deduct(updated, choice) {
    connection.query('UPDATE products SET stock_quantity = ' + updated + ' WHERE item_id = ?', choice, function (res) {
    })
}

//The initial function used to populate the screen after querying for all the available products in the
//database.
function displayItems(){

    console.log('Here is a list of the available products!');
    connection.query('SELECT * FROM products', function (err, results, fields) {
        dataList = results.length;
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < results.length; i++) {
            console.log(spacer);
            console.log('Item #: ' + results[i].item_id + bf +
                'Product: ' + results[i].product_name + bf +
                'Department: ' + results[i].department_name + bf + 
                'Price: ' + results[i].price + bf +
                "Stock: "+ results[i].stock_quantity);
            console.log(spacer);
        }
        pickItem();
    });
    
}

//The first function called, simply asking the user if they wish to continue or exit the program, and
//if they continue, begins a domino effect, calling other functions along the way.
function startUp() {
    inquirer.prompt([{
            type: "list",
            name: 'begin',
            message: 'Would you like to purchase an item?',
            choices: ["Yes", "No! I'll be on my way"]
        }])
        .then(function (res) {
            switch (res.begin) {

                case "Yes":
                    displayItems();
                    
                    break;

                case "No! I'll be on my way":
                    exit();
                    break;

            }
        })
}

//The simple exit function called throughtout the program, if called ends the connection, and displays
//a message telling the user the program is ended.
function exit() {
    connection.end(function (err) {
        console.log(spacer);
        console.log('Thank you for shopping with us\r\n');
        console.log(`
        #                    8888888b.  888      8888888888        d8888  .d8888b.  8888888888                  
        #                    888   Y88b 888      888              d88888 d88P  Y88b 888                         
        #                    888    888 888      888             d88P888 Y88b.      888                         
        #                    888   d88P 888      8888888        d88P 888  "Y888b.   8888888                     
        #                    8888888P"  888      888           d88P  888     "Y88b. 888                         
        #                    888        888      888          d88P   888       "888 888                         
        #                    888        888      888         d8888888888 Y88b  d88P 888                         
        #                    888        88888888 8888888888 d88P     888  "Y8888P"  8888888888                  
        #                                                                                                       
        #                                                                                                       
        #                                                                                                       
        #   .d8888b.   .d88888b.  888b     d888 8888888888       888888b.          d8888  .d8888b.  888    d8P  
        #  d88P  Y88b d88P" "Y88b 8888b   d8888 888              888  "88b        d88888 d88P  Y88b 888   d8P   
        #  888    888 888     888 88888b.d88888 888              888  .88P       d88P888 888    888 888  d8P    
        #  888        888     888 888Y88888P888 8888888          8888888K.      d88P 888 888        888d88K     
        #  888        888     888 888 Y888P 888 888              888  "Y88b    d88P  888 888        8888888b    
        #  888    888 888     888 888  Y8P  888 888              888    888   d88P   888 888    888 888  Y88b   
        #  Y88b  d88P Y88b. .d88P 888   "   888 888              888   d88P  d8888888888 Y88b  d88P 888   Y88b  
        #   "Y8888P"   "Y88888P"  888       888 8888888888       8888888P"  d88P     888  "Y8888P"  888    Y88b 
        #                                                                                                       
        #                                                                                                       
        #                                                                                                       
        #                                 .d8888b.   .d88888b.   .d88888b.  888b    888                         
        #                                d88P  Y88b d88P" "Y88b d88P" "Y88b 8888b   888                         
        #                                Y88b.      888     888 888     888 88888b  888                         
        #                                 "Y888b.   888     888 888     888 888Y88b 888                         
        #                                    "Y88b. 888     888 888     888 888 Y88b888                         
        #                                      "888 888     888 888     888 888  Y88888                         
        #                                Y88b  d88P Y88b. .d88P Y88b. .d88P 888   Y8888                         
        #                                 "Y8888P"   "Y88888P"   "Y88888P"  888    Y888                         
        #                                                                                                       
        #                                                                                                       
        #                                                                                                       `);
    });
};