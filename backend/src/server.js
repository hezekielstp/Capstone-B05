import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/notesRoutes.js";
import eegSessionRoutes from "./routes/eegSessionRoutes.js";
import cameraCaptureRoutes from "./routes/cameraCaptureRoutes.js";
import validateCaptureRoutes from "./routes/validateCaptureRoutes.js";
import esp32CameraRoutes from "./routes/esp32CameraRoutes.js";
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
app.use(cors());    

// ⚠️ IMPORTANT: ESP32 camera route MUST come BEFORE express.json()
// because it needs to handle raw binary data, not JSON
app.use("/api/camera", esp32CameraRoutes);  // ESP32-CAM upload endpoint (raw binary)

// Middleware untuk membaca JSON dari request body
app.use(express.json());

// Serve static files from uploads directory (for accessing camera images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/captures", cameraCaptureRoutes);
app.use("/api/captures/validate", validateCaptureRoutes);


// Tes koneksi database
connectDB();

// Routing utama
app.use("/api/sessions", eegSessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

// Jalankan server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server started on PORT: ${PORT}`);
});
