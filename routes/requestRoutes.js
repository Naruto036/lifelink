import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import nodemailer from "nodemailer";

const router = express.Router();

/* ---------------- EMAIL CONFIG ---------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

/* ---------------- SEND REQUEST ---------------- */
router.post("/send", async (req, res) => {
  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    const existing = await Request.findOne({
      donorId,
      requesterId,
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new Request({
      donorId,
      requesterId,
      requesterName,
      bloodGroup,
      status: "Pending",
    });

    await newRequest.save();

    const BASE_URL = "https://lifelink-4.onrender.com";

    await transporter.sendMail({
      from: `"LifeLink 🩸" <${process.env.EMAIL}>`,
      to: donor.email,
      subject: "Blood Request",
      html: `
        <h2>Blood Request</h2>
        <p>${requesterName} needs ${bloodGroup} blood.</p>

        <a href="${BASE_URL}/api/requests/action/${newRequest._id}/accept">Accept</a>
        <br/>
        <a href="${BASE_URL}/api/requests/action/${newRequest._id}/reject">Reject</a>
      `,
    });

    return res.status(201).json({
      message: "Request sent successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- FIX: ACCEPTED REQUESTS ROUTE (IMPORTANT FIX) ---------------- */
router.get("/accepted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const accepted = await Request.find({
      requesterId: userId,
      status: "Accepted",
    });

    res.json(accepted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;