const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  token: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  relationshipType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" },
  invitee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Invitation", InvitationSchema);
