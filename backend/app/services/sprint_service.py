from sqlmodel import Session, select
from ..schemas.models import Sprint

class SprintService:
    @staticmethod
    def create_sprint(session: Session, name: str, goal: str, start_date: str, end_date: str, project_id: int):
        sprint = Sprint(
            name=name,
            goal=goal,
            start_date=start_date,
            end_date=end_date,
            project_id=project_id
        )
        session.add(sprint)
        session.commit()
        session.refresh(sprint)
        return sprint

    @staticmethod
    def get_sprint_by_id(session: Session, sprint_id: int):
        return session.get(Sprint, sprint_id)

    @staticmethod
    def get_project_sprints(session: Session, project_id: int):
        return session.exec(select(Sprint).where(Sprint.project_id == project_id)).all()
