const mongoose = require("mongoose");

const CodeSchema = mongoose.Schema({
  code: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// export model user with UserSchema
module.exports = mongoose.model("code", CodeSchema);
