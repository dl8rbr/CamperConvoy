'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

// Benutzer-Interface
interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

// Auth Context Interface
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
}

// Default Context Werte
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
})

// Hook für einfachen Zugriff auf den Auth Context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Simulierte Benutzer-Datenbank (für Demo-Zwecke)
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'demo@example.com': {
    password: 'password',
    user: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo Benutzer',
      avatar: '🚐',
    },
  },
  'test@example.com': {
    password: 'test123',
    user: {
      id: '2',
      email: 'test@example.com',
      name: 'Test User',
      avatar: '🏕️',
    },
  },
}

// Local Storage Key
const AUTH_STORAGE_KEY = 'camper-convoy-auth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Beim Start: Auth-Status aus LocalStorage laden
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          const parsedUser = JSON.parse(stored) as User
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  // Login-Funktion (simuliert)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulierte Verzögerung für realistische UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const normalizedEmail = email.toLowerCase().trim()
    const demoUser = DEMO_USERS[normalizedEmail]

    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser.user))
      return true
    }

    // Für Demo: Akzeptiere jeden Benutzer mit Passwort "demo"
    if (password === 'demo') {
      const newUser: User = {
        id: Date.now().toString(),
        email: normalizedEmail,
        name: email.split('@')[0],
        avatar: '🚗',
      }
      setUser(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return true
    }

    return false
  }, [])

  // Logout-Funktion
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  // Registrierungs-Funktion (simuliert)
  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulierte Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 500))

    const normalizedEmail = email.toLowerCase().trim()

    // Prüfen ob Benutzer bereits existiert
    if (DEMO_USERS[normalizedEmail]) {
      return false
    }

    // Neuen Benutzer erstellen
    const newUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
      name: name,
      avatar: '🚐',
    }

    setUser(newUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
    return true
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


