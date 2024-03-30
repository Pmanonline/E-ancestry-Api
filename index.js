// const express = require("express");
// const morgan = require("morgan");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const app = express();
// const bodyParser = require("body-parser");
// const ClassUser = require("./models/classModel");

// app.use(bodyParser.json());

// // cors
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
// app.options("*", function (req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your client's domain
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.sendStatus(200);
// });
// // * BorderParser Middleware
// app.use(express.json());

// // * Load Env
// dotenv.config({ path: "./config.env" });

// //* Log route actions
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }
// const options = {
//   allowedHosts: ["localhost"], // Example of allowed hosts
//   // Other options...
// };
// //* Use Routes
// app.use("/api/course", require("./routes/course"));
// app.use("/api/class", require("./routes/class"));
// app.use("/api/student", require("./routes/student"));

// const port = process.env.PORT || 5000;

// app.listen(port, () => console.log(`Server started on port ${port}`));

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const ClassUser = require("./models/classModel");

app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "https://schoolmgtapp-api.onrender.com"], // Add your client's domain here
  credentials: true,
};

// Enable CORS
app.use(cors(corsOptions));

// Log route actions
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Load Env
dotenv.config({ path: "./config.env" });

// BorderParser Middleware
app.use(express.json());

// Use Routes
app.use("/api/course", require("./routes/course"));
app.use("/api/class", require("./routes/class"));
app.use("/api/student", require("./routes/student"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
