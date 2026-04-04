# ScrumsWeb

## Resumen del proyecto

ScrumsWeb es una WebApp Scrum con frontend y backend separados, pensada para gestionar:
- equipos y proyectos
- sprints y backlog
- tareas con estado, prioridad, estimación, horas trabajadas y asignación de usuarios
- roles básicos del flujo Scrum

## Arquitectura actual

- Frontend: Next.js + React (carpeta `frontend/`)
- Backend: FastAPI + SQLModel (carpeta `backend/`)
- Base de datos: SQLite
- Orquestación: Docker + Docker Compose

## Estado actual implementado

### Backend
- Endpoints CRUD para equipos, proyectos, sprints y tareas
- Modelo de usuarios con roles y contraseña
- Login JWT con endpoint `/token`
- Endpoint `/users/me` para obtener el usuario autenticado
- Validación de usuarios asignados en tareas
- Migración básica de SQLite para columnas nuevas (`task.assignee_id`, `user.password`)
- Backend tests passing (3 tests verified in current environment)

### Frontend
- Página inicial de bienvenida
- Listado y creación de equipos/proyectos
- Detalle de proyecto con creación de sprints y tareas
- Interfaz de login y registro de usuario
- Autenticación cliente con token y almacenamiento en `localStorage`
- Diferencias básicas de UI según rol (`DEVELOPER` vs roles de gestión)

## Cómo ejecutar

### Frontend
1. Entrar a la carpeta frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

### Backend
1. Entrar a la carpeta backend:
   ```bash
   cd backend
   ```
2. Instalar dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Ejecutar el backend:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Con Docker
1. Levantar frontend y backend:
   ```bash
   docker compose up --build
   ```
2. Backend disponible en `http://localhost:8000`
3. Frontend disponible en `http://localhost:3000`

## Qué falta completar

- Finalizar los permisos por rol a nivel de backend y frontend
- Asegurar un flujo de login/registro estable y la expiración de tokens
- Mejorar la gestión de usuarios y roles en la UI
- Agregar edición y eliminación de sprints y tareas desde el frontend
- Implementar vistas Scrum específicas: tablero Kanban, burndown y sprint dashboard
- Añadir historial de tareas y métricas de avance

## Notas para cerrar el día

- El sistema principal ya tiene frontend y backend conectados
- Backend tests pasaron exitosamente en este entorno (3 tests)
- Las APIs básicas están listas y el flujo de creación de proyectos/sprints/tareas funciona
- Falta pulir permisos, UI de usuario y vistas Scrum avanzadas
- La verificación del build de frontend no se hizo en este shell porque `npm` no estaba disponible

---

> Prioridad de cierre para hoy: dejar la app funcional con login, creación de sprint/tarea y roles básicos, y documentar claramente el estado actual en este README.
