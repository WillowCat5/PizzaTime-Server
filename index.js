const express = require('express')
const app = express()

////
//const db = require("mongodb")
//const dbLink = "mongodb://localhost:27017/test"
//const MongoClient = db.MongoClient
////

app.use('/public',express.static('public'))
app.use(express.json('*/*'))

app.get('/', (req, res) => res.send('<html><body><h2>This is smaller</h2></body></html>'))
app.get('/test', (req, res) => res.send('<html><body><h1>This is bigger</h1></body></html>'))

let jsonObj = { "name": "supreme",
                "size": 12,
                "crust": "deep",
                "imgURL":  "http://www.sugardale.com/sites/default/files/stuffed%20crust%20pizza.jpg"
            }
                

app.get('/deals', (req, res) => res.send(JSON.stringify(jsonObj)))

app.listen(3000, 
    () => console.log("Listening on port 3000"))









/////-----      customer

app.post('/account/newuser', (req, res) => {
    //parse req for account data
    let accountData = req.body
    // ...
    registerNewUser(accountData)
    // Respond telling them that it worked...
    let respObj = { "resultCode": 200, "result": "OK"}
    res.send(JSON.stringify(respObj))
})


function registerNewUser(accountData) {
    console.log("Got user data", accountData)
    // submit data to mongo....
}
/*

getUserInfo(user)

modifyUserAccount(user,changes)

deleteUserAccount(user)

*/

/////-----      discover
/*
getMenu()

getWebsiteData()

*/

/////-----      order
/*
recordProductInRecentlyPurchased(product)

addToCart(product,amount)

removeFromCart(product,amount)

clearCart()

checkout()

sendOrderToStore(cart,customerinfo)


*/

/////-----     admin
/*

addProductToMenu(product)

removeProductFromMenu(product)

modifyProductOnMenu(product)

*/
