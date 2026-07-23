# 🎨 Phase 4 - Guide des Interfaces UI

## 📋 Vue d'ensemble

Ce document décrit les interfaces UI créées pour la gestion des permissions.

**Phase 4** : Frontend UI - Interfaces de gestion

---

## ✅ Composants Créés

### 1. **UsersManagementView.vue** ✅

**Chemin** : `frontend/src/views/UsersManagementView.vue`

**Description** : Vue principale de gestion des utilisateurs

**Fonctionnalités** :
- ✅ Liste de tous les utilisateurs de la compagnie
- ✅ Recherche par nom/email
- ✅ Filtrage par rôle
- ✅ Affichage conditionnel selon les permissions
- ✅ Actions : Voir permissions, Modifier, Supprimer
- ✅ Badge de rôle avec couleurs
- ✅ Avatar avec initiales

**Permissions utilisées** :
- `users.view` - Voir la liste
- `users.create` - Bouton créer
- `users.update` - Bouton modifier
- `users.delete` - Bouton supprimer (owner/geyavo uniquement)

---

### 2. **UserPermissionsModal.vue** ✅

**Chemin** : `frontend/src/components/users/UserPermissionsModal.vue`

**Description** : Modal de gestion des permissions d'un utilisateur

**Fonctionnalités** :
- ✅ Résumé des permissions (rôle, groupes, custom, total)
- ✅ 3 onglets : Permissions, Groupes, Personnalisées
- ✅ **Onglet Permissions** : Liste toutes les permissions par catégorie avec indicateur actif/inactif
- ✅ **Onglet Groupes** : Liste des groupes assignés + bouton ajouter/retirer
- ✅ **Onglet Personnalisées** : Liste des permissions accordées/révoquées manuellement
- ✅ Actions : Accorder, Révoquer, Retirer groupe

**Permissions utilisées** :
- `users.manage_permissions` - Toutes les actions de modification

---

## 📦 Composants à Créer

Les composants suivants doivent être créés pour compléter la Phase 4 :

### 3. **UserFormModal.vue** ⏳

**Chemin** : `frontend/src/components/users/UserFormModal.vue`

**Description** : Modal de création/modification d'utilisateur

**Champs** :
```vue
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <h2>{{ user ? 'Modifier' : 'Créer' }} un utilisateur</h2>
      
      <form @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="form-group">
          <label>Email *</label>
          <input v-model="form.email" type="email" required />
        </div>

        <!-- Prénom -->
        <div class="form-group">
          <label>Prénom</label>
          <input v-model="form.first_name" type="text" />
        </div>

        <!-- Nom -->
        <div class="form-group">
          <label>Nom</label>
          <input v-model="form.last_name" type="text" />
        </div>

        <!-- Téléphone -->
        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="form.phone" type="tel" />
        </div>

        <!-- Rôle -->
        <div class="form-group">
          <label>Rôle *</label>
          <select v-model="form.role" required>
            <option value="operator">Opérateur</option>
            <option value="manager">Gestionnaire</option>
            <option value="owner">Propriétaire</option>
            <option v-if="isGeyavo" value="geyavo">Geyavo</option>
          </select>
        </div>

        <!-- Compagnie (si Geyavo) -->
        <div v-if="isGeyavo" class="form-group">
          <label>Compagnie *</label>
          <select v-model="form.company_id" required>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary">
            {{ user ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import axios from 'axios';

const props = defineProps<{
  user?: any;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { isGeyavo } = usePermissions();

const form = ref({
  email: props.user?.email || '',
  first_name: props.user?.first_name || '',
  last_name: props.user?.last_name || '',
  phone: props.user?.phone || '',
  role: props.user?.role || 'operator',
  company_id: props.user?.company_id || ''
});

const companies = ref<any[]>([]);

async function loadCompanies() {
  if (isGeyavo.value) {
    const response = await axios.get('/api/v1-admin/companies');
    companies.value = response.data.companies;
  }
}

async function handleSubmit() {
  try {
    if (props.user) {
      // Modifier
      await axios.put(`/api/v1-admin/users/${props.user.id}`, form.value);
    } else {
      // Créer
      await axios.post('/api/v1-admin/users', form.value);
    }
    emit('saved');
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de l\'enregistrement');
  }
}

onMounted(() => {
  loadCompanies();
});
</script>
```

---

### 4. **AddGroupModal.vue** ⏳

**Chemin** : `frontend/src/components/users/AddGroupModal.vue`

**Description** : Modal pour assigner un groupe à un utilisateur

**Structure** :
```vue
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <h2>Assigner un groupe</h2>
      
      <div class="groups-list">
        <div 
          v-for="group in availableGroups" 
          :key="group.id"
          @click="selectGroup(group)"
          class="group-item"
        >
          <h4>{{ group.name }}</h4>
          <p>{{ group.description }}</p>
          <span v-if="group.is_system" class="badge">Système</span>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  close: [];
  added: [];
}>();

const availableGroups = ref<any[]>([]);

async function loadGroups() {
  const response = await axios.get('/api/v1-admin/permissions/groups');
  availableGroups.value = response.data.groups;
}

async function selectGroup(group: any) {
  try {
    await axios.post(`/api/v1-admin/permissions/users/${props.userId}/groups/${group.id}`);
    emit('added');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

onMounted(() => {
  loadGroups();
});
</script>
```

---

### 5. **GrantPermissionModal.vue** ⏳

**Chemin** : `frontend/src/components/users/GrantPermissionModal.vue`

**Description** : Modal pour accorder une permission

**Structure** :
```vue
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <h2>Accorder une permission</h2>
      
      <div class="search-box">
        <input v-model="search" placeholder="Rechercher une permission..." />
      </div>

      <div class="permissions-by-category">
        <div v-for="(perms, category) in filteredPermissions" :key="category">
          <h3>{{ category }}</h3>
          <div class="permissions-list">
            <div 
              v-for="perm in perms" 
              :key="perm.code"
              @click="grantPermission(perm.code)"
              class="permission-item"
            >
              <div>
                <strong>{{ perm.name }}</strong>
                <p>{{ perm.code }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  close: [];
  granted: [];
}>();

const search = ref('');
const allPermissions = ref<any[]>([]);

const filteredPermissions = computed(() => {
  let filtered = allPermissions.value;
  
  if (search.value) {
    const query = search.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query)
    );
  }
  
  // Grouper par catégorie
  const grouped: Record<string, any[]> = {};
  filtered.forEach(perm => {
    if (!grouped[perm.category]) {
      grouped[perm.category] = [];
    }
    grouped[perm.category].push(perm);
  });
  
  return grouped;
});

async function loadPermissions() {
  const response = await axios.get('/api/v1-admin/permissions');
  allPermissions.value = response.data.permissions;
}

async function grantPermission(code: string) {
  try {
    await axios.post(`/api/v1-admin/permissions/users/${props.userId}`, {
      permissionCode: code
    });
    emit('granted');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

onMounted(() => {
  loadPermissions();
});
</script>
```

---

### 6. **RevokePermissionModal.vue** ⏳

**Chemin** : `frontend/src/components/users/RevokePermissionModal.vue`

**Description** : Modal pour révoquer une permission

**Structure** : Similaire à `GrantPermissionModal.vue` mais avec action de révocation

---

### 7. **PermissionGroupsView.vue** ⏳

**Chemin** : `frontend/src/views/PermissionGroupsView.vue`

**Description** : Vue de gestion des groupes de permissions

**Fonctionnalités** :
- Liste des groupes (système + personnalisés)
- Créer un groupe
- Modifier un groupe
- Supprimer un groupe (sauf système)
- Voir les permissions d'un groupe

---

### 8. **SettingsView.vue** ⏳

**Chemin** : `frontend/src/views/SettingsView.vue`

**Description** : Vue des paramètres de la compagnie

**Sections** :
- **Informations générales** : Nom, email, téléphone, adresse
- **Notifications** : Activer/désactiver les notifications email/SMS
- **Branding** : Logo, couleurs primaire/secondaire
- **Paramètres métier** : Devise, fuseau horaire, langue

---

### 9. **CompaniesManagementView.vue** ⏳ (Geyavo uniquement)

**Chemin** : `frontend/src/views/CompaniesManagementView.vue`

**Description** : Vue de gestion des compagnies (Geyavo uniquement)

**Fonctionnalités** :
- Liste de toutes les compagnies
- Créer une compagnie
- Modifier une compagnie
- Supprimer une compagnie (sauf geyavo_company)
- Voir les statistiques d'une compagnie
- Voir les utilisateurs d'une compagnie

---

## 🎨 Styles Globaux Recommandés

Créer un fichier `frontend/src/assets/css/permissions.css` :

```css
/* Badges de rôle */
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-geyavo {
  background: #f3e8ff;
  color: #7c3aed;
}

.role-owner {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #d1fae5;
  color: #065f46;
}

.role-operator {
  background: #f1f5f9;
  color: #475569;
}

/* Badges de statut */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Boutons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #0A2540;
  color: white;
}

.btn-primary:hover {
  background: #1E3A8A;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0A2540;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-success {
  background: #059669;
  color: white;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Loading */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0A2540;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 🗺️ Routes à Ajouter

Dans `frontend/src/router/index.ts` :

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { usePermissionStore } from '@/stores/permissionStore';

const routes = [
  // ... routes existantes
  
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/UsersManagementView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'users.view'
    }
  },
  {
    path: '/permission-groups',
    name: 'PermissionGroups',
    component: () => import('@/views/PermissionGroupsView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'users.manage_permissions',
      roles: ['owner', 'geyavo']
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'settings.view'
    }
  },
  {
    path: '/companies',
    name: 'Companies',
    component: () => import('@/views/CompaniesManagementView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'companies.view',
      roles: ['geyavo']
    }
  }
];

// Guard de navigation
router.beforeEach((to, from, next) => {
  const permissionStore = usePermissionStore();
  
  if (to.meta.requiresAuth && !permissionStore.initialized) {
    return next('/login');
  }
  
  if (to.meta.permission) {
    const hasPermission = permissionStore.hasPermission(to.meta.permission as string);
    if (!hasPermission) {
      return next('/403');
    }
  }
  
  if (to.meta.roles) {
    const hasRole = permissionStore.hasRole(to.meta.roles as string[]);
    if (!hasRole) {
      return next('/403');
    }
  }
  
  next();
});
```

---

## 📊 Résumé de la Phase 4

### ✅ Créé
- `UsersManagementView.vue` - Vue principale de gestion des utilisateurs
- `UserPermissionsModal.vue` - Modal de gestion des permissions

### ⏳ À Créer
- `UserFormModal.vue` - Formulaire utilisateur
- `AddGroupModal.vue` - Assigner un groupe
- `GrantPermissionModal.vue` - Accorder une permission
- `RevokePermissionModal.vue` - Révoquer une permission
- `PermissionGroupsView.vue` - Gestion des groupes
- `SettingsView.vue` - Paramètres de la compagnie
- `CompaniesManagementView.vue` - Gestion des compagnies (Geyavo)

### 📝 Fichiers de support
- `permissions.css` - Styles globaux
- Routes dans `router/index.ts`

---

**Phase 4 : Partiellement implémentée**  
**Prochaine étape** : Créer les composants manquants ou passer à la Phase 5 (Tests)

**Date** : 11 novembre 2025  
**Version** : 1.0
