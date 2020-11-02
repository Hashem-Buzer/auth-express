const express = require("express");
const bodyParser = require("body-parser");

// User routers
const user = require("./routes/user");

// Initiate Mongo Server
const InitiateMongoServer = require("./config/db");
InitiateMongoServer();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Access to .env
require("dotenv").config();

// PORT
const PORT = process.env.PORT || 4000;

// Initial route
app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

// User routes
app.use("/user", user);

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});
