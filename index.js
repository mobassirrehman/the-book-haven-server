const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(
  cors({
    origin: "https://dapper-trifle-02574c.netlify.app",
    credentials: true,
  })
);
app.use(express.json());

const commentRoutes = require("./routes/comments");

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
    // await client.connect();

    const db = client.db("bookHaven_db");
    app.locals.db = db;

    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

    console.log("Successfully connected to MongoDB!");

    app.use("/comments", commentRoutes);

    app.get("/test", (req, res) => {
      res.send("Book Haven API is working!");
    });

    app.get("/books/latest", async (req, res) => {
      try {
        const cursor = booksCollection.find().sort({ addedAt: -1 }).limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching latest books:", error);
        res.status(500).send({ message: "Failed to fetch books" });
      }
    });

    app.get("/books/top-rated", async (req, res) => {
      try {
        const cursor = booksCollection.find().sort({ rating: -1 }).limit(3);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching top rated books:", error);
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

    app.post("/books", async (req, res) => {
      try {
        const newBook = req.body;
        console.log("Received book:", newBook);
        const result = await booksCollection.insertOne(newBook);
        res.send(result);
      } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).send({ message: "Failed to add book" });
      }
    });

    app.get("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await booksCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Book not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).send({ message: "Failed to fetch book" });
      }
    });

    app.get("/books/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { userEmail: email };
        const cursor = booksCollection.find(query).sort({ addedAt: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user books:", error);
        res.status(500).send({ message: "Failed to fetch user books" });
      }
    });

    app.delete("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await booksCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).send({ message: "Failed to delete book" });
      }
    });

    app.put("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedBook = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title: updatedBook.title,
            author: updatedBook.author,
            genre: updatedBook.genre,
            rating: updatedBook.rating,
            summary: updatedBook.summary,
            coverImage: updatedBook.coverImage,
          },
        };
        const result = await booksCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).send({ message: "Failed to update book" });
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
