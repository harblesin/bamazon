var mysql = require('mysql');
var inquirer = require('inquirer');
var spacer = "=============================================================";

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '123',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) {
        console.log(err);
    }

    console.log('Welcome Manager!');
    inquirer.prompt([{
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: ['View Products For Sale',
                'View Low Inventory',
                'Add To Inventory',
                'Add New Product'
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
                    addTo();
                    break;

                case "Add New Product":
                    break;

                default:
                    exit();
            }

        })
})

function grabProducts() {
    connection.query('SELECT * FROM products', function (err, res, fields) {
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < res.length; i++) {
            console.log(spacer);
            console.log("Item ID: " + res[i].item_id +
                "\nProduct: " + res[i].product_name +
                "\nDepartment: " + res[i].department_name +
                "\nPrice: " + res[i].price +
                "\nStock: " + res[i].stock_quantity);
            console.log(spacer);
        };
        exit();
    })
}

function lowInv() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 3',
        function (err, res, fields) {
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < res.length; i++) {
                console.log(spacer);
                console.log("Item ID: " + res[i].item_id +
                    "\nProduct: " + res[i].product_name +
                    "\nDepartment: " + res[i].department_name +
                    "\nPrice: " + res[i].price +
                    "\nStock: " + res[i].stock_quantity);
                console.log(spacer);
            };
            exit();
        })
};

function addTo() {
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
            var addAmount = res.amount;
            connection.query('SELECT stock_quantity FROM products WHERE item_id = ?', id, function (err, response, field) {
                
                var update = response + addAmount;

                connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', update, id,
                    function (err, res, fields) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(res);
                        exit();
                    })
            })

        })

}

function exit() {
    connection.end(function (err) {
        if (err) {
            console.log('Error disconnecting.');
        }
        console.log(spacer);
        console.log("Logging out . . .");
    })
}