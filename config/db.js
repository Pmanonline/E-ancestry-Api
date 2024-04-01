// const mysql = require("mysql2");

// var db;
// connectDatabase = () => {
//   if (!db) {
//     db = mysql.createConnection({
//       host: process.env.DBHOST,
//       port: process.env.PORT,
//       database: process.env.DBNAME,
//       user: process.env.DBUSER,
//       password: "",
//     });
//     db.connect(function (err) {
//       if (!err) {
//         console.log("Database is connected!");
//       } else {
//         console.log("Error connecting database!");
//       }
//     });
//   }
//   return db;
// };
// module.exports = connectDatabase();
const { mongoose } = require("mongoose");
const MONGO_URI =
  // "mongodb+srv://firstCRUD:w3schools.com@crud.zgveazn.mongodb.net/?retryWrites=true&w=majority";
  "mongodb+srv://firstCRUD:w3schools.com@crud.zgveazn.mongodb.net/";
// "mongodb://127.0.0.1:27017/myDatabase";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`mongodb connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB();
