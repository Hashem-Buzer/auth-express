const mongoose = require("mongoose");

const MONGOURI = "mongodb://localhost/express-auth";

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

module.exports = InitiateMongoServer;
