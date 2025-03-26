const mongoose = require("mongoose")

const serviceFeatureSchema = new mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceType: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    availability: {
      type: String,
    },
    deliveryTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    features: [serviceFeatureSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for reviews
serviceSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "service",
})

// Virtual for bookings
serviceSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "service",
})

const Service = mongoose.model("Service", serviceSchema)

module.exports = Service

