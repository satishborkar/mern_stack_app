const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Auth token expired!, please login again...");
    }
  } else {
    throw new Error("No token found in the header");
  }
});

const isAdminMiddleware = asyncHandler(async (req, res, next) => {
  const { email } = req?.user;
  try {
    const user = await User.findOne({ email: email });
    if (user?.role && user?.role === "admin") {
      next();
    } else {
      throw new Error("You don't have admin access.");
    }
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { authMiddleware, isAdminMiddleware };
