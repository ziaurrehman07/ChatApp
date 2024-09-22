const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const server = http.createServer(app);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed:", error));

// Message schema
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  time: String
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// Setup socket.io with CORS
const io = socketIo(server, { cors: { origin: process.env.CORS_ORIGIN, methods: ["GET", "POST"] } });

app.use(cors({
  origin: process.env.CORS_ORIGIN 
}));
app.use(express.json());

// Socket.io logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Load previous messages when a user joins
  socket.on('join-chat', async () => {
    try {
      const messages = await Message.find().sort({ createdAt: 1 }).limit(100); // Get last 100 messages
      socket.emit('load-messages', messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  });

  // Handle sending of messages
  socket.on("send-message", async (message) => {
    try {
      const newMessage = new Message({
        user: message.user,
        message: message.message,
        time: message.time,
      });
      await newMessage.save(); // Save message in MongoDB
      io.emit("recieved-message", message); // Broadcast to all clients
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Server setup
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
