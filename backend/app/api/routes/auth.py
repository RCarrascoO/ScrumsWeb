from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import timedelta
from ...database import get_session
from ...schemas.requests import UserCreate, UserRead, Token
from ...services.user_service import UserService
from ...core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_session)):
    existing_user = UserService.get_user_by_email(session, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return UserService.create_user(session, user.name, user.email, user.password)

@router.post("/login", response_model=Token)
def login(email: str, password: str, session: Session = Depends(get_session)):
    user = UserService.verify_user_password(session, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(hours=24)
    )
    return {"access_token": access_token, "token_type": "bearer"}
