const express = require("express");
const {
  createTweet,
  getSingleUserTweets,
  getTweet,
  likeTweet,
  deleteTweet,
  retweetTweet,
  getTimelineTweets,
} = require("../controllers/tweetsController");
const { authenticateUser } = require("../middlewares/authntication");
const router = express.Router();
router
  .route("/")
  .post(authenticateUser, createTweet)
  .get(authenticateUser, getTimelineTweets);
router.route("/:id").get(getSingleUserTweets);
router.route("/user/:tweetId").get(getTweet);
router.route("/like/:tweetId").put(authenticateUser, likeTweet);
router.route("/retweet/:tweetId").put(authenticateUser, retweetTweet);
router.route("/delete/:tweetId").delete(authenticateUser, deleteTweet);

module.exports = router;
