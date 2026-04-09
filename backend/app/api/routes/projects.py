from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import ProjectCreate, ProjectRead
from ...services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectRead)
def create_project(project: ProjectCreate, session: Session = Depends(get_session)):
    return ProjectService.create_project(session, project.name, project.description, project.team_id)

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session)):
    return ProjectService.get_project_by_id(session, project_id)

@router.post("/{project_id}/assign-team/{team_id}")
def assign_team(project_id: int, team_id: int, session: Session = Depends(get_session)):
    return ProjectService.assign_team(session, project_id, team_id)
