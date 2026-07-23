<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Permissions de {{ user?.email }}</h1>
              <p class="text-sm text-gray-500 mt-1">
                Rôle : <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user?.role)}`">
                  {{ getRoleName(user?.role) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto  py-8">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600">Chargement des permissions...</p>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Résumé -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-500 mb-1">Permissions du rôle</div>
            <div class="text-3xl font-bold text-gray-900">{{ permissionsSummary?.rolePermissions?.length || 0 }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-500 mb-1">Groupes assignés</div>
            <div class="text-3xl font-bold text-gray-900">{{ userGroups?.length || 0 }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-500 mb-1">Permissions custom</div>
            <div class="text-3xl font-bold text-gray-900">{{ permissionsSummary?.customPermissions?.length || 0 }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-500 mb-1">Total effectif</div>
            <div class="text-3xl font-bold text-green-600">{{ permissionsSummary?.effectivePermissions?.length || 0 }}</div>
          </div>
        </div>

        <!-- Onglets -->
        <div class="bg-white rounded-lg shadow">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'permissions'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'permissions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Permissions
              </button>
              <button
                @click="activeTab = 'groups'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'groups'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Groupes
              </button>
              <button
                @click="activeTab = 'history'"
                :class="[
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'history'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Historique
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Permissions Tab -->
            <div v-if="activeTab === 'permissions'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Gestion des permissions</h3>
                <div class="flex gap-2">
                  <button
                    @click="openGrantModal"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Accorder
                  </button>
                  <button
                    @click="openRevokeModal"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Révoquer
                  </button>
                </div>
              </div>

              <!-- Permissions effectives par catégorie -->
              <div v-if="permissionsSummary?.effectivePermissions?.length > 0" class="space-y-6">
                <h4 class="text-sm font-medium text-gray-700">Permissions effectives ({{ permissionsSummary.effectivePermissions.length }})</h4>
                
                <div
                  v-for="(perms, category) in permissionsByCategory"
                  :key="category"
                  class="space-y-3"
                >
                  <h5 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <span class="w-1 h-4 bg-primary-600 rounded"></span>
                    {{ category }}
                    <span class="text-xs font-normal text-gray-500">({{ perms.length }})</span>
                  </h5>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      v-for="perm in perms"
                      :key="perm.code"
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                    >
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 truncate">
                          {{ perm.name }}
                        </div>
                        <div class="text-xs text-gray-500 font-mono truncate">
                          {{ perm.code }}
                        </div>
                      </div>
                      <span class="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded flex-shrink-0">Actif</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-gray-500">
                Aucune permission effective
              </div>
            </div>

            <!-- Groups Tab -->
            <div v-if="activeTab === 'groups'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Groupes de permissions</h3>
                <button
                  @click="openAddGroupModal"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Assigner un groupe
                </button>
              </div>

              <div v-if="userGroups?.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="group in userGroups"
                  :key="group.id"
                  class="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-base font-semibold text-gray-900">{{ group.name }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ group.description }}</p>
                      <div class="mt-3 text-xs text-gray-500">
                        🔑 {{ group.permissions_count || 0 }} permissions
                      </div>
                    </div>
                    <button
                      @click="removeGroup(group)"
                      class="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-gray-500">
                Aucun groupe assigné
              </div>
            </div>

            <!-- History Tab -->
            <div v-if="activeTab === 'history'" class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Historique des modifications</h3>
              <div class="text-center py-12 text-gray-500">
                Historique non disponible pour le moment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddGroupModal
      v-if="user?.id"
      v-model="showAddGroupModal"
      :user-id="user.id"
      @added="onGroupAdded"
    />

    <GrantPermissionModal
      v-if="user?.id"
      v-model="showGrantModal"
      :user-id="user.id"
      @granted="onPermissionGranted"
    />

    <RevokePermissionModal
      v-if="user?.id"
      v-model="showRevokeModal"
      :user-id="user.id"
      @revoked="onPermissionRevoked"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api'
import AddGroupModal from '@/components/users/AddGroupModal.vue'
import GrantPermissionModal from '@/components/users/GrantPermissionModal.vue'
import RevokePermissionModal from '@/components/users/RevokePermissionModal.vue'

const route = useRoute()
const router = useRouter()

const userId = route.params.id as string

const user = ref<any>(null)
const loading = ref(false)
const activeTab = ref('permissions')
const permissionsSummary = ref<any>(null)
const userGroups = ref<any[]>([])

const showAddGroupModal = ref(false)
const showGrantModal = ref(false)
const showRevokeModal = ref(false)

function goBack() {
  router.push('/users')
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    geyavo: 'Super Admin',
    owner: 'Propriétaire',
    manager: 'Gestionnaire',
    operator: 'Opérateur'
  }
  return names[role] || role
}

function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    geyavo: 'bg-purple-100 text-purple-800',
    owner: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    operator: 'bg-gray-100 text-gray-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

// Computed pour grouper les permissions par catégorie
const permissionsByCategory = computed(() => {
  const grouped: Record<string, any[]> = {}
  
  if (!permissionsSummary.value?.effectivePermissions) {
    return grouped
  }
  
  permissionsSummary.value.effectivePermissions.forEach((perm: any) => {
    const category = perm.category || 'Autres'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(perm)
  })
  
  return grouped
})

async function loadUserPermissions() {
  try {
    loading.value = true
    
    const [userRes, permissionsRes, groupsRes] = await Promise.all([
      apiClient.get(`/users/${userId}`),
      apiClient.get(`/permissions/users/${userId}`),
      apiClient.get(`/permissions/users/${userId}/groups`)
    ])
    
    user.value = userRes.data.user
    permissionsSummary.value = permissionsRes.data
    userGroups.value = groupsRes.data.groups
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  } finally {
    loading.value = false
  }
}

function openAddGroupModal() {
  showAddGroupModal.value = true
}

function openGrantModal() {
  showGrantModal.value = true
}

function openRevokeModal() {
  showRevokeModal.value = true
}

async function onGroupAdded() {
  await loadUserPermissions()
}

async function onPermissionGranted() {
  await loadUserPermissions()
}

async function onPermissionRevoked() {
  await loadUserPermissions()
}

async function removeGroup(group: any) {
  if (!confirm(`Retirer le groupe "${group.name}" de cet utilisateur ?`)) {
    return
  }
  
  try {
    await apiClient.delete(`/permissions/users/${userId}/groups/${group.id}`)
    await loadUserPermissions()
  } catch (error: any) {
    console.error('Erreur:', error)
    alert(error.response?.data?.message || 'Erreur lors du retrait du groupe')
  }
}

onMounted(() => {
  loadUserPermissions()
})
</script>
