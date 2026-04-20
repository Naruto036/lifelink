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

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: [
      "https://lifelink-ahxd.vercel.app",
      "https://lifelink-pw8s.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ---------------- MIDDLEWARE ----------------
app.use(cors({
  origin: [
    "https://lifelink-ahxd.vercel.app",
    "https://lifelink-pw8s.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("LifeLink Backend Running 🚀");
});

// ---------------- MONGODB ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// ---------------- SOCKET USER MAP ----------------
let users = {};

// ---------------- SOCKET EVENTS ----------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
  });

  // Send request (DONOR FLOW)
  socket.on("send_request", (data) => {
    const donorSocket = users[data.donorId];
    if (donorSocket) {
      io.to(donorSocket).emit("receive_request", data);
    }
  });

  // Accept request
  socket.on("accept_request", (data) => {
    const requesterSocket = users[data.requesterId];
    if (requesterSocket) {
      io.to(requesterSocket).emit("request_accepted", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});