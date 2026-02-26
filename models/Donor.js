import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
});

donorSchema.index({ location: "2dsphere" });

export default mongoose.model("Donor", donorSchema);