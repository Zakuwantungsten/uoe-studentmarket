const express = require("express")
const router = express.Router()
const groupController = require("../controllers/group.controller")
const { protect } = require("../middleware/auth.middleware")

// Group routes
router.route("/")
  .get(groupController.getAllGroups)
  .post(protect, groupController.createGroup)

router.route("/:id")
  .get(groupController.getGroupById)
  .put(protect, groupController.updateGroup)
  .delete(protect, groupController.deleteGroup)

// Join a group
router.route("/:id/join")
  .post(protect, groupController.joinGroup)

// Leave a group
router.route("/:id/leave")
  .post(protect, groupController.leaveGroup)

// Export the router
module.exports = router