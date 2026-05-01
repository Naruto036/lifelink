import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";

const router = express.Router();


// ✅ SEND REQUEST (MAIN FIX)
router.post("/send", async (req, res) => {
  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    console.log("Incoming request:", req.body);

    // ✅ VALIDATION
    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ CHECK DONOR
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // ✅ EMAIL CHECK
    if (!donor.email) {
      return res.status(400).json({ message: "Donor has no email" });
    }

    // ✅ SAVE REQUEST
    const newRequest = new Request({
      donorId,
      requesterId,
      requesterName,
      bloodGroup,
      status: "pending",
    });

    await newRequest.save();

    res.json({ message: "Request sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET ACCEPTED REQUESTS (for showing phone)
router.get("/accepted/:userId", async (req, res) => {
  try {
    const requests = await Request.find({
      requesterId: req.params.userId,
      status: "accepted",
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});


export default router;