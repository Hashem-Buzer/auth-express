const mongoose = require("mongoose");

// Mongo link connection
const MONGOURI = "mongodb://localhost/express-auth";

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
