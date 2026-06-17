import type {
  AuthResponse,
  CastContestVoteResponse,
  CommentDto,
  CommentListResponse,
  DailyContestDto,
  GenerateSeaLionRequest,
  PublicUserProfileDto,
  RatingSummaryDto,
  SeaLionDetailDto,
  SeaLionDto,
  SeaLionListResponse,
  UserDto,
  UserSearchResponse,
} from './types'

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

  if (response.status === 204) {
    return undefined as T
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

  generateSeaLion(options?: GenerateSeaLionRequest) {
    return request<SeaLionDto>('/api/sealions/generate', {
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined,
    })
  },

  getRecent(page = 1, pageSize = 12) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    return request<SeaLionListResponse>(`/api/sealions/recent?${params}`)
  },

  getTop(period: 'week' | 'all', limit = 12, minRatings = 1) {
    const params = new URLSearchParams({
      period,
      limit: String(limit),
      minRatings: String(minRatings),
    })
    return request<SeaLionListResponse>(`/api/sealions/top?${params}`)
  },

  getDiscover(limit = 15) {
    const params = new URLSearchParams({ limit: String(limit) })
    return request<SeaLionListResponse>(`/api/sealions/discover?${params}`)
  },

  getMySeaLions() {
    return request<SeaLionListResponse>('/api/sealions/my')
  },

  getSeaLion(id: string) {
    return request<SeaLionDetailDto>(`/api/sealions/${id}`)
  },

  getComments(seaLionId: string) {
    return request<CommentListResponse>(`/api/sealions/${seaLionId}/comments`)
  },

  createComment(seaLionId: string, text: string) {
    return request<CommentDto>(`/api/sealions/${seaLionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },

  updateComment(commentId: string, text: string) {
    return request<CommentDto>(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    })
  },

  deleteComment(commentId: string) {
    return request<void>(`/api/comments/${commentId}`, { method: 'DELETE' })
  },

  upsertRating(seaLionId: string, value: number) {
    return request<RatingSummaryDto>(`/api/sealions/${seaLionId}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
  },

  removeRating(seaLionId: string) {
    return request<RatingSummaryDto>(`/api/sealions/${seaLionId}/rating`, {
      method: 'DELETE',
    })
  },

  searchUsers(query: string, limit = 8) {
    const params = new URLSearchParams({ q: query, limit: String(limit) })
    return request<UserSearchResponse>(`/api/users/search?${params}`)
  },

  getUserProfile(username: string, page = 1, pageSize = 12) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    return request<PublicUserProfileDto>(
      `/api/users/${encodeURIComponent(username)}?${params}`,
    )
  },

  getDailyContest() {
    return request<DailyContestDto>('/api/contests/daily')
  },

  voteDailyContest(seaLionId: string) {
    return request<CastContestVoteResponse>('/api/contests/daily/vote', {
      method: 'POST',
      body: JSON.stringify({ seaLionId }),
    })
  },
}
