import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
import { transporter } from "../config/mailer.js";

const router = express.Router();
const BASE_URL= process.env.BASE_URL||"https://lifelink-4.onrender.com";

/* ---------------- SEND REQUEST ---------------- */
router.post("/send", async (req, res) => {
  console.log("POST /send HIT");
  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    // ✅ validation
    if (!donorId || !requesterId || !requesterName || !bloodGroup) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // ✅ check duplicate request
   

    // ✅ save request
    const newRequest = await Request.create({
      donorId,
      requesterId,
      requesterName,
      bloodGroup,
      status: "Pending",
    });

    // ✅ get donor details
    const donor = await Donor.findById(donorId);
    console.log("DONOR EMAIL:",donor?.email);

    if (!donor || !donor.email) {
      console.log("❌ Donor email not found");
      return res.status(404).json({
        message: "Donor email not found",
      });
    }

    // ✅ send email safely (non-blocking but controlled)
    try {
       const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: donor.email,
        subject: "🩸 Blood Request",
        html: `
          <h2>Blood Request</h2>
          <p><b>${requesterName}</b> needs <b>${bloodGroup}</b> blood.</p>
          <p>Please respond to the request</p>
          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/accept"
          style="padding:10px 15px; background:green;coloor:white;text-dec
          oration:none;margin-right:10px;">
          Accept
          </a>
          <a href="${BASE_URL}/api/requests/action/${newRequest._id}/reject"
          style="padding:10px 15px;background:red;color:white;text-decoration:none;">
          Reject
          </a>
        `,
      });

      console.log("✅ Email sent to:", donor.email);

    } catch (emailErr) {
      console.log("❌ Email error:", emailErr.message);
    }

    // ✅ response
    return res.status(201).json({
      message: "Request sent successfully",
      request: newRequest,
    });

  } catch (err) {
    console.log("❌ Server error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

/* ---------------- ACCEPTED REQUESTS ---------------- */
router.get("/accepted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const accepted = await Request.find({
      requesterId: userId,
      status: "Accepted",
    });

    res.json(accepted);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;