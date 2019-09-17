const dbclient = require('../helpers/db')

var collection 
(async () => { collection = await dbclient.collections() })()

module.exports = {
    getProdById,
    getProdsByCategory
}

async function getProdById(id) {
    console.log("Looking for productID: ", id)
    return await collection.products.findOne({ "productID": id })    
}

async function getProdsByCategory(category) {
    console.log("Looking for product category: ", category)
    return await collection.products.find({ "category": category }).toArray() 
}

