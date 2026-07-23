<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Filters -->
    <!-- <div class="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 mx-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ligne</label>
          <select
            v-model="filters.line_id"
            @change="applyFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="">Toutes les lignes</option>
            <option v-for="line in lines" :key="line.id" :value="line.id">
              {{ cityStore.getDisplayName(line.origin) }} → {{ cityStore.getDisplayName(line.destination) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="">Tous</option>
            <option value="open">Ouvert</option>
            <option value="closed">Fermé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date début</label>
          <input
            v-model="filters.date_from"
            type="date"
            @change="applyFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
          <input
            v-model="filters.date_to"
            type="date"
            @change="applyFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
      </div>
    </div> -->

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else >
      <DataGrid
        title="Départs"
        :columnDefs="columnDefs"
        :rowData="departures"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
            v-permission="'departures.create'"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
          <button
            v-if="selectedRows.length > 0 && canCancelDepartures"
            @click="bulkCancel"
            v-permission="'departures.cancel'"
            class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler ({{ selectedRows.length }})
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkDelete"
            v-permission="'departures.delete'"
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
    <DepartureModal
      v-model="showModal"
      :departure="selectedDeparture"
      @saved="handleDepartureSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { GridApi } from 'ag-grid-community'
import departureService from '@/services/departureService'
import lineService from '@/services/lineService'
import type { Departure, DepartureFilters } from '@/types/departure'
import type { Line } from '@/types/line'
import { useCityStore } from '@/stores/city'
import { useAuthStore } from '@/stores/auth'
import DataGrid from '@/components/common/DataGrid.vue'
import DepartureModal from '@/components/departures/DepartureModal.vue'
import { departuresColumnDefs, defaultColDef, createActionsColumn, createCompanyColumn } from '@/config/gridColumns/departuresColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

const cityStore = useCityStore()
const authStore = useAuthStore()

const departures = ref<Departure[]>([])
const lines = ref<Line[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedDeparture = ref<Departure | null>(null)
const selectedRows = ref<Departure[]>([])
const gridApi = ref<GridApi | null>(null)

// Vérifier si l'utilisateur est Geyavo
const isGeyavo = computed(() => authStore.user?.role === 'geyavo')

const filters = ref<DepartureFilters>({
  line_id: '',
  status: '' as any,
  date_from: '',
  date_to: ''
})

// Vérifier si on peut annuler les départs sélectionnés
const canCancelDepartures = computed(() => {
  return selectedRows.value.some(row => row.status === 'open')
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
    label: 'Annuler le départ',
    iconPath: 'M6 18L18 6M6 6l12 12',
    className: 'text-orange-600 hover:bg-orange-50',
    onClick: async (data) => {
      if (data.status === 'open') {
        await cancelDeparture(data)
      }
    },
    // condition: (data) => data.status === 'open'
  },
  {
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteDeparture(data)
    }
  }
]

// Configuration AG Grid avec colonne d'actions
// Ajouter la colonne Entreprise si l'utilisateur est Geyavo
const columnDefs = computed(() => {
  const cols = [...departuresColumnDefs]
  
  // Ajouter la colonne Entreprise après la colonne Ligne si Geyavo
  if (isGeyavo.value) {
    cols.splice(1, 0, createCompanyColumn())
  }
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

const fetchDepartures = async () => {
  loading.value = true
  try {
    const cleanFilters: DepartureFilters = {}
    
    if (filters.value.line_id) cleanFilters.line_id = filters.value.line_id
    if (filters.value.status) cleanFilters.status = filters.value.status as any
    if (filters.value.date_from) cleanFilters.date_from = filters.value.date_from
    if (filters.value.date_to) cleanFilters.date_to = filters.value.date_to

    const response = await departureService.getAll(cleanFilters)
    departures.value = response.data
  } catch (error) {
    console.error('Error fetching departures:', error)
  } finally {
    loading.value = false
  }
}

const fetchLines = async () => {
  try {
    const response = await lineService.getActive()
    lines.value = response.data
  } catch (error) {
    console.error('Error fetching lines:', error)
  }
}

const applyFilters = () => {
  fetchDepartures()
}

// AG Grid Events
const onGridReady = (api: GridApi) => {
  gridApi.value = api
}

const onSelectionChanged = (rows: Departure[]) => {
  selectedRows.value = rows
}

const onRowClicked = (data: Departure) => {
  console.log('Row clicked:', data)
}

// Modal Actions
const openCreateModal = () => {
  selectedDeparture.value = null
  showModal.value = true
}

const openEditModal = (departure: Departure) => {
  selectedDeparture.value = departure
  showModal.value = true
}

const handleDepartureSaved = () => {
  showModal.value = false
  fetchDepartures()
}

// Departure Actions
const cancelDeparture = async (departure: Departure) => {
  if (!confirm(`Voulez-vous annuler le départ ${departure.line?.origin} → ${departure.line?.destination} ?`)) return
  
  try {
    await departureService.cancel(departure.id)
    await fetchDepartures()
  } catch (error: any) {
    console.error('Error cancelling departure:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'annulation')
  }
}

const deleteDeparture = async (departure: Departure) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce départ ?\n\nCette action est irréversible.`)) return
  
  try {
    await departureService.delete(departure.id)
    await fetchDepartures()
  } catch (error: any) {
    console.error('Error deleting departure:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Bulk Actions
const bulkCancel = async () => {
  const openDepartures = selectedRows.value.filter(d => d.status === 'open')
  
  if (openDepartures.length === 0) {
    alert('Aucun départ ouvert sélectionné')
    return
  }
  
  if (!confirm(`Voulez-vous annuler ${openDepartures.length} départ(s) ?`)) return
  
  try {
    await Promise.all(openDepartures.map(d => departureService.cancel(d.id)))
    await fetchDepartures()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk cancelling:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'annulation en masse')
  }
}

const bulkDelete = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} départ(s) ?\n\nCette action est irréversible.`)) return
  
  try {
    await Promise.all(selectedRows.value.map(d => departureService.delete(d.id)))
    await fetchDepartures()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(async () => {
  await cityStore.loadCities()
  await fetchLines()
  fetchDepartures()
})
</script>
