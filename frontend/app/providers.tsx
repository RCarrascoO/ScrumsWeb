'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type User = {
  id: number
  name?: string
  email: string
  role: string
  created_at: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('scrumsweb_token') : null
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('scrumsweb_user') : null
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const saveAuth = (tokenValue: string, userValue: User) => {
    setToken(tokenValue)
    setUser(userValue)
    localStorage.setItem('scrumsweb_token', tokenValue)
    localStorage.setItem('scrumsweb_user', JSON.stringify(userValue))
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('scrumsweb_token')
    localStorage.removeItem('scrumsweb_user')
  }

  const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers ?? undefined)
    headers.set('Content-Type', 'application/json')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(input, { ...init, headers })
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${apiBase}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    })

    if (!response.ok) {
      throw new Error('Email o contraseña incorrectos')
    }

    const data = await response.json()
    const meResponse = await fetch(`${apiBase}/users/me`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    })
    if (!meResponse.ok) {
      throw new Error('No se pudo obtener el usuario autenticado')
    }

    const userData = await meResponse.json()
    saveAuth(data.access_token, userData)
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await fetch(`${apiBase}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    if (!response.ok) {
      throw new Error('No se pudo crear el usuario')
    }
    await login(email, password)
  }

  const logout = () => {
    clearAuth()
  }

  const value = useMemo(
    () => ({ user, token, login, register, logout, authFetch }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
