from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import UserRead
from ...services.user_service import UserService
from ...core.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
def get_current_user_info(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    return UserService.get_user_by_id(session, user_id)

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    return UserService.get_user_by_id(session, user_id)
