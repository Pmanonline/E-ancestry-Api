const UserModel = require("../model/User.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
// const ENV = require('../config.js');
const otpGenerator = require("otp-generator");
const JWT_SECRET = "Qwe123123";
const BizModel = require("../model/businessModel.js");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

/** middleware for verify user */
async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

const register = asyncHandler(async (req, res) => {
  const { firstName, email, password, lastName, phoneNumber } = req.body;

  // Check if email exists in db
  const userExists = await UserModel.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document in db
    const user = await UserModel.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword, // Save hashed password to the database
    });

    // Generate JWT token for the user
    const token = jwt.sign({ _id: UserModel._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      _id: UserModel._id,
      firstName: UserModel.firstName,
      email: UserModel.email,
      lastName: UserModel.lastName,
      phoneNumber: UserModel.phoneNumber,
      token,
      password,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid user data" });
  }
});

const registerBusiness = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { businessName, businessState, businessCity, businessTag } = req.body;

  // Check if business exists in db
  const bizExists = await BizModel.findOne({ businessName });

  if (bizExists) {
    return res.status(400).json({ message: "Business Name already exists" });
  }

  try {
    // Create new business document in db
    const newBiz = await BizModel.create({
      businessName,
      businessState,
      businessCity,
      businessTag,
    });

    res.status(201).json({
      _id: newBiz._id,
      businessName: newBiz.businessName,
      businessState: newBiz.businessState,
      businessCity: newBiz.businessCity,
      businessTag: newBiz.businessTag,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });

    // If user not found, send error message
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate JWT token for the user
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // Send user details and token in response
      res.json({
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        userToken: token,
      });
    } else {
      // If password does not match, send error message
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    // Handle any errors that occur during the login process
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/** GET: http://localhost:8080/api/user/example123 */
const getUser = asyncHandler(async (req, res) => {
  const { email } = req.params; // Change 'email' to 'username' to match parameter name

  try {
    if (!email) return res.status(501).send({ error: "Invalid Username" });

    UserModel.findOne({ email }, function (err, user) {
      if (err) return res.status(500).send({ err });
      if (!user)
        return res.status(501).send({ error: "Couldn't Find the User" });

      /** remove password from user */
      // mongoose return unnecessary data with object so convert it into json
      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // update the data
      UserModel.updateOne({ _id: userId }, body, function (err, data) {
        if (err) throw err;

        return res.status(201).send({ msg: "Record Updated...!" });
      });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
});

const generateOTP = asyncHandler(async (req, res) => {
  const { email } = req.body; // Extract email from request body
  try {
    // Check if email exists in the database
    const user = await UserModel.findOne({ email });

    // If email does not exist, send an error response
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Generate OTP
    const OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store the OTP in the application's locals
    req.app.locals.OTP = OTP;

    // Log the stored OTP to verify

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // user: process.env.EMAIL_USER,
        user: "petersonzoconis@gmail.com",
        pass: "hszatxfpiebzavdd",
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Password Recovery",
      text: `Your OTP for password recovery is ${OTP}.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send the OTP in the response
    res.status(201).send({ code: OTP });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { code } = req.query; // Extract the OTP from the request query parameters
    const storedOTP = req.app.locals.OTP; // Retrieve the stored OTP from the application locals
    // console.log(`Received OTP for verification: ${code}`);
    // console.log(`Stored OTP: ${storedOTP}`);

    if (!storedOTP) {
      // If no OTP is stored, send an error response
      return res
        .status(400)
        .send({ error: "No OTP stored in the application" });
    }

    // Compare the stored OTP with the OTP provided by the user
    if (parseInt(storedOTP) === parseInt(code)) {
      // OTP matches, reset the stored OTP value and start session for password reset
      req.app.locals.OTP = null; // Reset stored OTP
      req.app.locals.resetSession = true; // Set reset session flag
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // OTP doesn't match, send an error response
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error verifying OTP:", error);
    return res.status(500).send({ error: "Failed to verify OTP" });
  }
});

const createResetSession = asyncHandler(async (req, res) => {
  try {
    const { code } = req.query;

    // Call the verifyOTP function to verify the OTP
    const verificationResult = await verifyOTP(req, res);

    // Check if OTP verification was successful
    if (verificationResult.status === 200) {
      // OTP verified successfully, proceed with password reset
      const { email } = req.body; // Extract email from request body
      const { password } = req.body; // Extract new password from request body

      // Find the user by email
      const user = await UserModel.findOne({ email });

      // If user not found, send error response
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password with the hashed password
      await UserModel.updateOne({ email }, { password: hashedPassword });

      // Return success response
      return res.status(201).send({ message: "Password reset successfully" });
    } else if (verificationResult.status === 400) {
      // OTP verification failed, return an error response
      return res.status(400).send({ error: "Invalid OTP" });
    } else {
      // Handle other verification result statuses
      throw new Error("OTP verification failed");
    }
  } catch (error) {
    // Handle any errors that occur during OTP verification or password reset
    console.error("Error during password reset:", error);
    return res.status(500).send({ error: "Failed to reset password" });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    // Check if reset session is active
    if (!req.app.locals.resetSession)
      return res.status(401).json({ message: "Session expired!" });

    // Extract email and password from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      // Handle user not found
      return res.status(401).json({ message: "User not found!" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password with the hashed password
    await UserModel.updateOne(
      { email: user.email },
      { password: hashedPassword }
    );

    // Reset session
    req.app.locals.resetSession = false;

    // Send success response
    return res.status(201).json({
      message: "Password updated successfully!! You can now login",
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  verifyUser,
  register,
  registerBusiness,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
};
