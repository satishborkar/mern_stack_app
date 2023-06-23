const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const asyncHandler = require("express-async-handler");
const { validateMondoDBId } = require("../utils/validateMondoDBId");

// Create User
const createUser = asyncHandler(async (req, res) => {
  // check for existing user
  const email = req.body.email;
  const isEmailExist = await User.findOne({ email: email });
  if (!isEmailExist) {
    // Create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    // User already exist return error
    throw new Error("User already exist");
    // res.json({
    //   message: "User already exist",
    //   success: false,
    // });
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // find existing user
  const findUser = await User.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updatedUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser._id,
      fistName: findUser.firstName,
      lastName: findUser.lastName,
      email: findUser.email,
      mobile: findUser.mobile,
      role: findUser.role,
      token: generateToken(findUser?._id),
      isBlocked: findUser.isBlocked,
    });
  } else {
    throw new Error("Credentials not found");
  }
});

// Handle refresh token
const refreshTokenHandler = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken)
    throw new Error("No refresh token found in the cookies");
  // find user by refreshTOken
  const { refreshToken } = req.cookies;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token found");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    console.log({ err, decoded, userId: user.id, user_Id: user._id });
    if (err || user?.id !== decoded.id) {
      throw new Error("Something went wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMondoDBId(_id);
  const { firstName, lastName, email, mobile } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName,
        lastName,
        email,
        mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// get a user
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDBId(id);
  try {
    const getUser = await User.findById(id);
    if (getUser) {
      res.json(getUser);
    } else {
      throw new Error("Id is incorrect");
    }
  } catch (error) {
    throw new Error(error);
  }
});

// delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDBId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// blockUser
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDBId(id);
  try {
    const updatedUser =
      id &&
      (await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true }));
    res.json({
      message: "user is blocked",
      user: updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// unBlockUser
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMondoDBId(id);
  try {
    const updatedUser =
      id &&
      (await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true }));
    res.json({
      message: "user is unblocked",
      user: updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  refreshTokenHandler,
};
