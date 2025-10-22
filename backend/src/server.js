import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/notesRoutes.js";
import cors from "cors";

// Inisialisasi konfigurasi environment (.env)
dotenv.config();

// Inisialisasi express app
const app = express();
app.use(cors());    

// Middleware untuk membaca JSON dari request body
app.use(express.json());

// Tes koneksi database
connectDB();

// Routing utama
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

// Jalankan server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server started on PORT: ${PORT}`);
});
