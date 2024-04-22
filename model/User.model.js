const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "Qwe123123";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide a unique email"],
    unique: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  mobile: { type: Number },
  phoneNumber: { type: Number },
  address: { type: String },
  profile: { type: String },
});

// Method to generate JWT token for the user
UserSchema.methods.generateToken = function () {
  return jwt.sign({ userId: this._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
