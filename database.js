const {MONGO_USERNAME, MONGO_PASSWORD} = require("./secrets.js");
const JREADS_DB = "jReads";
const BOOKS_COLLECTION = "books";

//connect to database
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const mongoUrl = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@jreads.ccxgi.mongodb.net/${JREADS_DB}?retryWrites=true&w=majority`;


//CREATE

function insert(data, callback){

}
function insertOne(bookData, callback){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, async (err, client) => {
        try {
            assert.strictEqual(null, err);
            const db = client.db(JREADS_DB);
            const collection = db.collection(BOOKS_COLLECTION);
            await collection.insertOne(bookData);
            await client.close();
            callback();

        } catch (err) {
            console.log("Error inserting: ", err);
        }
    });
}

function insertMany(bookData){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
        assert.strictEqual(null, err);
    
        const db = client.db(JREADS_DB);
        let collection = db.collection(BOOKS_COLLECTION);
        collection.insertMany(bookData)
        .then( () => {
            console.log("Added multiple book entries");  
        })
        .catch(err => {
            console.log("*** E R R O R ***");
            console.log(err);
        })
        .finally( () => {
            client.close();
        });
    
    });
}

function clearDB(callback){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
        assert.strictEqual(null, err);
    
        const db = client.db(JREADS_DB);
        db.collection('books').deleteMany({})
        .then( () => {
            console.log("Database cleared")
        })
        .catch(err => {
            console.log("*** E R R O R ***");
            console.log(err);
        })
        .finally( () => {
            client.close();
            callback();
        });
    
    });
}



//READ
function findOne(findId, callback){
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
        assert.strictEqual(null, err);
    
        const db = client.db(JREADS_DB);
        const collection = db.collection(BOOKS_COLLECTION);
        console.log("Searching database...");
        collection.find({id: findId}).toArray((err, books) => {
            if(err){
                console.log(err);
                throw err;
            }
            callback(books[0]);
        });

    });
}

function findMany(term, callback){
 
    MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
        assert.strictEqual(null, err);
    
        const db = client.db(JREADS_DB);
        const collection = db.collection(BOOKS_COLLECTION);
        console.log("Searching database...");
        collection.find(term).toArray((err, books) => {
            if(err){
                console.log(err);
                throw err;
            }
            callback(books);
        });
    });
}

module.exports.insertOne = insertOne;
module.exports.insertMany = insertMany;
module.exports.findOne = findOne;
module.exports.findMany = findMany;
module.exports.clearDB = clearDB;