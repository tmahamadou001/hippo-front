/**
 * ============================================================================
 * useRole Composable
 * ============================================================================
 * Composable pour faciliter la gestion des rôles
 * Phase 3 - Frontend
 */

import { computed } from 'vue';
import { usePermissionStore } from '@/stores/permissionStore';

/**
 * Liste des rôles disponibles dans le système
 */
export const ROLES = {
  GEYAVO: 'geyavo',
  OWNER: 'owner',
  MANAGER: 'manager',
  OPERATOR: 'operator'
} as const;

/**
 * Type pour les rôles
 */
export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Composable pour gérer les rôles
 * 
 * @example
 * ```vue
 * <script setup>
 * const { isOwner, isManager, isOperator, isGeyavo, role } = useRole();
 * 
 * if (isOwner.value) {
 *   // L'utilisateur est owner
 * }
 * </script>
 * ```
 */
export function useRole() {
  const permissionStore = usePermissionStore();

  /**
   * Rôle actuel de l'utilisateur
   */
  const role = computed<Role | null>(() => {
    return permissionStore.userRole as Role | null;
  });

  /**
   * Vérifie si l'utilisateur est Geyavo (super admin)
   */
  const isGeyavo = computed(() => {
    return role.value === ROLES.GEYAVO;
  });

  /**
   * Vérifie si l'utilisateur est Owner
   */
  const isOwner = computed(() => {
    return role.value === ROLES.OWNER;
  });

  /**
   * Vérifie si l'utilisateur est Manager
   */
  const isManager = computed(() => {
    return role.value === ROLES.MANAGER;
  });

  /**
   * Vérifie si l'utilisateur est Operator
   */
  const isOperator = computed(() => {
    return role.value === ROLES.OPERATOR;
  });

  /**
   * Vérifie si l'utilisateur est Owner OU Geyavo
   * Utile pour les actions d'administration
   */
  const isAdmin = computed(() => {
    return isOwner.value || isGeyavo.value;
  });

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * 
   * @param roles - Rôle ou liste de rôles à vérifier
   * @returns true si l'utilisateur a le rôle
   * 
   * @example
   * ```ts
   * if (hasRole('owner')) {
   *   // L'utilisateur est owner
   * }
   * 
   * if (hasRole(['owner', 'manager'])) {
   *   // L'utilisateur est owner OU manager
   * }
   * ```
   */
  const hasRole = (roles: Role | Role[]): boolean => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(role.value as Role);
  };

  /**
   * Nom d'affichage du rôle
   */
  const roleName = computed(() => {
    const names: Record<Role, string> = {
      [ROLES.GEYAVO]: 'Super Admin',
      [ROLES.OWNER]: 'Propriétaire',
      [ROLES.MANAGER]: 'Gestionnaire',
      [ROLES.OPERATOR]: 'Opérateur'
    };
    
    return role.value ? names[role.value] : 'Inconnu';
  });

  /**
   * Couleur associée au rôle (pour l'UI)
   */
  const roleColor = computed(() => {
    const colors: Record<Role, string> = {
      [ROLES.GEYAVO]: 'purple',
      [ROLES.OWNER]: 'blue',
      [ROLES.MANAGER]: 'green',
      [ROLES.OPERATOR]: 'gray'
    };
    
    return role.value ? colors[role.value] : 'gray';
  });

  /**
   * Icône associée au rôle (pour l'UI)
   */
  const roleIcon = computed(() => {
    const icons: Record<Role, string> = {
      [ROLES.GEYAVO]: 'shield-check',
      [ROLES.OWNER]: 'crown',
      [ROLES.MANAGER]: 'users',
      [ROLES.OPERATOR]: 'user'
    };
    
    return role.value ? icons[role.value] : 'user';
  });

  return {
    // Propriétés
    role,
    roleName,
    roleColor,
    roleIcon,
    
    // Vérifications de rôle
    isGeyavo,
    isOwner,
    isManager,
    isOperator,
    isAdmin,
    hasRole,
    
    // Constantes
    ROLES
  };
}
