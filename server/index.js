const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const serviceRoutes = require("./routes/service.routes");
const jobRoutes = require("./routes/job.routes");
const messageRoutes = require("./routes/message.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");

dotenv.config({ path: path.resolve(__dirname, ".env") });
connectDB();

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL;
const devAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", clientUrl].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (isProduction) {
      return callback(origin === clientUrl ? null : new Error("Not allowed by CORS"), origin === clientUrl);
    }

    return callback(devAllowedOrigins.includes(origin) ? null : new Error("Not allowed by CORS"), devAllowedOrigins.includes(origin));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId.toString(), socket.id);
  }

  socket.on("sendMessage", (payload) => {
    const receiverId = payload?.receiverId;
    if (!receiverId) {
      return;
    }

    const receiverSocketId = onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", payload);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId.toString());
    }
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "ServiceHire API is running" });
});

if (isProduction) {
  const clientDistPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
