import express from "express";
import Donor from "./Donor.js";

const router = express.Router();

// ✅ Unified Route: Handles both "Get All" and "Filtered Search"
router.get("/all", async (req, res) => {
  try {
    const { lat, lng, bloodGroup } = req.query;

    // Default filter: only show active donors
    let filter = { status: "Active" };

    // 1. Exact Blood Group Filter
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup; 
    }

    // 2. Geospatial Filter (Only if lat/lng are provided)
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // [Longitude, Latitude]
          },
          $maxDistance: 10000, // 10km radius (in meters)
        },
      };
    }

    const donors = await Donor.find(filter);
    res.json(donors);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: error.message });
  }
});

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

export default router;