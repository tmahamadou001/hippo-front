// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  role?: string
  company_id?: string
  profile?: UserProfile | null
}

export interface UserProfile {
  id: string
  email: string
  company_id: string | null
  role: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
}

export interface AuthResponse {
  user: User
  session: AuthSession
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  code?: string
}
