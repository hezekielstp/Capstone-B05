import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================================
   🔹 SEND VERIFICATION EMAIL
================================ */
async function sendVerificationEmail(email, token) {
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
                      Terima kasih sudah mendaftar! Klik tombol di bawah untuk memverifikasi email Anda dan mulai menggunakan Affectra.
                    </p>
    
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
                        Verifikasi Email
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
