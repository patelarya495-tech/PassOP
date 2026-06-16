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

const db = client.db(dbName);
const collection = db.collection('passwords');

collection.createIndex(
  {
    id: 1,
    userId: 1
  },
  {
    unique: true
  }
);

app.get('/', async (req, res) => {
  const { userId } = req.query;

  const findResult = await collection.find({
    userId
  }).toArray();

  res.json(findResult);
});

app.post('/', async (req, res) => {
    try {
    console.log("NEW SERVER VERSION RUNNING")
    const password = req.body

    console.log("POST RECEIVED")
    console.log(password)

    const db = client.db(dbName)
    const collection = db.collection('passwords')

    const existingPassword = await collection.findOne({
        id: password.id,
        userId: password.userId
    })

    console.log("EXISTING PASSWORD:", existingPassword)
    let findResult

    if (existingPassword) {
        findResult = await collection.updateOne({
            id: password.id,
            userId: password.userId
        }, {
            $set: {
                site: password.site,
                username: password.username,
                password: password.password,
                updatedAt: password.updatedAt
            }
        })
    } else {
        findResult = await collection.insertOne(password)
    }

    console.log("INSERT RESULT:", findResult)
    console.log("FIND RESULT:", findResult)

    res.send({
        success: true,
        result: findResult
    })
     } catch (error) {
    console.error("POST ERROR:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
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