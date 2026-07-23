// ============================================================================
// AUTH SERVICE
// ============================================================================

import apiClient from './api'
import type {
  LoginCredentials,
  ChangePasswordData,
  AuthResponse,
  User,
  ApiResponse
} from '@/types/auth'

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    )
    return data.data!
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refresh_token: refreshToken
    })
    return data.data!
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
    return data.data!
  },

  /**
   * Change password
   */
  async changePassword(passwords: ChangePasswordData): Promise<void> {
    await apiClient.post('/auth/change-password', passwords)
  },

  /**
   * Impersonate a user (Geyavo admin only)
   */
  async impersonate(userId: string): Promise<any> {
    const { data } = await apiClient.post(`/users/${userId}/impersonate`)
    return data
  },

  /**
   * Stop impersonation and return to admin account
   */
  async stopImpersonation(): Promise<any> {
    const { data } = await apiClient.post('/users/stop-impersonate')
    return data
  }
}

export default authService
