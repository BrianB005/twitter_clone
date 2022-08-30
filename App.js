require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const connectDB = require("./db/connect");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// file upload with multer
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});
const upload = multer({ storage });

app.post("/api/v1/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.log(error);
  }
});

const notFoundMiddleware = require("./middlewares/not-found");
const ErrorHandlerMiddleware = require("./middlewares/error-handler");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const tweetRouter = require("./routes/tweetRoutes");
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(morgan("tiny"));

app.use(express.json());

// path for static files

app.use("/images", express.static(path.join(__dirname, "public/images")));
// the secret key passed to the function below is used to sign the cookie
app.use(cookieParser(process.env.JWT_SECRET));
// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
// error middlewares
app.use(ErrorHandlerMiddleware);
app.use(notFoundMiddleware);
const PORT = 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server is currently listening on port ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();
