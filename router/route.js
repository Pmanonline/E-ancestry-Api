const express = require("express");
const router = express.Router();

const {
  register,
  registerBusiness,
  verifyUser,
  login,
  getUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  updateUser,
  resetPassword,
} = require("../controllers/appController.js");
const Auth = require("../middleware/auth.js");

const { registerMail } = require("../controllers/mailer.js");

const { body, validationResult } = require("express-validator");

// Define the validation rules using express-validator

/** POST Methods */
router.route("/register").post(register); // register user
router.route("/registerBusiness").post(registerBusiness); // register user
router.route("/registerMail").post(registerMail); // send the email
router.route("/authenticate").post(verifyUser, (req, res) => res.end()); // authenticate user
router.route("/login").post(verifyUser, login); // login in app

/** GET Methods */
router.route("/user/:username").get(getUser); // user with username
router.post("/generateOTP", generateOTP); // generate random OTP
router.route("/verifyOTP").get(verifyUser, verifyOTP); // verify generated OTP
router.route("/createResetSession").get(createResetSession); // reset all the variables

/** PUT Methods */
router.route("/updateuser").put(updateUser); // is use to update the user profile
router.route("/resetPassword").all(resetPassword); // use to reset password

module.exports = router;
