/**
 * ============================================================================
 * Permission Store (Pinia)
 * ============================================================================
 * Gère l'état global des permissions de l'utilisateur connecté
 * Phase 3 - Frontend
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/services/api';

/**
 * Interface pour une permission
 */
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
}

/**
 * Interface pour un groupe de permissions
 */
export interface PermissionGroup {
  id: string;
  name: string;
  description: string | null;
  company_id: string | null;
  is_system: boolean;
}

/**
 * Interface pour le résumé des permissions d'un utilisateur
 */
export interface UserPermissionsSummary {
  role: string;
  rolePermissions: string[];
  groupPermissions: string[];
  customPermissions: { code: string; granted: boolean }[];
  effectivePermissions: string[];
}

export const usePermissionStore = defineStore('permissions', () => {
  // ============================================================================
  // État (State)
  // ============================================================================
  
  /**
   * Liste de toutes les permissions disponibles dans le système
   */
  const allPermissions = ref<Permission[]>([]);
  
  /**
   * Permissions effectives de l'utilisateur connecté
   * Ce sont les permissions réellement actives (rôle + groupes + custom)
   */
  const userPermissions = ref<string[]>([]);
  
  /**
   * Résumé détaillé des permissions de l'utilisateur
   */
  const userPermissionsSummary = ref<UserPermissionsSummary | null>(null);
  
  /**
   * Liste de tous les groupes de permissions
   */
  const permissionGroups = ref<PermissionGroup[]>([]);
  
  /**
   * Indique si les données sont en cours de chargement
   */
  const loading = ref(false);
  
  /**
   * Indique si les permissions ont été chargées au moins une fois
   */
  const initialized = ref(false);

  // ============================================================================
  // Getters (Computed)
  // ============================================================================
  
  /**
   * Vérifie si l'utilisateur est un super admin Geyavo
   * Les utilisateurs Geyavo ont toutes les permissions (wildcard *)
   */
  const isGeyavo = computed(() => {
    // Vérifier d'abord le rôle dans le résumé
    if (userPermissionsSummary.value?.role === 'geyavo') {
      return true;
    }
    // Fallback : vérifier si * est dans les permissions
    return userPermissions.value.includes('*');
  });
  
  /**
   * Récupère le rôle de l'utilisateur
   */
  const userRole = computed(() => {
    return userPermissionsSummary.value?.role || null;
  });
  
  /**
   * Permissions groupées par catégorie
   * Utile pour afficher les permissions de manière organisée
   */
  const permissionsByCategory = computed(() => {
    const grouped: Record<string, Permission[]> = {};
    
    allPermissions.value.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    
    return grouped;
  });

  // ============================================================================
  // Actions
  // ============================================================================
  
  /**
   * Charge toutes les permissions disponibles dans le système
   */
  async function fetchAllPermissions() {
    try {
      loading.value = true;
      const response = await apiClient.get('/permissions');
      allPermissions.value = response.data.permissions;
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Charge les permissions de l'utilisateur connecté
   * @param userId - ID de l'utilisateur
   */
  async function fetchUserPermissions(userId: string) {
    try {
      loading.value = true;
      const response = await apiClient.get(`/permissions/users/${userId}`);
      
      console.log('📊 Permissions reçues du backend:', response.data);
      console.log('👤 Rôle utilisateur:', response.data.role);
      
      // Stocker le résumé complet
      userPermissionsSummary.value = response.data;
      
      // Extraire les codes des permissions effectives (pour un accès rapide)
      // Le backend renvoie maintenant des objets {code, name, description, category}
      if (response.data.effectivePermissions && Array.isArray(response.data.effectivePermissions)) {
        userPermissions.value = response.data.effectivePermissions.map((p: any) => p.code);
        console.log('✅ Permissions extraites:', userPermissions.value);
      } else {
        console.error('❌ effectivePermissions invalide:', response.data.effectivePermissions);
        userPermissions.value = [];
      }
      
      console.log('🔑 isGeyavo:', isGeyavo.value);
      
      initialized.value = true;
    } catch (error) {
      console.error('Erreur lors du chargement des permissions utilisateur:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Charge tous les groupes de permissions
   */
  async function fetchPermissionGroups() {
    try {
      loading.value = true;
      const response = await apiClient.get('/permissions/groups');
      permissionGroups.value = response.data.groups;
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Vérifie si l'utilisateur possède une permission spécifique
   * @param permissionCode - Code de la permission (ex: 'reservations.view')
   * @returns true si l'utilisateur a la permission
   */
  function hasPermission(permissionCode: string): boolean {
    console.log(`🔍 Vérification permission "${permissionCode}":`, {
      isGeyavo: isGeyavo.value,
      userPermissions: userPermissions.value,
      hasIt: userPermissions.value.includes(permissionCode)
    });
    
    // Si Geyavo, toutes les permissions
    if (isGeyavo.value) {
      return true;
    }
    
    // Sinon, vérifier dans la liste des permissions
    return userPermissions.value.includes(permissionCode);
  }
  
  /**
   * Vérifie si l'utilisateur possède AU MOINS UNE des permissions
   * @param permissionCodes - Liste de codes de permissions
   * @returns true si l'utilisateur a au moins une permission
   */
  function hasAnyPermission(permissionCodes: string[]): boolean {
    // Si Geyavo, toutes les permissions
    if (isGeyavo.value) {
      return true;
    }
    
    // Vérifier si au moins une permission est présente
    return permissionCodes.some(code => userPermissions.value.includes(code));
  }
  
  /**
   * Vérifie si l'utilisateur possède TOUTES les permissions
   * @param permissionCodes - Liste de codes de permissions
   * @returns true si l'utilisateur a toutes les permissions
   */
  function hasAllPermissions(permissionCodes: string[]): boolean {
    // Si Geyavo, toutes les permissions
    if (isGeyavo.value) {
      return true;
    }
    
    // Vérifier que toutes les permissions sont présentes
    return permissionCodes.every(code => userPermissions.value.includes(code));
  }
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param roles - Rôle ou liste de rôles
   * @returns true si l'utilisateur a le rôle
   */
  function hasRole(roles: string | string[]): boolean {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(userRole.value || '');
  }
  
  /**
   * Accorde une permission à un utilisateur
   * @param userId - ID de l'utilisateur
   * @param permissionCode - Code de la permission
   */
  async function grantPermission(userId: string, permissionCode: string) {
    try {
      await apiClient.post(`/permissions/users/${userId}`, {
        permissionCode
      });
      
      // Recharger les permissions si c'est l'utilisateur connecté
      if (userPermissionsSummary.value) {
        await fetchUserPermissions(userId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la permission:', error);
      throw error;
    }
  }
  
  /**
   * Révoque une permission d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param permissionCode - Code de la permission
   */
  async function revokePermission(userId: string, permissionCode: string) {
    try {
      await apiClient.delete(`/permissions/users/${userId}/${permissionCode}`);
      
      // Recharger les permissions si c'est l'utilisateur connecté
      if (userPermissionsSummary.value) {
        await fetchUserPermissions(userId);
      }
    } catch (error) {
      console.error('Erreur lors de la révocation de la permission:', error);
      throw error;
    }
  }
  
  /**
   * Assigne un groupe de permissions à un utilisateur
   * @param userId - ID de l'utilisateur
   * @param groupId - ID du groupe
   */
  async function assignGroup(userId: string, groupId: string) {
    try {
      await apiClient.post(`/permissions/users/${userId}/groups/${groupId}`);
      
      // Recharger les permissions si c'est l'utilisateur connecté
      if (userPermissionsSummary.value) {
        await fetchUserPermissions(userId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du groupe:', error);
      throw error;
    }
  }
  
  /**
   * Retire un groupe de permissions d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param groupId - ID du groupe
   */
  async function removeGroup(userId: string, groupId: string) {
    try {
      await apiClient.delete(`/permissions/users/${userId}/groups/${groupId}`);
      
      // Recharger les permissions si c'est l'utilisateur connecté
      if (userPermissionsSummary.value) {
        await fetchUserPermissions(userId);
      }
    } catch (error) {
      console.error('Erreur lors du retrait du groupe:', error);
      throw error;
    }
  }
  
  /**
   * Réinitialise le store (utile lors de la déconnexion)
   */
  function reset() {
    userPermissions.value = [];
    userPermissionsSummary.value = null;
    initialized.value = false;
  }

  // ============================================================================
  // Retour du store
  // ============================================================================
  
  return {
    // État
    allPermissions,
    userPermissions,
    userPermissionsSummary,
    permissionGroups,
    loading,
    initialized,
    
    // Getters
    isGeyavo,
    userRole,
    permissionsByCategory,
    
    // Actions
    fetchAllPermissions,
    fetchUserPermissions,
    fetchPermissionGroups,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    grantPermission,
    revokePermission,
    assignGroup,
    removeGroup,
    reset
  };
});
