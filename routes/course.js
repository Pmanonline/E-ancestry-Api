const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const db = require("../config/db");
const { v4: uuidV4 } = require("uuid");
const courseUser = require("../models/courseModel");

const uuid = require("uuid"); // Import the uuid library

// // @route type: POST //create a class?
// router.post("/create", async (req, res) => {
//   try {
//     const { courseName } = req.body;

//     // Generate a UID and a slug from the class name
//     const uid = uuid.v4();
//     const slug = slugify(courseName, { lower: true });

//     // check if course exists in db
//     const userExists = await courseUser.findOne({ courseName });

//     if (userExists) {
//       res
//         .status(404)
//         .json({ error: "Course with the same name already exists" });
//     }

//     // Create a new class with the generated UID and slug
//     const newClass = await courseUser.create({ courseName, uid, slug });

//     if (newClass) {
//       res.status(201).json({
//         _id: newClass._id,
//         courseName: newClass.courseName,
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
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  "/create",
  asyncHandler(async (req, res) => {
    const { courseName } = req.body;

    // Generate a UID and a slug from the class name
    const uid = uuid.v4();
    const slug = slugify(courseName, { lower: true });

    // check if email exists in db
    const userExists = await courseUser.findOne({ courseName });

    if (userExists) {
      return res.status(402).json({ error: "user already exists" });
    }

    // create new user document in db
    const newClass = await courseUser.create({ courseName, uid, slug });

    if (newClass) {
      res.status(201).json({
        _id: newClass._id,
        courseName: newClass.courseName,
        uid: newClass.uid, // Include the generated UID in the response
        slug: newClass.slug, // Include the generated slug in the response
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

// router.post("/create", async (req, res) => {
//   try {
//     const { courseName } = req.body;

//     // Check if courseName is empty or not provided
//     if (!courseName) {
//       return res.status(422).json({ error: "Course name is required" });
//     }

//     // Generate a UID and a slug from the class name
//     const uid = uuid.v4();
//     const slug = slugify(courseName, { lower: true });

//     // Check if a course with the same name already exists in the database
//     const courseExists = await courseUser.findOne({ courseName });

//     if (courseExists) {
//       return res
//         .status(422)
//         .json({ error: "Course with the same name already exists" });
//     }

//     // Create a new class with the generated UID and slug
//     const newClass = await courseUser.create({ courseName, uid, slug });

//     if (newClass) {
//       return res.status(201).json({
//         _id: newClass._id,
//         courseName: newClass.courseName,
//         uid: newClass.uid, // Include the generated UID in the response
//         slug: newClass.slug, // Include the generated slug in the response
//       });
//     } else {
//       return res.status(400).json({ error: "Invalid class data" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "Course creation failed. Please try again." });
//   }
// });

// router.post("/create", async (req, res) => {
//   try {
//     const { courseName } = req.body;

//     // Check if courseName is empty or not provided
//     if (!courseName) {
//       return res.status(422).send("Course name is required");
//     }

//     // Generate a UID and a slug from the class name
//     const uid = uuid.v4();
//     const slug = slugify(courseName, { lower: true });

//     // Check if a course with the same name already exists
//     const courseExists = await courseUser.findOne({ courseName });

//     if (courseExists) {
//       return res.status(422).send("Course with the same name already exists");
//     }

//     // Create a new class with the generated UID and slug
//     const newClass = await courseUser.create({ courseName, uid, slug });

//     if (newClass) {
//       return res.status(201).json({
//         _id: newClass._id,
//         courseName: newClass.courseName,
//         uid: newClass.uid,
//         slug: newClass.slug,
//       });
//     } else {
//       return res.status(400).send("Invalid class data");
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send("Internal Server Error");
//   }
// });

// @route type: GET //get all classes?
router.get("/", async (req, res) => {
  try {
    const courses = await courseUser.find(); // Retrieve all classes from MongoDB
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @route type: update //update al class?
router.put("/:customId", async (req, res) => {
  try {
    const { courseName } = req.body;
    const { customId } = req.params;

    // Find the class by customId
    const existingClass = await courseUser.findOne({ customId });

    if (!existingClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Update the class properties
    existingClass.courseName = courseName;

    // Save the updated class
    const updatedClass = await existingClass.save();

    res.status(200).json({
      _id: updatedClass._id,
      courseName: updatedClass.courseName,
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
    const deleteResult = await courseUser.deleteOne({ customId });

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
