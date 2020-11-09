const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
    default: null,
  },
  codeExpiration: {
    type: Date,
    required: false,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Export model user with UserSchema
module.exports = mongoose.model("User", UserSchema);
