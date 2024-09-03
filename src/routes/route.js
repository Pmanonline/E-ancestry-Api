const express = require("express");
const { authMiddleware } = require("../middleware/auth.js");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  register,
  verifyUser,
  login,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  refreshToken,
} = require("../controller/authController.js");
const {
  registerMail,
  sendInviteEmail,
  acceptInvite,
  recordVisit,
  fetchVisits,
} = require("../controller/mailer.js");

const {
  markAsRead,
  findUser,
  getAllUser,
  createChat,
  findUserChats,
  findChat,
  createMessage,
  getMessages,
  // getMessageById,
} = require("../controller/chatController.js");

// Define routes without error handling
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshToken);
router.route("/registerMail").post(registerMail);
router.route("/send-invite").post(sendInviteEmail);
router.route("/record-visit").post(recordVisit);
router.route("/fetch-visits").get(fetchVisits);
router.route("/accept-invite").get(acceptInvite);
router.route("/authenticate").post(verifyUser, (req, res) => res.end());

router.route("/generateOTP").post(generateOTP);
router.route("/verifyOTP").get(verifyUser, verifyOTP);
router.route("/createResetSession").get(createResetSession);
router.route("/resetPassword").all(resetPassword);

// chat Route
router.route("/messages/markAsRead").post(markAsRead);
router.route("/findUser/:userId").get(findUser);
router.route("/").get(getAllUser);
router.route("/chats").post(createChat);
router.route("/chats/:userId").get(findUserChats);
router.route("/chats/:firstId/:secondId").get(findChat);
router.route("/messages").post(createMessage);
router.route("/messages/:chatId").get(getMessages);

module.exports = router;
