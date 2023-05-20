const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const blogs = require("./blogs.json");

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ki0ifk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyCollection").collection("toys");
    app.get("/api/all", async (req, res) => {
      const toys = await toyCollection.find({}).toArray();
      res.send(toys);
    });

    app.get("/api/v1/:id", async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const toy = await toyCollection.findOne(find);
      res.send(toy);
    });
    app.get("/api/cat/:cat", async (req, res) => {
      const id = req.params.cat;
      const find = { category: id };
      const toy = await toyCollection.find(find).toArray();
      res.send(toy);
    });
    app.get("/api/sub/:sub", async (req, res) => {
      const id = req.params.sub;
      const find = { sub_category: id };
      const toy = await toyCollection.find(find).toArray();
      res.send(toy);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", function (req, res) {
  res.send("Server is running");
});

app.get('/temp', (req, res) => {
  res.send(blogs)
})

app.listen(port);
