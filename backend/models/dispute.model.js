const mongoose = require("mongoose")

const disputeSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["service_quality", "payment", "cancellation", "communication", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "under_review", "mediation", "resolved", "closed"],
      default: "open",
    },
    description: {
      type: String,
      required: true,
    },
    evidence: {
      type: [String], // array of file URLs
    },
    desiredOutcome: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
    },
    resolutionNotes: {
      type: String,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isAdminMessage: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Dispute = mongoose.model("Dispute", disputeSchema)

module.exports = Dispute