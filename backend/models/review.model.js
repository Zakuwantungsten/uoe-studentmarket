const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["published", "hidden", "flagged", "under_review"],
      default: "published",
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    flaggedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review

