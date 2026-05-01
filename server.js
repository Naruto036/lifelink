import dotenv from "dotenv";
dotenv.config();
console.log("EMAIL CHECK:",process.env.EMAIL);
console.log("PASS CHECK:",process.env.EMAIL_PASS?"OK":"MISSING");

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();
const server = http.createServer(app);

// ✅ ALLOWED FRONTENDS
const allowedOrigins = [
  "http://localhost:5173",
  "https://lifelink-liart.vercel.app",
  "https://lifelink-qy8t.vercel.app",
  "https://lifelink-gavd.vercel.app",
];

// ---------------- CORS FIX (IMPORTANT) ----------------
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // allow all (for debugging)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());


// ---------------- ROUTES ----------------
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: "*", // TEMP FIX (important for now)
    methods: ["GET", "POST"],
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("send_request", (data) => {
    const donorSocket = users[data.donorId];
    if (donorSocket) {
      io.to(donorSocket).emit("receive_request", data);
    }
  });

  socket.on("accept_request", (data) => {
    const requesterSocket = users[data.requesterId];
    if (requesterSocket) {
      io.to(requesterSocket).emit("request_accepted", data);
    }
  });
});

// ---------------- DB ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});