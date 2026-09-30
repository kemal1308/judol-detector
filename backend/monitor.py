import time
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Video, CommentLog, ActionType
from .youtube import get_youtube_client, fetch_latest_comments, delete_comment
import sys
import os
import re
import unicodedata

# Tambahkan parent path agar bisa import dari folder model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from model.predict_indobert import predict_judol_indobert as predict_judol

def create_keyword_pattern(keyword: str):
    kw = unicodedata.normalize('NFKC', keyword).lower()
    kw = re.sub(r'[^a-z0-9]', '', kw)
    if not kw:
        return re.compile(r'^$')
        
    leet_map = {
        'a': '[a4@]',
        'b': '[b8]',
        'e': '[e3]',
        'g': '[g9]',
        'i': '[i1!l]',
        'l': '[l1!i]',
        'o': '[o0]',
        's': '[s5$]',
        't': '[t7]'
    }
    parts = [leet_map.get(c, re.escape(c)) for c in kw]
    # Allow spaces and symbols between characters
    regex_str = r'[\W_]*'.join(parts)
    return re.compile(regex_str, re.IGNORECASE)

def check_video_comments(db: Session, video: Video):
    if not video.user or not video.user.oauth_token:
        return
    
    youtube = get_youtube_client(video.user.oauth_token)
    comments = fetch_latest_comments(youtube, video.video_id)
    
    custom_keywords = [k.keyword for k in video.user.custom_keywords]
    kw_patterns = [create_keyword_pattern(kw) for kw in custom_keywords if kw.strip()]
    
    for item in comments:
        top_comment = item['snippet']['topLevelComment']
        comment_id = top_comment['id']
        text = top_comment['snippet']['textOriginal']
        author = top_comment['snippet']['authorDisplayName']
        
        # Cek apakah komentar sudah pernah diproses di DB
        existing = db.query(CommentLog).filter(
            CommentLog.video_id == video.id,
            CommentLog.author == author,
            CommentLog.comment_text == text
        ).first()
        
        if existing:
            continue # Lewati jika sudah diproses
            
        text_norm = unicodedata.normalize('NFKC', text)
        is_custom_blacklisted = False
        alasan_custom = ""
        
        for kw_str, pattern in zip(custom_keywords, kw_patterns):
            if pattern.search(text_norm):
                is_custom_blacklisted = True
                alasan_custom = f"Custom Keyword: {kw_str}"
                break
                
        action = ActionType.aman
        alasan = ""
        confidence = 0.0
        
        if is_custom_blacklisted:
            success = delete_comment(youtube, comment_id)
            if success:
                action = ActionType.hapus
            alasan = alasan_custom
            confidence = 100.0
        else:
            prediction = predict_judol(text)
            if prediction['is_judi']:
                # Jika terdeteksi judi, hapus komentarnya
                success = delete_comment(youtube, comment_id)
                if success:
                    action = ActionType.hapus
            alasan = prediction['alasan']
            confidence = prediction['confidence']
        
        # Catat ke log
        log = CommentLog(
            video_id=video.id,
            comment_text=text,
            author=author,
            action=action,
            alasan=alasan,
            confidence=confidence
        )
        db.add(log)
    db.commit()

def run_monitoring_cycle():
    print("Mulai siklus monitoring otomatis...")
    db = SessionLocal()
    try:
        # Ambil semua video yang status monitoring-nya aktif
        videos = db.query(Video).filter(Video.is_active == True).all()
        for video in videos:
            check_video_comments(db, video)
    except Exception as e:
        print(f"Error dalam monitoring: {e}")
    finally:
        db.close()
    print("Siklus monitoring selesai.")
