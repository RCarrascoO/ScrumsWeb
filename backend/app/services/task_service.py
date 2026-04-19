from sqlmodel import Session, select
from fastapi import HTTPException
from ..schemas.models import Task, User
from ..schemas.enums import Role

class TaskService:
    @staticmethod
    def create_task(session: Session, title: str, description: str, priority: str, estimate_hours: float, sprint_id: int):
        task = Task(
            title=title,
            description=description,
            priority=priority,
            estimate_hours=estimate_hours,
            sprint_id=sprint_id
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_task_by_id(session: Session, task_id: int):
        return session.get(Task, task_id)

    @staticmethod
    def get_sprint_tasks(session: Session, sprint_id: int):
        return session.exec(select(Task).where(Task.sprint_id == sprint_id)).all()

    @staticmethod
    def update_task(session: Session, task_id: int, user: User, **kwargs):
        task = TaskService.get_task_by_id(session, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        allowed_keys_for_dev = ["status", "spent_hours"]
        
        # Security validation
        if user.role == Role.DEVELOPER:
            if task.assignee_id != user.id:
                raise HTTPException(status_code=403, detail="Developers can only edit tasks assigned to them")
            for k in kwargs.keys():
                if k not in allowed_keys_for_dev and kwargs[k] is not None:
                    raise HTTPException(status_code=403, detail=f"Developers cannot modify {k}")

        for key, value in kwargs.items():
            if value is not None:
                setattr(task, key, value)
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def assign_task_by_email(session: Session, task_id: int, user_email: str):
        task = session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        u = session.exec(select(User).where(User.email == user_email)).first()
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        task.assignee_id = u.id
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
