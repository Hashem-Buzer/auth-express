const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../config/User");
const auth = require("../middlewares/auth");

// Accessing .env
require("dotenv").config();

// Checking for token validation
router.get("/logged", auth, async (req, res) => {
  try {
    res.send(true);
  } catch (e) {
    res.send(false);
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  // console.log("req===> ", req.body);

  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    // console.log("USER===> ", user);

    if (user) return res.send({ status: false, msg: "User Already Exists" });

    user = new User({ username, password });
    // console.log("NEW USER===> ", user);

    const salt = await bcrypt.genSalt(10);
    // console.log("SALT===> ", salt);

    user.password = await bcrypt.hash(password, salt);
    // console.log("HASHED PASS===> ", user.password);

    await user.save();

    const payload = {
      user: { id: user.id },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 20000 },
      (err, token) => {
        if (err) throw err;
        // console.log("TOKEN===> ", token);
        res.json({ token });
      }
    );
  } catch (err) {
    return res.send({ status: false, msg: err });
  }
});

// Login route
router.post("/login", async (req, res) => {
  // console.log("req===> ", req.body);

  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user)
      return res.send({
        status: false,
        msg: "No User Found With This Username!!",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("isMatch===> ", isMatch);

    if (!isMatch) return res.send({ status: false, msg: "Wrong Password!!" });

    const payload = {
      user: { id: user.id },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 20000 },
      (err, token) => {
        if (err) throw err;
        // console.log("TOKEN===> ", token);
        res.json({ token });
      }
    );
  } catch (err) {
    return res.send({ status: false, msg: err });
  }
});

module.exports = router;
