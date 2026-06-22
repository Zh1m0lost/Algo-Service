export interface AuthUser {
  id: string
  name: string
  login: string
  avatar_url: string | null
  group_id: string | null
  roles: string[]
  role: 'student' | 'teacher' | 'admin' | null
  balance: number
}

const TOKEN_KEY = 'auth_token'

/**
 * Состояние авторизации: токен (в localStorage) + профиль пользователя.
 * Используется страницей входа, layout'ами и глобальным middleware.
 */
export function useAuth() {
  const user  = useState<AuthUser | null>('auth_user', () => null)
  const token = useState<string | null>('auth_token', () =>
    import.meta.client ? localStorage.getItem(TOKEN_KEY) : null,
  )

  const isAuthenticated = computed(() => !!token.value)

  function setToken(value: string | null) {
    token.value = value
    if (import.meta.client) {
      if (value) localStorage.setItem(TOKEN_KEY, value)
      else localStorage.removeItem(TOKEN_KEY)
    }
  }

  /** Домашняя страница по роли. */
  function homePath(role: string | null = user.value?.role ?? null): string {
    switch (role) {
      case 'admin':   return '/admin'
      case 'teacher': return '/teacher'
      case 'student': return '/student'
      default:        return '/auth/login'
    }
  }

  async function login(loginValue: string, password: string): Promise<AuthUser> {
    const res = await useApi()<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { login: loginValue, password },
    })
    setToken(res.token)
    user.value = res.user
    return res.user
  }

  async function fetchMe(): Promise<AuthUser | null> {
    if (!token.value) return null
    try {
      user.value = await useApi()<AuthUser>('/auth/me')
      return user.value
    } catch {
      setToken(null)
      user.value = null
      return null
    }
  }

  async function logout(): Promise<void> {
    try {
      await useApi()('/auth/logout', { method: 'POST' })
    } catch {
      // токен мог истечь — выходим в любом случае
    }
    setToken(null)
    user.value = null
  }

  return { user, token, isAuthenticated, homePath, login, fetchMe, logout, setToken }
}
