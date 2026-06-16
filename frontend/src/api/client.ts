import type { AuthResponse, SeaLionDto, SeaLionListResponse, UserDto } from './types'

const TOKEN_KEY = 'navy_seal_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(path, { ...options, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `Ошибка ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  register(username: string, email: string, password: string) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  },

  login(username: string, password: string) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  me() {
    return request<UserDto>('/api/auth/me')
  },

  generateSeaLion() {
    return request<SeaLionDto>('/api/sealions/generate', { method: 'POST' })
  },

  getRecent(limit = 12) {
    return request<SeaLionListResponse>(`/api/sealions/recent?limit=${limit}`)
  },

  getMySeaLions() {
    return request<SeaLionListResponse>('/api/sealions/my')
  },
}
