'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useAuth } from '../providers'

type RoleOption = {
  value: string
  label: string
}

const roleOptions: RoleOption[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'SCRUM_MASTER', label: 'Scrum Master' },
  { value: 'PRODUCT_OWNER', label: 'Product Owner' },
  { value: 'DEVELOPER', label: 'Desarrollador' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('DEVELOPER')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          throw new Error('Todos los campos son obligatorios para registrarse')
        }
        await register(name, email, password, role)
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email y contraseña son obligatorios')
        }
        await login(email, password)
      }
      router.push('/projects')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al autenticar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{isRegister ? 'Registrar usuario' : 'Iniciar sesión'}</h1>
        <p>{isRegister ? 'Crea una cuenta para acceder a la aplicación Scrum.' : 'Accede con tu email y contraseña.'}</p>
      </header>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {isRegister ? (
          <label>
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ width: '100%', padding: '0.9rem', marginTop: '0.4rem' }}
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.4rem' }}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.4rem' }}
          />
        </label>

        {isRegister ? (
          <label>
            Rol
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              style={{ width: '100%', padding: '0.9rem', marginTop: '0.4rem' }}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '1rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer' }}
        >
          {loading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Ingresar'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Registrarme'}
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/" style={{ color: '#0f172a', textDecoration: 'underline' }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
