const express = require("express");
const { connectDB, mongoose } = require('./config/db');
const cors = require("cors");
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/votes");
const socketio = require("socket.io");
const readline = require("readline");
require("dotenv").config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server (use let so we can reassign on “rs”)
let server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startConsoleInterface();
});

// Initialize Socket.IO (use let so we can reassign on “rs”)
let io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/votes", voteRoutes);

// Socket.IO events
function bindIoEvents(socketServer) {
  socketServer.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
bindIoEvents(io);

// Console interface for rs command
function startConsoleInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (input) => {
    if (input.trim().toLowerCase() === "rs") {
      console.log("Restarting server...");

      // Close existing connections
      await mongoose.disconnect();
      server.close(async () => {
        // Reconnect to database
        await connectDB();

        // Reinitialize HTTP server
        const newServer = app.listen(PORT, () => {
          console.log(`Server restarted on port ${PORT}`);
        });

        // Reinitialize Socket.IO
        const newIo = socketio(newServer, {
          cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
          },
        });

        // Update references
        server = newServer;
        io = newIo;

        // Rebind events
        bindIoEvents(newIo);
      });
    }
  });
}

module.exports = { app, server, io };
