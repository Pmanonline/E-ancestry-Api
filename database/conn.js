const mongoose = require("mongoose");

// const MONGO_URI = "mongodb://127.0.0.1:27017/myDatabase";
const MONGO_URI =
  "mongodb+srv://firstCRUD:w3schools.com@crud.zgveazn.mongodb.net/";
const DB_URL = process.env.DB_URL || MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: true,
    });

    mongoose.set("strictQuery", true);
    console.log(`MongoDB is connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
