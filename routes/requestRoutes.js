import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ---------------- EMAIL CONFIG ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- SEND REQUEST ----------------
router.post("/send", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    // ✅ Validate
    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find donor
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // ❌ No email
    if (!donor.email) {
      return res.status(400).json({ message: "Donor has no email" });
    }

    // ✅ Prevent duplicate ONLY if still pending
    const existing = await Request.findOne({
      donorId,
      requesterId,
      status: "Pending", // ⚠️ must match exactly what you save
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
      status: "Pending",
    });

    await newRequest.save();

    const BASE_URL = "https://lifelink-4.onrender.com";

    // ---------------- SEND EMAIL ----------------
    try {
      const info = await transporter.sendMail({
        from: `"LifeLink 🩸" <${process.env.EMAIL}>`,
        to: donor.email,
        subject: "🩸 Blood Request - Action Needed",
        html: `
          <h2>Blood Request</h2>
          <p>Hello ${donor.name},</p>
          <p><b>${requesterName}</b> needs blood.</p>
          <p>Blood Group: <b>${bloodGroup}</b></p>

          <br/>

          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/accept"
             style="background:green;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;">
             ✅ Accept
          </a>

          <br/><br/>

          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/reject"
             style="background:red;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;">
             ❌ Reject
          </a>

          <br/><br/>
          <p>Thank you ❤️</p>
        `,
      });

      console.log("EMAIL SENT:", info.response);

      return res.status(201).json({
        message: "Request sent & email delivered ✅",
      });

    } catch (emailErr) {
      console.error("EMAIL ERROR:", emailErr);

      return res.status(201).json({
        message: "Request saved but email failed ⚠️",
      });
    }

  } catch (err) {
    console.error("SEND REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ---------------- ACCEPT / REJECT ----------------
router.get("/action/:id/:type", async (req, res) => {
  try {
    const { id, type } = req.params;

    const status = type === "accept" ? "Accepted" : "Rejected";

    const request = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.send("<h2>Request not found</h2>");
    }

    if (status === "Accepted") {
      return res.send(`
        <h2>✅ Request Accepted</h2>
        <p>You can now contact the requester.</p>
      `);
    } else {
      return res.send(`
        <h2>❌ Request Rejected</h2>
      `);
    }

  } catch (err) {
    console.error("ACTION ERROR:", err);
    res.send("<h2>Error processing request</h2>");
  }
});


// ---------------- GET ACCEPTED (for frontend) ----------------
router.get("/accepted/:userId", async (req, res) => {
  try {
    const requests = await Request.find({
      requesterId: req.params.userId,
      status: "Accepted",
    });

    res.json(requests);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;