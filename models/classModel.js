const mongoose = require("mongoose");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

const classSchema = mongoose.Schema(
  {
    customId: {
      type: String,
      default: () => uuidv4(), // Generate a UUID as the default customId
      unique: true,
      required: true,
    },
    className: {
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

const ClassUser = mongoose.model("Class", classSchema);
module.exports = ClassUser;
