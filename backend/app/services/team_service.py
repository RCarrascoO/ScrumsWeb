from sqlmodel import Session, select
from ..schemas.models import Team, TeamMember, User

class TeamService:
    @staticmethod
    def create_team(session: Session, name: str, description: str = ""):
        team = Team(name=name, description=description)
        session.add(team)
        session.commit()
        session.refresh(team)
        return team

    @staticmethod
    def get_team_by_id(session: Session, team_id: int):
        return session.get(Team, team_id)

    @staticmethod
    def add_member(session: Session, team_id: int, user_id: int):
        member = TeamMember(team_id=team_id, user_id=user_id)
        session.add(member)
        session.commit()
        session.refresh(member)
        return member

    @staticmethod
    def get_team_members(session: Session, team_id: int):
        return session.exec(select(TeamMember).where(TeamMember.team_id == team_id)).all()
