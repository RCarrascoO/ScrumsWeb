from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import TaskCreate, TaskRead, TaskUpdate
from ...services.task_service import TaskService
from ...core.auth import get_current_user, get_manager_user
from ...schemas.models import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskRead)
def create_task(task: TaskCreate, sprint_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    return TaskService.create_task(
        session, task.title, task.description, task.priority, task.estimate_hours, sprint_id
    )

@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return TaskService.get_task_by_id(session, task_id)

@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return TaskService.update_task(session, task_id, current_user, **task_update.dict(exclude_unset=True))

@router.get("/sprint/{sprint_id}")
def get_sprint_tasks(sprint_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return TaskService.get_sprint_tasks(session, sprint_id)

@router.post("/{task_id}/assign")
def assign_task(task_id: int, email: str, session: Session = Depends(get_session), current_user: User = Depends(get_manager_user)):
    return TaskService.assign_task_by_email(session, task_id, email)
