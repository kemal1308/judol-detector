"""
Script satu kali untuk memperbaiki timestamp lama yang tersimpan dalam UTC.
Menambahkan 7 jam (WIB) ke semua record yang waktu-nya masih UTC.
"""
from datetime import timedelta
from backend.database import SessionLocal
from backend.models import CommentLog, User, Video, CustomKeyword

db = SessionLocal()

try:
    # Perbaiki comment_logs
    logs = db.query(CommentLog).all()
    for log in logs:
        if log.deleted_at:
            log.deleted_at = log.deleted_at + timedelta(hours=7)
    
    # Perbaiki users
    users = db.query(User).all()
    for user in users:
        if user.created_at:
            user.created_at = user.created_at + timedelta(hours=7)
    
    # Perbaiki videos
    videos = db.query(Video).all()
    for video in videos:
        if video.created_at:
            video.created_at = video.created_at + timedelta(hours=7)
    
    # Perbaiki custom_keywords
    keywords = db.query(CustomKeyword).all()
    for kw in keywords:
        if kw.created_at:
            kw.created_at = kw.created_at + timedelta(hours=7)
    
    db.commit()
    print(f"Berhasil memperbaiki {len(logs)} log, {len(users)} user, {len(videos)} video, {len(keywords)} keyword.")
    print("Semua timestamp sudah dikonversi ke WIB (UTC+7).")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
