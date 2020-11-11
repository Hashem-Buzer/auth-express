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

// Checking for token validation
router.get("/logged", auth, async (req, res) => {
  try {
    return res.send(true);
  } catch (e) {
    return res.send(false);
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  // console.log("req===> ", req.body);

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ username });
    console.log("USER===> ", user);

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
        msg: "No User Found With This Username or Email!!",
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

// Generate pass-code of 6 digits and expiration date and assign them to the email from the req in database
router.post("/send-passCode", async (req, res) => {
  const { email } = req.body;

  let user = await User.findOneAndUpdate(
    { email },
    {
      code: crypto.randomBytes(3).toString("hex"),
      codeExpiration: Date.now() + 3600000, // expires in one hour
    }
  );
  // console.log("user==> ", user);

  if (!user)
    return res.send({
      status: false,
      msg: "Email not registered!!",
    });

  await user.save();

  transporter.sendMail(
    {
      from: "Auth application",
      to: user.email,
      subject: "Password resetting",
      html: "<b> This is your code to reset your password:</b> " + user.code,
    },
    (error, info) => {
      return error
        ? res.send({ status: false, msg: error })
        : res.send({ status: true, msg: "Email sent" });
    }
  );
});

// Confirming the given reset code
router.post("/confirm-passCode", async (req, res) => {
  const { email, code } = req.body;

  try {
    let user = await User.findOne({ email, code });
    console.log("user with code ===> ", user);

    if (!user)
      return res.send({
        status: false,
        msg: "No User Found With This Code!!",
      });

    return res.send({ status: true, msg: "Valid code" });
  } catch (err) {
    return res.send({ status: false, msg: err });
  }
});

// Reset password by email
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user)
      return res.send({
        status: false,
        msg: "No User Found With This Username or Email!!",
      });

    const salt = await bcrypt.genSalt(10);
    // console.log("SALT===> ", salt);

    user.password = await bcrypt.hash(password, salt);
    // console.log("HASHED PASS===> ", user.password);

    await user.save();

    return res.send({ status: true, msg: "Password changed successfully." });
  } catch (err) {
    return res.send({ status: false, msg: err });
  }
});

module.exports = router;
