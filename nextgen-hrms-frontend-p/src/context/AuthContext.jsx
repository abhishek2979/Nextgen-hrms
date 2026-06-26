import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hrms_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On first load, trust the cached user if a token exists.
    // (A /auth/me call could be added here to re-validate against the backend.)
    setLoading(false)
  }, [])

  const login = useCallback(async (employeeId, password) => {
    const data = await authService.login(employeeId, password)
    const loggedInUser = {
      id: data.id,
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
    }
    localStorage.setItem('hrms_token', data.token)
    localStorage.setItem('hrms_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
