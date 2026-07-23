/**
 * ============================================================================
 * v-permission Directive
 * ============================================================================
 * Directive Vue pour afficher/cacher des éléments selon les permissions
 * Phase 3 - Frontend
 */

import type { Directive, DirectiveBinding } from 'vue';
import { usePermissionStore } from '@/stores/permissionStore';

/**
 * Type pour les valeurs de la directive
 */
type PermissionValue = string | string[] | {
  permission?: string | string[];
  mode?: 'any' | 'all';
  role?: string | string[];
};

/**
 * Directive v-permission
 * 
 * Permet de cacher automatiquement un élément si l'utilisateur n'a pas la permission
 * 
 * @example
 * ```vue
 * <!-- Affiche le bouton seulement si l'utilisateur peut supprimer -->
 * <button v-permission="'reservations.delete'">Supprimer</button>
 * 
 * <!-- Affiche si l'utilisateur a AU MOINS UNE permission -->
 * <button v-permission="['reservations.update', 'reservations.confirm']">
 *   Modifier
 * </button>
 * 
 * <!-- Affiche si l'utilisateur a TOUTES les permissions -->
 * <button v-permission="{ permission: ['reservations.view', 'reservations.export'], mode: 'all' }">
 *   Exporter
 * </button>
 * 
 * <!-- Affiche si l'utilisateur a la permission ET le bon rôle -->
 * <button v-permission="{ permission: 'users.delete', role: ['owner', 'geyavo'] }">
 *   Supprimer utilisateur
 * </button>
 * ```
 */
export const vPermission: Directive = {
  /**
   * Appelé quand l'élément est monté dans le DOM
   */
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    checkPermission(el, binding);
  },

  /**
   * Appelé quand la valeur de la directive change
   */
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    checkPermission(el, binding);
  }
};

/**
 * Vérifie les permissions et cache/affiche l'élément
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
  const permissionStore = usePermissionStore();
  const value = binding.value;

  // Si pas de valeur, on affiche l'élément
  if (!value) {
    showElement(el);
    return;
  }

  let hasPermission = false;

  // Cas 1: Valeur simple (string) - une seule permission
  if (typeof value === 'string') {
    hasPermission = permissionStore.hasPermission(value);
  }
  
  // Cas 2: Array de permissions - mode "any" par défaut
  else if (Array.isArray(value)) {
    hasPermission = permissionStore.hasAnyPermission(value);
  }
  
  // Cas 3: Objet avec options avancées
  else if (typeof value === 'object') {
    const { permission, mode = 'any', role } = value;

    // Vérifier les permissions
    if (permission) {
      if (typeof permission === 'string') {
        hasPermission = permissionStore.hasPermission(permission);
      } else if (Array.isArray(permission)) {
        hasPermission = mode === 'all'
          ? permissionStore.hasAllPermissions(permission)
          : permissionStore.hasAnyPermission(permission);
      }
    } else {
      // Si pas de permission spécifiée, on considère que c'est ok
      hasPermission = true;
    }

    // Vérifier le rôle (si spécifié)
    if (hasPermission && role) {
      hasPermission = permissionStore.hasRole(role);
    }
  }

  // Afficher ou cacher l'élément selon le résultat
  if (hasPermission) {
    showElement(el);
  } else {
    hideElement(el);
  }
}

/**
 * Cache un élément du DOM
 */
function hideElement(el: HTMLElement) {
  // Sauvegarder le display original si pas déjà fait
  if (!el.dataset.originalDisplay) {
    el.dataset.originalDisplay = el.style.display || '';
  }
  
  // Cacher l'élément
  el.style.display = 'none';
}

/**
 * Affiche un élément du DOM
 */
function showElement(el: HTMLElement) {
  // Restaurer le display original
  if (el.dataset.originalDisplay !== undefined) {
    el.style.display = el.dataset.originalDisplay;
  } else {
    el.style.display = '';
  }
}

/**
 * Plugin pour enregistrer la directive globalement
 * 
 * @example
 * ```ts
 * // main.ts
 * import { permissionDirective } from '@/directives/permission';
 * 
 * app.use(permissionDirective);
 * ```
 */
export const permissionDirective = {
  install(app: any) {
    app.directive('permission', vPermission);
  }
};

export default vPermission;
