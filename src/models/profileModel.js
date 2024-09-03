const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: { type: String },
    DOB: { type: String },
    background: { type: String },
    streetAddress: { type: String },
    lga: { type: String },
    state: { type: String },
    kindred: { type: String },
    village: { type: String },
    autonomous: { type: String },
    tribe: { type: String },
    religion: { type: String },
    profession: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    about: { type: String },
    middlename: { type: String },
    image: {
      type: String, // URL of the user's profile image
    },
    image2: {
      type: String, // URL of the user's profile image
    },
    // Additional profile information
  },
  { timestamps: true }
);

const ProfileModel = mongoose.model("Profile", ProfileSchema);

module.exports = ProfileModel;
