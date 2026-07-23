// ============================================================================
// API CLIENT
// ============================================================================

import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1-admin'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Don't retry for login, logout, or refresh endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/logout') ||
                          originalRequest.url?.includes('/auth/refresh')

    // If 401 and not already retried and not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const authStore = useAuthStore()
        const refreshToken = localStorage.getItem('refresh_token')
        
        // Only try to refresh if we have a refresh token
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        await authStore.refreshToken()

        // Retry original request with new token
        const token = localStorage.getItem('access_token')
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('expires_at')
        
        // Redirect to login without calling logout API
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
