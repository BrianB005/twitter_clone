const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  attachCookiesToResponse,
  userTokenPayload,
  authorizeUser,
  createJWT,
} = require("../utils");
const CustomError = require("../errors");

const showCurrentUser = async (req, res) => {
  // console.log(user);
  // const user=req.user;
  const user = await User.findOne({ username: req.user.username }).select(
    "-password"
  );
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user with name : ${req.user.username}`
    );
  }
  res.status(200).json({ user });
};
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({ users });
};
const searchUsers = async (req, res) => {
  const query = req.query.search_query;
  const users = await User.find({
    name: { $regex: query, $options: "i" },
  }).select("-password");
  res.status(200).json({ users });
};
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user with name : ${req.params.username}`
    );
  }
  // authorizeUser(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const updateUser = async (req, res) => {
  // const { userId } = req.user;
  // try {
  const user = await User.findOneAndUpdate({ _id: req.user.userId }, req.body, {
    new: true,
    runValidators: true,
  });
  // console.log(user);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.user.userId}`);
  }
  authorizeUser(req.user, user._id);
  const tokenUser = userTokenPayload(user);
  // attachCookiesToResponse({ res, user: tokenUser });
  const token = createJWT({ payload: tokenUser });

  const { password, ...others } = user._doc;
  res.status(StatusCodes.CREATED).json({ user: others, token: token });
  res.status(200).json({ user });
  // } catch (error) {
  //   res.status(400).json("Update failed!Try again!");
  // }
};
const deleteUser = async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.user.userId}`);
  }
  authorizeUser(req.user, user._id);
  res
    .status(StatusCodes.OK)
    .json({ msg: `Your Account has been deleted successfully` });
};
const followUser = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);
    if (!user.followers.includes(req.user.userId)) {
      await user.updateOne({ $push: { followers: req.user.userId } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      res.status(200).json("user followed successfully");
    } else {
      res.status(403).json("You already follow this user!");
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
};

const unfollowUser = async (req, res) => {
  if (req.user.userId !== req.params.id) {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);
    if (user.followers.includes(req.user.userId)) {
      await user.updateOne({ $pull: { followers: req.user.userId } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      res.status(200).json("user has been unfollowed successfully");
    } else {
      res.status(403).json("you dont follow this user");
    }
  } else {
    res.status(403).json("Wrong action.You can't unfollow yourself");
  }
};
const deleteAll = async (req, res) => {
  await User.deleteMany({});
  res.status(200).json("Users deleted");
};
module.exports = {
  getSingleUser,
  showCurrentUser,
  deleteUser,
  updateUser,
  getAllUsers,
  followUser,
  unfollowUser,
  deleteAll,
  searchUsers,
};
