const mongoose = require("mongoose");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

const courseSchema = mongoose.Schema(
  {
    customId: {
      type: String,
      default: () => uuidv4(), // Generate a UUID as the default customId
      unique: true,
      required: true,
    },
    courseName: {
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
        return slugify(this.className, { lower: true });
      },
    },
  },
  {
    timestamps: true,
  }
);

const courseUser = mongoose.model("Courses", courseSchema);
module.exports = courseUser;
