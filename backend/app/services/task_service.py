from sqlmodel import Session, select
from ..schemas.models import Task

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
    def update_task(session: Session, task_id: int, **kwargs):
        task = TaskService.get_task_by_id(session, task_id)
        if task:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(task, key, value)
            session.add(task)
            session.commit()
            session.refresh(task)
        return task
