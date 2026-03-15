import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";

const router = express.Router();

// Create request
router.post("/send", async (req, res) => {
  try {
    const { donorId, requesterId } = req.body;

    const request = new Request({
      donorId,
      requesterId,
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update request status
router.put("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests for donor
router.get("/donor/:donorId", async (req, res) => {
  const requests = await Request.find({
    donorId: req.params.donorId,
  });

  res.json(requests);
});

export default router;