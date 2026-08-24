import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const { data } = await api.get('/api/auth/me')
        setUser(data)
      } catch (err) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
    setUser(data.user)
    return data.user
  }

  const register = async (formData) => {
    const { data } = await api.post('/api/auth/register', formData)
    localStorage.setItem('token', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const hasRole = (role) => {
    if (!user || !user.roles) return false
    return user.roles.includes(`ROLE_${role}`) || user.roles.includes(role)
  }

  const isProfileIncomplete = user && user.profileComplete === false

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole, loadUser, isProfileIncomplete }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
