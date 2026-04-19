from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import ProjectCreate, ProjectRead
from ...services.project_service import ProjectService
from ...services.team_service import TeamService
from ...services.user_service import UserService
from ...core.auth import get_current_user, get_admin_user, get_manager_user
from ...schemas.models import User

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("", response_model=ProjectRead)
def create_project(project: ProjectCreate, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    team = TeamService.create_team(session, name=f"Team for {project.name}")
    created_project = ProjectService.create_project(session, project.name, project.description, team.id)
    # Autocreo el team y añado al manager que lo creó (opcional pero buena idea)
    TeamService.add_member(session, team.id, current_user.id)
    return created_project

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return ProjectService.get_project_by_id(session, project_id)

@router.get("", response_model=list[ProjectRead])
def get_all_projects(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return ProjectService.get_all_projects(session, current_user)

@router.post("/{project_id}/assign-team/{team_id}")
def assign_team(project_id: int, team_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    return ProjectService.assign_team(session, project_id, team_id)

@router.post("/{project_id}/assign-user")
def assign_user_to_project(project_id: int, email: str, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    user = UserService.get_user_by_email(session, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.team_id:
        team = TeamService.create_team(session, name=f"Team for {project.name}")
        project = ProjectService.assign_team(session, project.id, team.id)
        
    TeamService.add_member(session, project.team_id, user.id)
    return {"message": "Usuario asignado", "user_id": user.id}

