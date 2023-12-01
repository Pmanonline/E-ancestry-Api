const mongoose = require("mongoose");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

const studentSchema = mongoose.Schema(
  {
    customId: {
      type: String,
      default: () => uuidv4(), // Generate a UUID as the default customId
      unique: true,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentAge: {
      type: String,
      required: true,
    },
    studentCourse: {
      type: Array,
      required: true,
    },
    studentClass: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      default: uuidv4(),
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return slugify(this.studentName, { lower: true });
      },
    },
  },
  {
    timestamps: true,
  }
);

const studentUser = mongoose.model("Students", studentSchema);
module.exports = studentUser;
