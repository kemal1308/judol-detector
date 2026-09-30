from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models import Video, CommentLog, CustomKeyword
from .auth import router as auth_router
from apscheduler.schedulers.background import BackgroundScheduler
from .monitor import run_monitoring_cycle
from pydantic import BaseModel
import os

# Buat tabel otomatis jika belum ada (jika tidak menggunakan psql langsung)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CommentBlocker API")

# Setup CORS untuk Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

# Serve static assets (CSS, JS, images)
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
STATIC_DIR = os.path.join(FRONTEND_DIR, "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Serve halaman HTML frontend
def html_response(filepath: str) -> Response:
    """Serve HTML with no-cache headers to prevent stale browser cache."""
    with open(filepath, 'rb') as f:
        content = f.read()
    return Response(
        content=content,
        media_type='text/html',
        headers={
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        }
    )

@app.get("/", response_class=Response)
def serve_index():
    return html_response(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/dashboard", response_class=Response)
def serve_dashboard():
    return html_response(os.path.join(FRONTEND_DIR, "dashboard.html"))

@app.get("/logs", response_class=Response)
def serve_logs():
    return html_response(os.path.join(FRONTEND_DIR, "logs.html"))

@app.get("/settings", response_class=Response)
def serve_settings():
    return html_response(os.path.join(FRONTEND_DIR, "settings.html"))

from datetime import datetime

@app.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    # Menjalankan monitoring background otomatis setiap 5 menit sesuai PRD
    # (next_run_time=datetime.now() membuatnya langsung jalan 1x saat server menyala)
    scheduler.add_job(run_monitoring_cycle, 'interval', minutes=5, next_run_time=datetime.now())
    scheduler.start()

@app.get("/scan")
def manual_scan():
    # Endpoint rahasia untuk trigger scan manual tanpa harus nunggu 5 menit (hanya untuk testing)
    run_monitoring_cycle()
    return {"status": "success", "message": "Pemindaian manual selesai."}

class VideoCreate(BaseModel):
    user_id: str
    video_id: str
    title: str

@app.post("/videos")
def add_video(video: VideoCreate, db: Session = Depends(get_db)):
    new_video = Video(
        user_id=video.user_id,
        video_id=video.video_id,
        title=video.title
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video

@app.get("/videos/{user_id}")
def get_user_videos(user_id: str, db: Session = Depends(get_db)):
    videos = db.query(Video).filter(Video.user_id == user_id).all()
    return videos

@app.patch("/videos/{video_id}/toggle")
def toggle_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    video.is_active = not video.is_active
    db.commit()
    return {"status": "success", "is_active": video.is_active}

@app.delete("/videos/{video_id}")
def delete_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video:
        db.delete(video)
        db.commit()
    return {"status": "success"}

@app.get("/logs/{user_id}")
def get_logs(user_id: str, db: Session = Depends(get_db)):
    # Get all video IDs for user
    videos = db.query(Video).filter(Video.user_id == user_id).all()
    video_map = {v.id: (v.title or v.video_id) for v in videos}
    video_ids = list(video_map.keys())
    
    logs = db.query(CommentLog).filter(
        CommentLog.video_id.in_(video_ids)
    ).order_by(CommentLog.deleted_at.desc()).limit(100).all()
    
    result = []
    for log in logs:
        log_dict = {
            "id": str(log.id),
            "video_id": str(log.video_id),
            "video_title": video_map.get(log.video_id, "Unknown"),
            "comment_text": log.comment_text,
            "author": log.author,
            "action": log.action,
            "alasan": log.alasan,
            "confidence": log.confidence,
            "deleted_at": log.deleted_at.isoformat()
        }
        result.append(log_dict)
    
    return result

class KeywordCreate(BaseModel):
    keyword: str

@app.post("/keywords/{user_id}")
def add_keyword(user_id: str, kw: KeywordCreate, db: Session = Depends(get_db)):
    new_kw = CustomKeyword(
        user_id=user_id,
        keyword=kw.keyword.lower().strip()
    )
    db.add(new_kw)
    db.commit()
    db.refresh(new_kw)
    return new_kw

@app.get("/keywords/{user_id}")
def get_keywords(user_id: str, db: Session = Depends(get_db)):
    keywords = db.query(CustomKeyword).filter(CustomKeyword.user_id == user_id).all()
    return keywords

@app.delete("/keywords/{keyword_id}")
def delete_keyword(keyword_id: str, db: Session = Depends(get_db)):
    kw = db.query(CustomKeyword).filter(CustomKeyword.id == keyword_id).first()
    if kw:
        db.delete(kw)
        db.commit()
    return {"status": "success"}
