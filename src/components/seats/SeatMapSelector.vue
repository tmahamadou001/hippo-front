<template>
  <div class="seat-map-selector">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          🪑 Sélectionnez vos places
        </h3>
        <div class="text-sm text-gray-600">
          {{ selectedSeats.length }} / {{ maxSeats }} place(s)
        </div>
      </div>

      <!-- Légende -->
      <div class="flex flex-wrap gap-4 mb-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
          <span class="text-gray-700">Disponible</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
          <span class="text-gray-700">Occupé</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-orange-100 border-2 border-orange-400 rounded"></div>
          <span class="text-gray-700">Réservé temporairement</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
          <span class="text-gray-700">Votre sélection</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
          <span class="text-gray-700">Premium (+{{ premiumPrice.toLocaleString() }} FCFA)</span>
        </div>
      </div>

      <!-- Bus Preview -->
      <div class="bg-gray-50 rounded-lg p-6 overflow-x-auto">
        <!-- Driver Section -->
        <div class="flex items-center justify-center mb-6 pb-4 border-b-2 border-gray-300">
          <div class="flex items-center gap-3 bg-blue-100 px-4 py-2 rounded-lg">
            <span class="text-2xl">🧑‍✈️</span>
            <span class="text-sm font-medium text-blue-900">Avant du bus</span>
          </div>
        </div>

        <!-- Seats Grid -->
        <div class="space-y-2" :style="{ maxWidth: gridMaxWidth }">
          <div
            v-for="row in seatMap.layout.rows"
            :key="row"
            class="flex items-center gap-2"
          >
            <!-- Row Number -->
            <div class="w-8 text-center text-xs font-medium text-gray-500">
              {{ row }}
            </div>

            <!-- Seats in this row -->
            <div class="flex gap-2 flex-1">
              <template v-for="col in seatMap.layout.columns" :key="col">
                <!-- Aisle -->
                <div
                  v-if="isAisleAfter(col)"
                  class="w-8 flex items-center justify-center"
                >
                  <div class="h-full w-1 bg-gray-300 rounded"></div>
                </div>

                <!-- Seat Button -->
                <SeatButton
                  :seat="getSeat(row, col)"
                  :is-selected="isSelected(getSeat(row, col)?.id)"
                  :is-occupied="isOccupied(getSeat(row, col)?.id)"
                  :is-locked="isLocked(getSeat(row, col)?.id)"
                  @click="toggleSeat"
                />
              </template>
            </div>
          </div>
        </div>

        <!-- Toilet (if configured) -->
        <div v-if="seatMap.metadata?.hasToilet" class="mt-6 pt-4 border-t-2 border-gray-300">
          <div class="flex items-center justify-center">
            <div class="bg-gray-200 px-4 py-2 rounded-lg">
              <span class="text-lg">🚽</span>
              <span class="text-sm font-medium text-gray-700 ml-2">Toilettes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected seats summary -->
      <div v-if="selectedSeats.length > 0" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="text-sm font-semibold text-blue-900 mb-1">
              Places sélectionnées
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="seatId in selectedSeats"
                :key="seatId"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
              >
                {{ seatId }}
                <button
                  @click="removeSeat(seatId)"
                  class="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
          <div class="text-right ml-4">
            <p class="text-xs text-blue-700 mb-1">Prix total</p>
            <p class="text-2xl font-bold text-blue-900">
              {{ totalPrice.toLocaleString() }} <span class="text-sm font-normal">FCFA</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Info message -->
      <div v-if="selectedSeats.length === 0" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600 text-center">
          👆 Cliquez sur les sièges pour sélectionner vos places
        </p>
      </div>

      <!-- Max seats warning -->
      <div v-if="selectedSeats.length >= maxSeats" class="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p class="text-sm text-yellow-800 text-center">
          ⚠️ Vous avez sélectionné le nombre maximum de places ({{ maxSeats }})
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SeatButton from './SeatButton.vue'
import { SeatMap, Seat, SeatMapUtils } from '../../types/seat'

const props = defineProps<{
  seatMap: SeatMap
  occupiedSeats: string[]
  lockedSeats: string[]
  maxSeats: number
  basePrice: number
}>()

const emit = defineEmits<{
  seatsSelected: [seats: string[]]
}>()

const selectedSeats = ref<string[]>([])

// Computed
const premiumPrice = computed(() => {
  const premiumSeat = props.seatMap.seats.find(s => s.type === 'premium')
  return premiumSeat?.price_modifier || 1000
})

const totalPrice = computed(() => {
  let total = 0
  
  selectedSeats.value.forEach(seatId => {
    const seat = props.seatMap.seats.find(s => s.id === seatId)
    if (seat) {
      total += props.basePrice
      if (seat.price_modifier) {
        total += seat.price_modifier
      }
    }
  })
  
  return total
})

const gridMaxWidth = computed(() => {
  const seatWidth = 60
  const gap = 8
  const aisleWidth = 32
  const rowNumberWidth = 32
  
  const aisleCount = props.seatMap.layout.aisleAfter?.length ?? 0
  const width = rowNumberWidth + 
    (props.seatMap.layout.columns * seatWidth) + 
    ((props.seatMap.layout.columns - 1) * gap) + 
    (aisleCount * aisleWidth)
  
  return `${width}px`
})

// Methods
function getSeat(row: number, col: number): Seat | undefined {
  const column = SeatMapUtils.columnNumberToLetter(col)
  const id = SeatMapUtils.generateSeatId(row, column)
  return props.seatMap.seats.find(s => s.id === id)
}

function isAisleAfter(col: number): boolean {
  return props.seatMap.layout.aisleAfter?.includes(col) ?? false
}

function isSelected(seatId?: string): boolean {
  return seatId ? selectedSeats.value.includes(seatId) : false
}

function isOccupied(seatId?: string): boolean {
  return seatId ? props.occupiedSeats.includes(seatId) : false
}

function isLocked(seatId?: string): boolean {
  return seatId ? props.lockedSeats.includes(seatId) : false
}

function toggleSeat(seat: Seat) {
  if (!seat.available) return
  if (isOccupied(seat.id)) return
  if (isLocked(seat.id)) return

  const index = selectedSeats.value.indexOf(seat.id)
  
  if (index > -1) {
    // Désélectionner le siège
    selectedSeats.value.splice(index, 1)
  } else {
    // Sélectionner le siège
    if (selectedSeats.value.length < props.maxSeats) {
      // Il reste de la place, ajouter simplement
      selectedSeats.value.push(seat.id)
    } else {
      // Limite atteinte, remplacer le dernier siège sélectionné
      selectedSeats.value[selectedSeats.value.length - 1] = seat.id
    }
  }

  emit('seatsSelected', selectedSeats.value)
}

function removeSeat(seatId: string) {
  const index = selectedSeats.value.indexOf(seatId)
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
    emit('seatsSelected', selectedSeats.value)
  }
}

// Sélection automatique de sièges disponibles
function autoSelectSeats(count: number): string[] {
  const availableSeats = props.seatMap.seats.filter(seat => 
    seat.available && 
    !isOccupied(seat.id) && 
    !isLocked(seat.id)
  )

  // Trier par row puis column pour sélectionner les premiers sièges disponibles
  availableSeats.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row
    return a.column.localeCompare(b.column)
  })

  const selected = availableSeats.slice(0, count).map(s => s.id)
  selectedSeats.value = selected
  emit('seatsSelected', selected)
  
  return selected
}

// Exposer la méthode pour l'utiliser depuis le parent
defineExpose({
  autoSelectSeats
})
</script>

<style scoped>
.seat-map-selector {
  @apply w-full;
}
</style>
