from sqlmodel import Session, select
from ..schemas.models import Project, TeamMember, User
from ..schemas.enums import Role

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
    def get_all_projects(session: Session, user: User = None):
        if user and user.role in [Role.ADMIN, Role.MANAGER]:
            return session.exec(select(Project)).all()
        elif user:
            statement = select(Project).join(TeamMember, Project.team_id == TeamMember.team_id).where(TeamMember.user_id == user.id)
            return session.exec(statement).all()
        return session.exec(select(Project)).all()

    @staticmethod
    def assign_team(session: Session, project_id: int, team_id: int):
        project = ProjectService.get_project_by_id(session, project_id)
        if project:
            project.team_id = team_id
            session.add(project)
            session.commit()
            session.refresh(project)
        return project
