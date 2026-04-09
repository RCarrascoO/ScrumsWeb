from sqlmodel import Session, select
from ..schemas.models import User
from ..core.security import hash_password, verify_password

class UserService:
    @staticmethod
    def create_user(session: Session, name: str, email: str, password: str):
        user = User(
            name=name,
            email=email,
            password=hash_password(password)
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(session: Session, email: str):
        return session.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def get_user_by_id(session: Session, user_id: int):
        return session.get(User, user_id)

    @staticmethod
    def verify_user_password(session: Session, email: str, password: str):
        user = UserService.get_user_by_email(session, email)
        if not user or not verify_password(password, user.password):
            return None
        return user
