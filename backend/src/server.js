import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/notesRoutes.js";
import eegSessionRoutes from "./routes/eegSessionRoutes.js";
import cameraCaptureRoutes from "./routes/cameraCaptureRoutes.js";
import validateCaptureRoutes from "./routes/validateCaptureRoutes.js";
import remoteControlRoutes from "./routes/remoteControlRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inisialisasi konfigurasi environment (.env)
dotenv.config();

// Inisialisasi express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set("io", io);

app.use(cors());    

// Serve static files from uploads directory (for camera captures)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ESP32 camera upload route - MUST come before express.json() middleware
// Uses express.raw() to accept binary JPEG data
app.use("/api/camera", express.raw({ type: "image/jpeg", limit: "10mb" }), cameraCaptureRoutes);

// Middleware untuk membaca JSON dari request body
app.use(express.json());

app.use("/api/captures", cameraCaptureRoutes);
app.use("/api/captures/validate", validateCaptureRoutes);


// Tes koneksi database
connectDB();

// Routing utama
app.use("/api/sessions", eegSessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/remote", remoteControlRoutes); // Public remote control (no auth)

// Socket.IO for remote control
io.on("connection", (socket) => {
  console.log("🎮 Remote controller connected:", socket.id);

  socket.on("manual-emotion", (data) => {
    console.log("📡 Broadcasting manual emotion:", data);
    io.emit("emotion-override", data);
  });

  socket.on("disconnect", () => {
    console.log("🎮 Remote controller disconnected:", socket.id);
  });
});

// Jalankan server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`✅ Server started on PORT: ${PORT}`);
  console.log(`ℹ️  Inference runs on-demand only (via POST /api/sessions/inference)`);
  console.log(`🎮 Socket.IO remote control enabled`);
});
