<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else>
      <DataGrid
        title="Horaires"
        :columnDefs="columnDefs"
        :rowData="schedules"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
            v-permission="'schedules.create'"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            @click="openGenerateModal"
            v-permission="'schedules.generate'"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkDelete"
            v-permission="'schedules.delete'"
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
    <ScheduleFormModal
      v-model="showScheduleModal"
      :schedule="selectedSchedule"
      @saved="onScheduleSaved"
    />

    <GenerateDeparturesModal
      v-model="showGenerateModal"
      :selected-schedules="selectedRows.length > 0 ? selectedRows : schedules"
      @generated="onDeparturesGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { GridApi } from 'ag-grid-community'
import { usePermissions } from '@/composables/usePermissions'
import apiClient from '@/services/api'
import DataGrid from '@/components/common/DataGrid.vue'
import ScheduleFormModal from '@/components/schedules/ScheduleFormModal.vue'
import GenerateDeparturesModal from '@/components/schedules/GenerateDeparturesModal.vue'
import { schedulesColumnDefs, defaultColDef, createActionsColumn, createCompanyColumn } from '@/config/gridColumns/schedulesColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

// Composables
const { isGeyavo } = usePermissions()

// État
const schedules = ref<any[]>([])
const loading = ref(false)
const showScheduleModal = ref(false)
const showGenerateModal = ref(false)
const selectedSchedule = ref<any>(null)
const selectedRows = ref<any[]>([])
const gridApi = ref<GridApi | null>(null)

// Actions pour chaque ligne
const rowActions: ActionMenuItem[] = [
  {
    label: 'Modifier',
    iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    className: 'text-blue-600 hover:bg-blue-50',
    onClick: (data) => {
      editSchedule(data)
    }
  },
  {
    label: 'Générer départs',
    iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    className: 'text-green-600 hover:bg-green-50',
    onClick: (data) => {
      generateFromSchedule(data)
    }
  },
  {
    label: 'Activer/Désactiver',
    iconPath: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    className: 'text-orange-600 hover:bg-orange-50',
    onClick: async (data) => {
      await toggleActive(data)
    }
  },
  {
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteSchedule(data)
    }
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = computed(() => {
  const cols = [...schedulesColumnDefs]
  
  // Ajouter la colonne Compagnie si Geyavo
  if (isGeyavo.value) {
    cols.splice(1, 0, createCompanyColumn())
  }
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

// Méthodes
async function loadSchedules() {
  try {
    loading.value = true
    const response = await apiClient.get('/schedules')
    schedules.value = response.data.schedules || []
  } catch (error: any) {
    console.error('❌ Erreur lors du chargement des horaires:', error)
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
  selectedSchedule.value = null
  showScheduleModal.value = true
}

function editSchedule(schedule: any) {
  selectedSchedule.value = schedule
  showScheduleModal.value = true
}

function onScheduleSaved() {
  selectedSchedule.value = null
  loadSchedules()
}

// Generate Modal
function openGenerateModal() {
  showGenerateModal.value = true
}

function generateFromSchedule(schedule: any) {
  selectedRows.value = [schedule]
  showGenerateModal.value = true
}

function onDeparturesGenerated() {
  selectedRows.value = []
  loadSchedules()
  alert('Départs générés avec succès !')
}

// Schedule Actions
async function toggleActive(schedule: any) {
  try {
    await apiClient.put(`/schedules/${schedule.id}`, {
      is_active: !schedule.is_active
    })
    await loadSchedules()
  } catch (error: any) {
    console.error('Erreur lors du changement de statut:', error)
    alert(error.response?.data?.message || 'Erreur lors du changement de statut')
  }
}

async function deleteSchedule(schedule: any) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer cet horaire ?\n\nLigne: ${schedule.line?.origin} → ${schedule.line?.destination}\nGare: ${schedule.departure_station}\nHeure: ${schedule.departure_time}\n\nCette action est irréversible.`)) {
    return
  }

  try {
    await apiClient.delete(`/schedules/${schedule.id}`)
    await loadSchedules()
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Bulk Actions
async function bulkDelete() {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} horaire(s) ?\n\nCette action est irréversible.`)) {
    return
  }

  try {
    await Promise.all(selectedRows.value.map(s => apiClient.delete(`/schedules/${s.id}`)))
    await loadSchedules()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(() => {
  loadSchedules()
})
</script>
