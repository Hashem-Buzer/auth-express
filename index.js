const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/user");

// Initiate Mongo Server
const InitiateMongoServer = require("./config/db");
InitiateMongoServer();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("dotenv").config();

// PORT
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

app.use("/user", user);
app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});
