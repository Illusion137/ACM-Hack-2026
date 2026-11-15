import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { User } from './types'

const SESSION_EXPIRED = 'session-expired'

export function expireSession() {
  window.dispatchEvent(new Event(SESSION_EXPIRED))
}

export async function apiRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && path !== 'login') expireSession()
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data as T
}

async function request(path: string, body?: unknown): Promise<User | null> {
  const data = await apiRequest<{ user?: User }>(path, body)
  return data.user ?? null
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request('load-data')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    const on_expired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED, on_expired)
    return () => window.removeEventListener(SESSION_EXPIRED, on_expired)
  }, [])

  const value: AuthState = {
    user,
    loading,
    login: async (email, password) => setUser(await request('login', { email, password })),
    signup: async (name, email, password) => setUser(await request('signup', { name, email, password })),
    logout: async () => {
      await request('logout', {}).catch(() => null)
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}

export function RequireAuth({ children, guest = false }: { children: ReactNode; guest?: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="faint">Loading…</p>
  if (guest && user) return <Navigate to="/home" replace />
  if (!guest && !user) return <Navigate to="/" replace />
  return <>{children}</>
}
