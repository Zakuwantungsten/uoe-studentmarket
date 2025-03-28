const express = require("express")
const router = express.Router()
const discussionController = require("../controllers/discussion.controller")
const commentController = require("../controllers/comment.controller")
const { protect } = require("../middleware/auth.middleware")

// Discussion routes
router.route("/")
  .get(discussionController.getAllDiscussions)
  .post(protect, discussionController.createDiscussion)

router.route("/:id")
  .get(discussionController.getDiscussionById)
  .put(protect, discussionController.updateDiscussion)
  .delete(protect, discussionController.deleteDiscussion)

// Comment routes related to discussions
router.route("/:discussionId/comments")
  .get(commentController.getCommentsByDiscussion)

// Export the router
module.exports = router