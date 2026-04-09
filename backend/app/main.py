from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, SQLModel, select

from .auth import get_current_user
from .database import engine, get_session
from .models import (
    Project,
    ProjectCreate,
    ProjectRead,
    Sprint,
    SprintCreate,
    SprintRead,
    Task,
    TaskCreate,
    TaskRead,
    TaskUpdate,
    Team,
    TeamCreate,
    TeamRead,
    User,
    UserCreate,
    UserRead,
)
from .security import create_access_token, get_password_hash, verify_password

app = FastAPI(
    title='ScrumsWeb Backend',
    description='API REST con FastAPI para la WebApp Scrum',
    version='0.1.0',
)

SQLModel.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.on_event('startup')
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get('/')
def root():
    return {
        'status': 'ok',
        'service': 'ScrumsWeb Backend',
        'message': 'FastAPI backend is running. Use /health, /teams, /projects, /projects/{project_id}/sprints and /sprints/{sprint_id}/tasks.',
    }

@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'ScrumsWeb Backend'}

@app.get('/users', response_model=List[UserRead])
def list_users(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(User)).all()

@app.post('/users', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    user_data['password'] = hashed_password
    db_user = User(**user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.post('/token')
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token = create_access_token({'sub': str(user.id), 'role': user.role})
    return {'access_token': access_token, 'token_type': 'bearer'}

@app.get('/users/me', response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get('/teams', response_model=List[TeamRead])
def list_teams(session: Session = Depends(get_session)):
    return session.exec(select(Team)).all()

@app.post('/teams', response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(team: TeamCreate, session: Session = Depends(get_session)):
    db_team = Team.from_orm(team)
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team

@app.get('/projects', response_model=List[ProjectRead])
def list_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()

@app.post('/projects', response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, session: Session = Depends(get_session)):
    if project.team_id and not session.get(Team, project.team_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Team not found')
    project_data = project.dict(exclude_none=True)
    db_project = Project(**project_data)
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project

@app.get('/projects/{project_id}', response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project

@app.get('/projects/{project_id}/sprints', response_model=List[SprintRead])
def list_project_sprints(project_id: int, session: Session = Depends(get_session)):
    if not session.get(Project, project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return session.exec(select(Sprint).where(Sprint.project_id == project_id)).all()

@app.post('/projects/{project_id}/sprints', response_model=SprintRead, status_code=status.HTTP_201_CREATED)
def create_sprint(project_id: int, sprint: SprintCreate, session: Session = Depends(get_session)):
    if not session.get(Project, project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    db_sprint = Sprint(**sprint.dict(), project_id=project_id)
    session.add(db_sprint)
    session.commit()
    session.refresh(db_sprint)
    return db_sprint

@app.get('/sprints/{sprint_id}/tasks', response_model=List[TaskRead])
def list_sprint_tasks(sprint_id: int, session: Session = Depends(get_session)):
    if not session.get(Sprint, sprint_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Sprint not found')
    return session.exec(select(Task).where(Task.sprint_id == sprint_id)).all()

@app.post('/sprints/{sprint_id}/tasks', response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(sprint_id: int, task: TaskCreate, session: Session = Depends(get_session)):
    if not session.get(Sprint, sprint_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Sprint not found')
    task_data = task.dict(exclude_none=True)
    if task_data.get('assignee_id') and not session.get(User, task_data['assignee_id']):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Assignee not found')
    db_task = Task(**task_data, sprint_id=sprint_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.get('/tasks/{task_id}', response_model=TaskRead)
def get_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    return task

@app.patch('/tasks/{task_id}', response_model=TaskRead)
def update_task(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    task_data = task_update.dict(exclude_unset=True, exclude_none=True)
    if 'assignee_id' in task_data and task_data['assignee_id']:
        if not session.get(User, task_data['assignee_id']):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Assignee not found')
    for key, value in task_data.items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.delete('/tasks/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    session.delete(task)
    session.commit()
    return None
