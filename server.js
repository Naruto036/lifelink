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

/* ---------------- DB ---------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------------- IMPORTANT ORDER FIX ---------------- */
// 1️⃣ JSON parser FIRST (VERY IMPORTANT)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ CORS SECOND
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

/* ---------------- LOG REQUEST BODY (DEBUG) ---------------- */
app.use((req, res, next) => {
  if (req.method === "POST") {
    console.log("📩 Incoming POST:", req.path);
    console.log("BODY:", req.body);
  }
  next();
});

/* ---------------- ROUTES ---------------- */
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

/* ---------------- SOCKET.IO ---------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
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

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});