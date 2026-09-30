import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from .database import get_db
from .models import User
import uuid
import hashlib
import base64
import os

# Simpan code_verifier secara global untuk keperluan PKCE (sementara untuk local testing)
_oauth_store = {}

router = APIRouter(prefix="/auth", tags=["auth"])

# Allow HTTP for OAuth callback in development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "client_secrets.json")
SCOPES = [
    "https://www.googleapis.com/auth/youtube.force-ssl", 
    "https://www.googleapis.com/auth/userinfo.email", 
    "openid"
]

@router.get("/youtube")
def login_youtube():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/auth/callback"
    )
    
    # Generate PKCE code verifier and challenge untuk tipe "Desktop App"
    code_verifier = base64.urlsafe_b64encode(os.urandom(40)).decode('utf-8').rstrip('=')
    code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode('utf-8')).digest()).decode('utf-8').rstrip('=')
    
    auth_url, state = flow.authorization_url(
        prompt='consent', 
        access_type='offline',
        code_challenge=code_challenge,
        code_challenge_method='S256'
    )
    
    _oauth_store[state] = code_verifier
    return RedirectResponse(auth_url)

@router.get("/callback")
def auth_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/auth/callback"
    )
    
    # Ambil code verifier yang disimpan sebelumnya
    code_verifier = _oauth_store.pop(state, None)
    if code_verifier:
        flow.fetch_token(code=code, code_verifier=code_verifier)
    else:
        flow.fetch_token(code=code)
        
    credentials = flow.credentials
    
    # Ambil email user
    user_info_service = build('oauth2', 'v2', credentials=credentials)
    user_info = user_info_service.userinfo().get().execute()
    email = user_info.get('email')
    
    # Ambil info channel YouTube
    youtube = build('youtube', 'v3', credentials=credentials)
    channel_response = youtube.channels().list(mine=True, part='snippet').execute()
    channel_name = "Unknown Channel"
    if channel_response.get("items"):
        channel_name = channel_response["items"][0]["snippet"]["title"]
    
    # Simpan/Update user di DB
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, youtube_channel=channel_name)
        db.add(user)
    else:
        user.youtube_channel = channel_name
        
    user.oauth_token = credentials.to_json()
    db.commit()
    db.refresh(user)
    
    import time
    # Redirect ke dashboard React dengan cache buster
    return RedirectResponse(f"http://localhost:5173/dashboard?user_id={user.id}&t={int(time.time())}")

@router.get("/me")
def get_me(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "youtube_channel": user.youtube_channel}
