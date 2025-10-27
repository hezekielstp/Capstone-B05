import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // ✅ tambahan baru untuk kirim email

/* ================================
   🔹 GET ALL NOTES (dummy sementara)
================================ */
export async function getAllNotes(req, res) {
  try {
    const notes = []; // nanti b isa isi logic ambil dari DB
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
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email atau nomor HP sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
    });

    await user.save();

    // ✅ BUAT TOKEN OTOMATIS
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "rahasia", {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token, // ✅ kirim token ke frontend
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

/* ================================
   🔹 FORGOT PASSWORD (Kirim Email Sungguhan)
================================ */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    // 🔸 Cek user di DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar." });
    }

    // 🔹 Buat token reset (expired 15 menit)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "rahasia",
      { expiresIn: "15m" }
    );

    // 🔹 Buat tautan reset password
    const resetLink = `http://localhost:3000/resetpassword?token=${resetToken}`;

    // 🔹 Setup transporter email (pakai Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // alamat Gmail kamu
        pass: process.env.EMAIL_PASS, // App Password dari Google
      },
    });

    // 🔹 Kirim email ke user
    await transporter.sendMail({
      from: `"Affectra Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password Affectra",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2>Halo ${user.name || ""},</h2>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Affectra kamu.</p>
          <p>Silakan klik tautan di bawah ini untuk melanjutkan:</p>
          <a href="${resetLink}" style="display:inline-block;background:#2D3570;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Kata Sandi</a>
          <p>Atau salin tautan ini ke browser kamu:</p>
          <p>${resetLink}</p>
          <br/>
          <p><i>Tautan ini akan kadaluarsa dalam 15 menit.</i></p>
          <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    console.log(`📧 Email reset password terkirim ke: ${email}`);

    return res
      .status(200)
      .json({ message: "Tautan reset kata sandi telah dikirim ke email Anda!" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengirim email reset password." });
  }
}
