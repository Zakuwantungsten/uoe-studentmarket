const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for review
bookingSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "booking",
  justOne: true,
})

// Virtual for transaction
bookingSchema.virtual("transaction", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "booking",
  justOne: true,
})

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking

