const UserModel = require("../models/User.model");
const ProfileModel = require("../models/profileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const passport = require("passport");
const PersonModel = require("../models/personModel");
const validator = require("validator");
const JWT_SECRET = process.env.JWT_SECRET || "Qwe123123";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "Refresh123123";

dotenv.config();

// const register = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new UserModel({
//       email,
//       password: hashedPassword,
//     });

//     if (!validator.isEmail(email))
//       return res.status(400).json("email must be a valid email");

//     // Save the new user
//     await newUser.save();

//     // Generate the access token and refresh token using newUser directly
//     const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     const refreshToken = jwt.sign(
//       { _id: newUser._id },
//       process.env.JWT_REFRESH_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Attach refreshToken to the user and save it again
//     newUser.refreshToken = refreshToken;
//     await newUser.save();

//     // Set the refreshToken in an HTTP-only cookie
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//     });

//     // Respond with the token, refreshToken, and user info (_id, email)
//     res.status(201).json({
//       token,
//       refreshToken,
//       user: {
//         _id: newUser._id,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json("Email must be a valid email");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      firstName, // Add firstName
      lastName, // Add lastName
    });

    // Save the new user
    await newUser.save();

    // Generate the access token and refresh token using newUser directly
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const refreshToken = jwt.sign(
      { _id: newUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Attach refreshToken to the user and save it again
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Set the refreshToken in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Respond with the token, refreshToken, and user info (_id, email, firstName, lastName)
    res.status(201).json({
      token,
      refreshToken,
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName, // Include firstName
        lastName: newUser.lastName, // Include lastName
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle other errors
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // user.refreshToken = refreshToken;
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies; // Retrieve refresh token from cookies

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await UserModel.findById(decoded._id);

    // Check if the refresh token is valid and matches the one stored
    const isValidRefreshToken = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );

    if (!isValidRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    // Optionally, you can also generate a new refresh token and update it in the DB
    const newRefreshToken = jwt.sign({ _id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
    UserModel.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Token refresh failed" });
  }
};

logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Successfully logged out" });
};

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

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const storedOTP = req.app.locals.OTP;

  if (!storedOTP) {
    return res.status(400).send({ error: "No OTP stored in the application" });
  }

  if (parseInt(storedOTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;

    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).send({ error: "Invalid OTP" });
  }
});

// Create reset session
const createResetSession = asyncHandler(async (req, res) => {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  if (!req.app.locals.resetSession) {
    return res.status(440).send({ error: "Session expired!" });
  }

  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  await user.save();

  req.app.locals.resetSession = false;

  res.status(201).send({ message: "Password reset successfully" });
});

// Middleware to verify user
const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const { username } = req.method === "GET" ? req.query : req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication error" });
  }
});

// Function to fetch all profiles
const getAllProfiles = async () => {
  return await UserModel.find();
};

const createOrUpdateProfile = asyncHandler(async (req, res) => {
  const {
    background,
    DOB,
    firstName,
    lastName,
    phoneNumber,
    streetAddress,
    lga,
    state,
    kindred,
    village,
    autonomous,
    tribe,
    religion,
    profession,
    facebook,
    twitter,
    instagram,
    about,
    middlename,
  } = req.body;

  const userId = req.user._id;

  // Check if images were uploaded
  const newImage = req.files["image"] ? req.files["image"][0].path : null;
  const newImage2 = req.files["image2"] ? req.files["image2"][0].path : null;

  // Check if the profile already exists
  let profile = await UserModel.findOne({ _id: userId });

  if (profile) {
    // Delete old images if new ones are provided
    if (newImage && profile.image) {
      const oldImagePath = path.resolve(profile.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
    }

    if (newImage2 && profile.image2) {
      const oldImagePath2 = path.resolve(profile.image2);
      if (fs.existsSync(oldImagePath2)) {
        fs.unlink(oldImagePath2, (err) => {
          if (err) console.error("Failed to delete old image2:", err);
        });
      }
    }

    // Update existing profile, excluding email
    profile = await UserModel.findByIdAndUpdate(
      profile._id,
      {
        background,
        DOB,
        firstName,
        lastName,
        phoneNumber,
        streetAddress,
        lga,
        state,
        kindred,
        village,
        autonomous,
        tribe,
        religion,
        profession,
        facebook,
        twitter,
        instagram,
        about,
        middlename,
        image: newImage || profile.image,
        image2: newImage2 || profile.image2,
      },
      { new: true, runValidators: true } // Ensure other validations run
    );
  } else {
    // Create a new profile, skipping email check if already exists
    profile = await UserModel.create({
      _id: userId, // ensure the userId is set
      DOB,
      background,
      firstName,
      lastName,
      phoneNumber,
      streetAddress,
      lga,
      state,
      kindred,
      village,
      autonomous,
      tribe,
      religion,
      profession,
      facebook,
      twitter,
      instagram,
      about,
      middlename,
      image: newImage,
      image2: newImage2,
    });
  }

  // Fetch all profiles (if needed, depending on the rest of your application logic)
  const allProfiles = await getAllProfiles();

  res.status(201).json({ updatedProfile: profile, allProfiles });
});

const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const profile = await UserModel.findOne({ _id: userId });

  if (!profile) {
    return res.status(404).json({ message: "incomplete profile" });
  }

  // If file exists, include the full URL
  if (profile.file) {
    profile.file = `${req.protocol}://${req.get("host")}/${profile.file}`;
  }

  res.status(200).json(profile);
});

// Controller to get all profiles
const AllProfiles = asyncHandler(async (req, res) => {
  try {
    const profiles = await UserModel.find({});

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    // Optionally format the profile images URLs if needed
    profiles.forEach((profile) => {
      if (profile.file) {
        profile.file = `${req.protocol}://${req.get("host")}/${profile.file}`;
      }
    });

    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // const users = await UserModel.find();
    const users = await PersonModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getuserByQuery = async (req, res) => {
  try {
    const query = req.query.query; // Assuming the query parameter is passed as `query`

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Replace this with the actual logic to fetch names related to the query
    const names = await PersonModel.find({
      firstName: { $regex: new RegExp(query, "i") },
      lastName: { $regex: new RegExp(query, "i") },
    });

    res.status(200).json({ names });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while searching.",
      details: error.message,
    });
  }
};

module.exports = {
  login,
  refreshToken,
  verifyUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  createOrUpdateProfile,
  getProfile,
  getAllUsers,
  getuserByQuery,
  AllProfiles,
  register,
};
