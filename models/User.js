const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: [true, "Please choose another username"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],

      validate: [validator.isEmail, "PLease provide a valid meial address."],
    },
    residence: {
      type: String,
    },
    birthday: {
      type: Date,
    },

    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [6, "Password must be atleast 6 characters"],
      // select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    profilePic: {
      type: String,
    },
    profileInfo: {
      type: String,
      maxlength: [100, "Profile Info too long..."],
    },
    followers: {
      type: Array,
      default: []
    },
    following: {
      type: Array,
      default: []
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
