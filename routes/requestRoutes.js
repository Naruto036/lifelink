import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ---------------- EMAIL CONFIG ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,        // ✅ FIXED
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ VERIFY EMAIL CONFIG
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

// ---------------- SEND REQUEST ----------------
router.post("/send", async (req, res) => {
  console.log("📩 BODY RECEIVED:", req.body);

  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    if (!donor.email) {
      return res.status(400).json({ message: "Donor has no email" });
    }

    // ✅ FIX duplicate logic
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

    // ---------------- SEND EMAIL ----------------
    try {
      console.log("📧 Sending email to:", donor.email);

      const info = await transporter.sendMail({
        from: `"LifeLink 🩸" <${process.env.EMAIL}>`,
        
        // 🔥 TEMP TEST (optional)
        // to: "yourpersonalemail@gmail.com",
        
        to: donor.email,

        subject: "🩸 Blood Request - Action Needed",
        html: `
          <h2>Blood Request</h2>
          <p>Hello ${donor.name},</p>
          <p><b>${requesterName}</b> needs blood.</p>
          <p>Blood Group: <b>${bloodGroup}</b></p>

          <br/>

          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/accept"
             style="background:green;color:white;padding:12px 18px;border-radius:6px;">
             ✅ Accept
          </a>

          <br/><br/>

          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/reject"
             style="background:red;color:white;padding:12px 18px;border-radius:6px;">
             ❌ Reject
          </a>

          <br/><br/>
          <p>Thank you ❤️</p>
        `,
      });

      console.log("✅ EMAIL SENT:", info.response);

      return res.status(201).json({
        message: "Request sent & email delivered ✅",
      });

    } catch (emailErr) {
      console.error("❌ EMAIL ERROR:", emailErr);

      return res.status(201).json({
        message: "Request saved but email failed ⚠️",
      });
    }

  } catch (err) {
    console.error("❌ SEND REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;