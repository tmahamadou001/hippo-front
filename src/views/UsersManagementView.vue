<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else>
      <DataGrid
        title="Utilisateurs"
        :columnDefs="columnDefs"
        :rowData="users"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
            v-permission="'users.create'"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkDelete"
            v-permission="'users.delete'"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer ({{ selectedRows.length }})
          </button>
        </template>
      </DataGrid>
    </div>

    <!-- Modals -->
    <UserFormModal
      v-model="showUserModal"
      :user="selectedUser"
      @saved="onUserSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { GridApi } from 'ag-grid-community'
import { usePermissions } from '@/composables/usePermissions'
import apiClient from '@/services/api'
import DataGrid from '@/components/common/DataGrid.vue'
import UserFormModal from '@/components/users/UserFormModal.vue'
import { usersColumnDefs, defaultColDef, createActionsColumn, createCompanyColumn } from '@/config/gridColumns/usersColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'
import { useAuthStore } from '@/stores/auth'

// Composables
const { isGeyavo } = usePermissions()
const router = useRouter()
const authStore = useAuthStore()

// État
const users = ref<any[]>([])
const loading = ref(false)
const showUserModal = ref(false)
const selectedUser = ref<any>(null)
const selectedRows = ref<any[]>([])
const gridApi = ref<GridApi | null>(null)

// Actions pour chaque ligne
const rowActions: ActionMenuItem[] = [
  {
    label: 'Voir détails',
    iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    onClick: (data) => {
      editUser(data)
    }
  },
  {
    label: 'Gérer permissions',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    className: 'text-blue-600 hover:bg-blue-50',
    onClick: (data) => {
      viewUserPermissions(data)
    }
  },
  {
    label: 'Impersonate',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    className: 'text-purple-600 hover:bg-purple-50',
    onClick: async (data) => {
      await impersonateUser(data)
    },
    condition: (data) => {
      // Visible uniquement pour Geyavo et pas pour impersonate un autre Geyavo
      return isGeyavo.value && data.role !== 'geyavo'
    }
  },
  {
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteUser(data)
    }
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = computed(() => {
  const cols = [...usersColumnDefs]
  
  // Ajouter la colonne Entreprise après la colonne Rôle si Geyavo
  if (isGeyavo.value) {
    cols.splice(3, 0, createCompanyColumn())
  }
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

// Méthodes
async function loadUsers() {
  try {
    loading.value = true
    const response = await apiClient.get('/users')
    users.value = response.data.users
  } catch (error: any) {
    console.error('❌ Erreur lors du chargement des utilisateurs:', error)
    alert(`Erreur: ${error.response?.data?.message || error.message}`)
  } finally {
    loading.value = false
  }
}

// AG Grid Events
const onGridReady = (api: GridApi) => {
  gridApi.value = api
}

const onSelectionChanged = (rows: any[]) => {
  selectedRows.value = rows
}

const onRowClicked = (data: any) => {
  console.log('Row clicked:', data)
}

// Modal Actions
function openCreateModal() {
  selectedUser.value = null
  showUserModal.value = true
}

function editUser(user: any) {
  selectedUser.value = user
  showUserModal.value = true
}

function viewUserPermissions(user: any) {
  router.push(`/users/${user.id}/permissions`)
}

async function impersonateUser(user: any) {
  if (!confirm(`Voulez-vous vous connecter en tant que "${user.email}" ?\n\nVous verrez l'application exactement comme cet utilisateur.`)) {
    return
  }
  
  try {
    await authStore.impersonate(user.id)
    // Rediriger vers le dashboard pour voir l'app comme l'utilisateur
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Error impersonating user:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'impersonation')
  }
}

function onUserSaved() {
  selectedUser.value = null
  loadUsers()
}

// User Actions
async function deleteUser(user: any) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.email} ?\n\nCette action est irréversible.`)) return

  try {
    await apiClient.delete(`/users/${user.id}`)
    await loadUsers()
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Bulk Actions
async function bulkDelete() {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} utilisateur(s) ?\n\nCette action est irréversible.`)) return

  try {
    await Promise.all(selectedRows.value.map(u => apiClient.delete(`/users/${u.id}`)))
    await loadUsers()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(() => {
  loadUsers()
})
</script>
