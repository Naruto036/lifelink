import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
})

app.use(cors());
app.use(express.json());
app.use("/api/donors", donorRoutes);
app.use("/requests",requestRoutes);
app.get("/", (req, res) => {
  res.send("LifeLink Backend Running 🚀");
  app.use(cors({
    origin:"https://lifelink-pw8s.vercel.app"
    
}));
}
);
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "Email working ✅"
    });

    res.send("Email sent successfully");
  } catch (err) {
    console.log(err);
    res.send("Email failed");
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to:", process.env.MONGO_URI))
  .catch(err => console.log(err));
let users = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

io.on("connection", (socket) => {

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));