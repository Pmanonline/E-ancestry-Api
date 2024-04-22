const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  businessName: {
    type: String,
  },
  businessState: {
    type: String,
  },
  businessCity: {
    type: String,
  },
  businessTag: {
    type: String,
  },
});

const BizModel = mongoose.model("Biz", UserSchema);

module.exports = BizModel;
