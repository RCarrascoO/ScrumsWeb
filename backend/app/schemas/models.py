from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from .enums import Role, SprintStatus, TaskStatus, Priority

class User(SQLModel, table=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password: str
    role: Role = Field(default=Role.DEVELOPER)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tasks: list["Task"] = Relationship(back_populates="assignee")
    team_members: list["TeamMember"] = Relationship(back_populates="user")

class Team(SQLModel, table=True):
    __tablename__ = "team"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    projects: list["Project"] = Relationship(back_populates="team")
    members: list["TeamMember"] = Relationship(back_populates="team")

class TeamMember(SQLModel, table=True):
    __tablename__ = "team_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    team: Team = Relationship(back_populates="members")
    user: User = Relationship(back_populates="team_members")

class Project(SQLModel, table=True):
    __tablename__ = "project"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    team_id: Optional[int] = Field(default=None, foreign_key="team.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    team: Optional[Team] = Relationship(back_populates="projects")
    sprints: list["Sprint"] = Relationship(back_populates="project")

class Sprint(SQLModel, table=True):
    __tablename__ = "sprint"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    goal: str = Field(default="")
    start_date: str
    end_date: str = Field(default="")
    status: SprintStatus = Field(default=SprintStatus.PLANNED)
    project_id: int = Field(foreign_key="project.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    project: Project = Relationship(back_populates="sprints")
    tasks: list["Task"] = Relationship(back_populates="sprint")

class Task(SQLModel, table=True):
    __tablename__ = "task"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str = Field(default="")
    status: TaskStatus = Field(default=TaskStatus.TODO, index=True)
    priority: Priority = Field(default=Priority.MEDIUM)
    estimate_hours: Optional[float] = Field(default=None)
    spent_hours: float = Field(default=0.0)
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    sprint_id: int = Field(foreign_key="sprint.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sprint: Sprint = Relationship(back_populates="tasks")
    assignee: Optional[User] = Relationship(back_populates="tasks")
