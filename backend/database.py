from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket # <-- Değişiklik burada
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "music_cloud_db")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    fs = None 

    def connect(self):
        try:
            print(f"📡 Bağlanılıyor: {MONGO_URL} (Veritabanı: {DB_NAME})")
            self.client = AsyncIOMotorClient(MONGO_URL)
            self.db = self.client[DB_NAME]
            
            # DÜZELTME: AsyncIOMotorGridFSBucket kullanıyoruz
            self.fs = AsyncIOMotorGridFSBucket(self.db)
            
            print("✅ MongoDB Bağlantısı Başarılı!")
        except Exception as e:
            print(f"❌ Bağlantı Hatası: {e}")

    def close(self):
        if self.client:
            self.client.close()
            print("❌ MongoDB Bağlantısı Kapatıldı.")

db = Database()