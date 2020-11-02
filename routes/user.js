const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../config/User");
const auth = require("../config/middlewares/auth");

require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    let user = await User.find({});
    if (!user || user.length <= 0) return res.send("No User Found!!");
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

router.get("/logged", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.send(user);
  } catch (e) {
    res.send({ status: false, msg: "Error in Fetching user" });
  }
});

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

router.delete("/", async (req, res) => {
  try {
    let user = await User.deleteMany({});
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
