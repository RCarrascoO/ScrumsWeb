from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from .enums import Role, TaskStatus, Priority

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = Role.DEVELOPER

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    team_id: Optional[int] = None

class ProjectRead(BaseModel):
    id: int
    name: str
    description: str
    team_id: Optional[int] = None

class TeamCreate(BaseModel):
    name: str
    description: str = ""

class TeamRead(BaseModel):
    id: int
    name: str
    description: str

class TeamMemberRead(BaseModel):
    id: int
    team_id: int
    user_id: int

class SprintCreate(BaseModel):
    name: str
    goal: str = ""
    start_date: str
    end_date: str = ""

class SprintRead(BaseModel):
    id: int
    name: str
    goal: str
    start_date: str
    end_date: str

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: Priority = Priority.MEDIUM
    estimate_hours: Optional[float] = None

class TaskRead(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: Priority
    estimate_hours: Optional[float]
    spent_hours: float
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    estimate_hours: Optional[float] = None
    spent_hours: Optional[float] = None
