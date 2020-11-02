const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("token");
  // console.log("TOKEN FROM HEADER===> ", token);

  if (!token) return res.send({ status: false, msg: "Auth Error!!" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    // console.log("Decoded===> ", decoded);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.send({ status: false, msg: err });
  }
};
