const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const db = require("../config/db");
const { v4: uuidV4 } = require("uuid");
const studentUser = require("../models/studentModel");

const uuid = require("uuid"); // Import the uuid library

// // @route type: POST //create a class?
// router.post("/create", async (req, res) => {
//   try {
//     const { studentName, studentAge, studentCourse, studentClass } = req.body;

//     // Generate a UID and a slug from the class name
//     const uid = uuid.v4();
//     const slug = slugify(studentName, { lower: true });

//     // check if course exists in db
//     const userExists = await studentUser.findOne({ studentName });

//     if (userExists) {
//       res.status(404).json({ error: "student already exists" });
//     }

//     // Create a new class with the generated UID and slug
//     const newClass = await studentUser.create({
//       studentName,
//       studentAge,
//       studentCourse,
//       studentClass,
//       uid,
//       slug,
//     });

//     if (newClass) {
//       res.status(201).json({
//         _id: newClass._id,
//         studentName: newClass.studentName,
//         studentAge: newClass.studentAge,
//         studentCourse: newClass.studentCourse,
//         studentClass: newClass.studentClass,
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
    const { studentName, studentAge, studentCourse, studentClass } = req.body;
    // Generate a UID and a slug from the class name
    const uid = uuid.v4();
    const slug = slugify(studentName, { lower: true });

    // check if course exists in db
    const userExists = await studentUser.findOne({ studentName });

    if (userExists) {
      res.status(404).json({ error: "student already exists" });
    }
    // Create a new class with the generated UID and slug
    const newClass = await studentUser.create({
      studentName,
      studentAge,
      studentCourse,
      studentClass,
      uid,
      slug,
    });

    if (newClass) {
      res.status(201).json({
        _id: newClass._id,
        studentName: newClass.studentName,
        studentAge: newClass.studentAge,
        studentCourse: newClass.studentCourse,
        studentClass: newClass.studentClass,
        uid: newClass.uid, // Include the generated UID in the response
        slug: newClass.slug, // Include the generated slug in the response
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

// @route type: GET //get all classes?
router.get("/", async (req, res) => {
  try {
    const students = await studentUser.find(); // Retrieve all classes from MongoDB
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @route type: update //update al class?
router.put("/:customId", async (req, res) => {
  try {
    const { studentName, studentAge, studentCourse, studentClass } = req.body;
    const { customId } = req.params;

    // Find the class by customId
    const existingStudent = await studentUser.findOne({ customId });

    if (!existingStudent) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Update the student properties
    existingStudent.studentName = studentName;
    existingStudent.studentAge = studentAge;
    existingStudent.studentCourse = studentCourse;
    existingStudent.studentClass = studentClass;

    // Save the updated class
    const updatedstudent = await existingStudent.save();

    res.status(200).json({
      _id: updatedstudent._id,
      studentName: updatedstudent.studentName,
      studentAge: updatedstudent.studentAge,
      studentCourse: updatedstudent.studentCourse,
      studentClass: updatedstudent.studentClass,
      uid: updatedstudent.uid,
      slug: updatedstudent.slug,
      customId: updatedstudent.customId, // Include the custom ID in the response
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
    const deleteResult = await studentUser.deleteOne({ customId });

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
