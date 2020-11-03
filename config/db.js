const mongoose = require("mongoose");

require("dotenv").config();

// Mongo link connection
const MONGOURI = process.env.DB;

// Starting mongo
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
    });
    // console.log("Connected to DB !!");
  } catch (error) {
    // console.log("ERROR connecting to db===> ", error);
    throw error;
  }
};

// Exporting the starting mongo server
module.exports = InitiateMongoServer;
