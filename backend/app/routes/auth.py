"""
Auth routes for Trendzy — register, login, me, logout.
JWT-based authentication for buyers and sellers.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import uuid, bcrypt, os

from jose import jwt, JWTError
from app.database import get_db, UserDB

router   = APIRouter()
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv('JWT_SECRET', 'trendzy-super-secret-jwt-key-2025')
ALGORITHM  = 'HS256'
TOKEN_EXPIRE_DAYS = 30


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    phone:    Optional[str] = None

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class UserResponse(BaseModel):
    id:        str
    name:      str
    email:     str
    phone:     Optional[str]
    role:      str
    createdAt: datetime

class AuthResponse(BaseModel):
    token: str
    user:  UserResponse


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        'sub':  user_id,
        'role': role,
        'exp':  datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid or expired token')

def _user_to_dict(u: UserDB) -> dict:
    return {
        'id':        u.id,
        'name':      u.name,
        'email':     u.email,
        'phone':     u.phone,
        'role':      u.role,
        'createdAt': u.createdAt,
    }


# ── Dependency: get current user ──────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserDB:
    if not credentials:
        raise HTTPException(status_code=401, detail='Not authenticated')
    payload = decode_token(credentials.credentials)
    user = db.query(UserDB).filter(UserDB.id == payload['sub']).first()
    if not user or not user.isActive:
        raise HTTPException(status_code=401, detail='User not found')
    return user

def get_current_seller(user: UserDB = Depends(get_current_user)) -> UserDB:
    if user.role != 'seller':
        raise HTTPException(status_code=403, detail='Seller access required')
    return user


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post('/register', response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(UserDB).filter(UserDB.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail='Email already registered')

    user = UserDB(
        id        = str(uuid.uuid4()),
        name      = data.name.strip(),
        email     = data.email.lower().strip(),
        phone     = data.phone,
        password  = hash_password(data.password),
        role      = 'buyer',
        createdAt = datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    print(f'[Auth] ✓ New buyer registered: {user.email}')
    return AuthResponse(token=create_token(user.id, user.role), user=_user_to_dict(user))


@router.post('/login', response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == data.email.lower()).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail='Invalid email or password')

    if not user.isActive:
        raise HTTPException(status_code=403, detail='Account is disabled')

    # Update last login
    user.lastLoginAt = datetime.utcnow()
    db.commit()

    print(f'[Auth] ✓ Login: {user.email} ({user.role})')
    return AuthResponse(token=create_token(user.id, user.role), user=_user_to_dict(user))


@router.get('/me', response_model=UserResponse)
def get_me(current_user: UserDB = Depends(get_current_user)):
    return _user_to_dict(current_user)


@router.get('/users', tags=['seller'])
def get_all_users(
    db: Session = Depends(get_db),
    _: UserDB = Depends(get_current_seller)
):
    """Seller only — list all registered buyers."""
    users = db.query(UserDB).filter(UserDB.role == 'buyer').order_by(UserDB.createdAt.desc()).all()
    return [{
        'id':          u.id,
        'name':        u.name,
        'email':       u.email,
        'phone':       u.phone,
        'createdAt':   u.createdAt,
        'lastLoginAt': u.lastLoginAt,
    } for u in users]
