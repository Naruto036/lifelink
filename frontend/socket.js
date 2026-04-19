import { io } from "socket.io-client";

const socket = io("https://lifelink-4.onrender.com");

export default socket;