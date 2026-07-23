// ============================================================================
// AUTH STORE
// ============================================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { User, LoginCredentials, ChangePasswordData } from '@/types/auth'
import { usePermissionStore } from './permissionStore'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Impersonation state
  const isImpersonating = ref(false)
  const impersonatedUser = ref<User | null>(null)
  const originalToken = ref<string | null>(null)
  const impersonationSessionId = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isOwner = computed(() => user.value?.role === 'owner')
  const isManager = computed(() => user.value?.role === 'manager')
  const isOperator = computed(() => user.value?.role === 'operator')
  const hasRole = computed(() => (roles: string[]) => {
    return user.value?.role ? roles.includes(user.value.role) : false
  })

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      // Store tokens
      localStorage.setItem('access_token', response.session.access_token)
      localStorage.setItem('refresh_token', response.session.refresh_token)
      localStorage.setItem('expires_at', response.session.expires_at.toString())

      // Handle Remember Me
      if (credentials.rememberMe) {
        localStorage.setItem('remembered_email', credentials.email)
      } else {
        localStorage.removeItem('remembered_email')
      }

      // Store user
      user.value = response.user

      // Charger les permissions de l'utilisateur
      const permissionStore = usePermissionStore()
      await permissionStore.fetchUserPermissions(response.user.id)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(skipApiCall = false) {
    loading.value = true

    try {
      // Only call logout API if we have a valid token and not skipping
      if (!skipApiCall && localStorage.getItem('access_token')) {
        await authService.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('expires_at')

      // Clear user
      user.value = null
      
      // Réinitialiser les permissions
      const permissionStore = usePermissionStore()
      permissionStore.reset()
      
      loading.value = false

      // Redirect to login using window.location for reliable navigation
      window.location.href = '/login'
    }
  }

  async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authService.refreshToken(refreshToken)

      // Update tokens
      localStorage.setItem('access_token', response.session.access_token)
      localStorage.setItem('refresh_token', response.session.refresh_token)
      localStorage.setItem('expires_at', response.session.expires_at.toString())

      // Update user
      user.value = response.user

      return response
    } catch (err) {
      // Refresh failed, logout
      await logout()
      throw err
    }
  }

  async function fetchCurrentUser() {
    loading.value = true
    error.value = null

    try {
      const currentUser = await authService.getCurrentUser()
      user.value = currentUser
      
      // Charger les permissions de l'utilisateur
      const permissionStore = usePermissionStore()
      await permissionStore.fetchUserPermissions(currentUser.id)
      
      return currentUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(passwords: ChangePasswordData) {
    loading.value = true
    error.value = null

    try {
      await authService.changePassword(passwords)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password change failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function initializeAuth() {
    const token = localStorage.getItem('access_token')
    const expiresAt = localStorage.getItem('expires_at')

    if (token && expiresAt) {
      const now = Date.now()
      const expiry = parseInt(expiresAt) * 1000

      // Token still valid
      if (now < expiry) {
        fetchCurrentUser().catch(() => {
          // If fetch fails, clear auth
          logout()
        })
      } else {
        // Token expired, try to refresh
        refreshToken().catch(() => {
          logout()
        })
      }
    }
  }

  // Impersonation Actions
  async function impersonate(userId: string) {
    loading.value = true
    error.value = null
    
    try {
      // Sauvegarder le token admin original
      originalToken.value = localStorage.getItem('access_token')
      
      // Appeler l'API d'impersonation
      const response = await authService.impersonate(userId)
      
      // Stocker le nouveau token
      localStorage.setItem('access_token', response.token)
      localStorage.setItem('impersonation_session_id', response.impersonation.session_id)
      
      // Mettre à jour l'état
      isImpersonating.value = true
      impersonatedUser.value = response.user
      impersonationSessionId.value = response.impersonation.session_id
      user.value = response.user
      
      // Charger les permissions de l'utilisateur impersonné
      const permissionStore = usePermissionStore()
      await permissionStore.fetchUserPermissions(response.user.id)
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Impersonation failed'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function stopImpersonation() {
    loading.value = true
    error.value = null
    
    try {
      // Appeler l'API pour arrêter l'impersonation
      const response = await authService.stopImpersonation()
      
      // Restaurer le token admin original
      localStorage.setItem('access_token', response.token)
      localStorage.removeItem('impersonation_session_id')
      
      // Réinitialiser l'état d'impersonation
      isImpersonating.value = false
      impersonatedUser.value = null
      impersonationSessionId.value = null
      originalToken.value = null
      
      // Mettre à jour l'utilisateur
      user.value = response.user
      
      // Recharger les permissions de l'admin
      const permissionStore = usePermissionStore()
      await permissionStore.fetchUserPermissions(response.user.id)
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Stop impersonation failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    loading,
    error,
    // Impersonation state
    isImpersonating,
    impersonatedUser,
    impersonationSessionId,
    // Getters
    isAuthenticated,
    isOwner,
    isManager,
    isOperator,
    hasRole,
    // Actions
    login,
    logout,
    refreshToken,
    fetchCurrentUser,
    changePassword,
    initializeAuth,
    // Impersonation actions
    impersonate,
    stopImpersonation
  }
})
