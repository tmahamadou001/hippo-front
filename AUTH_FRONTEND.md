# 🔐 Authentification Frontend - Geyavo Admin

## 📋 Vue d'ensemble

Système d'authentification complet pour le frontend avec **Vue 3**, **Pinia**, et **TailwindCSS**.

## 🗂️ Structure des fichiers

```
frontend/src/
├── types/
│   └── auth.ts                    # Types TypeScript
├── services/
│   ├── api.ts                     # Client API avec intercepteurs
│   └── authService.ts             # Service d'authentification
├── stores/
│   └── auth.ts                    # Store Pinia pour l'auth
├── components/
│   └── auth/
│       └── LoginForm.vue          # Formulaire de connexion
├── views/
│   ├── LoginView.vue              # Page de login
│   ├── UnauthorizedView.vue      # Page 403
│   └── NotFoundView.vue           # Page 404
└── router/
    ├── index.ts                   # Configuration des routes
    └── guards.ts                  # Guards de navigation
```

## 🚀 Fonctionnalités

### ✅ Implémenté

- ✅ Login avec email/password
- ✅ Logout
- ✅ Refresh token automatique
- ✅ Store Pinia pour l'état d'authentification
- ✅ Guards de navigation (auth, guest, role-based)
- ✅ Gestion des tokens (localStorage)
- ✅ Intercepteurs HTTP (ajout token, refresh automatique)
- ✅ Pages d'erreur (403, 404)
- ✅ Interface moderne avec TailwindCSS

## 🔧 Configuration

### 1. Variables d'environnement

Créer un fichier `.env` à la racine du frontend :

```env
VITE_API_URL=http://localhost:6000/api/v1
VITE_APP_NAME=Geyavo Admin
VITE_APP_VERSION=1.0.0
```

### 2. Installation

```bash
cd frontend
pnpm install
```

### 3. Lancer le serveur

```bash
pnpm run dev
```

## 💻 Utilisation

### Store Pinia

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login
await authStore.login({
  email: 'admin@company.com',
  password: 'password123'
})

// Logout
await authStore.logout()

// Check authentication
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user)
}

// Check role
if (authStore.isOwner) {
  // Owner only actions
}
```

### Dans un composant

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    <p>Welcome, {{ authStore.user?.email }}</p>
    <button @click="authStore.logout()">Logout</button>
  </div>
</template>
```

### Guards de navigation

```typescript
// router/index.ts
import { authGuard, guestGuard, ownerGuard, managerGuard } from './guards'

const routes = [
  {
    path: '/login',
    beforeEnter: guestGuard // Only for non-authenticated users
  },
  {
    path: '/dashboard',
    beforeEnter: authGuard // Requires authentication
  },
  {
    path: '/settings',
    beforeEnter: ownerGuard // Only for owners
  },
  {
    path: '/vehicles',
    beforeEnter: managerGuard // For owners and managers
  }
]
```

## 🔒 Sécurité

### Gestion des tokens

Les tokens sont stockés dans `localStorage` :

- `access_token` : Token d'accès (expire après 1h)
- `refresh_token` : Token de rafraîchissement (expire après 7 jours)
- `expires_at` : Timestamp d'expiration

### Refresh automatique

L'intercepteur HTTP détecte automatiquement les erreurs 401 et rafraîchit le token :

```typescript
// services/api.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token automatically
      await authStore.refreshToken()
      // Retry original request
      return apiClient(originalRequest)
    }
  }
)
```

### Initialisation au démarrage

```typescript
// main.ts
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
app.use(pinia)
app.use(router)

// Initialize auth
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
```

## 📊 Flow d'authentification

```
1. User visits /login
   ↓
2. LoginForm.vue
   ↓
3. authStore.login()
   ↓
4. authService.login()
   ↓
5. API POST /auth/login
   ↓
6. Store tokens in localStorage
   ↓
7. Store user in Pinia
   ↓
8. Redirect to /dashboard
```

## 🎨 Composants

### LoginForm.vue

Formulaire de connexion avec :
- Validation des champs
- Affichage/masquage du mot de passe
- Gestion des erreurs
- Loading state
- Design moderne

### LoginView.vue

Page de login avec :
- Formulaire à gauche
- Branding à droite (desktop)
- Responsive design

## 🔐 Guards disponibles

| Guard | Description | Utilisation |
|-------|-------------|-------------|
| `authGuard` | Requiert authentification | Routes protégées |
| `guestGuard` | Seulement non-authentifiés | Page de login |
| `roleGuard(roles)` | Requiert rôles spécifiques | Routes avec permissions |
| `ownerGuard` | Seulement owner | Settings, admin |
| `managerGuard` | Owner et manager | Gestion véhicules, lignes |
| `anyAuthGuard` | Tous authentifiés | Dashboard, stats |

## 🧪 Tests

### Test manuel

1. **Login** :
   ```
   Email: admin@company.com
   Password: password123
   ```

2. **Vérifier le token** :
   ```javascript
   localStorage.getItem('access_token')
   ```

3. **Vérifier l'utilisateur** :
   ```javascript
   useAuthStore().user
   ```

4. **Test des guards** :
   - Accéder à `/dashboard` sans être connecté → Redirect vers `/login`
   - Se connecter → Redirect vers `/dashboard`
   - Accéder à `/settings` en tant qu'operator → Redirect vers `/unauthorized`

## 📝 API Endpoints utilisés

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/login` | POST | Connexion |
| `/auth/logout` | POST | Déconnexion |
| `/auth/refresh` | POST | Rafraîchir token |
| `/auth/me` | GET | Utilisateur actuel |
| `/auth/change-password` | POST | Changer mot de passe |

## 🎯 Prochaines étapes

- [ ] Ajouter "Remember me"
- [ ] Implémenter "Forgot password"
- [ ] Ajouter 2FA (optionnel)
- [ ] Améliorer la gestion des erreurs
- [ ] Ajouter des tests unitaires
- [ ] Implémenter le changement de mot de passe dans l'UI

---

**Version** : 1.0.0  
**Dernière mise à jour** : 7 novembre 2025
