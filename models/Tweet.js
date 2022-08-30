const mongoose = require("mongoose");
const TweetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: [200, "A tweet can't be longer than 200 characters"],
    },
    image: {
      type: String,
    },
    comments: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    retweets: {
      type: Array,
      default: [],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tweet", TweetSchema);
