import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================================
   🔹 GET ALL NOTES (dummy sementara)
================================ */
export async function getAllNotes(req, res) {
  try {
    const notes = []; // nanti bisa isi logic ambil dari DB
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/* ================================
   🔹 REGISTER USER BARU
================================ */
export async function registerUser(req, res) {
  try {
    const { name, email, password, phoneNumber, birthDate, gender } = req.body;

    // 🔸 Validasi input
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // 🔸 Cek user sudah ada
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email atau nomor HP sudah terdaftar" });
    }

    // 🔸 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔸 Simpan user baru
    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      birthDate,
      gender,
    });

    await user.save();

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

/* ================================
   🔹 LOGIN USER
================================ */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // 🔸 Cek user di DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 🔸 Cek password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Password salah" });
    }

    // 🔸 Buat JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "rahasia",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

/* ================================
   🔹 GET CURRENT USER (pakai token)
================================ */
export async function getCurrentUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Get current user error:", error);
    res.status(401).json({ message: "Token tidak valid" });
  }
}
