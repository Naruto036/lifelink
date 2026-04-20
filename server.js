import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();
const server = http.createServer(app);

// ---------------- CORS (FIXED PROPERLY) ----------------
const allowedOrigins = [
  "https://lifelink-liart.vercel.app",
  "https://lifelink-gavd.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));

app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

// ---------------- SOCKET (IF YOU REMOVED IT, YOU CAN DELETE THIS) ----------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ---------------- HEALTH ----------------
app.get("/", (req, res) => {
  res.send("LifeLink Backend Running 🚀");
});

// ---------------- DB ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});