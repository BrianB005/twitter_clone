const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  userTokenPayload,
  createJWT,
} = require("../utils");

const register = async (req, res) => {
  const { email } = req.body;
  const { username } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  const usernameAlreadyExists = await User.findOne({ username });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  if (usernameAlreadyExists) {
    throw new CustomError.BadRequestError(
      "Username already exists.Pick a different one."
    );
  }

  const user = await User.create(req.body);
  const tokenUser = userTokenPayload(user);
  // attachCookiesToResponse({ res, user: tokenUser });
  const token = createJWT({ payload: tokenUser });

  const { password, ...others } = user._doc;
  res.status(StatusCodes.CREATED).json({ user: others, token: token });
};
const login = async (req, res) => {
  // const { email, password } = req.body;
  let user;
  // if ("email" in req.body) {
  //   if (!req.body.email || !req.body.password) {
  //     throw new CustomError.BadRequestError(
  //       "Please provide email and password"
  //     );
  //   }
  //   user = await User.findOne({ email: req.body.email });
  // } else if ("username" in req.body) {
  //   if (!req.body.username || !req.body.password) {
  //     throw new CustomError.BadRequestError(
  //       "Please provide your username and password"
  //     );
  //   }
  //   user = await User.findOne({ username: req.body.username });
  // }
  if (!req.body.email || !req.body.password) {
    throw new CustomError.BadRequestError("KIndly fill the required fields");
  }
  user = await User.findOne({
    email: req.body.email || username || req.body.email,
  });
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      "User doesn't exist.Kindly Register"
    );
  }
  const isPasswordCorrect = await user.comparePassword(req.body.password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Wrong password!!");
  }
  const tokenUser = userTokenPayload(user);
  // attachCookiesToResponse({ res, user: tokenUser });
  const token = createJWT({ payload: tokenUser });

  const { password, ...others } = user._doc;
  res.status(StatusCodes.CREATED).json({ user: others, token: token });
};
const logout = async (req, res) => {
  // res.status(200).json({ msg: "User logged out successfully" });
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

module.exports = {
  register,
  login,
  logout,
};
