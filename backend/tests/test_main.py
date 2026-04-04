import os
from pathlib import Path

db_path = Path(__file__).resolve().parent.parent / 'test.db'
if db_path.exists():
    db_path.unlink()

os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'

from fastapi.testclient import TestClient

from app.main import app


def test_root_returns_ok():
    client = TestClient(app)
    response = client.get('/')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    assert 'service' in response.json()


def test_health_returns_ok():
    client = TestClient(app)
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok', 'service': 'ScrumsWeb Backend'}


def test_project_crud_flow():
    client = TestClient(app)

    team_response = client.post('/teams', json={'name': 'Equipo A', 'description': 'Equipo de prueba'})
    assert team_response.status_code == 201
    team = team_response.json()
    assert team['name'] == 'Equipo A'

    project_response = client.post(
        '/projects',
        json={
            'name': 'Proyecto Inicial',
            'description': 'Proyecto de prueba',
            'team_id': team['id'],
        },
    )
    assert project_response.status_code == 201
    project = project_response.json()
    assert project['name'] == 'Proyecto Inicial'
    assert project['team_id'] == team['id']

    list_response = client.get('/projects')
    assert list_response.status_code == 200
    assert any(item['id'] == project['id'] for item in list_response.json())

    sprint_response = client.post(
        f"/projects/{project['id']}/sprints",
        json={
            'name': 'Sprint 1',
            'goal': 'Completar el MVP',
            'start_date': '2026-04-05',
            'end_date': '2026-04-19',
            'status': 'PLANNED',
        },
    )
    assert sprint_response.status_code == 201
    sprint = sprint_response.json()
    assert sprint['name'] == 'Sprint 1'
    assert sprint['project_id'] == project['id']

    sprints_response = client.get(f"/projects/{project['id']}/sprints")
    assert sprints_response.status_code == 200
    assert any(item['id'] == sprint['id'] for item in sprints_response.json())

    user_response = client.post(
        '/users',
        json={
            'name': 'Juan',
            'email': 'juan@example.com',
            'role': 'DEVELOPER',
            'password': 'secret123',
        },
    )
    assert user_response.status_code == 201
    user = user_response.json()
    assert user['email'] == 'juan@example.com'

    token_response = client.post(
        '/token',
        data={'username': 'juan@example.com', 'password': 'secret123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    assert token_response.status_code == 200
    token_data = token_response.json()
    assert token_data['token_type'] == 'bearer'

    task_response = client.post(
        f"/sprints/{sprint['id']}/tasks",
        json={
            'title': 'Tarea de prueba',
            'description': 'Una tarea de ejemplo',
            'status': 'TODO',
            'priority': 'HIGH',
            'estimate_hours': 4,
            'spent_hours': 0,
            'assignee_id': user['id'],
        },
    )
    assert task_response.status_code == 201
    task = task_response.json()
    assert task['title'] == 'Tarea de prueba'
    assert task['sprint_id'] == sprint['id']
    assert task['assignee_id'] == user['id']

    list_tasks_response = client.get(f"/sprints/{sprint['id']}/tasks")
    assert list_tasks_response.status_code == 200
    assert any(item['id'] == task['id'] for item in list_tasks_response.json())

    patch_response = client.patch(
        f"/tasks/{task['id']}",
        json={
            'status': 'IN_PROGRESS',
            'spent_hours': 1.5,
        },
    )
    assert patch_response.status_code == 200
    updated_task = patch_response.json()
    assert updated_task['status'] == 'IN_PROGRESS'
    assert updated_task['spent_hours'] == 1.5
