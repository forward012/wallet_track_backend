// server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Connection URI
const PORT = process.env.PORT; // Choose your port
const MONGODB_URI = process.env.MONGODB_URI; // Use your connection string here
const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.COLLECTION;
const client = new MongoClient(MONGODB_URI);
const database = client.db(DATABASE); // Replace with your database name
const wallet_collection = database.collection(COLLECTION); // Replace with your collection name

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error(err));

// GET endpoint to fetch data
app.get("/api/data", async (req, res) => {
  try {
    const data = await wallet_collection.find({}).toArray();
    console.log("get request received!");

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

// PUT endpoint to update a wallet's name by address
app.post("/api/update/", async (req, res) => {
  const { address, name } = req.body; // New name from request body
  // const { name } = req.body.name; // New name from request body
  console.log(req.body.address);

  try {
    const result = await wallet_collection.findOneAndUpdate(
      { address: address },
      { $set: { name: name } }
    );

    console.log("data-----", result);

    if (result) {
      res.send("Update successful");
    } else {
      res.status(404).send("No wallet found with that address");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data");
  }
});

app.post("/api/findOne", async (req, res) => {
  const address = req.body.address;
  console.log(address);

  try {
    const result = await wallet_collection.findOne({ address: address });
    console.log("data-----", result);
    if (result) {
      res.send(result);
    } else {
      res.status(404).send("No wallet found with that address");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data");
  }
});

app.post("/api/addNewWallet", async (req, res) => {
  const { name, address, pnl, volumn } = req.body;
  console.log(name, address);
  const currentTime = Math.floor(Date.now() / 1000);

  const walletInfo = {
    name: name,
    address: address,
    pnl: pnl,
    volumn: volumn,
    last_signatures: [],
    recent_update: new Date().toISOString(),
    recent_blocktime: currentTime,
  };

  try {
    // Check if a wallet with the same address already exists
    const existingWallet = await wallet_collection.findOne({
      address: address,
    });

    if (existingWallet) {
      // If it exists, respond with a 409 Conflict status
      return res
        .status(409)
        .send("This wallet with this address already exists.");
    }

    const result = await wallet_collection.insertOne(walletInfo);
    console.log("data-----", result, currentTime);
    if (result.acknowledged) {
      res.status(201).send(result); // Send back the result with a 201 Created status
    } else {
      res.status(404).send("No wallet found with that address");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
