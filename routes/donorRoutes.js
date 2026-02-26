import express from "express";
import Donor from "../models/Donor.js";

const router = express.Router();

// Add donor
router.post("/add", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all donors
router.get("/all", async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get nearby donors
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, bloodGroup } = req.query;

    if (!lat || !lng || !bloodGroup) {
      return res.status(400).json({ error: "lat, lng, and bloodGroup are required" });
    }

    const donors = await Donor.find({
      bloodGroup,
      status: "Active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000, // 5 km radius
        },
      },
    });

    res.json(donors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;