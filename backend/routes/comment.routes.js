const express = require("express")
const router = express.Router()
const commentController = require("../controllers/comment.controller")
const { protect } = require("../middleware/auth.middleware")

// Comment routes
router.route("/")
  .post(protect, commentController.createComment)

router.route("/:id")
  .put(protect, commentController.updateComment)
  .delete(protect, commentController.deleteComment)

// Export the router
module.exports = router