const mongoose = require("mongoose")

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for comments
discussionSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "discussion",
})

const Discussion = mongoose.model("Discussion", discussionSchema)

module.exports = Discussion

