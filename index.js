const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0zmmwcn.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Book Haven server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("bookHaven_db");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

    console.log("Successfully connected to MongoDB!");

    app.get("/test", (req, res) => {
      res.send("Book Haven API is working!");
    });

    app.get("/books/latest", async (req, res) => {
      try {
        const cursor = booksCollection
          .find()
          .sort({ addedAt: -1 })
          .limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching latest books:", error);
        res.status(500).send({ message: "Failed to fetch books" });
      }
    });

    app.get("/books", async (req, res) => {
      try {
        const cursor = booksCollection.find().sort({ addedAt: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send({ message: "Failed to fetch books" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Book Haven server is running on port: ${port}`);
});
