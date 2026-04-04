'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers'

type Team = {
  id: number
  name: string
  description?: string
}

type Project = {
  id: number
  name: string
  description?: string
  team_id?: number
}

export default function ProjectsPage() {
  const router = useRouter()
  const { user, authFetch, logout } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canManage = user?.role !== 'DEVELOPER'

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user])

  async function loadData() {
    try {
      const [teamRes, projectRes] = await Promise.all([
        authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/teams`),
        authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects`),
      ])

      if (!teamRes.ok || !projectRes.ok) {
        throw new Error('No se pueden cargar equipos o proyectos')
      }

      setTeams(await teamRes.json())
      setProjects(await projectRes.json())
    } catch (err) {
      setError('Error al cargar datos del backend')
    }
  }

  async function handleCreateTeam(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!teamName.trim()) {
      setError('El nombre del equipo es obligatorio')
      return
    }

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: teamName, description: teamDescription }),
    })

    if (!response.ok) {
      setError('No se pudo crear el equipo')
      return
    }

    setTeamName('')
    setTeamDescription('')
    await loadData()
  }

  async function handleCreateProject(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!projectName.trim() || selectedTeam === null) {
      setError('Debe ingresar nombre de proyecto y seleccionar un equipo')
      return
    }

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/projects`, {
      method: 'POST',
      body: JSON.stringify({
        name: projectName,
        description: projectDescription,
        team_id: selectedTeam,
      }),
    })

    if (!response.ok) {
      setError('No se pudo crear el proyecto')
      return
    }

    setProjectName('')
    setProjectDescription('')
    await loadData()
  }

  return (
    <main style={{ padding: '3rem', maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <div>
            <h1>Proyectos</h1>
            <p>Gestiona proyectos y equipos según tu rol.</p>
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
        <Link href="/">Volver al inicio</Link>
      </header>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : null}

      {canManage ? (
        <section style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Crear equipo</h2>
            <form onSubmit={handleCreateTeam} style={{ display: 'grid', gap: '0.85rem' }}>
              <label>
                Nombre
                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={teamDescription}
                  onChange={(event) => setTeamDescription(event.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
                Crear equipo
              </button>
            </form>
          </article>

          <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h2>Crear proyecto</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'grid', gap: '0.85rem' }}>
              <label>
                Nombre
                <input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                />
              </label>
              <label>
                Equipo
                <select
                  value={selectedTeam ?? ''}
                  onChange={(event) => setSelectedTeam(Number(event.target.value) || null)}
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.4rem' }}
                >
                  <option value="">Selecciona un equipo</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" style={{ padding: '0.9rem 1.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8 }}>
                Crear proyecto
              </button>
            </form>
          </article>
        </section>
      ) : (
        <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 12, background: '#eef2ff', color: '#3730a3' }}>
          <strong>Modo desarrollador:</strong> solo puedes ver los proyectos existentes y acceder a tus tareas asignadas.
        </div>
      )}

      <section style={{ display: 'grid', gap: '2rem' }}>
        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Equipos</h2>
          {teams.length === 0 ? (
            <p>No hay equipos creados aún.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0, gap: '0.75rem' }}>
              {teams.map((team) => (
                <li key={team.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <strong>{team.name}</strong>
                  <p style={{ margin: 0 }}>{team.description}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h2>Proyectos</h2>
          {projects.length === 0 ? (
            <p>No hay proyectos creados aún.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0, gap: '0.75rem' }}>
              {projects.map((project) => (
                <li key={project.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <Link href={`/projects/${project.id}`} style={{ fontWeight: '700', color: '#0f172a' }}>
                    {project.name}
                  </Link>
                  <p style={{ margin: 0 }}>{project.description}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  )
}
