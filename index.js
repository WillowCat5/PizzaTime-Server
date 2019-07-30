const express = require('express')
const app = express()

const db = require("mongodb")
const dbLink = "mongodb://localhost:27017"
const MongoClient = db.MongoClient

const assert = require('assert')

const mongoClient = new MongoClient(dbLink, { useNewUrlParser: true } )
const mongoDBName = 'PizzaTime'
var mongoDB
var collection = {}

mongoClient.connect(function(err) {
    assert.equal(null, err)
    console.log("Connected to Mongo")
    // Get a handle to our database
    mongoDB = mongoClient.db(mongoDBName)

    // Get a handle to all of the collections
    const collList = ['Accounts','Orders','Products','Pages']
    collList.some(element => {
        // Store the handles in this object, making it easier to access them
        collection[element] = mongoDB.collection(element)
    })

    app.listen("8080", () => {
        console.log("Server started on 8080")
    })

})

///////////////////////////////////////////////////////////////

// Express initialization
app.use(express.json('*/*'))

// Helper functions used throughout much of the code below
function respondOK(res,obj) {
    obj = { ...obj, "resultCode" : 200, "result": "OK" }
    res.send(JSON.stringify(obj))
}

// ToDo: refactor all the insertOne functions here


////////////////// API and DB calls ///////////////////////////

/////-----      customer
app.post('/account/newuser', (req, res) => {
    let accountData = req.body
    // Todo: sanitize the data and do security checks here.
    registerNewUser(accountData,(respObj) => respondOK(res,respObj))
    // Normally, if there was an error, we wouldn't respondOK...
    // IOW, put some error-checking/handling code here
})

function registerNewUser(accountData,cb) {
    collection.Accounts.insertOne(accountData).then( 
        (myResult) => 
            cb({ ops: myResult.ops, 
                 insertedCount: myResult.insertedCount, 
                 insertedId: myResult.insertedId})
    )
}

app.get('/account/detail/:accountNum', (req, res) => {
    let accountNum = req.params.accountNum
    retrieveUser(accountNum,(respObj) => respondOK(res,respObj))
})

function retrieveUser(accountNum,cb) {
    collection.Accounts.findOne({ accountNum: parseInt(accountNum)}.then((err, item) => cb(item))
}


/////-----      products
app.post('/product/newitem', (req, res) => {
    let productData = req.body
    // Todo: sanitize the data and do security checks here.
    registerNewItem(productData,(respObj) => respondOK(res,respObj))
})

function registerNewItem(productData,cb) {
    collection.Products.insertOne(productData).then( 
        (myResult) => 
            cb({ ops: myResult.ops, 
                 insertedCount: myResult.insertedCount, 
                 insertedId: myResult.insertedId})
    )
}

app.get('/product/detail/:productNum', (req, res) => {
    let productNum = req.params.productNum
    retrieveItem(productNum,(respObj) => respondOK(res,respObj))
})

function retrieveItem(productNum,cb) {
    collection.Products.findOne({ productNum: parseInt(productNum)}.then((err, item) => cb(item))
}


/////-----      orders
app.post('/order/newitem', (req, res) => {
    let orderData = req.body
    // Todo: sanitize the data and do security checks here.
    registerNewOrder(orderData,(respObj) => respondOK(res,respObj))
})

function registerNewOrder(orderData,cb) {
    collection.Orders.insertOne(orderData).then( 
        (myResult) => 
            cb({ ops: myResult.ops, 
                 insertedCount: myResult.insertedCount, 
                 insertedId: myResult.insertedId})
    )
}

app.get('/order/detail/:orderNum', (req, res) => {
    let orderNum = req.params.orderNum
    retrieveOrder(orderNum,(respObj) => respondOK(res,respObj))
})

function retrieveOrder(orderNum,cb) {
    collection.Orders.findOne({ orderNum: parseInt(orderNum)}.then((err, item) => cb(item))
}