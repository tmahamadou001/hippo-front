<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- AG Grid DataGrid -->
    <div v-else class="">
      <DataGrid
        title="Réservations"
        :columnDefs="columnDefs"
        :rowData="reservations"
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
            @click="bulkConfirm"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Confirmer ({{ selectedRows.length }})
          </button>
          <button
            v-if="selectedRows.length > 0"
            @click="bulkCancel"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg class="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler ({{ selectedRows.length }})
          </button>
        </template>
      </DataGrid>
    </div>

    <!-- Modals -->
    <ReservationModal
      v-model="showModal"
      :reservation="selectedReservation"
      @saved="handleReservationSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { GridApi } from 'ag-grid-community'
import reservationService from '@/services/reservationService'
import type { Reservation } from '@/types/reservation'
import { useCityStore } from '@/stores/city'
import DataGrid from '@/components/common/DataGrid.vue'
import ReservationModal from '@/components/reservations/ReservationModal.vue'
import { reservationsColumnDefs, defaultColDef, createActionsColumn } from '@/config/gridColumns/reservationsColumns'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

const cityStore = useCityStore()

const reservations = ref<Reservation[]>([])
const loading = ref(false)
const showModal = ref(false)
const selectedReservation = ref<Reservation | null>(null)
const selectedRows = ref<Reservation[]>([])
const gridApi = ref<GridApi | null>(null)

// Actions pour chaque ligne
const rowActions: ActionMenuItem[] = [
  {
    label: 'Voir détails',
    iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    onClick: (data) => {
      console.log('Voir détails:', data)
      openEditModal(data)
    }
  },
  {
    label: 'Voir le billet',
    iconPath: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    className: 'text-blue-600 hover:bg-blue-50',
    onClick: async (data) => {
      if (data.qr_token) {
        await downloadTicket(data.id)
      } else {
        alert('Ce billet n\'a pas de QR code généré')
      }
    }
  },
  {
    label: 'Confirmer',
    iconPath: 'M5 13l4 4L19 7',
    className: 'text-green-600 hover:bg-green-50',
    onClick: async (data) => {
      if (data.status === 'pending') {
        await confirmReservation(data)
      }
    }
  },
  {
    label: 'Annuler',
    iconPath: 'M6 18L18 6M6 6l12 12',
    className: 'text-red-600 hover:bg-red-50',
    onClick: async (data) => {
      if (data.status !== 'cancelled') {
        await cancelReservation(data)
      }
    }
  }
]

// Configuration AG Grid avec colonne d'actions
const columnDefs = [...reservationsColumnDefs, createActionsColumn(rowActions)]

const fetchReservations = async () => {
  loading.value = true
  try {
    const response = await reservationService.getAll({})
    reservations.value = response.data
  } catch (error) {
    console.error('Error fetching reservations:', error)
  } finally {
    loading.value = false
  }
}

// AG Grid Events
const onGridReady = (api: GridApi) => {
  gridApi.value = api
}

const onSelectionChanged = (rows: Reservation[]) => {
  selectedRows.value = rows
}

const onRowClicked = (row: Reservation) => {
  console.log('Row clicked:', row)
  // Optionnel : ouvrir le modal d'édition au clic
  // openEditModal(row)
}

// Actions groupées
const bulkConfirm = async () => {
  if (!confirm(`Confirmer ${selectedRows.value.length} réservation(s) ?`)) return
  
  try {
    await Promise.all(
      selectedRows.value.map(r => 
        reservationService.update(r.id, { 
          status: 'confirmed',
          payment_status: 'paid'
        })
      )
    )
    await fetchReservations()
    selectedRows.value = []
  } catch (error) {
    console.error('Error confirming reservations:', error)
    alert('Erreur lors de la confirmation')
  }
}

const bulkCancel = async () => {
  if (!confirm(`Annuler ${selectedRows.value.length} réservation(s) ?`)) return
  
  try {
    await Promise.all(
      selectedRows.value.map(r => reservationService.cancel(r.id))
    )
    await fetchReservations()
    selectedRows.value = []
  } catch (error) {
    console.error('Error cancelling reservations:', error)
    alert('Erreur lors de l\'annulation')
  }
}

const openCreateModal = () => {
  selectedReservation.value = null
  showModal.value = true
}

const openEditModal = (reservation: Reservation) => {
  selectedReservation.value = reservation
  showModal.value = true
}

const confirmReservation = async (reservation: Reservation) => {
  if (!confirm('Confirmer cette réservation ?')) return
  
  try {
    await reservationService.update(reservation.id, { 
      status: 'confirmed',
      payment_status: 'paid'
    })
    await fetchReservations()
  } catch (error) {
    console.error('Error confirming reservation:', error)
    alert('Erreur lors de la confirmation')
  }
}

const cancelReservation = async (reservation: Reservation) => {
  if (!confirm('Annuler cette réservation ? La place sera libérée.')) return
  
  try {
    await reservationService.cancel(reservation.id)
    await fetchReservations()
  } catch (error: any) {
    console.error('Error cancelling reservation:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'annulation')
  }
}

const downloadTicket = async (reservationId: string) => {
  try {
    await reservationService.downloadTicket(reservationId)
  } catch (error: any) {
    console.error('Error downloading ticket:', error)
    alert(error.response?.data?.message || 'Erreur lors du téléchargement du billet')
  }
}

const handleReservationSaved = () => {
  showModal.value = false
  fetchReservations()
}


onMounted(async () => {
  await cityStore.loadCities()
  fetchReservations()
})
</script>
