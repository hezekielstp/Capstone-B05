# Status Fitur Affectra

Dokumen ini menjelaskan status implementasi semua fitur dalam aplikasi **Affectra** - sistem pemantauan emosi berbasis EEG wearable dual-channel.

**Terakhir diperbarui:** November 2025

---

## 📊 Ringkasan Status

| Kategori | Total Fitur | ✅ Berfungsi Penuh | 🟡 Sebagian | ❌ Belum Berfungsi |
|----------|-------------|-------------------|-------------|-------------------|
| Autentikasi & User | 6 | 6 | 0 | 0 |
| Sesi EEG | 4 | 3 | 1 | 0 |
| Catatan (Notes) | 3 | 3 | 0 | 0 |
| Kamera & Pemicu Emosi | 6 | 6 | 0 | 0 |
| Frontend Dashboard | 6 | 6 | 0 | 0 |
| **TOTAL** | **25** | **24** | **1** | **0** |

---

## 1. 🔐 Autentikasi & Manajemen User

### ✅ Fitur yang Berfungsi Penuh

#### 1.1 Registrasi User
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/users/register`
- **Implementasi:**
  - Validasi email format dan nomor telepon (10-15 digit)
  - Hashing password dengan bcryptjs
  - Generasi token verifikasi unik
  - Pengiriman email verifikasi otomatis
  - Pengecekan duplikasi email dan nomor telepon
  - Dukungan pengiriman ulang email untuk akun belum terverifikasi
- **File:** `backend/src/controllers/userController.js`
- **Model:** `backend/src/models/user.model.js`

#### 1.2 Verifikasi Email
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/users/verify?token={token}`
- **Implementasi:**
  - Verifikasi token unik dari email
  - Update status `isVerified` menjadi `true`
  - Penghapusan token setelah verifikasi sukses
  - Template email HTML dengan branding Affectra
- **File:** `backend/src/controllers/userController.js`
- **Frontend:** `frontend/src/app/verify-email/page.js`

#### 1.3 Login
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/users/login`
- **Implementasi:**
  - Validasi email dan password
  - Pengecekan status verifikasi email
  - Generasi JWT token (expire 1 hari)
  - Return user data (id, name, email, phoneNumber)
- **File:** `backend/src/controllers/userController.js`
- **Frontend:** `frontend/src/app/login/page.js`

#### 1.4 Forgot Password
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/users/forgot-password`
- **Implementasi:**
  - Validasi email terdaftar
  - Generasi reset token JWT (expire 15 menit)
  - Pengiriman email dengan link reset password
  - Template email HTML profesional
- **File:** `backend/src/controllers/userController.js`
- **Frontend:** `frontend/src/app/forgotpassword/page.js`

#### 1.5 Reset Password
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/users/reset-password`
- **Implementasi:**
  - Verifikasi reset token
  - Validasi password baru
  - Hashing password baru
  - Update password di database
- **File:** `backend/src/controllers/userController.js`
- **Frontend:** `frontend/src/app/reset-password/page.js`

#### 1.6 Get Current User
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/users/me`
- **Implementasi:**
  - Ekstraksi user dari JWT token
  - Return data user tanpa password hash
  - Proteksi dengan authorization header
- **File:** `backend/src/controllers/userController.js`

---

## 2. 🧠 Sesi EEG & Klasifikasi Emosi

### ✅ Fitur yang Berfungsi Penuh

#### 2.1 Get All Sessions
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/sessions`
- **Implementasi:**
  - Ambil semua sesi milik user yang login
  - Sorting berdasarkan createdAt (descending)
  - Proteksi dengan JWT token
- **File:** `backend/src/controllers/eegSessionController.js`
- **Model:** `backend/src/models/eegSession.model.js`

#### 2.2 Create Session Manual
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/sessions`
- **Implementasi:**
  - Buat sesi baru dengan mood (Positif/Netral/Negatif)
  - Optional photo path
  - Link ke user ID dari token
- **File:** `backend/src/controllers/eegSessionController.js`

#### 2.3 Update Session Note
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `PATCH /api/sessions/:id`
- **Implementasi:**
  - Update catatan pada sesi tertentu
  - Validasi ownership (user hanya bisa update sesinya sendiri)
  - Return updated session
- **File:** `backend/src/controllers/eegSessionController.js`

### 🟡 Fitur yang Sebagian Berfungsi

#### 2.4 Real-time EEG Inference
- **Status:** 🟡 Sebagian Berfungsi
- **Endpoint:** `POST /api/sessions/inference`
- **Implementasi yang Ada:**
  - Spawn Python script untuk inference
  - Model XGBoost untuk klasifikasi emosi (3 kelas: Negatif, Netral, Positif)
  - Feature extraction dari sinyal EEG
  - Simulasi sinyal EEG dual-channel
  - Penyimpanan hasil ke MongoDB
  - Probabilitas untuk setiap kelas emosi
- **File:** 
  - `backend/src/controllers/eegSessionController.js`
  - `backend/inference/inference.py`
  - `backend/inference/feature_extraction.py`
  - `backend/inference/simulation.py`
  - `backend/inference/model/final_model.pkl`
- **Yang Belum Lengkap:**
  - ❌ Integrasi dengan hardware EEG device (ESP32) secara real-time
  - ❌ Komunikasi Bluetooth dengan device fisik
  - ❌ Penerimaan data EEG streaming dari sensor FP1
  - ⚠️ Saat ini menggunakan simulasi data EEG, bukan data real dari device
- **Catatan:** 
  - Backend sudah siap menerima dan memproses data EEG
  - Model ML sudah trained dan berfungsi
  - Yang dibutuhkan: integrasi hardware-software untuk data acquisition real-time

---

## 3. 📝 Catatan (Notes)

### ✅ Fitur yang Berfungsi Penuh

#### 3.1 Create Note
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/notes`
- **Implementasi:**
  - Buat catatan baru untuk user
  - Support 2 tipe: "session" (terkait sesi EEG) atau "general"
  - Validasi konten tidak kosong
  - Link ke sessionId (optional)
- **File:** `backend/src/controllers/noteController.js`
- **Model:** `backend/src/models/note.model.js`
- **Frontend:** `frontend/src/app/dashboard/components/catatanaanda.js`

#### 3.2 Get All Notes
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/notes`
- **Implementasi:**
  - Ambil semua catatan user
  - Populate data session terkait
  - Sorting berdasarkan createdAt (descending)
- **File:** `backend/src/controllers/noteController.js`
- **Frontend:** `frontend/src/app/dashboard/components/catatanaanda.js`

#### 3.3 Delete Note
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `DELETE /api/notes/:id`
- **Implementasi:**
  - Hapus catatan berdasarkan ID
  - Validasi ownership (user hanya bisa hapus catatannya sendiri)
- **File:** `backend/src/controllers/noteController.js`

---

## 4. 📷 Kamera & Virtual Tracking Pemicu Emosi

### ✅ Fitur yang Berfungsi Penuh

#### 4.1 Create Camera Capture
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/captures`
- **Implementasi:**
  - Simpan record foto kamera dengan metadata
  - Auto-increment captureId (sequential numbering)
  - Link ke sessionId
  - Timestamp dan imageUrl wajib
  - Optional context note
- **File:** `backend/src/controllers/cameraCaptureController.js`
- **Model:** `backend/src/models/cameraCapture.model.js`

#### 4.2 Get All Captures
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/captures`
- **Implementasi:**
  - Ambil semua capture records
  - Sorting berdasarkan captureId ascending
- **File:** `backend/src/controllers/cameraCaptureController.js`

#### 4.3 Get Capture by ID
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/captures/:captureId`
- **Implementasi:**
  - Ambil capture berdasarkan sequential ID
  - Return single capture dengan metadata lengkap
- **File:** `backend/src/controllers/cameraCaptureController.js`

#### 4.4 Get Captures by Session
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `GET /api/captures/session/:sessionId`
- **Implementasi:**
  - Ambil semua captures untuk sesi tertentu
  - Sorting berdasarkan captureId
- **File:** `backend/src/controllers/cameraCaptureController.js`

#### 4.5 Delete Capture
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `DELETE /api/captures/:captureId`
- **Implementasi:**
  - Hapus capture berdasarkan ID
  - Return deleted record
- **File:** `backend/src/controllers/cameraCaptureController.js`

#### 4.6 Camera Capture Validation
- **Status:** ✅ Berfungsi Penuh
- **Endpoint:** `POST /api/captures/validate`
- **Implementasi:**
  - Validasi metadata sebelum upload foto
  - Cek sessionId valid (session exist di database)
  - Cek duplicate timestamp
  - Return valid true/false dengan reason
- **File:** 
  - `backend/src/routes/validateCaptureRoutes.js`
  - `backend/src/controllers/validateCaptureController.js`

---

## 5. 🖥️ Frontend Dashboard

### ✅ Fitur yang Berfungsi Penuh

#### 5.1 Landing Page
- **Status:** ✅ Berfungsi Penuh
- **File:** `frontend/src/app/landing/page.js`
- **Implementasi:**
  - Halaman utama aplikasi
  - Informasi tentang Affectra
  - Navigation ke login/register

#### 5.2 Dashboard Utama
- **Status:** ✅ Berfungsi Penuh
- **File:** `frontend/src/app/dashboard/page.js`
- **Implementasi:**
  - Sidebar navigasi
  - Komponen-komponen dashboard:
    - **Emosi Terakhir** (`emositerakhir.js`) - Menampilkan hasil klasifikasi emosi terbaru
    - **Rekap Emosi** (`rekapemosi.js`) - Statistik dan visualisasi emosi dari semua sesi
    - **Riwayat Sesi** (`riwayatsesi.js`) - List semua sesi EEG dengan detail
    - **Catatan Anda** (`catatanaanda.js`) - CRUD catatan user
    - **Rekam Foto** (`rekamfoto.js`) - Interface untuk camera capture
  - Protected route dengan authentication
- **Components:**
  - `frontend/src/app/dashboard/components/sidebar.js`
  - `frontend/src/app/dashboard/components/logout.js`
  - `frontend/src/app/dashboard/components/riwayatsesiitem.js`

#### 5.3 Detail Riwayat Sesi
- **Status:** ✅ Berfungsi Penuh
- **File:** `frontend/src/app/dashboard/riwayatdetail/page.js`
- **Implementasi:**
  - Header dengan info sesi (`HeaderSection.js`)
  - Summary statistik (`SummarySection.js`)
  - Records detail (`RecordsSection.js`)
  - Visualisasi data EEG dan emosi

#### 5.4 Form Login
- **Status:** ✅ Berfungsi Penuh
- **File:** `frontend/src/app/login/page.js`
- **Implementasi:**
  - Left section dengan branding (`LoginLeftSection.js`)
  - Right section dengan form (`LoginRightSection.js`)
  - Loading overlay (`LoadingOverlay.js`)
  - Validasi input dan error handling
  - Redirect setelah login sukses

#### 5.5 Form Register
- **Status:** ✅ Berfungsi Penuh
- **File:** `frontend/src/app/register/page.js`
- **Implementasi:**
  - Left section dengan branding (`RegisterLeftSection.js`)
  - Right section dengan form (`RegisterRightSection.js`)
  - Loading overlay (`LoadingOverlay.js`)
  - Validasi lengkap (email, phone, password)
  - Konfirmasi registrasi dan redirect ke email verification

#### 5.6 Forgot/Reset Password Pages
- **Status:** ✅ Berfungsi Penuh
- **Files:** 
  - `frontend/src/app/forgotpassword/page.js`
  - `frontend/src/app/reset-password/page.js`
- **Implementasi:**
  - Form request reset password
  - Form reset password dengan token
  - Validasi token expired
  - Success/error messages

---

## 6. 🗄️ Database & Models

### ✅ Model yang Sudah Lengkap

#### 6.1 User Model
- **File:** `backend/src/models/user.model.js`
- **Fields:** name, email, phoneNumber, passwordHash, birthDate, gender, isVerified, verificationToken
- **Methods:** comparePassword()
- **Status:** ✅ Fully Implemented

#### 6.2 EEG Session Model
- **File:** `backend/src/models/eegSession.model.js`
- **Fields:** userId, mood, probabilities, note, photoPath, timestamps
- **Status:** ✅ Fully Implemented

#### 6.3 Note Model
- **File:** `backend/src/models/note.model.js`
- **Fields:** sessionId, userId, noteContent, noteType, timestamps
- **Status:** ✅ Fully Implemented

#### 6.4 Camera Capture Model
- **File:** `backend/src/models/cameraCapture.model.js`
- **Fields:** captureId (auto-increment), sessionId, timestamp, imageUrl, contextNote
- **Status:** ✅ Fully Implemented

#### 6.5 EEG Data Model
- **File:** `backend/src/models/eegData.model.js`
- **Fields:** sessionId, timestamp, rawSignal, filteredSignal
- **Status:** ✅ Model Defined
- **Catatan:** Model sudah ada tapi belum digunakan intensif dalam controller

#### 6.6 Emotion Label Model
- **File:** `backend/src/models/emotionLabel.model.js`
- **Fields:** eegDataId, emotionCategory, confidenceScore, timestamp
- **Status:** ✅ Model Defined
- **Catatan:** Model sudah ada tapi belum digunakan intensif dalam controller

---

## 7. 🔒 Security & Middleware

### ✅ Fitur Security yang Berfungsi

#### 7.1 JWT Authentication Middleware
- **Status:** ✅ Berfungsi Penuh
- **File:** `backend/src/middlewares/authMiddleware.js`
- **Implementasi:**
  - Verifikasi JWT token dari header
  - Ekstraksi userId dan inject ke req object
  - Protected routes untuk semua endpoint private

#### 7.2 Password Security
- **Status:** ✅ Berfungsi Penuh
- **Implementasi:**
  - Bcrypt hashing (cost factor 10)
  - Compare method untuk validasi
  - No plaintext password storage

#### 7.3 CORS Configuration
- **Status:** ✅ Berfungsi Penuh
- **File:** `backend/src/server.js`
- **Implementasi:** CORS enabled untuk frontend communication

---

## 8. 📧 Email Service

### ✅ Email Features

#### 8.1 Email Verification
- **Status:** ✅ Berfungsi Penuh
- **Implementasi:**
  - Nodemailer dengan Gmail SMTP
  - Template HTML profesional dengan branding
  - Token verification system
  - Resend capability

#### 8.2 Password Reset Email
- **Status:** ✅ Berfungsi Penuh
- **Implementasi:**
  - Template HTML dengan link reset
  - JWT token dengan expiry 15 menit
  - Professional design matching brand

---

## 9. 🤖 Machine Learning & Inference

### ✅ ML Components yang Berfungsi

#### 9.1 XGBoost Classification Model
- **Status:** ✅ Trained & Working
- **File:** `backend/inference/model/final_model.pkl`
- **Classes:** Negatif (0), Netral (1), Positif (2)
- **Output:** Prediction label + probabilities array

#### 9.2 Feature Extraction
- **Status:** ✅ Berfungsi Penuh
- **File:** `backend/inference/feature_extraction.py`
- **Implementasi:** Extract features dari raw EEG signals

#### 9.3 EEG Simulation
- **Status:** ✅ Berfungsi (untuk testing)
- **File:** `backend/inference/simulation.py`
- **Implementasi:** Generate realistic EEG data dual-channel untuk testing

---

## 📋 Kesimpulan

### ✅ Kekuatan Sistem
1. **Autentikasi Lengkap** - Sistem auth dengan verifikasi email, reset password, dan JWT
2. **Dashboard Interaktif** - Frontend React dengan Next.js yang responsif dan modern
3. **ML Model Ready** - Model XGBoost sudah trained dan dapat melakukan klasifikasi emosi
4. **Database Well-Structured** - MongoDB dengan models yang jelas dan relasi yang baik
5. **API Comprehensive** - RESTful API dengan dokumentasi yang jelas melalui code
6. **Security Implemented** - Password hashing, JWT tokens, protected routes
7. **Email Notifications** - Professional email templates untuk verifikasi dan reset password

### 🟡 Area yang Perlu Pengembangan
1. **Hardware Integration** - Integrasi dengan ESP32 dan sensor EEG fisik untuk data real-time (sedang dalam tahap implementasi untuk fitur inference)
2. **Bluetooth Communication** - Implementasi komunikasi Bluetooth antara device dan backend untuk streaming data EEG
3. **Real EEG Data Pipeline** - Transisi dari simulasi ke data real dari sensor FP1

### 🎯 Rekomendasi Prioritas
1. **HIGH Priority:** Integrasi hardware EEG device dengan backend untuk data real-time
2. **MEDIUM Priority:** Implementasi komunikasi Bluetooth ESP32 untuk streaming data
3. **LOW Priority:** Optimisasi UI/UX berdasarkan user testing

---

## 📞 Kontak Tim

Untuk informasi lebih lanjut atau laporan bug:
- **Shafa Aura Yogadiasa** – Frontend & Desain UI/UX
- **Hezekiel Sitepu** – Backend & Database
- **Jhon Samuel Kudadiri** – Analisis Data EEG

---

*Dokumen ini akan diperbarui seiring perkembangan proyek.*
