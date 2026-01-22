import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
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

# Veritabanı Bağlantısını Başlat
client = AsyncIOMotorClient(MONGO_URL)
db = client.music_cloud_db

# CORS Ayarları (Tüm sitelere izin ver)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Fonksiyon
def song_helper(song) -> dict:
    return {
        "id": str(song["_id"]),
        "title": song["title"],
        "artist": song["artist"],
        "url": song.get("music_url", ""),
        "cover": song.get("cover_url", ""),
    }

# --- ENDPOINTLER ---

# 1. Şarkı Yükle (Düzeltilmiş Versiyon)
@app.post("/upload")
async def upload_song(
    title: str = Form(...),
    artist: str = Form(...),
    file: UploadFile = File(...),
    cover: UploadFile = File(...)
):
    try:
        print(f"Yükleme başladı: {title} - {artist}")
        
        # 1. MÜZİĞİ YÜKLE (Zorunlu)
        # Dosya imlecini başa alıyoruz (Garanti olsun diye)
        file.file.seek(0)
        music_res = cloudinary.uploader.upload(file.file, resource_type="video", folder="music_cloud/songs")
        music_url = music_res["secure_url"]

        # 2. KAPAĞI YÜKLE (Hata Toleranslı)
        # Önce varsayılan bir resim belirliyoruz
        cover_url = "https://placehold.co/300x300/1db954/white?text=Music"
        
        try:
            # Dosya imlecini başa al
            cover.file.seek(0)
            
            # Cloudinary'ye yüklemeyi dene
            # Eğer dosya boşsa (0 byte) Cloudinary hata fırlatır, biz de 'except' bloğuna düşeriz.
            upload_result = cloudinary.uploader.upload(cover.file, folder="music_cloud/covers")
            cover_url = upload_result["secure_url"]
            
        except Exception as e:
            print(f"⚠️ Kapak resmi yüklenemedi (Boş olabilir), varsayılan resim kullanılacak. Hata: {e}")

        # 3. VERİTABANINA KAYDET
        new_song = {
            "title": title,
            "artist": artist,
            "music_url": music_url,
            "cover_url": cover_url
        }
        await db["songs"].insert_one(new_song)
        
        print("✅ Başarıyla Yüklendi!")
        return {"message": "Yüklendi! 🚀"}

    except Exception as e:
        print("❌ Kritik Hata:", e)
        raise HTTPException(status_code=500, detail=f"Sunucu Hatası: {str(e)}")

# 2. Şarkıları Getir
@app.get("/songs")
async def get_songs():
    songs = []
    async for song in db["songs"].find():
        songs.append(song_helper(song))
    return songs

# 3. Şarkı Sil
@app.delete("/songs/{song_id}")
async def delete_song(song_id: str):
    try:
        result = await db["songs"].delete_one({"_id": ObjectId(song_id)})
        if result.deleted_count == 1:
            return {"message": "Silindi"}
        raise HTTPException(404, "Bulunamadı")
    except Exception:
        raise HTTPException(400, "Geçersiz ID")