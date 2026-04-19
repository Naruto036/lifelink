import express from "express";
import Request from "./Request.js";
import Donor from "./Donor.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ✅ Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ SEND REQUEST + EMAIL
router.post("/send", async (req, res) => {
  try {
    const { donorId, requesterId, requesterName, bloodGroup } = req.body;

    console.log("📩 Incoming request:", req.body);

    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    console.log("👤 Donor found:", donor.name);
    console.log("📧 Donor email:", donor.email);

    // ❌ IMPORTANT FIX: Check email exists
    if (!donor.email) {
      return res.status(400).json({
        message: "Donor does not have an email address",
      });
    }

    // ✅ Save request
    const request = new Request({
      donorId,
      requesterId,
      status: "Pending",
    });

    await request.save();

    const BASE_URL = "https://lifelink-4.onrender.com";

    // ✅ SEND EMAIL
    const info = await transporter.sendMail({
      from: `"LifeLink 🩸" <${process.env.EMAIL_USER}>`,
      to: donor.email,
      subject: "🩸 Blood Request - Action Needed",
      html: `
        <h2>Blood Request</h2>
        <p>Hello ${donor.name},</p>
        <p><b>${requesterName || "Someone"}</b> needs blood.</p>
        <p>Blood Group: <b>${bloodGroup || donor.bloodGroup}</b></p>

        <br/>

        <a href="${BASE_URL}/requests/action/${request._id}/accept"
           style="background:green;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;">
           ✅ Accept
        </a>

        <br/><br/>

        <a href="${BASE_URL}/requests/action/${request._id}/reject"
           style="background:red;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;">
           ❌ Reject
        </a>

        <br/><br/>
        <p>Thank you for being a lifesaver ❤️</p>
      `,
    });

    console.log("✅ Email sent:", info.response);

    res.status(201).json({
      message: "Request sent & email delivered ✅",
      request,
    });

  } catch (err) {
    console.error("❌ Email/Request Error:", err);

    res.status(500).json({
      error: "Failed to send request or email",
      details: err.message,
    });
  }
});


// ✅ ACCEPT / REJECT FROM EMAIL
router.get("/action/:id/:type", async (req, res) => {
  try {
    const { id, type } = req.params;

    const status = type === "accept" ? "Accepted" : "Rejected";

    const request = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("donorId");

    if (!request) {
      return res.send("Request not found");
    }

    if (status === "Accepted") {
      return res.send(`
        <h2>✅ Request Accepted</h2>
        <p>The requester will contact you soon.</p>
      `);
    } else {
      return res.send(`
        <h2>❌ Request Rejected</h2>
      `);
    }

  } catch (err) {
    console.error("❌ Action Error:", err);
    res.send("Error processing request");
  }
});


// ✅ GET REQUESTS
router.get("/donor/:donorId", async (req, res) => {
  try {
    const requests = await Request.find({
      donorId: req.params.donorId,
    }).populate("donorId");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE STATUS
router.put("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;