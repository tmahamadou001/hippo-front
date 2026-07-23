# 🎨 Guide d'Utilisation - Système de Permissions Frontend

## 📋 Vue d'ensemble

Ce guide explique comment utiliser le système de permissions dans vos composants Vue.

**Phase 3** : Store Pinia + Composables + Directives

---

## 🚀 Installation

### Étape 1 : Enregistrer le store et la directive

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { permissionDirective } from '@/directives/permission';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(permissionDirective);  // Enregistre la directive v-permission

app.mount('#app');
```

### Étape 2 : Chargement automatique des permissions ✅

**Les permissions sont maintenant chargées automatiquement !**

Le `authStore` charge automatiquement les permissions dans les cas suivants :
- ✅ Après un login réussi
- ✅ Lors de la restauration de session (refresh de page)
- ✅ Après un refresh token

**Aucune action manuelle n'est requise !**

```typescript
// Le code suivant est déjà intégré dans authStore.ts
// Vous n'avez RIEN à faire manuellement

// 1. Lors du login
await authStore.login(credentials)
// → Les permissions sont automatiquement chargées

// 2. Lors de l'initialisation de l'app
authStore.initializeAuth()
// → Si une session existe, les permissions sont chargées

// 3. Lors du logout
await authStore.logout()
// → Les permissions sont automatiquement réinitialisées
```

### Étape 3 : Charger toutes les permissions (optionnel)

Pour les interfaces d'administration (gestion des permissions), vous pouvez charger toutes les permissions disponibles :

```typescript
import { usePermissionStore } from '@/stores/permissionStore';

const permissionStore = usePermissionStore();

// Charger toutes les permissions du système
await permissionStore.fetchAllPermissions();

// Charger tous les groupes de permissions
await permissionStore.fetchPermissionGroups();
```

---

## 📦 1. Utiliser le Store Pinia

### Import

```typescript
import { usePermissionStore } from '@/stores/permissionStore';
```

### Exemple complet

```vue
<script setup lang="ts">
import { usePermissionStore } from '@/stores/permissionStore';

const permissionStore = usePermissionStore();

// Vérifier une permission
if (permissionStore.hasPermission('reservations.delete')) {
  console.log('Peut supprimer des réservations');
}

// Vérifier plusieurs permissions (OU)
if (permissionStore.hasAnyPermission(['reservations.update', 'reservations.confirm'])) {
  console.log('Peut modifier OU confirmer');
}

// Vérifier plusieurs permissions (ET)
if (permissionStore.hasAllPermissions(['reservations.view', 'reservations.export'])) {
  console.log('Peut voir ET exporter');
}

// Vérifier le rôle
if (permissionStore.hasRole('owner')) {
  console.log('Est propriétaire');
}

// Vérifier si Geyavo (super admin)
if (permissionStore.isGeyavo) {
  console.log('Super admin avec toutes les permissions');
}
</script>
```

---

## 🎣 2. Utiliser le Composable `usePermissions`

### Import

```typescript
import { usePermissions } from '@/composables/usePermissions';
```

### Exemple simple

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { can, canAny, canAll, isGeyavo, userRole } = usePermissions();

// Vérifier une permission
const canDelete = can('reservations.delete');

// Vérifier plusieurs permissions
const canModify = canAny(['reservations.update', 'reservations.confirm']);

// Afficher le rôle
console.log('Rôle:', userRole.value);
</script>

<template>
  <div>
    <!-- Affichage conditionnel -->
    <button v-if="canDelete">Supprimer</button>
    
    <!-- Badge de rôle -->
    <span v-if="isGeyavo" class="badge">Super Admin</span>
  </div>
</template>
```

### Exemple avec fonction `canAccess`

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { canAccess } = usePermissions();

// Vérifier permission + rôle
const canDeleteUser = canAccess('users.delete', ['owner', 'geyavo']);
</script>

<template>
  <button v-if="canDeleteUser">
    Supprimer l'utilisateur
  </button>
</template>
```

---

## 🎯 3. Utiliser la Directive `v-permission`

La directive `v-permission` cache automatiquement les éléments si l'utilisateur n'a pas la permission.

### Syntaxe simple (une permission)

```vue
<template>
  <!-- Affiche le bouton seulement si l'utilisateur peut supprimer -->
  <button v-permission="'reservations.delete'">
    Supprimer
  </button>
</template>
```

### Syntaxe avec plusieurs permissions (mode "any")

```vue
<template>
  <!-- Affiche si l'utilisateur a AU MOINS UNE permission -->
  <button v-permission="['reservations.update', 'reservations.confirm']">
    Modifier
  </button>
</template>
```

### Syntaxe avec mode "all"

```vue
<template>
  <!-- Affiche si l'utilisateur a TOUTES les permissions -->
  <button v-permission="{ 
    permission: ['reservations.view', 'reservations.export'], 
    mode: 'all' 
  }">
    Exporter
  </button>
</template>
```

### Syntaxe avec vérification de rôle

```vue
<template>
  <!-- Affiche si l'utilisateur a la permission ET le bon rôle -->
  <button v-permission="{ 
    permission: 'users.delete', 
    role: ['owner', 'geyavo'] 
  }">
    Supprimer utilisateur
  </button>
</template>
```

### Exemple complet dans un composant

```vue
<template>
  <div class="actions">
    <!-- Bouton visible pour tous ceux qui peuvent voir -->
    <button 
      v-permission="'reservations.view'"
      @click="viewReservation"
    >
      Voir
    </button>

    <!-- Bouton visible pour ceux qui peuvent modifier OU confirmer -->
    <button 
      v-permission="['reservations.update', 'reservations.confirm']"
      @click="editReservation"
    >
      Modifier
    </button>

    <!-- Bouton visible seulement pour owner et geyavo -->
    <button 
      v-permission="{ permission: 'reservations.delete', role: ['owner', 'geyavo'] }"
      @click="deleteReservation"
      class="btn-danger"
    >
      Supprimer
    </button>

    <!-- Section visible seulement pour les admins -->
    <div v-permission="{ role: ['owner', 'geyavo'] }">
      <h3>Section Admin</h3>
      <p>Contenu réservé aux administrateurs</p>
    </div>
  </div>
</template>
```

---

## 👤 4. Utiliser le Composable `useRole`

### Import

```typescript
import { useRole, ROLES } from '@/composables/useRole';
```

### Exemple complet

```vue
<script setup lang="ts">
import { useRole, ROLES } from '@/composables/useRole';

const { 
  role, 
  roleName, 
  roleColor, 
  roleIcon,
  isGeyavo, 
  isOwner, 
  isManager, 
  isOperator,
  isAdmin 
} = useRole();

// Vérifier le rôle
if (isOwner.value) {
  console.log('Utilisateur est propriétaire');
}

// Vérifier si admin (owner ou geyavo)
if (isAdmin.value) {
  console.log('Utilisateur est administrateur');
}
</script>

<template>
  <div>
    <!-- Badge de rôle avec couleur -->
    <span :class="`badge badge-${roleColor}`">
      {{ roleName }}
    </span>

    <!-- Affichage conditionnel par rôle -->
    <div v-if="isGeyavo">
      <h2>Panneau Super Admin</h2>
    </div>

    <div v-else-if="isOwner">
      <h2>Panneau Propriétaire</h2>
    </div>

    <div v-else-if="isManager">
      <h2>Panneau Gestionnaire</h2>
    </div>

    <div v-else>
      <h2>Panneau Opérateur</h2>
    </div>
  </div>
</template>
```

---

## 🎨 5. Exemples d'Utilisation Réels

### Exemple 1 : Liste de réservations avec actions

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { can } = usePermissions();

interface Reservation {
  id: string;
  passenger: string;
  status: string;
}

const reservations = ref<Reservation[]>([]);

function viewReservation(id: string) {
  // Logique de visualisation
}

function editReservation(id: string) {
  // Logique de modification
}

function deleteReservation(id: string) {
  // Logique de suppression
}
</script>

<template>
  <div class="reservations-list">
    <div v-for="reservation in reservations" :key="reservation.id" class="reservation-card">
      <h3>{{ reservation.passenger }}</h3>
      <p>Statut: {{ reservation.status }}</p>

      <div class="actions">
        <!-- Bouton Voir (toujours visible si permission) -->
        <button 
          v-permission="'reservations.view'"
          @click="viewReservation(reservation.id)"
        >
          Voir
        </button>

        <!-- Bouton Modifier -->
        <button 
          v-permission="'reservations.update'"
          @click="editReservation(reservation.id)"
        >
          Modifier
        </button>

        <!-- Bouton Supprimer (seulement owner/geyavo) -->
        <button 
          v-permission="{ permission: 'reservations.delete', role: ['owner', 'geyavo'] }"
          @click="deleteReservation(reservation.id)"
          class="btn-danger"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>
```

### Exemple 2 : Menu de navigation avec permissions

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';
import { useRole } from '@/composables/useRole';

const { can } = usePermissions();
const { isGeyavo } = useRole();
</script>

<template>
  <nav class="sidebar">
    <!-- Tableau de bord (toujours visible) -->
    <router-link to="/dashboard">
      Tableau de bord
    </router-link>

    <!-- Réservations -->
    <router-link 
      v-permission="'reservations.view'"
      to="/reservations"
    >
      Réservations
    </router-link>

    <!-- Véhicules -->
    <router-link 
      v-permission="'vehicles.view'"
      to="/vehicles"
    >
      Véhicules
    </router-link>

    <!-- Utilisateurs (seulement owner/geyavo) -->
    <router-link 
      v-permission="{ permission: 'users.view', role: ['owner', 'geyavo'] }"
      to="/users"
    >
      Utilisateurs
    </router-link>

    <!-- Compagnies (seulement Geyavo) -->
    <router-link 
      v-if="isGeyavo"
      to="/companies"
    >
      Compagnies
    </router-link>

    <!-- Rapports -->
    <router-link 
      v-permission="'reports.view'"
      to="/reports"
    >
      Rapports
    </router-link>
  </nav>
</template>
```

### Exemple 3 : Formulaire avec champs conditionnels

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { can } = usePermissions();

const form = ref({
  passenger: '',
  price: 0,
  discount: 0,
  internalNotes: ''
});
</script>

<template>
  <form>
    <!-- Champ passager (toujours visible) -->
    <div class="form-group">
      <label>Passager</label>
      <input v-model="form.passenger" type="text" />
    </div>

    <!-- Champ prix (visible si peut créer/modifier) -->
    <div 
      v-permission="['reservations.create', 'reservations.update']"
      class="form-group"
    >
      <label>Prix</label>
      <input v-model="form.price" type="number" />
    </div>

    <!-- Champ réduction (seulement manager/owner/geyavo) -->
    <div 
      v-permission="{ role: ['manager', 'owner', 'geyavo'] }"
      class="form-group"
    >
      <label>Réduction</label>
      <input v-model="form.discount" type="number" />
    </div>

    <!-- Notes internes (seulement owner/geyavo) -->
    <div 
      v-permission="{ role: ['owner', 'geyavo'] }"
      class="form-group"
    >
      <label>Notes internes</label>
      <textarea v-model="form.internalNotes"></textarea>
    </div>
  </form>
</template>
```

---

## 🔒 6. Protection des Routes

### Exemple avec Vue Router

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { usePermissionStore } from '@/stores/permissionStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/reservations',
      component: () => import('@/views/ReservationsView.vue'),
      meta: { 
        requiresAuth: true,
        permission: 'reservations.view'
      }
    },
    {
      path: '/users',
      component: () => import('@/views/UsersView.vue'),
      meta: { 
        requiresAuth: true,
        permission: 'users.view',
        roles: ['owner', 'geyavo']
      }
    }
  ]
});

// Guard de navigation
router.beforeEach((to, from, next) => {
  const permissionStore = usePermissionStore();
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth && !permissionStore.initialized) {
    return next('/login');
  }
  
  // Vérifier la permission
  if (to.meta.permission) {
    const hasPermission = permissionStore.hasPermission(to.meta.permission as string);
    
    if (!hasPermission) {
      return next('/403'); // Page d'accès refusé
    }
  }
  
  // Vérifier le rôle
  if (to.meta.roles) {
    const hasRole = permissionStore.hasRole(to.meta.roles as string[]);
    
    if (!hasRole) {
      return next('/403');
    }
  }
  
  next();
});

export default router;
```

---

## ✅ Bonnes Pratiques

1. **Charger les permissions au login** : Toujours charger les permissions après l'authentification
2. **Utiliser la directive pour l'UI** : Préférer `v-permission` pour cacher/afficher des éléments
3. **Utiliser le composable pour la logique** : Utiliser `usePermissions()` dans les fonctions
4. **Protéger les routes** : Ajouter des guards sur les routes sensibles
5. **Vérifier côté backend** : Ne jamais faire confiance uniquement au frontend

---

**Documentation créée le** : 11 novembre 2025  
**Version** : 1.0  
**Phase** : 3 - Frontend
