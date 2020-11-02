const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../config/User");
const Code = require("../config/Code");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 5,
    }),

    check("phone_number", "Please Enter a Valid Phone Number")
      .not()
      .isEmpty()
      .isLength({ min: 11 }),
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    console.log("errr===> ", errors);

    if (!errors.isEmpty()) {
      console.log("errr===> ", errors);
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      console.log("req==> ", req.body);
    }
    // const errors = validationResult(req.body);
    // console.log("log===> ", errors);
    // !errors.isEmpty()
    //   ? console.log("errrr===> ", errors)
    //   : console.log("req==> ", req.body);
  }
);

// GENERATE CODE OF 6 NUMBERS DIGITS FUNCTION
var generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// ROUTE OF USING AND INSERTING THE CODE INTO CODE COLLECTION
//TO USE IT FOR ACCESSING A RESTAURANT
// router.get("/generate-code", (req, res) => {
//   console.log(s);
//   //   var code = generateCode();
//   //   try {
//   //     Code.findOne({ code: generateCode() }).then((respose) => {
//   //       console.log(respose);
//   //       respose === null
//   //         ? Code.create({ code: code }).then((dbResp) =>
//   //             res.send({ status: true, msg: dbResp.code })
//   //           )
//   //         : generateCode();
//   //     });
//   //   } catch (err) {
//   //     res.send({ status: false, msg: err });
//   //   }
// });

module.exports = router;
