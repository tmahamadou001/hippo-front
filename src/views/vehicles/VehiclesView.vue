<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else>
      <DataGrid
        title="Véhicules"
        :columnDefs="columnDefs"
        :rowData="vehicles"
        :defaultColDef="defaultColDef"
        @selectionChanged="onSelectionChanged"
        @rowClicked="onRowClicked"
        @gridReady="onGridReady"
      >
        <!-- Actions personnalisées dans la toolbar -->
        <template #toolbar-actions>
          <button
            @click="openCreateModal"
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
    <VehicleModal
      v-model="showModal"
      :vehicle="selectedVehicle"
      @saved="handleVehicleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { GridApi } from 'ag-grid-community'
import vehicleService from '@/services/vehicleService'
import type { Vehicle, VehicleFilters } from '@/types/vehicle'
import { useAuthStore } from '@/stores/auth'
import DataGrid from '@/components/common/DataGrid.vue'
import VehicleModal from '@/components/vehicles/VehicleModal.vue'
import { vehiclesColumnDefs, defaultColDef, createActionsColumn, createCompanyColumn } from '@/config/gridColumns/vehiclesColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

const authStore = useAuthStore()

const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)
const selectedRows = ref<Vehicle[]>([])
const gridApi = ref<GridApi | null>(null)

// Vérifier si l'utilisateur est Geyavo
const isGeyavo = computed(() => authStore.user?.role === 'geyavo')

const filters = ref<VehicleFilters>({
  type: '',
  search: ''
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
    label: 'Supprimer',
    iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      await deleteVehicle(data)
    }
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = computed(() => {
  const cols = [...vehiclesColumnDefs]
  
  // Ajouter la colonne Entreprise après la première colonne si Geyavo
  if (isGeyavo.value) {
    cols.splice(1, 0, createCompanyColumn())
  }
  
  // Ajouter la colonne Actions à la fin
  cols.push(createActionsColumn(rowActions))
  
  return cols
})

const fetchVehicles = async () => {
  loading.value = true
  try {
    const cleanFilters: VehicleFilters = {}
    
    if (filters.value.type) cleanFilters.type = filters.value.type
    if (filters.value.search) cleanFilters.search = filters.value.search

    const response = await vehicleService.getAll(cleanFilters)
    vehicles.value = response.data
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedVehicle.value = null
  showModal.value = true
}

const openEditModal = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle
  showModal.value = true
}

// AG Grid Events
const onGridReady = (api: GridApi) => {
  gridApi.value = api
}

const onSelectionChanged = (rows: Vehicle[]) => {
  selectedRows.value = rows
}

const onRowClicked = (data: Vehicle) => {
  console.log('Row clicked:', data)
}

// Modal Actions
const handleVehicleSaved = () => {
  showModal.value = false
  fetchVehicles()
}

// Vehicle Actions
const deleteVehicle = async (vehicle: Vehicle) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${vehicle.name} ?\n\nCette action est irréversible.`)) return
  
  try {
    await vehicleService.delete(vehicle.id)
    await fetchVehicles()
  } catch (error: any) {
    console.error('Error deleting vehicle:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Bulk Actions
const bulkDelete = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} véhicule(s) ?\n\nCette action est irréversible.`)) return
  
  try {
    await Promise.all(selectedRows.value.map(v => vehicleService.delete(v.id)))
    await fetchVehicles()
    gridApi.value?.deselectAll()
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression en masse')
  }
}

onMounted(() => {
  fetchVehicles()
})
</script>
