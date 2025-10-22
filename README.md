# Capstone-B05: Affectra

## Deskripsi Project
Affectra adalah proyek Capstone tim B05 yang mengembangkan **perangkat EEG wearable dual-channel berbasis AD620** untuk membantu pengguna memantau dan memahami emosi mereka. Sistem ini menggunakan elektroda yang dipasang di kepala untuk merekam aktivitas listrik otak dan dilengkapi dengan kamera untuk mendokumentasikan situasi di sekitar pengguna. Data EEG kemudian dianalisis menggunakan algoritma kecerdasan buatan untuk mengenali dan mengklasifikasikan emosi, yang ditampilkan melalui dashboard web interaktif.

## Latar Belakang
Penggunaan teknologi dalam kesehatan mental sering menimbulkan kekhawatiran, seperti risiko depersonalisasi atau salah penggunaan dalam terapi. Namun, alat EEG yang dikembangkan dalam proyek ini **tidak dimaksudkan untuk menggantikan peran terapis atau mendiagnosis penyakit mental**, melainkan sebagai **alat bantu self-monitoring berbasis bukti**. Sistem ini mengubah metode tradisional self-monitoring menjadi lebih modern, objektif, dan seamless, sehingga mendukung pengguna dalam memahami emosinya, mengembangkan regulasi diri, dan meningkatkan kesadaran emosional secara berkelanjutan.

## Fitur Utama
- Analisis sinyal EEG secara real-time untuk mendeteksi emosi pengguna
- Visualisasi hasil klasifikasi emosi pada dashboard web
- Pemantauan pemicu emosi melalui fitur virtual tracking dengan kamera
- Penyimpanan riwayat sesi untuk monitoring emosional jangka panjang
- Mendukung proses self-monitoring sebagai bagian dari Cognitive Behavioral Therapy (CBT)

## Teknologi & Arsitektur
### Stack Utama
Kami menggunakan **MERN Stack (MongoDB, Express.js, React.js, Node.js)** karena mendukung pengembangan aplikasi web berbasis data real-time dengan satu bahasa pemrograman: JavaScript.

### Frontend
- **React.js** digunakan untuk membangun UI interaktif dan SPA (Single-Page Application)
- Menyediakan komponen reusable untuk grafik gelombang otak, label emosi, dan riwayat sesi
- Memastikan rendering cepat melalui Virtual DOM

### Backend
- **Node.js + Express.js** menyediakan kerangka kerja efisien untuk REST API dan WebSocket
- Mendukung integrasi skrip Python untuk pemrosesan machine learning
- Memproses data EEG secara real-time melalui message broker **Apache Kafka**

### Database
- **MongoDB** sebagai basis data NoSQL untuk menangani data tidak terstruktur dan kompleks dari EEG
- Mendukung operasi CRUD dengan performa tinggi untuk data sensor yang kontinu

## Algoritma Klasifikasi
- Sistem menggunakan **SVM, XGBoost, dan Random Forest** untuk mengidentifikasi emosi pengguna
- Channel utama EEG: **FP1**
- Data EEG dikirim via **Bluetooth**, diproses secara real-time, dan disimpan untuk pemantauan jangka panjang

## Kesimpulan
Affectra diharapkan menjadi alternatif self-monitoring yang **objektif, aman, efisien, dan berkelanjutan**, membantu pengguna memahami emosinya sebelum berkonsultasi dengan psikolog. Perangkat ini mendukung pengenalan dan regulasi emosi secara real-time, sekaligus menyediakan data historis untuk analisis lebih lanjut.

## Tim Pengembang
- **Shafa Aura Yogadiasa** – Frontend & Integrasi UI/UX
- **Hezekiel Sitepu** – Backend & Database
- **Jhon Samuel K.** – Analisis Data EEG

