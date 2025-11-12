import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================================
   🔹 SEND VERIFICATION EMAIL
================================ */
async function sendVerificationEmail(email, token) {
  const verifyURL = `http://localhost:5001/api/users/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Affectra Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifikasi Email Affectra",
    html: `
      <div style="font-family:Arial; line-height:1.6;">
        <h2>Verifikasi Email Anda</h2>
        <p>Klik tombol di bawah ini untuk verifikasi email Anda:</p>
        <a href="${verifyURL}" 
           style="padding:10px 20px;background:#2D3570;color:white;text-decoration:none;border-radius:8px;">
           Verifikasi Email
        </a>
        <p>Atau salin link berikut ke browser:</p>
        <p>${verifyURL}</p>
      </div>
    `,
  });

  console.log(`📧 Email verifikasi terkirim ke: ${email}`);
}

/* ================================
   🔹 GET ALL NOTES (dummy)
================================ */
export async function getAllNotes(req, res) {
  try {
    const notes = [];
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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // kirim ulang email verifikasi
        const verificationToken = crypto.randomBytes(32).toString("hex");
        existingUser.verificationToken = verificationToken;
        await existingUser.save();

        await sendVerificationEmail(email, verificationToken);

        return res.status(200).json({
          message: "Akun sudah terdaftar namun belum diverifikasi. Email verifikasi baru telah dikirim."
        });
      }

      return res.status(400).json({ message: "Email sudah terdaftar dan terverifikasi" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    await user.save();

    // ✅ Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Registrasi berhasil! Silakan cek email untuk verifikasi.",
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

/* ================================
   🔹 VERIFIKASI EMAIL
================================ */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token tidak ditemukan" });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Email berhasil diverifikasi!" });

  } catch (error) {
    console.error("❌ Verify email error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

/* ================================
   🔹 LOGIN USER
================================ */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // ✅ Cegah user login jika belum verifikasi
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email belum diverifikasi!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Password salah" });
    }

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
   🔹 GET CURRENT USER
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
   🔹 FORGOT PASSWORD
================================ */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar." });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "rahasia",
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/resetpassword?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Affectra Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password Affectra",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2>Halo ${user.name || ""},</h2>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Affectra kamu.</p>
          <p>Silakan klik tautan di bawah ini:</p>
          <a href="${resetLink}" style="display:inline-block;background:#2D3570;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Reset Kata Sandi
          </a>
          <p>Link: ${resetLink}</p>
          <br/>
          <p><i>Link berlaku 15 menit.</i></p>
        </div>
      `,
    });

    console.log(`📧 Email reset password terkirim ke: ${email}`);

    return res.status(200).json({ message: "Tautan reset kata sandi telah dikirim ke email Anda!" });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ message: "Gagal mengirim email reset password." });
  }
}
