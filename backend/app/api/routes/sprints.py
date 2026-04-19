from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import SprintCreate, SprintRead
from ...services.sprint_service import SprintService
from ...core.auth import get_current_user, get_manager_user
from ...schemas.models import User

router = APIRouter(prefix="/sprints", tags=["sprints"])

@router.post("", response_model=SprintRead)
def create_sprint(sprint: SprintCreate, project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    return SprintService.create_sprint(
        session, sprint.name, sprint.goal, sprint.start_date, sprint.end_date, project_id
    )

@router.get("/{sprint_id}", response_model=SprintRead)
def get_sprint(sprint_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return SprintService.get_sprint_by_id(session, sprint_id)

@router.get("/project/{project_id}")
def get_project_sprints(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return SprintService.get_project_sprints(session, project_id)
