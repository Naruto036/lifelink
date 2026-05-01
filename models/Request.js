import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
    requesterId: {
      type: String,
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);