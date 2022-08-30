const express = require("express");
const {
  getSingleUser,
  deleteUser,
  showCurrentUser,
  updateUser,
  getAllUsers,
  followUser,
  unfollowUser,
  deleteAll,
  searchUsers,
} = require("../controllers/userControllers");
const { authenticateUser } = require("../middlewares/authntication");
const router = express.Router();

router.route("/find/:id").get(getSingleUser);
router.route("/delete/all").delete(deleteAll);
router
  .route("/")
  .put(authenticateUser, updateUser)
  .delete(authenticateUser, deleteUser)
  .get(authenticateUser, showCurrentUser);
router.route("/allUsers").get(getAllUsers);
router.route("/search").get(searchUsers);
router.route("/:id/follow").put(authenticateUser, followUser);
router.route("/:id/unfollow").put(authenticateUser, unfollowUser);
module.exports = router;
