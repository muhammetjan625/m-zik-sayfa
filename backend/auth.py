from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

load_dotenv()

# Şifreleme ayarları
SECRET_KEY = os.getenv("SECRET_KEY", "gizli_anahtar_degistir")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Şifreyi Hash'le (Veritabanına açık şifre kaydetmemek için)
def get_password_hash(password):
    return pwd_context.hash(password)

# Şifreyi Doğrula (Giriş yaparken)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Token Oluştur (Giriş başarılıysa verilecek giriş kartı)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt