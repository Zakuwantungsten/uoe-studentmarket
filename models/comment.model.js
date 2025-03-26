const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment

