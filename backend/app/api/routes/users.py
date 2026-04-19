from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ...database import get_session
from ...schemas.requests import UserRead
from ...services.user_service import UserService
from ...core.auth import get_current_user
from ...schemas.models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserRead])
def get_all_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return session.exec(select(User)).all()

@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    return UserService.get_user_by_id(session, user_id)
