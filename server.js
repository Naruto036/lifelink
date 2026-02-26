import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import donorRoutes from "./routes/donorRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use("/donors", donorRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/bloodDonation")
  .then(() => console.log("MongoDB connected"));

let users = {};

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

server.listen(5000, () => console.log("Server running on 5000"));