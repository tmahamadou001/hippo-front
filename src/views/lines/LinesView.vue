<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else>
      <DataGrid
        title="Lignes"
        :columnDefs="columnDefs"
        :rowData="lines"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
            v-permission="'lines.create'"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkToggleStatus"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Changer statut ({{ selectedRows.length }})
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkDelete"
            v-permission="'lines.delete'"
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
    <LineModal
      v-model="showModal"
      :line="selectedLine"
      @saved="handleLineSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { GridApi } from 'ag-grid-community'
import lineService from '@/services/lineService'
import type { Line, LineFilters } from '@/types/line'
import { useCityStore } from '@/stores/city'
import { useAuthStore } from '@/stores/auth'
import DataGrid from '@/components/common/DataGrid.vue'
import LineModal from '@/components/lines/LineModal.vue'
import { linesColumnDefs, defaultColDef, createActionsColumn, createCompanyColumn } from '@/config/gridColumns/linesColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

const cityStore = useCityStore()
const authStore = useAuthStore()

const lines = ref<Line[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedLine = ref<Line | null>(null)
const selectedRows = ref<Line[]>([])
const gridApi = ref<GridApi | null>(null)

// Vérifier si l'utilisateur est Geyavo
const isGeyavo = computed(() => authStore.user?.role === 'geyavo')

const filters = ref<LineFilters>({
  origin: '',
  destination: '',
  is_active: undefined
})

// Actions pour chaque ligne
const rowActions: ActionMenuItem[] = [
  {
    label: 'Voir détails',
    iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    onClick: (data) => {
      openEditModal(data)
    }
  },
  {
    label: 'Activer',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    className: 'text-green-600 hover:bg-green-50',
    onClick: async (data) => {
      await toggleLineStatus(data)
    },
    // condition: (data) => !data.is_active
  },
  {
    label: 'Désactiver',
    iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    className: 'text-orange-600 hover:bg-orange-50',
    onClick: async (data) => {
      await toggleLineStatus(data)
    },
    // condition: (data) => data.is_active
  },
  {
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteLine(data)
    }
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = computed(() => {
  const cols = [...linesColumnDefs]
  
  // Ajouter la colonne Entreprise après la première colonne si Geyavo
  if (isGeyavo.value) {
    cols.splice(1, 0, createCompanyColumn())
  }
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

const fetchLines = async () => {
  loading.value = true
  try {
    const cleanFilters: LineFilters = {}
    
    if (filters.value.origin) cleanFilters.origin = filters.value.origin
    if (filters.value.destination) cleanFilters.destination = filters.value.destination
    if (filters.value.is_active !== undefined) cleanFilters.is_active = filters.value.is_active

    const response = await lineService.getAll(cleanFilters)
    lines.value = response.data
  } catch (error) {
    console.error('Error fetching lines:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedLine.value = null
  showModal.value = true
}

const openEditModal = (line: Line) => {
  selectedLine.value = line
  showModal.value = true
}

// AG Grid Events
const onGridReady = (api: GridApi) => {
  gridApi.value = api
}

const onSelectionChanged = (rows: Line[]) => {
  selectedRows.value = rows
}

const onRowClicked = (data: Line) => {
  console.log('Row clicked:', data)
}

// Modal Actions
const handleLineSaved = () => {
  showModal.value = false
  fetchLines()
}

// Line Actions
const toggleLineStatus = async (line: Line) => {
  try {
    await lineService.toggleActive(line.id)
    await fetchLines()
  } catch (error: any) {
    console.error('Error toggling line status:', error)
    alert(error.response?.data?.message || 'Erreur lors du changement de statut')
  }
}

const deleteLine = async (line: Line) => {
  const cityStore = useCityStore()
  const origin = cityStore.getDisplayName(line.origin)
  const destination = cityStore.getDisplayName(line.destination)
  
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la ligne ${origin} → ${destination} ?\n\nCette action est irréversible.`)) return
  
  try {
    await lineService.delete(line.id)
    await fetchLines()
  } catch (error: any) {
    console.error('Error deleting line:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Bulk Actions
const bulkToggleStatus = async () => {
  if (!confirm(`Voulez-vous changer le statut de ${selectedRows.value.length} ligne(s) ?`)) return
  
  try {
    await Promise.all(selectedRows.value.map(l => lineService.toggleActive(l.id)))
    await fetchLines()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk toggling:', error)
    alert(error.response?.data?.message || 'Erreur lors du changement de statut en masse')
  }
}

const bulkDelete = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} ligne(s) ?\n\nCette action est irréversible.`)) return
  
  try {
    await Promise.all(selectedRows.value.map(l => lineService.delete(l.id)))
    await fetchLines()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(async () => {
  // Charger les villes pour l'affichage des noms
  await cityStore.loadCities()
  // Charger les lignes
  fetchLines()
})
</script>
