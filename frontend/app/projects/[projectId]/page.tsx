'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers'

type Project = {
  id: number
  name: string
  description?: string
  team_id?: number
}

type Sprint = {
  id: number
  name: string
  goal?: string
  start_date: string
  end_date?: string
  status: string
}

type User = {
  id: number
  name?: string
  email: string
  role: string
}

type Task = {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  estimate_hours?: number
  spent_hours: number
  assignee_id?: number
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter()
  const { user, authFetch, logout } = useAuth()
  const projectId = Number(params.projectId)
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', goal: '', start_date: '', end_date: '', status: 'PLANNED' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', estimate_hours: '', assignee_id: '' })
  const [error, setError] = useState<string | null>(null)

  const canManage = user?.role !== 'DEVELOPER'

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadProject()
    loadSprints()
    loadUsers()
  }, [projectId, user])

  useEffect(() => {
    if (selectedSprintId !== null) {
      loadTasks(selectedSprintId)
    } else {
      setTasks([])
    }
  }, [selectedSprintId])

  async function loadProject() {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('No se encontró el proyecto')
      }
      setProject(await response.json())
    } catch (err) {
      setError('Error al cargar el proyecto')
    }
  }

  async function loadSprints() {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects/${projectId}/sprints`)
      if (!response.ok) {
        throw new Error('No se pudieron cargar los sprints')
      }
      const data = await response.json()
      setSprints(data)
      if (data.length > 0 && selectedSprintId === null) {
        setSelectedSprintId(data[0].id)
      }
    } catch (err) {
      setError('Error al cargar sprints')
    }
  }

  async function loadUsers() {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users`)
      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios')
      }
      setUsers(await response.json())
    } catch (err) {
      setError('Error al cargar usuarios')
    }
  }

  async function loadTasks(sprintId: number) {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sprints/${sprintId}/tasks`)
      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas')
      }
      const loadedTasks: Task[] = await response.json()
      setTasks(user?.role === 'DEVELOPER' ? loadedTasks.filter((task) => task.assignee_id === user.id) : loadedTasks)
    } catch (err) {
      setError('Error al cargar tareas')
    }
  }

  async function handleCreateSprint(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.start_date) {
      setError('El nombre del sprint y la fecha de inicio son obligatorios')
      return
    }

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      setError('No se pudo crear el sprint')
      return
    }

    setForm({ name: '', goal: '', start_date: '', end_date: '', status: 'PLANNED' })
    await loadSprints()
  }

  async function handleCreateTask(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (selectedSprintId === null) {
      setError('Debe seleccionar un sprint antes de crear una tarea')
      return
    }
    if (!taskForm.title.trim()) {
      setError('El título de la tarea es obligatorio')
      return
    }

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sprints/${selectedSprintId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        estimate_hours: taskForm.estimate_hours ? Number(taskForm.estimate_hours) : undefined,
        spent_hours: 0,
        assignee_id: taskForm.assignee_id ? Number(taskForm.assignee_id) : undefined,
      }),
    })

    if (!response.ok) {
      setError('No se pudo crear la tarea')
      return
    }

    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', estimate_hours: '', assignee_id: '' })
    await loadTasks(selectedSprintId)
  }

  async function handleUpdateTask(taskId: number, update: { status?: string; spent_hours?: number }) {
    setError(null)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    })

    if (!response.ok) {
      setError('No se pudo actualizar la tarea')
      return
    }

    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, ...update } : task)))
  }

  return (
    <main style={{ padding: '3rem', maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <div>
            <h1>{project ? project.name : 'Proyecto'}</h1>
            <p>{project?.description || 'Detalle del proyecto y gestión de sprints y tareas.'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {user ? (
              <>
                <p style={{ margin: 0 }}>Ingresado como <strong>{user.name || user.email}</strong></p>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Rol: {user.role}</p>
                <button
                  type="button"
                  onClick={() => logout()}
                  style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #0f172a', background: 'transparent', cursor: 'pointer' }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : null}
          </div>
        </div>
        <Link href="/projects">Volver a proyectos</Link>
      </header>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : null}

      {canManage ? (
        <section style={{ display: 'grid', gap: '2rem', marginBottom: '2.5rem' }}>
          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Crear sprint</h2>
            <form onSubmit={handleCreateSprint} style={{ display: 'grid', gap: '0.85rem' }}>
              <label>
                Nombre
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Objetivo
                <textarea
                  value={form.goal}
                  onChange={(event) => setForm({ ...form, goal: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Fecha de inicio
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Fecha de fin
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Estado
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </label>
              <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
                Crear sprint
              </button>
            </form>
          </article>

          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Crear tarea</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '0.85rem' }}>
              <label>
                Título
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Prioridad
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </label>
              <label>
                Estimación (horas)
                <input
                  type="number"
                  value={taskForm.estimate_hours}
                  onChange={(event) => setTaskForm({ ...taskForm, estimate_hours: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Asignar a
                <select
                  value={taskForm.assignee_id}
                  onChange={(event) => setTaskForm({ ...taskForm, assignee_id: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="">Sin asignar</option>
                  {users.map((userOption) => (
                    <option key={userOption.id} value={userOption.id}>
                      {userOption.name || userOption.email} ({userOption.role})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
                Crear tarea
              </button>
            </form>
          </article>
        </section>
      ) : (
        <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 12, background: '#eef2ff', color: '#3730a3' }}>
          <strong>Modo desarrollador:</strong> solo puedes ver los proyectos existentes y tus tareas asignadas.
        </div>
      )}

      <section style={{ display: 'grid', gap: '2rem' }}>
        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Sprints</h2>
          <select
            value={selectedSprintId ?? ''}
            onChange={(event) => setSelectedSprintId(Number(event.target.value) || null)}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
          >
            <option value="">Selecciona un sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} — {sprint.status}
              </option>
            ))}
          </select>
          {sprints.length === 0 ? <p>No hay sprints todavía.</p> : null}
        </article>

        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Tareas</h2>
          {tasks.length === 0 ? (
            <p>No hay tareas para el sprint seleccionado.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0, gap: '1rem' }}>
              {tasks.map((task) => (
                <li key={task.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <strong>{task.title}</strong>
                  <p style={{ margin: '0.5rem 0' }}>{task.description}</p>
                  <p style={{ margin: 0 }}><strong>Status:</strong> {task.status}</p>
                  <p style={{ margin: 0 }}><strong>Prioridad:</strong> {task.priority}</p>
                  <p style={{ margin: 0 }}><strong>Estimado:</strong> {task.estimate_hours ?? '—'}h</p>
                  <p style={{ margin: 0 }}><strong>Horas trabajadas:</strong> {task.spent_hours}h</p>
                  <p style={{ margin: 0 }}><strong>Asignado a:</strong> {users.find((u) => u.id === task.assignee_id)?.name || task.assignee_id || 'Sin asignar'}</p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateTask(task.id, { status: 'IN_PROGRESS' })}
                      style={{ padding: '0.65rem 1rem', borderRadius: 8, border: '1px solid #0f172a', background: '#fff', cursor: 'pointer' }}
                    >
                      Marcar In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTask(task.id, { status: 'DONE' })}
                      style={{ padding: '0.65rem 1rem', borderRadius: 8, border: '1px solid #0f172a', background: '#fff', cursor: 'pointer' }}
                    >
                      Marcar Done
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTask(task.id, { spent_hours: task.spent_hours + 1 })}
                      style={{ padding: '0.65rem 1rem', borderRadius: 8, border: '1px solid #0f172a', background: '#fff', cursor: 'pointer' }}
                    >
                      +1h trabajada
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  )
}

  async function loadSprints() {
    try {
      const response = await fetch(`${apiBase}/projects/${projectId}/sprints`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar los sprints');
      }
      const data = await response.json();
      setSprints(data);
      if (data.length > 0 && selectedSprintId === null) {
        setSelectedSprintId(data[0].id);
      }
    } catch (err) {
      setError('Error al cargar sprints');
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch(`${apiBase}/users`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios');
      }
      setUsers(await response.json());
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  }

  async function loadTasks(sprintId: number) {
    try {
      const response = await fetch(`${apiBase}/sprints/${sprintId}/tasks`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas');
      }
      setTasks(await response.json());
    } catch (err) {
      setError('Error al cargar tareas');
    }
  }

  async function handleCreateSprint(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.start_date) {
      setError('El nombre del sprint y la fecha de inicio son obligatorios');
      return;
    }

    const response = await fetch(`${apiBase}/projects/${projectId}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError('No se pudo crear el sprint');
      return;
    }

    setForm({ name: '', goal: '', start_date: '', end_date: '', status: 'PLANNED' });
    await loadSprints();
  }

  async function handleCreateTask(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (selectedSprintId === null) {
      setError('Debe seleccionar un sprint antes de crear una tarea');
      return;
    }
    if (!taskForm.title.trim()) {
      setError('El título de la tarea es obligatorio');
      return;
    }

    const response = await fetch(`${apiBase}/sprints/${selectedSprintId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        estimate_hours: taskForm.estimate_hours ? Number(taskForm.estimate_hours) : undefined,
        spent_hours: 0,
        assignee_id: taskForm.assignee_id ? Number(taskForm.assignee_id) : undefined,
      }),
    });

    if (!response.ok) {
      setError('No se pudo crear la tarea');
      return;
    }

    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', estimate_hours: '', assignee_id: '' });
    await loadTasks(selectedSprintId);
  }

  async function handleUpdateTask(taskId: number, update: { status?: string; spent_hours?: number }) {
    setError(null);
    const response = await fetch(`${apiBase}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      setError('No se pudo actualizar la tarea');
      return;
    }

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, ...update } : task)),
    );
  }

  return (
    <main style={{ padding: '3rem', maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{project ? project.name : 'Proyecto'}</h1>
        <p>{project?.description || 'Detalle del proyecto y gestión de sprints y tareas.'}</p>
        <Link href="/projects">Volver a proyectos</Link>
      </header>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : null}

      <section style={{ display: 'grid', gap: '2rem', marginBottom: '2.5rem' }}>
        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Crear sprint</h2>
          <form onSubmit={handleCreateSprint} style={{ display: 'grid', gap: '0.85rem' }}>
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
              />
            </label>
            <label>
              Objetivo
              <textarea
                value={form.goal}
                onChange={(event) => setForm({ ...form, goal: event.target.value })}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
              />
            </label>
            <label>
              Fecha de inicio
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
              />
            </label>
            <label>
              Fecha de fin
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
              />
            </label>
            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
              >
                <option value="PLANNED">PLANNED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </label>
            <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
              Crear sprint
            </button>
          </form>
        </article>

        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Sprints</h2>
          {sprints.length === 0 ? (
            <p>Aún no hay sprints para este proyecto.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <label>
                Sprint activo
                <select
                  value={selectedSprintId ?? ''}
                  onChange={(event) => setSelectedSprintId(Number(event.target.value) || null)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="">Selecciona un sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </label>
              <ul style={{ listStyle: 'none', paddingLeft: 0, gap: '0.75rem' }}>
                {sprints.map((sprint) => (
                  <li key={sprint.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <strong>{sprint.name}</strong>
                    <p style={{ margin: 0 }}>{sprint.goal}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                      {sprint.start_date} — {sprint.end_date || 'sin fecha final'} • {sprint.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </section>

      {selectedSprintId !== null && (
        <section style={{ display: 'grid', gap: '2rem' }}>
          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Crear tarea</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '0.85rem' }}>
              <label>
                Título
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Prioridad
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </label>
              <label>
                Asignar a
                <select
                  value={taskForm.assignee_id}
                  onChange={(event) => setTaskForm({ ...taskForm, assignee_id: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="">Sin asignar</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estimación horas
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskForm.estimate_hours}
                  onChange={(event) => setTaskForm({ ...taskForm, estimate_hours: event.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
                Crear tarea
              </button>
            </form>
          </article>

          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Tareas del sprint</h2>
            {tasks.length === 0 ? (
              <p>No hay tareas para este sprint.</p>
            ) : (
              <ul style={{ listStyle: 'none', paddingLeft: 0, gap: '0.75rem' }}>
                {tasks.map((task) => (
                  <li key={task.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <strong>{task.title}</strong>
                    <p style={{ margin: '0.5rem 0' }}>{task.description}</p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
                          Estado
                          <select
                            value={task.status}
                            onChange={async (event) => {
                              const newStatus = event.target.value;
                              await handleUpdateTask(task.id, { status: newStatus });
                            }}
                            style={{ padding: '0.65rem', marginTop: '0.4rem' }}
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="DONE">DONE</option>
                            <option value="BLOCKED">BLOCKED</option>
                          </select>
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
                          Horas trabajadas
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={task.spent_hours}
                            onChange={(event) => {
                              const spentHours = Number(event.target.value);
                              setTasks((current) =>
                                current.map((t) =>
                                  t.id === task.id
                                    ? {
                                        ...t,
                                        spent_hours: spentHours,
                                      }
                                    : t,
                                ),
                              );
                            }}
                            style={{ padding: '0.65rem', marginTop: '0.4rem' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={async () => await handleUpdateTask(task.id, { status: task.status, spent_hours: task.spent_hours })}
                          style={{ padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, height: 42 }}
                        >
                          Guardar
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#334155' }}>
                          <span>Horas trabajadas: {task.spent_hours}h</span>
                          <span>Estimadas: {task.estimate_hours ?? 0}h</span>
                        </div>
                        <div style={{ height: 10, width: '100%', background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, task.estimate_hours ? (task.spent_hours / task.estimate_hours) * 100 : 0)}%`,
                              height: '100%',
                              background: task.spent_hours >= (task.estimate_hours ?? 0) ? '#16a34a' : '#0284c7',
                              transition: 'width 0.2s ease',
                            }}
                          />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                          Asignada a: {task.assignee_id ? users.find((user) => user.id === task.assignee_id)?.name || users.find((user) => user.id === task.assignee_id)?.email : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
