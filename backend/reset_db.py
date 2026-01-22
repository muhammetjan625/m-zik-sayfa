import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def reset_users():
    # Veritabanına bağlan
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.music_cloud_db

    # Users koleksiyonunu tamamen sil
    await db["users"].drop()
    print("✅ Tüm kullanıcılar silindi! Veritabanı tertemiz.")

if __name__ == "__main__":
    asyncio.run(reset_users())