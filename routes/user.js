const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../config/User");
const auth = require("../middlewares/auth");
const nodemailer = require("nodemailer");

// Accessing .env
require("dotenv").config();

// Creating connection with nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Generate password token and expiration date and assign them to the input email.
let generateInsertCode = async (email) => {
  try {
    let user = await User.findOneAndUpdate(
      { email },
      {
        code: crypto.randomBytes(3).toString("hex"),
        codeExpiration: Date.now() + 3600000, // expires in one hour
      }
    );
    return user;
  } catch (err) {
    return err;
  }
};

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

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ username });
    // console.log("USER===> ", user);

    if (user) return res.send({ status: false, msg: "User Already Exists" });

    user = new User({ username, email, password });
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
    console.log("ERRRRRR==> ", err);
    // return res.send({ status: false, msg: err });
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

// Generate code of 6 digits to be sent to email.
router.post("/generateCode", async (req, res) => {
  const { email } = req.body;
  let user = await User.findOne({ email });
  // console.log("user==> ", user);

  if (!user)
    return res.send({
      status: false,
      msg: "Email not registered!!",
    });

  let userCode = await generateInsertCode(email);

  // console.log("user===============> ", userCode);

  transporter.sendMail(
    {
      from: "Auth application",
      to: userCode.email,
      subject: "Password resetting",
      html:
        "<b> This is your code to reset your password:</b> " + userCode.code,
    },
    (error, info) => {
      return error
        ? res.send({ status: false, msg: error })
        : res.send({ status: true, msg: "Email sent" });
    }
  );
});

module.exports = router;
