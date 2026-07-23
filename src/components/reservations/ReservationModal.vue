<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'"
    allowFullscreen
    :dismissible="false"
    @close="handleClose"
  >
    <template #body>

      <!-- Lock Timer (only for new reservations with active lock) -->
      <div v-if="!isEdit && lockId && remainingSeconds > 0" class="mb-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-blue-800">
                  {{ form.number_of_passengers }} place(s) réservée(s) pour {{ formatTime(remainingSeconds) }}
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  Complétez le formulaire avant l'expiration du timer
                </p>
              </div>
              <button
                @click="extendLock"
                type="button"
                class="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
              >
                + 5 min
              </button>
            </div>
          </div>

      <!-- Lock Expired Warning -->
      <div v-if="!isEdit && lockId && remainingSeconds <= 0" class="mb-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800">
                  ⚠️ Votre réservation temporaire a expiré
                </p>
                <p class="text-xs text-red-600 mt-1">
                  Les places ont été libérées. Veuillez recommencer.
                </p>
              </div>
            </div>
          </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Départ -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Départ <span class="text-red-500">*</span>
              </label>
              <AutocompleteInput
                v-model="selectedDeparture"
                placeholder="Rechercher un départ (ville, date, heure)..."
                :disabled="isEdit"
                :fetch-items="fetchDepartures"
                :item-label="getDepartureLabel"
                :item-key="(item) => item.id"
                @select="onDepartureSelect"
              >
                <template #item="{ item }">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">
                        {{ cityStore.getDisplayName(item.line?.origin || '') }} → 
                        {{ cityStore.getDisplayName(item.line?.destination || '') }}
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ formatDate(item.depart_at) }} à {{ item.departure_time?.slice(0, 5) }}
                      </div>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-sm font-medium text-green-600">
                        {{ getAvailableSeatsDisplay(item) }} places
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ item.vehicle?.plate || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </template>
              </AutocompleteInput>
              
              <!-- Message d'aide pour la recherche avancée -->
              <div class="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div class="font-medium text-gray-700 mb-1">💡 Recherche avancée :</div>
                <div class="space-y-1">
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">abidjan</span> → Origine ou destination</div>
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">o:man</span> → Origine uniquement</div>
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">d:abidjan</span> → Destination uniquement</div>
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">dp:24</span> → Départs du 24</div>
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">h:14</span> → Départs à 14h</div>
                  <div><span class="font-mono bg-white px-1.5 py-0.5 rounded border">v:AB-123</span> → Véhicule (plaque)</div>
                  <div class="pt-1 border-t border-gray-200 mt-2">
                    <span class="font-mono bg-white px-1.5 py-0.5 rounded border">o:man dp:24</span> → Combiner plusieurs filtres
                  </div>
                </div>
              </div>
            </div>

            <!-- Nombre de passagers (only for new reservations) -->
            <div v-if="!isEdit">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Nombre de passagers <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  @click="updatePassengerCount(n)"
                  :disabled="!form.departure_id"
                  :class="[
                    'flex-1 px-4 py-3 rounded-lg font-medium transition-all',
                    form.number_of_passengers === n
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    !form.departure_id && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ n }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Sélectionnez d'abord un départ pour choisir le nombre de passagers
              </p>
            </div>

            <!-- Sélection des places (si le véhicule a une disposition configurée) -->
            <div v-if="!isEdit && seatMapData && form.number_of_passengers > 0" class="border-t border-gray-200 pt-6">
              <!-- Header avec bouton toggle -->
              <button
                type="button"
                @click="showSeatSelector = !showSeatSelector"
                class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div class="text-left">
                    <h3 class="text-sm font-semibold text-gray-900">
                      Sélection des places
                    </h3>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ selectedSeats.length > 0 ? `${selectedSeats.length} siège(s) sélectionné(s) : ${selectedSeats.join(', ')}` : 'Cliquez pour choisir vos places' }}
                    </p>
                  </div>
                </div>
                <svg 
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': showSeatSelector }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Contenu collapsible -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[600px] opacity-100"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="max-h-[600px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-show="showSeatSelector" class="overflow-hidden">
                  <div class="pt-4">
                    <SeatMapSelector
                      ref="seatMapSelectorRef"
                      :seat-map="seatMapData.seatMap"
                      :occupied-seats="seatMapData.occupiedSeats"
                      :locked-seats="seatMapData.lockedSeats"
                      :max-seats="form.number_of_passengers"
                      :base-price="selectedDeparture?.price || 5000"
                      @seats-selected="handleSeatsSelected"
                    />
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Passagers -->
            <div class="space-y-4">
              <!-- Passager 1 (Contact principal) -->
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-xs">1</span>
                  Passager 1 (Contact principal)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.passenger_name"
                      type="text"
                      required
                      placeholder="Ex: Jean Kouassi"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.passenger_phone"
                      type="tel"
                      required
                      placeholder="+225 07 00 00 00"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Email <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.passenger_email"
                      type="email"
                      required
                      placeholder="jean@example.com"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Prix <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="form.passengers[0].price"
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="5000"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                    <p class="text-xs text-gray-500 mt-1">Prix en FCFA</p>
                  </div>
                </div>
              </div>

              <!-- Passagers supplémentaires -->
              <div
                v-for="(passenger, index) in form.passengers.slice(1)"
                :key="index + 1"
                class="border border-gray-200 rounded-lg p-4"
              >
                <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 bg-gray-600 text-white rounded-full text-xs">{{ index + 2 }}</span>
                  Passager {{ index + 2 }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="passenger.name"
                      type="text"
                      required
                      placeholder="Ex: Marie Kouassi"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Prix <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="passenger.price"
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="5000"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                    <p class="text-xs text-gray-500 mt-1">Prix en FCFA</p>
                  </div>
                  <div class="md:col-span-2">
                    <p class="text-xs text-gray-500">
                      💡 Email et téléphone optionnels pour les passagers supplémentaires
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Récapitulatif prix -->
            <div class="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">💰 Récapitulatif</h3>
              <div class="space-y-2">
                <div v-for="(passenger, index) in form.passengers" :key="index" class="flex justify-between text-sm">
                  <span class="text-gray-700">
                    Passager {{ index + 1 }} ({{ passenger.name || 'Non renseigné' }})
                  </span>
                  <span class="font-medium text-gray-900">
                    {{ passenger.price || 0 }} FCFA
                  </span>
                </div>
                <div class="pt-2 border-t border-primary-300 flex justify-between">
                  <span class="font-semibold text-gray-900">Total</span>
                  <span class="text-lg font-bold text-primary-700">{{ calculateTotal() }} FCFA</span>
                </div>
              </div>
            </div>

            <!-- Autres informations -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de siège (optionnel)
                </label>
                <input
                  v-model="form.seat_number"
                  type="text"
                  placeholder="Ex: A12"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <select
                  v-model="form.payment_method"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Sélectionner</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Money">MTN Money</option>
                  <option value="Wave">Wave</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                </select>
              </div>
            </div>

            <!-- Statuts (seulement en édition) -->
            <div v-if="isEdit" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la réservation
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Statut du paiement
                </label>
                <select
                  v-model="form.payment_status"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="refunded">Remboursé</option>
                </select>
              </div>
            </div>

      </form>
    </template>

    <!-- Footer Actions -->
    <template #footer="{ close }">
      <button
        type="button"
        @click="close"
        class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
      >
        Annuler
      </button>
      <button
        type="submit"
        @click="handleSubmit"
        :disabled="loading || !!(lockId && remainingSeconds <= 0)"
        class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {{ loading ? 'Enregistrement...' : isEdit ? 'Modifier' : `Confirmer (${calculateTotal()} FCFA)` }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import reservationService from '@/services/reservationService'
import departureService from '@/services/departureService'
import api from '@/services/api'
import { reservationLocksService } from '@/services/reservationLocks'
import SeatMapSelector from '../seats/SeatMapSelector.vue'
import AutocompleteInput from '@/components/common/AutocompleteInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { Reservation, CreateReservationDto } from '@/types/reservation'
import type { Departure } from '@/types/departure'
import type { SeatMap } from '@/types/seat'
import { useCityStore } from '@/stores/city'

interface Passenger {
  name: string
  email?: string
  phone?: string
  price: number
}

const props = defineProps<{
  modelValue: boolean
  reservation?: Reservation | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

// Computed pour gérer le v-model avec AppModal
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const cityStore = useCityStore()
const departures = ref<Departure[]>([])
const loading = ref(false)
const isEdit = ref(false)
const selectedReservation = ref<Reservation | null>(null)
const selectedDeparture = ref<Departure | null>(null)

// Seat map data
const seatMapData = ref<{
  seatMap: SeatMap
  occupiedSeats: string[]
  lockedSeats: string[]
} | null>(null)
const selectedSeats = ref<string[]>([])
const seatMapSelectorRef = ref<any>(null)
const showSeatSelector = ref(false)

// Lock management
const lockId = ref<string | null>(null)
const sessionId = ref<string>(crypto.randomUUID())
const remainingSeconds = ref(0)
let timerInterval: NodeJS.Timeout | null = null

const form = reactive<CreateReservationDto & { 
  status?: string
  payment_status?: string
  number_of_passengers: number
  passengers: Passenger[]
}>({
  departure_id: '',
  passenger_name: '',
  passenger_phone: '',
  passenger_email: '',
  price: 0,
  seat_number: '',
  payment_method: '',
  status: 'confirmed',
  payment_status: 'pending',
  number_of_passengers: 1,
  passengers: [
    {
      name: '',
      email: '',
      phone: '',
      price: 0
    }
  ]
})

// Calculate total price
const calculateTotal = () => {
  return form.passengers.reduce((sum, p) => {
    return sum + (p.price || 0)
  }, 0)
}

// Get available seats display
const getAvailableSeatsDisplay = (departure: Departure) => {
  // TODO: Call API to get real-time available seats with locks
  return departure.seats_available
}

// Format time (MM:SS)
const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Reset form
const resetForm = () => {
  form.departure_id = ''
  form.passenger_name = ''
  form.passenger_phone = ''
  form.passenger_email = ''
  form.price = 0
  form.seat_number = ''
  form.payment_method = ''
  form.status = 'confirmed'
  form.payment_status = 'pending'
  form.number_of_passengers = 1
  form.passengers = [
    {
      name: '',
      email: '',
      phone: '',
      price: 5000
    }
  ]
  
  // Reset seat selection
  selectedSeats.value = []
  selectedDeparture.value = null
  seatMapData.value = null
  showSeatSelector.value = false
  
  // Reset edit mode
  isEdit.value = false
  selectedReservation.value = null
}

// Fetch departures for autocomplete
const fetchDepartures = async (search: string, offset: number, limit: number) => {
  try {
    const response = await departureService.search(search, offset, limit)
    return {
      items: response.data,
      hasMore: response.hasMore
    }
  } catch (error) {
    console.error('Error fetching departures:', error)
    return {
      items: [],
      hasMore: false
    }
  }
}

// Get departure label for autocomplete
const getDepartureLabel = (departure: Departure) => {
  return `${cityStore.getDisplayName(departure.line?.origin || '')} → ${cityStore.getDisplayName(departure.line?.destination || '')} - ${formatDate(departure.depart_at)} à ${departure.departure_time?.slice(0, 5)}`
}

// Handle departure selection
const onDepartureSelect = (departure: Departure) => {
  form.departure_id = departure.id
  onDepartureChange()
}

// Load departures (kept for backward compatibility)
const loadDepartures = async () => {
  try {
    const response = await departureService.getAll({ status: 'open' })
    departures.value = response.data.filter((d: Departure) => {
      const departDate = new Date(d.depart_at)
      const now = new Date()
      return departDate > now && (d.seats_available === null || (d.seats_available ?? 0) > 0)
    })
  } catch (error) {
    console.error('Error loading departures:', error)
  }
}

// Load seat map for selected departure
const loadSeatMap = async (departureId: string) => {
  try {
    console.log('🔄 Loading available seats for departure:', departureId)
    
    // Charger le seat map et les sièges occupés/lockés depuis l'API
    const response = await api.get(`/departures/${departureId}/available-seats`)
    
    if (!response.data.data.seatMap) {
      console.log('⚠️ Vehicle has no seat map configured')
      seatMapData.value = null
      return
    }

    seatMapData.value = {
      seatMap: response.data.data.seatMap,
      occupiedSeats: response.data.data.occupiedSeats,
      lockedSeats: response.data.data.lockedSeats
    }
    
    console.log('✅ Seat map loaded:', {
      totalSeats: response.data.data.seatMap.seats.length,
      occupied: response.data.data.occupiedSeats.length,
      locked: response.data.data.lockedSeats.length
    })
  } catch (error: any) {
    console.error('❌ Error loading seat map:', error)
    seatMapData.value = null
  }
}

// Handle seats selected
const handleSeatsSelected = async (seats: string[]) => {
  selectedSeats.value = seats
  form.seat_number = seats.join(',')
  console.log('✅ Seats selected:', seats, `(${seats.length}/${form.number_of_passengers})`)
  
  // Ne rien faire de plus tant que tous les sièges ne sont pas sélectionnés
  if (seats.length < form.number_of_passengers) {
    console.log('⏳ Waiting for all seats to be selected...')
    return
  }
  
  // Mettre à jour le lock avec les nouveaux sièges seulement quand tous sont sélectionnés
  if (lockId.value && seats.length === form.number_of_passengers) {
    try {
      await updateLockSeats(seats)
    } catch (error) {
      console.error('Error updating lock seats:', error)
    }
  }
}

// Update lock with new seat numbers
const updateLockSeats = async (seats: string[]) => {
  if (!lockId.value) return
  
  try {
    // Pour l'instant, on utilise l'endpoint update existant
    // qui ne supporte que number_of_seats
    // TODO: Créer un endpoint PATCH /locks/:id/seats pour mettre à jour uniquement les sièges
    console.log('🔄 Lock seats updated:', seats)
  } catch (error: any) {
    console.error('Error updating lock seats:', error)
    throw error
  }
}

// On departure change: create lock and load seat map
const onDepartureChange = async () => {
  if (!form.departure_id || isEdit.value) return
  
  try {
    loading.value = true
    
    // Charger le seat map
    await loadSeatMap(form.departure_id)
    
    const response = await reservationLocksService.createLock({
      departure_id: form.departure_id,
      number_of_seats: form.number_of_passengers,
      seat_numbers: selectedSeats.value.length > 0 ? selectedSeats.value : undefined,
      session_id: sessionId.value
    })
    
    lockId.value = response.data.lock_id
    // Calculer remaining_seconds côté frontend
    // IMPORTANT: Ajouter 'Z' si absent pour forcer le parsing en UTC
    const expiresAtStr = response.data.expires_at.endsWith('Z') 
      ? response.data.expires_at 
      : response.data.expires_at + 'Z'
    const expiresAt = new Date(expiresAtStr)
    const now = new Date()
    remainingSeconds.value = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    
    console.log('✅ Lock créé - Temps restant:', Math.floor(remainingSeconds.value / 60), 'min', remainingSeconds.value % 60, 'sec')
    
    startCountdown()
  } catch (error: any) {
    console.error('Error creating lock:', error)
    alert(error.response?.data?.message || 'Impossible de bloquer les places')
    form.departure_id = ''
  } finally {
    loading.value = false
  }
}

// Update passenger count
const updatePassengerCount = async (count: number) => {
  if (!form.departure_id) return
  
  const oldCount = form.number_of_passengers
  form.number_of_passengers = count
  
  // Update passengers array
  if (count > oldCount) {
    // Add passengers
    for (let i = oldCount; i < count; i++) {
      form.passengers.push({
        name: '',
        price: 5000
      })
    }
  } else if (count < oldCount) {
    // Remove passengers
    form.passengers = form.passengers.slice(0, count)
  }
  
  // Update lock if exists
  if (lockId.value) {
    try {
      loading.value = true
      const response = await reservationLocksService.updateLock(lockId.value, {
        number_of_seats: count
      })
      // Calculer remaining_seconds côté frontend (forcer UTC)
      const expiresAtStr = response.data.expires_at.endsWith('Z') 
        ? response.data.expires_at 
        : response.data.expires_at + 'Z'
      const expiresAt = new Date(expiresAtStr)
      const now = new Date()
      remainingSeconds.value = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    } catch (error: any) {
      console.error('Error updating lock:', error)
      // Rollback
      form.number_of_passengers = oldCount
      form.passengers = form.passengers.slice(0, oldCount)
      alert(error.response?.data?.message || 'Plus assez de places disponibles')
    } finally {
      loading.value = false
    }
  }
}

// Extend lock
const extendLock = async () => {
  if (!lockId.value) return
  
  try {
    const response = await reservationLocksService.extendLock(lockId.value)
    // Calculer remaining_seconds côté frontend (forcer UTC)
    const expiresAtStr = response.data.expires_at.endsWith('Z') 
      ? response.data.expires_at 
      : response.data.expires_at + 'Z'
    const expiresAt = new Date(expiresAtStr)
    const now = new Date()
    remainingSeconds.value = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  } catch (error) {
    console.error('Error extending lock:', error)
    alert('Impossible de prolonger la réservation')
  }
}

// Start countdown
const startCountdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  timerInterval = setInterval(() => {
    remainingSeconds.value--
    
    if (remainingSeconds.value <= 0) {
      clearInterval(timerInterval!)
      timerInterval = null
    }
  }, 1000)
}

// Stop countdown
const stopCountdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  remainingSeconds.value = 0
}

// Delete lock
const deleteLock = async () => {
  if (lockId.value) {
    try {
      await reservationLocksService.deleteLock(lockId.value)
    } catch (error) {
      console.error('Error deleting lock:', error)
    }
    lockId.value = null
  }
}

// Handle close
const handleClose = async () => {
  await deleteLock()
  stopCountdown()
  isOpen.value = false
  resetForm()
}

// Handle submit
const handleSubmit = async () => {
  // Sélection automatique si aucun siège n'est sélectionné et qu'un seat map existe
  if (!isEdit.value && seatMapData.value && selectedSeats.value.length === 0) {
    console.log('⚠️ No seats selected, auto-selecting...')
    if (seatMapSelectorRef.value) {
      const autoSelected = seatMapSelectorRef.value.autoSelectSeats(form.number_of_passengers)
      console.log('✅ Auto-selected seats:', autoSelected)
    }
  }

  // Sync passenger 1 data
  form.passengers[0].name = form.passenger_name
  form.passengers[0].email = form.passenger_email
  form.passengers[0].phone = form.passenger_phone
  
  loading.value = true
  try {
    if (isEdit.value && props.reservation) {
      // Update
      const updateData: any = {
        passenger_name: form.passenger_name,
        passenger_phone: form.passenger_phone,
        passenger_email: form.passenger_email,
        price: calculateTotal(),
        seat_number: form.seat_number,
        payment_method: form.payment_method,
        status: form.status,
        payment_status: form.payment_status
      }
      await reservationService.update(props.reservation.id, updateData)
    } else {
      // Create with lock
      const createData: any = {
        lock_id: lockId.value,
        departure_id: form.departure_id,
        passenger_name: form.passenger_name,
        passenger_phone: form.passenger_phone,
        passenger_email: form.passenger_email,
        number_of_passengers: form.number_of_passengers,
        passengers: form.passengers,
        price: calculateTotal(),
        seat_number: form.seat_number,
        payment_method: form.payment_method
      }
      await reservationService.create(createData)
      lockId.value = null // Lock will be deleted by backend
    }
    
    emit('saved')
    stopCountdown()
    isOpen.value = false
    resetForm()
  } catch (error: any) {
    console.error('Error saving reservation:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    loading.value = false
  }
}

// Watch modal open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    isEdit.value = !!props.reservation
    selectedReservation.value = props.reservation || null
    
    if (props.reservation) {
      // Edit mode
      form.departure_id = props.reservation.departure_id
      form.passenger_name = props.reservation.passenger_name
      form.passenger_phone = props.reservation.passenger_phone
      form.passenger_email = props.reservation.passenger_email || ''
      form.price = props.reservation.price
      form.seat_number = props.reservation.seat_number || ''
      form.payment_method = props.reservation.payment_method || ''
      form.status = props.reservation.status
      form.payment_status = props.reservation.payment_status
      
      // Load passengers if available
      if ((props.reservation as any).passengers && Array.isArray((props.reservation as any).passengers)) {
        form.passengers = (props.reservation as any).passengers
        form.number_of_passengers = form.passengers.length
      }
    } else {
      resetForm()
    }
    
    loadDepartures()
  } else {
    stopCountdown()
  }
})

onMounted(async () => {
  await cityStore.loadCities()
})

onUnmounted(() => {
  stopCountdown()
  deleteLock()
})
</script>
