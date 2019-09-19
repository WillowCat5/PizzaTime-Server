const dbclient = require('../helpers/db')
const { checkInput } = require('../helpers/schemas')
const { respondOK, respondError } = require('../helpers/responders')

let collection 
(async () => { collection = await dbclient.collections() })()



// ** todo:  helper functions (outputs)


// async function getAccountById(id) {
//     console.log("Looking for accounntID: ", id)
//     return await collection.accounts.findOne({ "accountID": id })
// }


// function getAccountById(req, res, next) {
//     accountService.getById(req.params.accountId)
//     .then(data => data ? res.json(data) : res.sendStatus(500))
//     .catch(err => next(err))
// }


function getAccount(req, res) {  // *** async functions?
    let id = parseInt(req.params.accountId)
    dbclient.retrieveOne("Accounts", "accountId", id, (obj) => respondOK(res, obj))
}

function newAccount(req, res) {
    let accountData = req.body
    if (accountData.accountId)  {
        respondError(res, 'accountId should NOT exist on received data')
        return
    }
    accountData.accountId = Math.floor(Math.random() * 10000) + 10000;
    // *** verify Id doesn't already exist in database?

    err = checkInput(accountData, "custAccount")
    if (err) {
        respondError(res, err)
        return  // be sure to return after sending a response, or we get an error about reusing res;  plus we don't want to register an invalid object
    }

    dbclient.registerObject("Accounts", accountData, (returnedData) => respondOK(res, returnedData))
    // Normally, if there was an error, we wouldn't respondOK...
    // IOW, put some error-checking/handling code here, *** for if the database rejected the call
}

function changeAccount(req, res) {
    let accountData = req.body
    let id = parseInt(req.params.accountId)
    // Todo: sanitize the data and do security checks here.
    dbclient.updateObject("Accounts", "accountId", id, accountData,(obj) => respondOK(res, obj))
}

// Preliminary search function

function searchAccount(req, res) {
    let searchParam = req.params.searchParam
    //console.log("Search param: '" + searchParam + "'")
    searchUser(searchParam, (obj) => respondOK(res, obj)  )
}


function searchUser(searchParam,cb) {
    let pattern = searchParam
    collection.Accounts.find({
        $or: [
            { firstName: { $regex: pattern, $options: 'i'}},
            { lastName: { $regex: pattern, $options: 'i'}},   
            ]
    }, (err, cursor) => cursor.toArray((err, items) => cb(items)) )
}


module.exports = {
    getAccount, newAccount, changeAccount, searchAccount
}
