from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

def get_youtube_client(oauth_token_json):
    credentials = Credentials.from_authorized_user_info(json.loads(oauth_token_json))
    return build('youtube', 'v3', credentials=credentials)

def fetch_latest_comments(youtube, video_id, max_results=50):
    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            order="time"
        ).execute()
        return response.get("items", [])
    except Exception as e:
        print(f"Error fetching comments for video {video_id}: {e}")
        return []

def delete_comment(youtube, comment_id):
    try:
        # Menghapus komentar secara permanen (sehingga tidak terlihat oleh si penulis sekalipun)
        youtube.comments().delete(id=comment_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting comment {comment_id}: {e}")
        return False
