from sqlmodel import Session, select
from ..schemas.models import Project

class ProjectService:
    @staticmethod
    def create_project(session: Session, name: str, description: str = "", team_id: int = None):
        project = Project(name=name, description=description, team_id=team_id)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project

    @staticmethod
    def get_project_by_id(session: Session, project_id: int):
        return session.get(Project, project_id)

    @staticmethod
    def assign_team(session: Session, project_id: int, team_id: int):
        project = ProjectService.get_project_by_id(session, project_id)
        if project:
            project.team_id = team_id
            session.add(project)
            session.commit()
            session.refresh(project)
        return project
