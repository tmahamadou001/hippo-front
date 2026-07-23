/**
 * ============================================================================
 * usePermissions Composable
 * ============================================================================
 * Composable pour faciliter l'utilisation des permissions dans les composants
 * Phase 3 - Frontend
 */

import { computed } from 'vue';
import { usePermissionStore } from '@/stores/permissionStore';

/**
 * Composable pour gérer les permissions
 * 
 * @example
 * ```vue
 * <script setup>
 * const { can, canAny, canAll, isGeyavo, userRole } = usePermissions();
 * 
 * // Vérifier une permission
 * if (can('reservations.delete')) {
 *   // Afficher le bouton supprimer
 * }
 * </script>
 * ```
 */
export function usePermissions() {
  // Récupérer le store des permissions
  const permissionStore = usePermissionStore();

  /**
   * Vérifie si l'utilisateur possède une permission
   * 
   * @param permission - Code de la permission (ex: 'reservations.view')
   * @returns true si l'utilisateur a la permission
   * 
   * @example
   * ```ts
   * if (can('reservations.create')) {
   *   // L'utilisateur peut créer des réservations
   * }
   * ```
   */
  const can = (permission: string): boolean => {
    return permissionStore.hasPermission(permission);
  };

  /**
   * Vérifie si l'utilisateur possède AU MOINS UNE des permissions
   * 
   * @param permissions - Liste de codes de permissions
   * @returns true si l'utilisateur a au moins une permission
   * 
   * @example
   * ```ts
   * if (canAny(['reservations.update', 'reservations.confirm'])) {
   *   // L'utilisateur peut modifier OU confirmer des réservations
   * }
   * ```
   */
  const canAny = (permissions: string[]): boolean => {
    return permissionStore.hasAnyPermission(permissions);
  };

  /**
   * Vérifie si l'utilisateur possède TOUTES les permissions
   * 
   * @param permissions - Liste de codes de permissions
   * @returns true si l'utilisateur a toutes les permissions
   * 
   * @example
   * ```ts
   * if (canAll(['reservations.view', 'reservations.export'])) {
   *   // L'utilisateur peut voir ET exporter des réservations
   * }
   * ```
   */
  const canAll = (permissions: string[]): boolean => {
    return permissionStore.hasAllPermissions(permissions);
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * 
   * @param roles - Rôle ou liste de rôles
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
  const hasRole = (roles: string | string[]): boolean => {
    return permissionStore.hasRole(roles);
  };

  /**
   * Indique si l'utilisateur est un super admin Geyavo
   * Les utilisateurs Geyavo ont toutes les permissions
   */
  const isGeyavo = computed(() => permissionStore.isGeyavo);

  /**
   * Rôle de l'utilisateur connecté
   */
  const userRole = computed(() => permissionStore.userRole);

  /**
   * Permissions effectives de l'utilisateur
   */
  const permissions = computed(() => permissionStore.userPermissions);

  /**
   * Résumé détaillé des permissions
   */
  const permissionsSummary = computed(() => permissionStore.userPermissionsSummary);

  /**
   * Indique si les permissions sont en cours de chargement
   */
  const loading = computed(() => permissionStore.loading);

  /**
   * Indique si les permissions ont été initialisées
   */
  const initialized = computed(() => permissionStore.initialized);

  /**
   * Charge les permissions de l'utilisateur connecté
   * 
   * @param userId - ID de l'utilisateur
   * 
   * @example
   * ```ts
   * await loadPermissions(currentUser.id);
   * ```
   */
  const loadPermissions = async (userId: string) => {
    await permissionStore.fetchUserPermissions(userId);
  };

  /**
   * Vérifie si l'utilisateur peut accéder à une ressource
   * Combine la vérification de permission et de rôle
   * 
   * @param permission - Permission requise
   * @param allowedRoles - Rôles autorisés (optionnel)
   * @returns true si l'utilisateur peut accéder
   * 
   * @example
   * ```ts
   * if (canAccess('users.delete', ['owner', 'geyavo'])) {
   *   // L'utilisateur peut supprimer ET a le bon rôle
   * }
   * ```
   */
  const canAccess = (permission: string, allowedRoles?: string[]): boolean => {
    const hasPermission = can(permission);
    
    if (!allowedRoles) {
      return hasPermission;
    }
    
    return hasPermission && hasRole(allowedRoles);
  };

  // Retourner toutes les fonctions et propriétés utiles
  return {
    // Fonctions de vérification
    can,
    canAny,
    canAll,
    hasRole,
    canAccess,
    
    // Propriétés réactives
    isGeyavo,
    userRole,
    permissions,
    permissionsSummary,
    loading,
    initialized,
    
    // Actions
    loadPermissions
  };
}
