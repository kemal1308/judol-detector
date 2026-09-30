-- Extension untuk men-generate UUID otomatis (dibutuhkan di versi PostgreSQL tertentu)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Membuat Custom Tipe ENUM
CREATE TYPE action_type AS ENUM ('hapus', 'aman');

-- ==========================================
-- 1. Tabel Users
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    youtube_channel VARCHAR,
    oauth_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

-- ==========================================
-- 2. Tabel Videos
-- ==========================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR,
    title VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    interval_menit INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_videos_video_id ON videos(video_id);

-- ==========================================
-- 3. Tabel Comment Logs
-- ==========================================
CREATE TABLE comment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    comment_text TEXT,
    author VARCHAR,
    action action_type,
    alasan VARCHAR,
    confidence FLOAT,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

