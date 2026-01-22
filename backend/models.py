from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Kullanıcı Kaydı İçin Model
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

# Veritabanında Saklanan Kullanıcı Modeli
class UserInDB(UserCreate):
    hashed_password: str

# Kullanıcıya Geri Döndürülen Model (Şifreyi gizlemek için)
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    is_active: bool = True
    
    class Config:
        from_attributes = True

# Giriş Yaparken Gelen Token Modeli
class Token(BaseModel):
    access_token: str
    token_type: str