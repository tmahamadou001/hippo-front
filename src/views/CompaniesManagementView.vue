<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else>
      <DataGrid
        title="Compagnies"
        :columnDefs="columnDefs"
        :rowData="companies"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
            v-permission="'companies.create'"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
          <button
            v-if="selectedRows.length > 0 && canDeleteSelected"
            @click="bulkDelete"
            v-permission="'companies.delete'"
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
    <CompanyFormModal
      v-model="showCompanyModal"
      :company="selectedCompany"
      @saved="onCompanySaved"
    />

    <CompanyDetailsModal
      v-model="showDetailsModal"
      :company="selectedCompany"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { GridApi } from 'ag-grid-community'
import apiClient from '@/services/api'
import DataGrid from '@/components/common/DataGrid.vue'
import CompanyFormModal from '@/components/companies/CompanyFormModal.vue'
import CompanyDetailsModal from '@/components/companies/CompanyDetailsModal.vue'
import { companiesColumnDefs, defaultColDef, createActionsColumn } from '@/config/gridColumns/companiesColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

// État
const companies = ref<any[]>([])
const loading = ref(false)
const showCompanyModal = ref(false)
const showDetailsModal = ref(false)
const selectedCompany = ref<any>(null)
const selectedRows = ref<any[]>([])
const gridApi = ref<GridApi | null>(null)

// Vérifier si on peut supprimer les compagnies sélectionnées (pas geyavo_company)
const canDeleteSelected = computed(() => {
  return selectedRows.value.every(company => company.slug !== 'geyavo_company')
})

// Actions pour chaque ligne
const rowActions: ActionMenuItem[] = [
  {
    label: 'Voir détails',
    iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    onClick: (data) => {
      viewCompanyDetails(data)
    }
  },
  {
    label: 'Modifier',
    iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    className: 'text-blue-600 hover:bg-blue-50',
    onClick: (data) => {
      editCompany(data)
    },
    condition: (data) => data.slug !== 'geyavo_company'
  },
  {
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteCompany(data)
    },
    condition: (data) => data.slug !== 'geyavo_company'
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = computed(() => {
  const cols = [...companiesColumnDefs]
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

// Méthodes
async function loadCompanies() {
  try {
    loading.value = true
    
    // Utiliser le nouvel endpoint optimisé avec stats agrégées
    const response = await apiClient.get('/companies?include_stats=true')
    
    // Les stats sont déjà incluses dans la réponse ! 🎉
    companies.value = response.data.companies
  } catch (error) {
    console.error('Erreur lors du chargement des compagnies:', error)
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
  selectedCompany.value = null
  showCompanyModal.value = true
}

function editCompany(company: any) {
  if (company.slug === 'geyavo_company') {
    alert('La compagnie système Geyavo ne peut pas être modifiée')
    return
  }
  selectedCompany.value = company
  showCompanyModal.value = true
}

function viewCompanyDetails(company: any) {
  selectedCompany.value = company
  showDetailsModal.value = true
}

async function onCompanySaved() {
  selectedCompany.value = null
  await loadCompanies()
}

// Company Actions
async function deleteCompany(company: any) {
  if (company.slug === 'geyavo_company') {
    alert('La compagnie système Geyavo ne peut pas être supprimée')
    return
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${company.name}" ?\n\nCette action supprimera également tous les utilisateurs, véhicules, lignes et réservations associés.\n\nCette action est irréversible.`)) {
    return
  }

  try {
    await apiClient.delete(`/companies/${company.id}`)
    await loadCompanies()
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression de la compagnie')
  }
}

// Bulk Actions
async function bulkDelete() {
  const deletableCompanies = selectedRows.value.filter(c => c.slug !== 'geyavo_company')
  
  if (deletableCompanies.length === 0) {
    alert('Aucune compagnie supprimable sélectionnée')
    return
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${deletableCompanies.length} compagnie(s) ?\n\nCette action supprimera également tous les utilisateurs, véhicules, lignes et réservations associés.\n\nCette action est irréversible.`)) {
    return
  }

  try {
    await Promise.all(deletableCompanies.map(c => apiClient.delete(`/companies/${c.id}`)))
    await loadCompanies()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(() => {
  loadCompanies()
})
</script>
