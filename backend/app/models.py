from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class SprintStatus(str, Enum):
    PLANNED = 'PLANNED'
    ACTIVE = 'ACTIVE'
    CLOSED = 'CLOSED'


class TaskStatus(str, Enum):
    TODO = 'TODO'
    IN_PROGRESS = 'IN_PROGRESS'
    REVIEW = 'REVIEW'
    DONE = 'DONE'
    BLOCKED = 'BLOCKED'


class Priority(str, Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'


class Role(str, Enum):
    ADMIN = 'ADMIN'
    SCRUM_MASTER = 'SCRUM_MASTER'
    PRODUCT_OWNER = 'PRODUCT_OWNER'
    DEVELOPER = 'DEVELOPER'


class User(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    name: str = Field(default='')
    email: str
    password: str
    role: Role = Field(default=Role.DEVELOPER)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    name: Optional[str] = ''
    email: str
    password: str
    role: Role = Role.DEVELOPER


class UserRead(BaseModel):
    id: int
    name: Optional[str] = ''
    email: str
    role: Role
    created_at: datetime


class Team(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    name: str
    description: str = Field(default='')
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = ''


class TeamRead(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime


class Project(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    name: str
    description: Optional[str] = Field(default=None)
    team_id: Optional[int] = Field(default=None, foreign_key='team.id')
    owner_id: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ''
    team_id: Optional[int] = None
    owner_id: Optional[int] = None


class ProjectRead(BaseModel):
    id: int
    name: str
    description: str
    team_id: Optional[int] = None
    owner_id: Optional[int] = None
    created_at: datetime


class Sprint(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    name: str
    goal: Optional[str] = Field(default=None)
    start_date: str
    end_date: Optional[str] = Field(default=None)
    status: SprintStatus = Field(default=SprintStatus.PLANNED)
    project_id: int = Field(foreign_key='project.id')
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SprintCreate(BaseModel):
    name: str
    goal: Optional[str] = ''
    start_date: str
    end_date: Optional[str] = ''
    status: SprintStatus = SprintStatus.PLANNED


class SprintRead(BaseModel):
    id: int
    name: str
    goal: str
    start_date: str
    end_date: str
    status: SprintStatus
    project_id: int
    created_at: datetime


class Task(SQLModel, table=True):
    id: int = Field(default=0, primary_key=True)
    title: str
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    priority: Priority = Field(default=Priority.MEDIUM)
    estimate_hours: Optional[float] = Field(default=None)
    spent_hours: float = Field(default=0)
    assignee_id: Optional[int] = Field(default=None, foreign_key='user.id')
    sprint_id: int = Field(foreign_key='sprint.id')
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ''
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    estimate_hours: Optional[float] = 0
    spent_hours: Optional[float] = 0
    assignee_id: Optional[int] = None


class TaskRead(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: Priority
    estimate_hours: float
    spent_hours: float
    assignee_id: Optional[int]
    sprint_id: int
    created_at: datetime


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    estimate_hours: Optional[float] = None
    spent_hours: Optional[float] = None
    assignee_id: Optional[int] = None
