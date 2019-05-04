var mysql = require('mysql');
var inquirer = require('inquirer');
var spacer = '========================================================';
var choice;
var stock;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '1800Petmeds?',
    database: 'bamazon'
});

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

    
    inquirer.prompt([{
            type: "input",
            name: "start",
            message: "Please enter the ID of the item you wish to purchase."
        }])
        .then(function (ans) {
            console.log('yes');
            choice = ans.start;
            connection.query('SELECT * FROM products WHERE item_id = ? ORDER BY item_id', choice, function (err, results) {
                if (err) {
                    console.log(err);
                    return;
                } else if (results) {
                    
                    stock = results[0].stock_quantity;
                    var price = results[0].price;
                    console.log(results);
                    buy(price, stock);
                    
                    //exit();
                } else {
                    exit();
                }
            })


        })

    //exit();
})

function buy(price, stock){
    inquirer.prompt([{
        type: 'input',
        name:'amount',
        message: 'How many would you like to purchase?'
    }])
    .then(function(res){
        var amount = res.amount;
        if(res.amount > stock){
            console.log("You want more than we have available!\n");
            console.log("Please enter another amount.");
            buy();
        }
        else{
            var cost = res.amount * price;
            var updated = stock - amount;
            // console.log(res.amount);
            // console.log(thisThing);
            console.log("You're total cost is: $" + cost);
            deduct(updated, choice);
            exit();
        }
    })
}

function deduct(updated, choice){
    connection.query('UPDATE products SET stock_quantity = '+ updated +' WHERE item_id = ?', choice, function(res){
        console.log("We're down to " + updated + " of that product!");
    } 
    )
}

function startUp() {
    console.log('Hello and welcome!');
    connection.query('SELECT * FROM products', function (err, results, fields) {
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < results.length; i++) {
            console.log(spacer);
            console.log('Item #: ' + results[i].item_id + '\nProduct: ' + results[i].product_name +
                '\nDepartment: ' + results[i].department_name + '\nPrice: ' + results[i].price);
            console.log(spacer);
        }
        //console.log(results)
    })
}

function exit() {
    connection.end(function (err) {
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
    })
};