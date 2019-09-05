// Set up Express
const express = require('express')
const app = express()
// Tell Express that we support JSON parsing
app.use(express.json('*/*'))
// Turn off CORS rules
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
const fs = require('fs')  // for JSON import
//const valid = require('validator')  // tried this library but decided to go for something more sophisticated
const Ajv = require('ajv')  // Another JSON (Schema) Validator, https://www.npmjs.com/package/ajv
let ajv = new Ajv( { allErrors: true } )  // ***** TODO: remove allErrors for production release, which fixes DoS issue

// Express routes are below the main runloop

// Set up MongoDB and associated variables
const db = require("mongodb")
const dbLink = "mongodb://localhost:27017"
const MongoClient = db.MongoClient

const mongoClient = new MongoClient(dbLink, { useNewUrlParser: true } )
const mongoDBName = 'PizzaTime'
let mongoDB
let collection = {}
let custAccountsValidator

// Use Assert for error checking
const assert = require('assert')

// async json import, see here: https://goenning.net/2016/04/14/stop-reading-json-files-with-require/
function readJson(path, cb) {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err)  cb(err)
        else  cb(null, JSON.parse(data))
    })
}

console.log("Connecting to Mongo")
// Connect to the database; once connected, we'll start our HTTP (express) listener
mongoClient.connect(err => {
    assert.equal(null, err)
    console.log("Connected to Mongo")
    // Get a handle to our database
    mongoDB = mongoClient.db(mongoDBName)

    // Convenience tool: get a handle to all of the collections
    const collList = ['Accounts','Orders','Products','Pages']
    collList.some( function(element) {  // *** forEach might be more efficient as it doesn't return anything
        // Store the handles in the "collections" object, making it easier to access them
        collection[element] = mongoDB.collection(element)
        // If we didn't do this, we'd possibly have to type the following
        // line of code all the time....
        // mongoClient.db('PizzaTime').collection('Accounts').insertOne(stuff)
    })

    // import schema(s)
    readJson('ajv/lib/refs/json-schema-secure.json', (err, securityJson) => {
        if (err) {
            console.log("Unable to import security schema, err: ", err)
            exit
        }
        let securitySchemaValidator = ajv.compile(securityJson)
        readJson('./custAccountsSchema2.json', (err, custJson) => {
            if (err) {
                console.log("Unable to import custAccountsSchema2 with error: ", err)
                exit  // quit server, which may already have started before cb called here
                // *** is there a "better" way to quit?  need to close db and express first?
            }
            
            custAccountsValidator = ajv.compile(custJson);
            if (!securitySchemaValidator(custJson)) {
                console.log("=== custAccountsSchema2 failed security check ===")
                // don't exit program, just complain and continue
            }
        })
    })
    

    console.log("Server starting on 8088")
    // Start Express
    app.listen("8088", () => {
        console.log("Server started on 8088")
    })

})

///////////////////////////////////////////////////////////////
// Items below this comment are Express API calls (event registrations)
// and the functions used by those API calls
///////////////////////////////////////////////////////////////

// Helper functions used by the API event handlers below
function respondOK(res,obj) {
    obj = { returned: obj, resultCode : 200, result: "OK" }
    res.send(JSON.stringify(obj))
}

function respondError(res,obj) {
    obj = { returned: obj, resultCode : 500, result: "NotOk" }
    res.send(JSON.stringify(obj))
}

function retrieveOne(coll,key,value,cb) {
    collection[coll].findOne({[key]: value}).then(cb)
}

function registerObject(coll,obj,cb) {
    console.log("Inserting into " + coll + ": ", obj);
    collection[coll].insertOne(obj).then((result) => {
        cb({ops: result.ops, insertedId: result.insertedId, insertedCount: result.insertedCount})
    })
}

function updateObject(coll,key,value,obj,cb) {
    collection[coll].updateOne({ [key]: value }, { $set: obj }).then((result) => {
        cb({ origObj: obj, modifiedCount: result.modifiedCount})
    })
}

function checkAccountData(accountData) {  // returns an error (string), or null if no issue
    if (!custAccountsValidator)  return 'server isn\'t ready, try again in a moment'  // schema may not be done being async loaded when a call happens to come in;  *** pause, auto-retry instead of failing?
    if (typeof accountData != 'object')  return 'unexpected data'  // *** should something like this be persistently logged somewhere?  may be a sign of a hacking attempt
    if (accountData.accountId)  return 'accountId should NOT exist on received data'
    accountData.accountId = 123  // placeholder value so next block doesn't complain;  *** need to generate a new *unique* id later

    if (!custAccountsValidator(accountData)) {
        console.log("=====")
        console.log(custAccountsValidator.errors)
        return custAccountsValidator.errors
    }

    // Object.keys(custAccountsSchema).forEach(key => {  // generically compare the top level elements in schema to input data
    //     console.log(key, " | ", accountData[key], ' | ', typeof accountData[key], ' | ', accountData[key].toString())  //  *** just for checking
    //     if (!accountData[key])  return `${key} doesn't exist in input data`
    //     if (accountData[key].toString.length > MAX_KEY_SIZE)  return `${key} is too long.  Maximum size is ${MAX_KEY_SIZE}`
    // })
    // if (!accountData.contacts.contacts1)  return 'no contact included'
    // // if (!accountData.addresses.address1)  return 'no address included'  // *** address may be optional, especially for pickup-only orders
    // if (!accountData.paymentMethods.payment1)  return 'no payment method included'
    
    // (done?) check if any fields are super long
    
    // *** check if any fields contain non-printing characters, using regex/pattern?  maybe combined with next thought:

    // *** check if certain fields make sense (like e-mail pattern)

    // *** password field should be changed for a hash or something, instead of the direct password it currently expects

    return null  // no error;  *** do we need to state null, or is it implied with a blank return?  doesn't hurt...
}
// ToDo: refactor all the insertOne functions here

////////////////// API and DB calls ///////////////////////////

/////-----      customer
app.post('/account/newuser', (req, res) => {
    let accountData = req.body
    // Todo: sanitize the data and do security checks here.

    //if (!accountData.firstName) { console.log("Missing first name")}  // this is now handled in checkAccountData()

    // check if main fields exist
    err = checkAccountData(accountData)
    if (err) {
        respondError(res, err)
        return  // be sure to return after sending a response, or we get an error about reusing res;  plus we don't want to register an invalid object
    }


    registerObject("Accounts",accountData,(returnedData) => respondOK(res,returnedData))
    // Normally, if there was an error, we wouldn't respondOK...
    // IOW, put some error-checking/handling code here, *** for if the database rejected the call
})

app.post('/account/change/:accountNum', (req, res) => {
    let accountData = req.body
    let num = parseInt(req.params.accountNum)
    // Todo: sanitize the data and do security checks here.
    updateObject("Accounts","accountNum",num,accountData,(obj) => respondOK(res,obj))
})

app.get('/account/detail/:accountNum', (req, res) => {
    let num = parseInt(req.params.accountNum)
    retrieveOne("Accounts","accountNum", num, (obj) => respondOK(res,obj))
})

// Preliminary search function

app.get('/account/search/:searchParam', (req, res) => {
    let searchParam = req.params.searchParam
    //console.log("Search param: '" + searchParam + "'")
    searchUser(searchParam,  (obj) => respondOK(res,obj)  )
})


function searchUser(searchParam,cb) {
    let pattern = searchParam
    collection.Accounts.find({
        $or: [
            { firstName: { $regex: pattern, $options: 'i'}},
            { lastName: { $regex: pattern, $options: 'i'}},   
            ]
    }, (err, cursor) => cursor.toArray((err, items) => cb(items)) )
}

/////-----      products
app.post('/product/newitem', (req, res) => {
    let productData = req.body
    let newitemNum = Math.floor(Math.random() * 10000) + 10000;
    productData.productNum = newitemNum

    if (!productData.productName) {
        respondError(res,"Invalid Product Name")
    }

    if (!productData.productSize) {
        respondError(res,"Product Size Undefined")
    }

    // Todo: sanitize the data and do security checks here.
    registerObject("Products",productData,(obj) => respondOK(res,obj))
})

app.post('/product/change/:productNum', (req, res) => {
    let productData = req.body
    let num = parseInt(req.params.productNum)
    // Todo: sanitize the data and do security checks here.
    updateObject("Products","productNum",num,productData,(obj) => respondOK(res,obj))
})

app.get('/product/detail/:productNum', (req, res) => {
    let num = parseInt(req.params.productNum)
    retrieveOne("Products", "productNum",num,(obj) => respondOK(res,obj))
})

/////-----      orders
app.post('/order/newitem', (req, res) => {
    let orderData = req.body
    // Todo: sanitize the data and do security checks here.
    registerObject("Orders",orderData,(obj) => respondOK(res,obj))
})

app.post('/order/change/:orderNum', (req, res) => {
    let orderData = req.body
    let num = parseInt(req.params.orderNum)
    // Todo: sanitize the data and do security checks here.
    updateObject("Orders","orderNum",num,orderData,(obj) => respondOK(res,obj))
})

app.get('/order/detail/:orderNum', (req, res) => {
    let num = parseInt(req.params.orderNum)
    retrieveOne("Orders","orderNum",num,(obj) => respondOK(res,obj))
})

/////-----      pages

app.post('/pages/newitem', (req, res) => {
    let pageData = req.body
    //console.log(req)
    // Todo: sanitize the data and do security checks here.
    registerObject("Pages",pageData,(obj) => respondOK(res,obj))
})

app.post('/pages/change/:pageNum', (req, res) => {
    let pageData = req.body
    let num = parseInt(req.params.pageNum)
    // Todo: sanitize the data and do security checks here.
    updateObject("Pages","pageNum",num,pageData,(obj) => respondOK(res,obj))
})

app.get('/pages/detail/:pageNum', (req, res) => {
    let num = parseInt(req.params.pageNum)
    retrieveOne("Pages", "pageNum",num,(obj) => respondOK(res,obj))
})
