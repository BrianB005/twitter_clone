const Tweet = require("../models/Tweet");
const CustomError = require("../errors");
const User = require("../models/User");
const createTweet = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new CustomError.BadRequestError("Tweet can't be empty");
  }
  req.body.user = req.user.userId;
  const tweet = await Tweet.create(req.body);
  res.status(200).json({ tweet });
};
const getTweet = async (req, res) => {
  const tweet = await Tweet.find({ _id: req.params.tweetId }).populate("user");
  res.status(200).json({ tweet });
};
const getSingleUserTweets = async (req, res) => {
  const tweets = await Tweet.find({ user: req.params.id })
    .populate("user")
    .sort("-createdAt");
  res.status(200).json({ tweets });
};
const likeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.tweetId);
    if (!tweet.likes.includes(req.user.userId)) {
      await tweet.updateOne({
        $push: { likes: req.user.userId },
      });
      res.status(200).json({ tweet });
    } else {
      await tweet.updateOne({
        $pull: { likes: req.user.userId },
      });
      res.status(200).json({ tweet });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const retweetTweet = async (req, res) => {
  const tweet = await Tweet.findById(req.params.tweetId);
  if (!tweet.retweets.includes(req.user.userId)) {
    await tweet.updateOne({
      $push: { retweets: req.user.userId },
    });
    res.status(200).json({ tweet });
  } else {
    await tweet.updateOne({
      $pull: { retweets: req.user.userId },
    });
    res.status(200).json({ tweet });
  }
};

const deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (tweet.user === req.user.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can only delete  your post!!!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTimelineTweets = async (req, res) => {
  const userId = req.user.userId;
  const currentUser = await User.findById(userId);
  const userTweets = await Tweet.find({ user: userId })
    .populate("user")
    .sort("-createdAt");
  // console.log(userTweets);
  const currentUserFollowingTweets = await Promise.all(
    currentUser.following.map((followingId) => {
      return Tweet.find({ user: followingId })
        .populate("user")
        .sort("-createdAt");
    })
  );
  // console.log(currentUserFollowingTweets);
  const timelineTweets = userTweets.concat(...currentUserFollowingTweets);

  res.status(200).json({ timelineTweets });
};

module.exports = {
  createTweet,
  getTweet,
  getSingleUserTweets,
  likeTweet,
  retweetTweet,
  deleteTweet,
  getTimelineTweets,
};
