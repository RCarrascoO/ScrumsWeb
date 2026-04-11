from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import ProjectCreate, ProjectRead
from ...services.project_service import ProjectService
from ...core.auth import get_current_user, get_admin_user
from ...schemas.models import User

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectRead)
def create_project(project: ProjectCreate, session: Session = Depends(get_session), current_user: User = Depends(get_admin_user)):
    return ProjectService.create_project(session, project.name, project.description, project.team_id)

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return ProjectService.get_project_by_id(session, project_id)

@router.get("/", response_model=list[ProjectRead])
def get_all_projects(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return ProjectService.get_all_projects(session)

@router.post("/{project_id}/assign-team/{team_id}")
def assign_team(project_id: int, team_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_admin_user)):
    return ProjectService.assign_team(session, project_id, team_id)
