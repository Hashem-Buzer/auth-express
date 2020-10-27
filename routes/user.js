const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../config/User");
const Code = require("../config/Code");

var s = process.env.SECRET;
// GENERATE CODE OF 6 NUMBERS DIGITS FUNCTION
var generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// ROUTE OF USING AND INSERTING THE CODE INTO CODE COLLECTION
//TO USE IT FOR ACCESSING A RESTAURANT
router.get("/generate-code", (req, res) => {
  console.log(s);
  //   var code = generateCode();
  //   try {
  //     Code.findOne({ code: generateCode() }).then((respose) => {
  //       console.log(respose);
  //       respose === null
  //         ? Code.create({ code: code }).then((dbResp) =>
  //             res.send({ status: true, msg: dbResp.code })
  //           )
  //         : generateCode();
  //     });
  //   } catch (err) {
  //     res.send({ status: false, msg: err });
  //   }
});

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    console.log("req===> ", req);
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      console.log("errr===> ", errors);
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;
    try {
      let user = await User.findOne({ username });

      if (user) {
        return res.status(400).json({
          msg: "User Already Exists",
        });
      }

      user = new User({ username, password });
      console.log("new user===> ", user);

      const salt = await bcrypt.genSalt(10);
      console.log("salt===> ", salt);

      user.password = await bcrypt.hash(password, salt);

      console.log("hashed password===> ", user.password);
      await user.save();

      const payload = {
        user: { id: user.id },
      };

      jwt.sign(payload, "#emBuZz3R", { expiresIn: 40000 }, (err, token) => {
        if (err) throw err;
        console.log("TOKEN===> ", token);
        res.status(200).json({
          token,
        });
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

module.exports = router;
