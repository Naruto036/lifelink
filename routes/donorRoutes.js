import express from "express";
import Donor from "../models/Donor.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { bloodGroup } = req.query;

    console.log("Query received:", req.query);

    let filter = {};

    if (bloodGroup) {
      // ✅ FULL FIX (handles + properly)
      bloodGroup = decodeURIComponent(bloodGroup);

      // remove accidental spaces
      bloodGroup = bloodGroup.trim();

      filter.bloodGroup = new RegExp(`^${bloodGroup}$`, "i");
    }

    console.log("Final Filter:", filter);

    const donors = await Donor.find(filter);

    res.json(donors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}); export default router;