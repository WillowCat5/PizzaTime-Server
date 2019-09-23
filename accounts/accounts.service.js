const dbclient = require('../helpers/db')
const { checkInput } = require('../helpers/schemas')

let collection 

(async () => { collection = await dbclient.collections() })()


async function getAccount(id) {
    return await collection.Accounts.findOne({"accountId": id})
}

async function newAccount(accountData) {
    if (accountData.accountId)  throw('accountId should NOT exist on received data')
    accountData.accountId = Math.floor(Math.random() * 10000) + 10000;
    // *** verify Id doesn't already exist in database?

    err = checkInput(accountData, "custAccount")
    if (err)  throw(err)

    return await collection.Accounts.insertOne(accountData)
}

async function changeAccount(id, accountData) {
    // *** Todo: sanitize the data and do security checks here.
    return await collection.Accounts.updateOne( { "accountId": id }, { $set: accountData })
}

// Preliminary search function

async function searchAccount(searchParam) {
    //console.log("Search param: '" + searchParam + "'")
    return await searchUser(searchParam)
}

async function searchUser(pattern) {
    return await collection.Accounts.find({
        $or: [
            { "contacts.firstName": { $regex: pattern, $options: 'i'}},
            { "contacts.lastName": { $regex: pattern, $options: 'i'}}
        ]
    }).toArray()
}


module.exports = {
    getAccount, newAccount, changeAccount, searchAccount
}
