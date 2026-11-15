import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, refreshAccessToken, setAccessToken, setOnAuthFailure } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while we check for an existing session

  // On first load: if the refresh cookie is still valid, get a new access token and the profile.
  // This is how the user stays logged in after a page reload.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshAccessToken()
        const data = await api('/auth/me')
        if (!cancelled) setUser(data.user)
      } catch {
        // not logged in - that is fine
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // If a refresh ever fails mid-session, api/client calls this so the UI logs out.
  useEffect(() => {
    setOnAuthFailure(() => setUser(null))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  const register = useCallback(
    (form) => api('/auth/register', { method: 'POST', body: form }),
    []
  )

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // even if the server call fails, clear the local session
    }
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
