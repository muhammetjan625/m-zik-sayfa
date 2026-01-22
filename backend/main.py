import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader

app = FastAPI()

# --- 1. CLOUDINARY AYARLARI ---
cloudinary.config( 
  cloud_name = "dqhqu5w1o", 
  api_key = "275726561282999", 
  api_secret = "tGJLqyPGMicNTO-hTm5kskO0ofU",
  secure = True
)

# --- 2. MONGODB ATLAS BAĞLANTISI ---
MONGO_URL = "mongodb+srv://admin:sokrates123@cluster0.ixibj0l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = AsyncIOMotorClient(MONGO_URL)
db = client.music_cloud_db

# CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELLER ---
# Kullanıcıdan gelen veriyi kontrol etmek için şablon
class UserLogin(BaseModel):
    username: str
    password: str

# Helper
def song_helper(song) -> dict:
    return {
        "id": str(song["_id"]),
        "title": song["title"],
        "artist": song["artist"],
        "url": song.get("music_url", ""),
        "cover": song.get("cover_url", ""),
    }

# --- ENDPOINTLER ---

# 1. Kayıt Ol (YENİ EKLENDİ)
@app.post("/register")
async def register(user: UserLogin):
    # Kullanıcı zaten var mı?
    existing_user = await db["users"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
    
    # Yeni kullanıcıyı kaydet
    new_user = {"username": user.username, "password": user.password} # Not: Gerçek projede şifre şifrelenmelidir!
    await db["users"].insert_one(new_user)
    return {"message": "Kayıt başarılı!"}

# 2. Giriş Yap (YENİ EKLENDİ)
@app.post("/login")
async def login(user: UserLogin):
    existing_user = await db["users"].find_one({"username": user.username, "password": user.password})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre hatalı")
    return {"message": "Giriş başarılı", "username": user.username}

# 3. Şarkı Yükle
@app.post("/upload")
async def upload_song(
    title: str = Form(...),
    artist: str = Form(...),
    file: UploadFile = File(...),
    cover: UploadFile = File(...)
):
    try:
        file.file.seek(0)
        music_res = cloudinary.uploader.upload(file.file, resource_type="video", folder="music_cloud/songs")
        
        cover_url = "https://placehold.co/300x300/1db954/white?text=Music"
        try:
            cover.file.seek(0)
            cover_res = cloudinary.uploader.upload(cover.file, folder="music_cloud/covers")
            cover_url = cover_res["secure_url"]
        except:
            pass

        new_song = {
            "title": title,
            "artist": artist,
            "music_url": music_res["secure_url"],
            "cover_url": cover_url
        }
        await db["songs"].insert_one(new_song)
        return {"message": "Yüklendi! 🚀"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Şarkıları Getir
@app.get("/songs")
async def get_songs():
    songs = []
    async for song in db["songs"].find():
        songs.append(song_helper(song))
    return songs

# 5. Şarkı Sil
@app.delete("/songs/{song_id}")
async def delete_song(song_id: str):
    await db["songs"].delete_one({"_id": ObjectId(song_id)})
    return {"message": "Silindi"}

# Ana Sayfa Kontrolü
@app.get("/")
def read_root():
    return {"message": "Backend Çalışıyor"}