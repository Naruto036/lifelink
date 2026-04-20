import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: [
      "https://lifelink-ahxd.vercel.app",
      "https://lifelink-pw8s.vercel.app",
      "https://lifelink-n3qn.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ---------------- MIDDLEWARE ----------------
app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("LifeLink Backend Running 🚀");
});

// ---------------- MONGODB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});