const mongoose = require("mongoose");

const connectDB = (url) => {
  mongoose.connect(url);
};
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "APP_ID",
  key: "APP_KEY",
  secret: "APP_SECRET",
  cluster: "APP_CLUSTER",
  useTLS: true,
});

const db = mongoose.connection;
db.once("open", () => {
  const tweetsCollection = db.collection("tweets");
  const changeStream = tweetsCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);
    console.log("Hello");
    if (change.operationType === "insert") {
      const tweet = change.fullDocument;
      pusher.trigger("tweets", "inserted", tweet.title);
    } else {
      console.log("Error triggering pusher event");
    }
  });
});

module.exports = connectDB;
