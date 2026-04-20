import express from "express";
import Donor from "../models/Donor.js";

const router = express.Router();

// ADD DONOR
router.post("/", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json(donor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET DONORS
router.get("/", async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;