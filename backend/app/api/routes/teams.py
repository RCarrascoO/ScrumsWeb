from fastapi import APIRouter, Depends
from sqlmodel import Session
from ...database import get_session
from ...schemas.requests import TeamCreate, TeamRead, TeamMemberRead
from ...services.team_service import TeamService
from ...core.auth import get_current_user, get_admin_user
from ...schemas.models import User

router = APIRouter(prefix="/teams", tags=["teams"])

@router.post("/", response_model=TeamRead)
def create_team(team: TeamCreate, session: Session = Depends(get_session), current_user: User = Depends(get_admin_user)):
    return TeamService.create_team(session, team.name, team.description)

@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return TeamService.get_team_by_id(session, team_id)

@router.post("/{team_id}/members/{user_id}", response_model=TeamMemberRead)
def add_team_member(team_id: int, user_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_admin_user)):
    return TeamService.add_member(session, team_id, user_id)

@router.get("/{team_id}/members")
def get_team_members(team_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return TeamService.get_team_members(session, team_id)
