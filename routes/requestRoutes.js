import express from "express";
import Request from "../models/Request.js";
import Donor from "../models/Donor.js";
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

    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // ✅ Save request
    const request = new Request({
      donorId,
      requesterId,
      status: "Pending",
    });

    await request.save();

    const BASE_URL = "https://lifelink-4.onrender.com";

    // ✅ SEND EMAIL WITH BUTTONS
    await transporter.sendMail({
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

    res.status(201).json({
      message: "Request sent & email delivered ✅",
      request,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
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
    console.error(err);
    res.send("Error processing request");
  }
});

// ✅ GET REQUESTS (WITH DONOR PHONE)
router.get("/donor/:donorId", async (req, res) => {
  try {
    const requests = await Request.find({
      donorId: req.params.donorId,
    }).populate("donorId"); // 🔥 important

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE STATUS (optional manual update)
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