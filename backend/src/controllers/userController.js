import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { startUserInferenceSession } from "../services/inferenceService.js";

/* ================================
   🔹 SEND VERIFICATION EMAIL
================================ */
async function sendVerificationEmail(email, token, verificationCode) {
  const verifyURL = `http://localhost:3000/verify-email?token=${token}`;

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
    subject: "Verifikasi Email • Affectra",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verifikasi Email</title>
      </head>
      <body style="margin:0; padding:0; background-color:#F5F7FB; font-family:Arial, sans-serif;">
    
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:40px 0;">
    
              <table role="presentation" style="width:100%; max-width:480px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    
                <!-- HEADER -->
                <tr>
                  <td align="center" style="background:#2D3570; padding:24px;">
                    <img src="https://i.ibb.co.com/v4Sm80KR/AFFECTRA-LOGO.png" alt="Affectra" style="width:80px; margin-bottom:8px;" />
                    <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">AFFECTRA</h1>
                    <p style="color:#FFD84D; margin:4px 0 0; font-size:14px; font-style:italic;">EEG Based Emotion Tracking</p>
                  </td>
                </tr>
    
                <!-- CONTENT -->
                <tr>
                  <td style="padding:32px; color:#2D3570;">
                    <h2 style="margin:0 0 16px; font-size:22px; font-weight:700;">Verifikasi Email Anda</h2>
                    <p style="margin:0 0 24px; font-size:15px;">
                      Terima kasih sudah mendaftar! Gunakan salah satu cara berikut untuk memverifikasi email Anda:
                    </p>

                    <!-- VERIFICATION CODE BOX -->
                    <div style="background:#F5F7FB; border:2px dashed #2D3570; border-radius:8px; padding:20px; text-align:center; margin-bottom:24px;">
                      <p style="margin:0 0 8px; font-size:14px; color:#666;">Kode Verifikasi Anda:</p>
                      <p style="margin:0; font-size:32px; font-weight:700; letter-spacing:8px; color:#2D3570; font-family:monospace;">
                        ${verificationCode}
                      </p>
                      <p style="margin:8px 0 0; font-size:13px; color:#888;">Masukkan kode ini di halaman verifikasi</p>
                    </div>

                    <p style="text-align:center; margin:0 0 16px; font-size:14px; color:#888;">— ATAU —</p>
    
                    <p style="text-align:center; margin-bottom:32px;">
                      <a href="${verifyURL}" 
                        style="
                          display:inline-block; 
                          background:#2D3570; 
                          color:#ffffff; 
                          padding:14px 28px; 
                          font-size:16px; 
                          border-radius:8px; 
                          text-decoration:none;
                          font-weight:600;
                        ">
                        Klik untuk Verifikasi
                      </a>
                    </p>
    
                    <p style="font-size:14px; color:#444;">
                      Jika tombol tidak berfungsi, salin dan tempel tautan berikut di browser Anda:
                    </p>
                    <p style="font-size:13px; word-break:break-all; color:#555; background:#F1F1F1; padding:10px; border-radius:6px;">
                      ${verifyURL}
                    </p>
                  </td>
                </tr>
    
                <!-- FOOTER -->
                <tr>
                  <td align="center" style="padding:20px; background:#F5F7FB; color:#888; font-size:12px;">
                    Email ini dikirim oleh Affectra.<br/>
                    Jika Anda tidak merasa membuat akun, abaikan email ini.
                    <br/><br/>
                    © ${new Date().getFullYear()} Affectra • All Rights Reserved
                  </td>
                </tr>
    
              </table>
            </td>
          </tr>
        </table>
    
      </body>
      </html>
    `,    
  });

  console.log(`📧 Email verifikasi terkirim ke: ${email}`);
}

/* ================================
   🔹 SEND USER ID EMAIL
================================ */
async function sendUserIdEmail(email, userName, userId) {
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
    subject: "User ID Anda untuk ESP32-CAM • Affectra",
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>User ID Affectra</title>
      </head>
      <body style="margin:0; padding:0; background-color:#F5F7FB; font-family:Arial, sans-serif;">
    
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:40px 0;">
    
              <table role="presentation" style="width:100%; max-width:480px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    
                <!-- HEADER -->
                <tr>
                  <td align="center" style="background:#2D3570; padding:24px;">
                    <img src="https://i.ibb.co.com/v4Sm80KR/AFFECTRA-LOGO.png" alt="Affectra" style="width:80px; margin-bottom:8px;" />
                    <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">AFFECTRA</h1>
                    <p style="color:#FFD84D; margin:4px 0 0; font-size:14px; font-style:italic;">EEG Based Emotion Tracking</p>
                  </td>
                </tr>
    
                <!-- CONTENT -->
                <tr>
                  <td style="padding:32px; color:#2D3570;">
                    <h2 style="margin:0 0 16px; font-size:22px; font-weight:700;">🎯 User ID untuk ESP32-CAM</h2>
                    
                    <p style="margin:0 0 16px; font-size:15px;">
                      Halo <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin:0 0 24px; font-size:15px;">
                      Berikut adalah <strong>User ID</strong> Anda yang diperlukan untuk konfigurasi ESP32-CAM:
                    </p>
    
                    <!-- USER ID BOX -->
                    <div style="background:#F5F7FB; border:2px solid #2D3570; border-radius:8px; padding:20px; margin-bottom:24px; text-align:center;">
                      <p style="margin:0 0 8px; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Your User ID</p>
                      <p style="margin:0; font-size:18px; color:#2D3570; font-family:monospace; font-weight:700; word-break:break-all;">
                        ${userId}
                      </p>
                    </div>
    
                    <div style="background:#FFF9E6; border-left:4px solid #FFD84D; padding:16px; margin-bottom:24px; border-radius:4px;">
                      <p style="margin:0 0 12px; font-size:14px; color:#2D3570; font-weight:600;">📱 Cara Menggunakan:</p>
                      <ol style="margin:0; padding-left:20px; font-size:14px; color:#555; line-height:1.6;">
                        <li>Nyalakan ESP32-CAM Anda</li>
                        <li>Hubungkan ke WiFi <strong>"Affectra-Setup"</strong></li>
                        <li>Buka browser: <strong>http://192.168.4.1</strong></li>
                        <li>Masukkan User ID ini pada form konfigurasi</li>
                        <li>Simpan dan ESP32-CAM siap digunakan!</li>
                      </ol>
                    </div>
    
                    <p style="font-size:13px; color:#777; margin:0;">
                      <strong>💡 Tips:</strong> Simpan User ID ini dengan aman. Anda dapat menyalin langsung dari email ini saat konfigurasi ESP32-CAM.
                    </p>
                  </td>
                </tr>
    
                <!-- FOOTER -->
                <tr>
                  <td align="center" style="padding:20px; background:#F5F7FB; color:#888; font-size:12px;">
                    Email ini dikirim oleh Affectra.<br/>
                    Jangan bagikan User ID Anda kepada siapa pun.
                    <br/><br/>
                    © ${new Date().getFullYear()} Affectra • All Rights Reserved
                  </td>
                </tr>
    
              </table>
            </td>
          </tr>
        </table>
    
      </body>
      </html>
    `,
  });

  console.log(`📧 User ID email terkirim ke: ${email}`);
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
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.verificationToken = verificationToken;
        existingUser.verificationCode = verificationCode;
        await existingUser.save();

        await sendVerificationEmail(email, verificationToken, verificationCode);

        return res.status(200).json({
          message: "Akun sudah terdaftar namun belum diverifikasi. Email verifikasi baru telah dikirim."
        });
      }

      return res.status(400).json({ message: "Email sudah terdaftar dan terverifikasi" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate verification token and 6-digit code
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    const user = new User({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      verificationToken,
      verificationCode,
      isVerified: false,
    });

    await user.save();

    // ✅ Send verification email with both token and code
    await sendVerificationEmail(email, verificationToken, verificationCode);

    // ✅ Send User ID email for ESP32-CAM configuration
    await sendUserIdEmail(email, name, user._id.toString());

    res.status(201).json({
      message: "Registrasi berhasil! Silakan cek email untuk verifikasi dan User ID Anda.",
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
    const { token, code, email } = req.query;

    let user = null;

    // ✅ Support both token and code verification
    if (code && email) {
      // Verify by 6-digit code + email
      user = await User.findOne({ email, verificationCode: code });
      if (!user) {
        return res.status(400).json({ message: "Kode verifikasi tidak valid atau email salah" });
      }
    } else if (token) {
      // Verify by token (original method)
      user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(400).json({ message: "Token tidak valid" });
      }
    } else {
      return res.status(400).json({ message: "Token atau kode verifikasi tidak ditemukan" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationCode = null;
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

    // 🧠 Automatically start inference session after successful login
    try {
      const result = startUserInferenceSession(user._id);
      console.log(`✅ Inference session started for user ${user._id} after login`);
    } catch (err) {
      console.error(`⚠️  Failed to start inference session for user ${user._id}:`, err.message);
      // Don't block login if inference fails
    }

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

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

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
      subject: "Reset Password • Affectra",
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Password</title>
        </head>
      
        <body style="margin:0; padding:0; background-color:#F5F7FB; font-family:Arial, sans-serif;">
      
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:40px 0;">
      
                <table role="presentation" style="width:100%; max-width:480px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      
                  <!-- HEADER -->
                  <tr>

                    <td align="center" style="background:#2D3570; padding:24px;">
                      <img src="https://i.ibb.co.com/v4Sm80KR/AFFECTRA-LOGO.png" alt="Affectra" style="width:80px; margin-bottom:8px;" />
                      <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">AFFECTRA</h1>
                      <p style="color:#FFD84D; margin:4px 0 0; font-size:14px; font-style:italic;">EEG Based Emotion Tracking</p>
                    </td>
                  </tr>
      
                  <!-- CONTENT -->
                  <tr>
                    <td style="padding:32px; color:#2D3570;">
                      <h2 style="margin:0 0 16px; font-size:22px; font-weight:700;">
                        Reset Kata Sandi
                      </h2>
      
                      <p style="margin:0 0 16px; font-size:15px;">
                        Halo <strong>${user.name || ""}</strong>,
                      </p>
      
                      <p style="margin:0 0 24px; font-size:15px;">
                        Kami menerima permintaan untuk mengatur ulang kata sandi akun Affectra kamu.
                        Jika kamu tidak merasa meminta ini, abaikan email ini.
                      </p>
      
                      <p style="text-align:center; margin-bottom:32px;">
                        <a href="${resetLink}" 
                          style="
                            display:inline-block; 
                            background:#2D3570; 
                            color:#ffffff; 
                            padding:14px 28px; 
                            font-size:16px; 
                            border-radius:8px; 
                            text-decoration:none;
                            font-weight:600;
                          ">
                          Reset Password
                        </a>
                      </p>
      
                      <p style="font-size:14px; color:#444;">
                        Jika tombol tidak berfungsi, salin dan tempel tautan berikut di browser Anda:
                      </p>
      
                      <p style="font-size:13px; word-break:break-all; color:#555; background:#F1F1F1; padding:10px; border-radius:6px;">
                        ${resetLink}
                      </p>
      
                      <p style="margin-top:24px; font-size:13px; color:#777;">
                        Tautan ini hanya berlaku selama <strong>15 menit</strong>.
                      </p>
                    </td>
                  </tr>
      
                  <!-- FOOTER -->
                  <tr>
                    <td align="center" style="padding:20px; background:#F5F7FB; color:#888; font-size:12px;">
                      Email ini dikirim oleh Affectra.<br/>
                      Jika kamu tidak merasa membuat permintaan ini, abaikan email ini.
                      <br/><br/>
                      © ${new Date().getFullYear()} Affectra • All Rights Reserved
                    </td>
                  </tr>
      
                </table>
              </td>
            </tr>
          </table>
      
        </body>
        </html>
      `,      
    });

    console.log(`📧 Email reset password terkirim ke: ${email}`);

    return res.status(200).json({ message: "Tautan reset kata sandi telah dikirim ke email Anda!" });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ message: "Gagal mengirim email reset password." });
  }
}

export async function verifyResetToken(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");

    return res.status(200).json({
      message: "Token valid",
      userId: decoded.userId,
    });

  } catch (error) {
    return res.status(400).json({ message: "Token tidak valid / kadaluarsa" });
  }
}


/* ================================
   🔹 RESEND USER ID EMAIL
================================ */
export async function resendUserId(req, res) {
  try {
    const userId = req.userId; // from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Send User ID email
    await sendUserIdEmail(user.email, user.name, user._id.toString());

    return res.status(200).json({ 
      message: "User ID telah dikirim ke email Anda!",
      userId: user._id.toString() // also return in response for immediate use
    });

  } catch (error) {
    console.error("❌ Resend User ID error:", error);
    return res.status(500).json({ message: "Gagal mengirim User ID" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token dan password baru wajib diisi" });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");

    // Cari user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password berhasil direset!" });

  } catch (error) {
    console.error("❌ reset password error:", error);
    return res.status(400).json({ message: "Token tidak valid atau kadaluarsa" });
  }
}
