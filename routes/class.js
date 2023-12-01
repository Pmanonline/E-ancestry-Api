const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const db = require("../config/db");
const { v4: uuidV4 } = require("uuid");
const ClassUser = require("../models/classModel");

const uuid = require("uuid"); // Import the uuid library

// @route type: POST //create a class?
// router.post("/create", async (req, res) => {
//   try {
//     const { className } = req.body;

//     // Generate a UID and a slug from the class name
//     const uid = uuid.v4();
//     const slug = slugify(className, { lower: true });

//     // check if course exists in db
//     const userExists = await ClassUser.findOne({ className });

//     if (userExists) {
//       res.status(404).json({ error: "user already exists" });
//     }

//     // Create a new class with the generated UID and slug
//     const newClass = await ClassUser.create({ className, uid, slug });

//     if (newClass) {
//       res.status(201).json({
//         _id: newClass._id,
//         className: newClass.className,
//         uid: newClass.uid, // Include the generated UID in the response
//         slug: newClass.slug, // Include the generated slug in the response
//       });
//     } else {
//       res.status(400).json({ error: "Invalid class data" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // @route type: GET //get all classes?
// router.get("/", async (req, res) => {
//   try {
//     const classes = await ClassUser.find(); // Retrieve all classes from MongoDB
//     res.status(200).json(classes);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/create", async (req, res) => {
  try {
    const { className } = req.body;

    // Check if courseName is empty or not provided
    if (!className) {
      return res.status(422).send("className is required");
    }

    // Generate a UID and a slug from the class name
    const uid = uuid.v4();
    const slug = slugify(className, { lower: true });

    // Check if a course with the same name already exists
    const courseExists = await ClassUser.findOne({ className });

    if (courseExists) {
      return res.status(422).send("Class with the same name already exists");
    }

    // Create a new class with the generated UID and slug
    const newClass = await ClassUser.create({ className, uid, slug });

    if (newClass) {
      return res.status(201).json({
        _id: newClass._id,
        className: newClass.className,
        uid: newClass.uid,
        slug: newClass.slug,
      });
    } else {
      return res.status(400).send("Invalid class data");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

// @route type: get //get al class?
router.get("/", async (req, res) => {
  try {
    const classes = await ClassUser.find(); // Retrieve all classes from MongoDB
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @route type: update //update al class?
router.put("/:customId", async (req, res) => {
  try {
    const { className } = req.body;
    const { customId } = req.params;

    // Find the class by customId
    const existingClass = await ClassUser.findOne({ customId });

    if (!existingClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Update the class properties
    existingClass.className = className;

    // Save the updated class
    const updatedClass = await existingClass.save();

    res.status(200).json({
      _id: updatedClass._id,
      className: updatedClass.className,
      uid: updatedClass.uid,
      slug: updatedClass.slug,
      customId: updatedClass.customId, // Include the custom ID in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @route type: delete //delete a class?
router.delete("/:customId", async (req, res) => {
  try {
    const { customId } = req.params;

    // Delete the class by customId
    const deleteResult = await ClassUser.deleteOne({ customId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(204).send(); // Respond with a 204 (No Content) status indicating success
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
