const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connect = require("./database/conn.js");
const router = require("./router/route.js");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by"); // less hackers know about our stack

const port = 8080;

// cors
app.use(
  cors({
    origin: ["https://rekoda-app.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);

// Allow preflight requests
app.options("*", function (req, res) {
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

/** api routes */
app.use("/api", router);

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

/** start server only when we have valid connection */
connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.log("Cannot connect to the server");
    }
  })
  .catch((error) => {
    console.log("Invalid database connection...!");
  });
