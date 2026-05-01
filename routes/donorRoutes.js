import express from "express";
import Donor from "../models/Donor.js";

const router = express.Router();


// ✅ ADD DONOR (FIXES 404)
router.post("/", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json(donor);
  } catch (err) {
    console.error("Error saving donor:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET DONORS (FIXED FILTER)
router.get("/", async (req, res) => {
  try {
    let { bloodGroup } = req.query;

    console.log("Query received:", req.query);

    let filter = {};

    if (bloodGroup) {
      // decode A%2B → A+
      bloodGroup = decodeURIComponent(bloodGroup).trim();

      // simple exact match (BEST FIX)
      filter.bloodGroup = bloodGroup;
    }

    console.log("Final Filter:", filter);

    const donors = await Donor.find(filter);

    res.json(donors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;