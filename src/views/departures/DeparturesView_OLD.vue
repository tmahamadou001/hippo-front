<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Départs</h1>
        <p class="text-gray-600 mt-1">Gérez les départs programmés</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        v-permission="'departures.create'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau départ
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ligne</label>
          <select
            v-model="filters.line_id"
            @change="fetchDepartures"
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
            @change="fetchDepartures"
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
            @change="fetchDepartures"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
          <input
            v-model="filters.date_to"
            type="date"
            @change="fetchDepartures"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="departures.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun départ</h3>
      <p class="text-gray-600 mb-4">Commencez par créer votre premier départ</p>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        v-permission="'departures.create'"
      >
        Créer un départ
      </button>
    </div>

    <!-- Departures List -->
    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="departure in departures"
        :key="departure.id"
        class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ cityStore.getDisplayName(departure.line?.origin || '') }} → 
                {{ cityStore.getDisplayName(departure.line?.destination || '') }}
              </h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  departure.status === 'open' ? 'bg-green-100 text-green-800' :
                  departure.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ departure.status === 'open' ? 'Ouvert' : departure.status === 'closed' ? 'Fermé' : 'Annulé' }}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {{ departure.comfort_type }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p class="text-sm text-gray-600">Date & Heure</p>
                <p class="font-medium text-gray-900">
                  {{ formatDate(departure.depart_at) }} à {{ departure.departure_time.slice(0, 5) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Prix</p>
                <p class="font-medium text-gray-900">{{ departure.price }} XOF</p>
              </div>
              <div v-if="departure.seats_available !== undefined">
                <p class="text-sm text-gray-600">Places disponibles</p>
                <p class="font-medium text-gray-900">{{ departure.seats_available || departure.capacity }}</p>
              </div>
              <div v-if="departure.departure_station">
                <p class="text-sm text-gray-600">Gare</p>
                <p class="font-medium text-gray-900">{{ departure.departure_station }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 ml-4">
            <button
              v-if="departure.status === 'open'"
              @click="cancelDeparture(departure)"
              class="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              title="Annuler"
            >
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              @click="openEditModal(departure)"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Modifier"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(departure)"
              class="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DepartureModal
      v-model="showModal"
      :departure="selectedDeparture"
      @saved="handleDepartureSaved"
    />

    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le départ"
      message="Êtes-vous sûr de vouloir supprimer ce départ ?"
      confirm-text="Supprimer"
      confirm-class="bg-red-600 hover:bg-red-700"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import departureService from '@/services/departureService'
import lineService from '@/services/lineService'
import type { Departure, DepartureFilters } from '@/types/departure'
import type { Line } from '@/types/line'
import { useCityStore } from '@/stores/city'
import DepartureModal from '@/components/departures/DepartureModal.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'

const cityStore = useCityStore()

const departures = ref<Departure[]>([])
const lines = ref<Line[]>([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedDeparture = ref<Departure | null>(null)
const departureToDelete = ref<Departure | null>(null)

const filters = ref<DepartureFilters>({
  line_id: '',
  status: '' as any,
  date_from: '',
  date_to: ''
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

const cancelDeparture = async (departure: Departure) => {
  if (!confirm('Voulez-vous annuler ce départ ?')) return
  
  try {
    await departureService.cancel(departure.id)
    await fetchDepartures()
  } catch (error) {
    console.error('Error cancelling departure:', error)
  }
}

const confirmDelete = (departure: Departure) => {
  departureToDelete.value = departure
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!departureToDelete.value) return

  try {
    await departureService.delete(departureToDelete.value.id)
    showDeleteModal.value = false
    departureToDelete.value = null
    await fetchDepartures()
  } catch (error: any) {
    console.error('Error deleting departure:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  await cityStore.loadCities()
  await fetchLines()
  fetchDepartures()
})
</script>
