const jwt = require("jsonwebtoken");

const JWT_SECRET = "Qwe123123";

/** Auth middleware */
async function Auth(req, res, next) {
  try {
    // Access the Authorization header to validate the request
    const token = req.headers.authorization.split(" ")[1];

    // Retrieve the user details for the logged-in user
    const decodedToken = await jwt.verify(token, JWT_SECRET);

    req.user = decodedToken;

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication Failed!" });
  }
}

/** Local variables middleware */
function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}

module.exports = {
  Auth,
  localVariables,
};
