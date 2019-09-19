const config = require('../config.json')
const MongoClient = require('mongodb').MongoClient

function connection() {

    let db = null;
    let collection = {}

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


    return { 
        get: get,
        collections: getCollections,
        retrieveOne,
        registerObject,
        updateObject
    }
}
// connection()  // is this even used externally?  Maybe just an iife


module.exports = connection();
