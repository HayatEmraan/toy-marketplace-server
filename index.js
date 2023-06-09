const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ki0ifk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});
const verifyJWT = (req, res, next) => {
  const query = req.headers?.authorization;
  const queryToken = query?.split(" ")[1];
  jwt.verify(queryToken, process.env.DB_KEY, function (err, result) {
    if (err) {
      console.log("error hitting client");
      return res.status(401).send("Unauthorized Access");
    }
    req.decoded = result;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyCollection").collection("toys");
    const blogsCollection = client.db("toyCollection").collection("blogs");

    app.get("/api/blogs", async (req, res) => {
      const blogs = await blogsCollection.find().toArray();
      res.send(blogs);
    });
    app.get("/api/blogs/:id", async (req, res) => {
      const params = req.params.id;
      const result = await blogsCollection.findOne({
        _id: new ObjectId(params),
      });
      res.send(result);
    });
    app.post("/jwt", async (req, res) => {
      const query = req.body;
      const token = jwt.sign(query, process.env.DB_KEY, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.post("/api/toyCollection", async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });
    app.get("/api/query", verifyJWT, async (req, res) => {
      console.log("something went wrong");
      if (req.decoded.email !== req.query.email) {
        console.log("hitting inside decoded");
        return res.status(401).send("Unauthorized Access");
      }
      const query = req.query;
      console.log(query);
      const toys = await toyCollection.find({ email: query.email }).toArray();
      res.send(toys);
    });
    app.delete("/api/query/:id", async (req, res) => {
      const params = req.params.id;
      const result = await toyCollection.deleteOne({
        _id: new ObjectId(params),
      });
      res.send(result);
    });
    app.patch("/api/toyCollection/:id", async (req, res) => {
      const params = req.params.id;
      const toy = req.body;
      const result = await toyCollection.updateOne(
        { _id: new ObjectId(params) },
        { $set: toy }
      );
      res.send(result);
    });
    app.get("/api/all", async (req, res) => {
      const toys = await toyCollection.find().toArray();
      res.send(toys);
    });
    app.get("/api/all/limit", async (req, res) => {
      const cursor = await toyCollection
        .find({}, { sort: { _id: -1 } })
        .limit(20)
        .toArray();
      res.send(cursor);
    });
    app.get("/api/query/sortings/ascending", verifyJWT, async (req, res) => {
      if (req.decoded.email !== req.query.email) {
        return res.status(401).send("Unauthorized Access");
      }
      const query = req.query;
      const mysort = { price: 1 };
      const toys = await toyCollection
        .find({ email: query.email })
        .sort(mysort)
        .toArray();
      res.send(toys);
    });
    app.get("/api/query/sortings/descending", verifyJWT, async (req, res) => {
      if (req.decoded.email !== req.query.email) {
        return res.status(401).send("Unauthorized Access");
      }
      const query = req.query;
      const mysort = { price: -1 };
      const toys = await toyCollection
        .find({ email: query.email })
        .sort(mysort)
        .toArray();
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
      const filter = { sub_category: id };
      const toy = await toyCollection.find(filter).toArray();
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


app.listen(port);
