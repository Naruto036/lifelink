import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donor",
    required: true,
  },
  requesterId: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);