const config = require('../config.json')
const MongoClient = require('mongodb').MongoClient

var connection = function () {

    var db = null;
    var collection = {}

    const collList = ['Accounts','Orders','Pages','Products']

    async function connect() {
        try { 
            let _db = await MongoClient.connect(config.localUrl, { useNewUrlParser: true })

            const dbpizza = _db.db('PizzaTime')
            collList.some(element => {
                collection[element] = dbpizza.collection(element)
            })

            return _db
        } catch (err) {
            return err
        }
    }

    async function getCollections() {
        try {
            if (db != null) {
                return collection;
            } else {
                db = await connect()
                return collection;
            }

        } catch (err) {
            return err
        }
    }

    async function get() {
        try {

            if (db != null) {
                return db;
            } else {
                db = await connect()
                return db
            }

        } catch (err) {
            return err
        }
    }

    return { 
        get: get,
        collections: getCollections
    }
    
}

module.exports = connection();
