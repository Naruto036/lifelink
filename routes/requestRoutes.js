import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ---------------- EMAIL SETUP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- SEND REQUEST ----------------
router.post("/send", async (req, res) => {
  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    // ✅ Validate input
    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Get donor
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // ❌ No email case
    if (!donor.email) {
      return res.status(400).json({ message: "Donor has no email" });
    }

    // ✅ Prevent duplicate requests
    const existing = await Request.findOne({
      donorId,
      requesterId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // ✅ Save request
    const newRequest = new Request({
      donorId,
      requesterId,
      requesterName,
      bloodGroup,
      status: "pending",
    });

    await newRequest.save();

    // ---------------- SEND EMAIL ----------------
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: donor.email,
        subject: "🩸 Blood Donation Request",
        html: `
          <h2>Blood Request Received</h2>
          <p><b>${requesterName}</b> needs <b>${bloodGroup}</b> blood.</p>
          <p>Please login to your dashboard to accept or reject.</p>
          <br/>
          <small>LifeLink Team</small>
        `,
      });

      return res.json({ message: "Request sent & email delivered ✅" });

    } catch (emailErr) {
      console.error("Email error:", emailErr);

      return res.json({
        message: "Request saved but email failed ⚠️",
      });
    }

  } catch (err) {
    console.error("Send request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- ACCEPT REQUEST ----------------
router.post("/action/:id/accept", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    await request.save();

    res.json({ message: "Request accepted ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- REJECT REQUEST ----------------
router.post("/action/:id/reject", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected ❌" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- GET ACCEPTED REQUESTS ----------------
router.get("/accepted/:userId", async (req, res) => {
  try {
    const requests = await Request.find({
      requesterId: req.params.userId,
      status: "accepted",
    });

    res.json(requests);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;