const express = require('express');
const dotenv = require('dotenv')
const {
    MongoClient
} = require('mongodb');
const bodyparser = require('body-parser')
const cors = require('cors')

dotenv.config()

// Connection URL
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

// Database Name
const dbName = 'passop';
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json())
app.use(cors())


client.connect();

app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
});

app.post('/', async (req, res) => {
    const password = req.body

    console.log("POST RECEIVED")
    console.log(password)

    const db = client.db(dbName)
    const collection = db.collection('passwords')

    const findResult = await collection.insertOne(password)

    console.log("INSERT RESULT:", findResult)

    res.send({
        success: true,
        result: findResult
    })
})

app.delete('/', async (req, res) => {

    const {
        id
    } = req.body

    const db = client.db(dbName)
    const collection = db.collection('passwords')

    const result = await collection.deleteOne({
        id
    })

    res.send({
        success: true,
        result
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});