# Judol Detector

Judol Detector adalah platform SaaS berbasis web yang dirancang khusus untuk membantu YouTuber Indonesia melindungi channel mereka dari serangan komentar spam judi online (judol) secara otomatis menggunakan Machine Learning. 

Komentar spam sering kali menggunakan teknik penyamaran (unicode font, leetspeak, dll). Aplikasi ini menggunakan sistem deteksi 5 lapis (termasuk model Machine Learning) dengan akurasi tinggi untuk mendeteksi dan menghapus komentar tersebut 24/7 tanpa intervensi manual.

## Fitur Utama

- **Login YouTube OAuth**: Masuk dengan aman menggunakan akun Google/YouTube Anda.
- **Auto Monitoring**: Sistem mengecek komentar baru pada video yang didaftarkan secara berkala.
- **Auto Hapus (Moderasi Otomatis)**: Komentar yang terdeteksi sebagai spam judi online akan otomatis dihapus melalui YouTube API.
- **Sistem Deteksi 5 Lapis**: Mendeteksi keyword pasti, kombinasi frasa, pola nama situs, hingga deteksi cerdas menggunakan model ML (Random Forest & IndoBERT).
- **Dashboard Interaktif**: Antarmuka React yang modern untuk melihat statistik, mengelola video, dan melihat riwayat komentar yang dihapus.
- **Tahan Teknik Penyamaran**: Mampu menormalisasi dan mendeteksi teks dengan *unicode font* (contoh: 𝒔𝒍𝒐𝒕), *leetspeak* (g4c0r), dan simbol pengganti huruf.

## Teknologi yang Digunakan

**Backend:**
- Python 3 & FastAPI
- PostgreSQL & SQLAlchemy (Database & ORM)
- APScheduler (Background Job Monitoring)
- OAuth 2.0 Google (Autentikasi)

**Frontend:**
- React (Vite)
- Tailwind CSS
- Chart.js (Visualisasi Statistik)

**Machine Learning:**
- Scikit-Learn (Random Forest & TF-IDF)
- IndoBERT (HuggingFace Transformers)
- Sastrawi & Regex (Preprocessing Teks)

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
Pastikan sistem Anda telah menginstal:
- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL**

### 2. Kloning Repository
```bash
git clone https://github.com/kemal1308/judol-detector.git
cd judol-detector
```

### 3. Setup Backend (Python)
Buka terminal dan jalankan perintah berikut:
```bash
# Buat virtual environment
python -m venv venv
# Untuk Windows:
venv\Scripts\activate
# Untuk Mac/Linux:
# source venv/bin/activate

# Install dependensi backend & ML
pip install -r requirements.txt
```

### 4. Konfigurasi Environment Variables
Aplikasi membutuhkan konfigurasi *environment* untuk koneksi Database dan kredensial Google OAuth.
1. Salin file contoh `.env.example` menjadi `.env`.
   ```bash
   cp .env.example .env
   ```
2. Buka `.env` dan isi kredensial yang diperlukan:
   - `DATABASE_URL`: URL koneksi PostgreSQL Anda.
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Kredensial dari Google Cloud Console (pastikan Anda telah mengaktifkan **YouTube Data API v3**).
   - `SECRET_KEY`: Kunci rahasia untuk enkripsi token/sesi.

3. *Catatan*: File OAuth tambahan seperti `client_secrets.json` dan `token.pickle` akan dihasilkan/digunakan saat proses autentikasi Google berlangsung.

### 5. Setup Database
Pastikan server PostgreSQL Anda berjalan dan database yang ditulis di `DATABASE_URL` sudah dibuat. Anda bisa menggunakan file `schema.sql` untuk membuat tabel-tabel yang diperlukan:
```bash
psql -U username_anda -d nama_database -f schema.sql
```

### 6. Setup Frontend (React)
Buka tab terminal baru, masuk ke folder frontend, dan instal *packages*:
```bash
cd frontend-react
npm install
```

### 7. Menjalankan Aplikasi
**Menjalankan Backend:**
```bash
# Pastikan environment Python aktif
uvicorn backend.main:app --reload
```
API server backend akan berjalan di `http://localhost:8000`.

**Menjalankan Frontend:**
```bash
cd frontend-react
npm run dev
```
Aplikasi web bisa diakses melalui browser pada alamat `http://localhost:5173`.

## Tentang Model Machine Learning

Karena batasan limit ukuran file di GitHub (maksimal 100MB per file), file model IndoBERT yang ukurannya sangat besar (`model.safetensors` & file zip terkait) **tidak disertakan** di dalam repository ini.

Namun, repository ini menyertakan **Model Baseline (Random Forest & TF-IDF)** (`model_baseline.pkl` dan `tfidf_vectorizer.pkl`) yang berukuran ringan (~9MB). Model ini dapat langsung digunakan dan sudah memiliki akurasi yang cukup tinggi (~95.5%).

Jika Anda ingin menggunakan model IndoBERT untuk performa yang lebih optimal:
1. Anda perlu meletakkan file model IndoBERT Anda (hasil *training*) ke dalam folder `model/`.
2. Anda bisa melakukan *training* ulang sendiri menggunakan jupyter notebooks yang tersedia di folder `notebooks/` menggunakan dataset yang ada di `dataset/`.
3. File *script* `predict_indobert.py` sudah disediakan dan siap dipakai untuk menjalankan inferensi menggunakan model tersebut.

## 📄 Lisensi
Hak Cipta © 2026 - Judol Detector
