// ============================================================================
// NAVIGATION GUARDS
// ============================================================================

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permissionStore'

/**
 * Auth guard - Requires authentication
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('access_token')

  if (!token) {
    // No token, redirect to login
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // If we have a token but no user, try to fetch current user
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      // Failed to fetch user, redirect to login
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // User is authenticated
  next()
}

/**
 * Guest guard - Only for non-authenticated users
 */
export const guestGuard = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('access_token')

  if (!token) {
    // No token, allow access to guest pages
    next()
    return
  }

  // If we have a token, check if user is valid
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
      // User is valid, redirect to dashboard
      next({ name: 'dashboard' })
    } catch (error) {
      // Token invalid, allow access to login
      next()
    }
  } else {
    // Already authenticated, redirect to dashboard
    next({ name: 'dashboard' })
  }
}

/**
 * Role guard - Requires specific roles
 */
export const roleGuard = (allowedRoles: string[]) => {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('access_token')

    if (!token) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // If we have a token but no user, try to fetch current user
    if (!authStore.user) {
      try {
        await authStore.fetchCurrentUser()
      } catch (error) {
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    const userRole = authStore.user?.role

    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role
      next({ name: 'unauthorized' })
    } else {
      next()
    }
  }
}

/**
 * Owner only guard
 */
export const ownerGuard = roleGuard(['owner'])

/**
 * Manager and Owner guard
 */
export const managerGuard = roleGuard(['owner', 'manager'])

/**
 * All authenticated users guard
 */
export const anyAuthGuard = roleGuard(['owner', 'manager', 'operator'])

/**
 * Permission guard - Requires specific permission(s)
 */
export const permissionGuard = (requiredPermissions: string | string[]) => {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const token = localStorage.getItem('access_token')

    if (!token) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // If we have a token but no user, try to fetch current user
    if (!authStore.user) {
      try {
        await authStore.fetchCurrentUser()
      } catch (error) {
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // Attendre que les permissions soient initialisées
    if (!permissionStore.initialized) {
      // Les permissions devraient déjà être chargées par authStore
      // Mais on attend un peu au cas où
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Vérifier les permissions
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions]

    const hasPermission = permissions.some(permission => 
      permissionStore.hasPermission(permission)
    )

    if (!hasPermission) {
      // User doesn't have required permission
      next({ name: 'unauthorized' })
    } else {
      next()
    }
  }
}

/**
 * Geyavo only guard (super admin)
 */
export const geyavoGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const token = localStorage.getItem('access_token')

  if (!token) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // If we have a token but no user, try to fetch current user
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // Vérifier si c'est un super admin Geyavo
  if (!permissionStore.isGeyavo && authStore.user?.role !== 'geyavo') {
    next({ name: 'unauthorized' })
  } else {
    next()
  }
}
