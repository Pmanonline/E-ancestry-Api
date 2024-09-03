const nodemailer = require("nodemailer");
const Visit = require("../models/RecordVisitModal");
const Person = require("../models/personModel");
const crypto = require("crypto");
const mongoose = require("mongoose");

const generateToken = () => {
  return crypto.randomBytes(20).toString("hex");
};
// Define your Invitation schema
const invitationSchema = new mongoose.Schema({
  recipient: String,
  token: String,
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Token expires in 1 hour
});
const Invitation = mongoose.model("Invitation", invitationSchema);

const registerMail = async (req, res) => {
  const { email, firstName } = req.body;

  try {
    // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "petersonzoconis@gmail.com",
        pass: "hszatxfpiebzavdd",
      },
    });

    // Define mail options
    const mailOptions = {
      from: "petersonzoconis@gmail.com",
      to: email,
      subject: "Signup Successful 🎉",
      text: `Welcome ${email} to E-ancestry! 🎉 We're thrilled to have you join our platform. Get ready to unlock new opportunities and connect with a vibrant community. Feel free to explore all the features and resources we offer to make your experience unforgettable. If you have any questions or need assistance, don't hesitate to reach out. Let's embark on this journey together and make magic happen! 🚀`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log success message to the console
    console.log("Email sent successfully!");

    // Send a success response to the client
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    // Log error to the console
    console.error("Error sending email:", error);

    // Send an error response to the client
    res
      .status(500)
      .json({ error: "An error occurred while sending the email." });
  }
};

const sendInviteEmail = async (req, res) => {
  const { recipient, name } = req.body;
  const token = generateToken();

  if (!recipient) {
    return res.status(400).json({ error: "Recipient email is required" });
  }

  try {
    // Save invitation with the token
    await Invitation.create({ recipient, token });

    console.log("Sending invite to:", recipient);

    const invitationLink = `http://localhost:3000/accept-invite?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: "You're Invited to Join E-Ancestry! 🌳",
      text: `Hello ${name},\n\nYou have been invited to join E-Ancestry by one of your connections. Explore your family history, connect with relatives, and build your family tree today!\n\nClick the link below to accept the invitation:\n\n[${invitationLink}]\n\nWe're excited to have you onboard!\n\nBest regards,\nThe E-Ancestry Team`,
    };

    await transporter.sendMail(mailOptions);

    console.log("Invitation email sent successfully!");
    res.status(200).json({ message: "Invitation email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "An error occurred while sending the invitation email.",
    });
  }
};

const acceptInvite = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Find the invitation with the given token
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res
        .status(400)
        .json({ error: "Invalid or expired invitation link." });
    }

    // Process the invitation (e.g., activate user account, register user, etc.)
    // For example, you might want to add the user to your database here

    // Optionally, remove the invitation after it has been used
    await Invitation.deleteOne({ token });

    res.status(200).json({ message: "Invitation accepted successfully!" });
  } catch (error) {
    console.error("Error processing invitation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the invitation." });
  }
};

// const recordVisit = async (req, res) => {
//   const { visitorId, visitedId } = req.body;

//   if (visitorId === visitedId) {
//     // Return a message indicating no action was taken
//     return res.status(200).json({ message: "Visit to self not recorded" });
//   }

//   try {
//     const existingVisit = await Visit.findOne({
//       visitor: visitorId,
//       visited: visitedId,
//     });

//     if (existingVisit) {
//       existingVisit.visitedAt = new Date();
//       await existingVisit.save();

//       const populatedVisit = await Visit.findById(existingVisit._id)
//         .populate({ path: "visitor", select: "email firstName lastName image" })
//         .populate({
//           path: "visited",
//           select: "email firstName lastName image",
//         });

//       // Log the populated visit for debugging
//       console.log("Updated Visit:", populatedVisit);

//       res.status(200).json(populatedVisit);
//     } else {
//       const visit = new Visit({
//         visitor: visitorId,
//         visited: visitedId,
//         visitedAt: new Date(),
//       });

//       await visit.save();

//       const populatedVisit = await Visit.findById(visit._id)
//         .populate({ path: "visitor", select: "email" })
//         .populate({ path: "visited", select: "email" });

//       console.log("Created Visit:", populatedVisit);

//       res.status(201).json(populatedVisit);
//     }
//   } catch (error) {
//     console.error("Error recording visit:", error);
//     res.status(500).json({ message: "Failed to record visit" });
//   }
// };

// const fetchVisits = async (req, res) => {
//   const { visitorId, visitedId } = req.query; // Assuming you pass query parameters

//   try {
//     // Build query based on provided parameters
//     const query = {};
//     if (visitorId) query.visitor = visitorId;
//     if (visitedId) query.visited = visitedId;

//     // Fetch visit records
//     const visits = await Visit.find(query)
//       .populate({ path: "visitor", select: "email" })
//       .populate({ path: "visited", select: "email" });

//     res.status(200).json(visits);
//   } catch (error) {
//     console.error("Error fetching visits:", error);
//     res.status(500).json({ message: "Failed to fetch visits" });
//   }
// };
const recordVisit = async (req, res) => {
  const { visitorId, visitedId } = req.body;

  if (visitorId === visitedId) {
    // Return a message indicating no action was taken
    return res.status(200).json({ message: "Visit to self not recorded" });
  }

  try {
    const existingVisit = await Visit.findOne({
      visitor: visitorId,
      visited: visitedId,
    });

    if (existingVisit) {
      existingVisit.visitedAt = new Date();
      await existingVisit.save();

      const populatedVisit = await Visit.findById(existingVisit._id)
        .populate({ path: "visitor", select: "email firstName lastName image" })
        .populate({
          path: "visited",
          select: "email firstName lastName image",
        });

      // Log the populated visit for debugging
      console.log("Updated Visit:", populatedVisit);

      res.status(200).json(populatedVisit);
    } else {
      const visit = new Visit({
        visitor: visitorId,
        visited: visitedId,
        visitedAt: new Date(),
      });

      await visit.save();

      const populatedVisit = await Visit.findById(visit._id)
        .populate({ path: "visitor", select: "email firstName lastName image" })
        .populate({
          path: "visited",
          select: "email firstName lastName image",
        });

      console.log("Created Visit:", populatedVisit);

      res.status(201).json(populatedVisit);
    }
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({ message: "Failed to record visit" });
  }
};
const fetchVisits = async (req, res) => {
  const { visitorId, visitedId } = req.query; // Assuming you pass query parameters

  try {
    // Build query based on provided parameters
    const query = {};
    if (visitorId) query.visitor = visitorId;
    if (visitedId) query.visited = visitedId;

    // Fetch visit records
    const visits = await Visit.find(query)
      .populate({ path: "visitor", select: "email firstName lastName image" })
      .populate({
        path: "visited",
        select: "email firstName lastName image",
      });

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ message: "Failed to fetch visits" });
  }
};

module.exports = {
  registerMail,
  sendInviteEmail,
  acceptInvite,
  recordVisit,
  fetchVisits,
};
