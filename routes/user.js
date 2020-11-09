const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../config/User");
const auth = require("../middlewares/auth");
// const emailjs = require("emailjs");
const emailjs = require("emailjs-com");

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

  generateInsertCode(email).then((user) => {
    console.log("user===============> ", user);

    // var data = {
    //   service_id: "gmail",
    //   template_id: "template_xnib93i",
    //   user_id: "user_3wcZojnv9Dx1ylzdWwP5c",
    //   template_params: {
    //     to_username: user.username,
    //     to_email: user.email,
    //     message: user.code,
    //   },
    // };

    emailjs
      .send("gmail", "template_xnib93i", {
        to_username: user.username,
        to_email: user.email,
        message: user.code,
      })
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (err) {
          console.log("FAILED...", err);
        }
      );
    // router.post("https://api.emailjs.com/api/v1.0/email/send",
    // });
  });
});

// Generate password token and expiration date and assign them to the input email.
var generateInsertCode = async (email) => {
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

module.exports = router;
