<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <MapPin class="w-4 h-4 text-gray-400" />
          <span class="text-sm font-semibold text-gray-900">{{ origin }} → {{ destination }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ lineName }}</p>
      </div>
      <span
        :class="[
          'text-xs px-2 py-1 rounded-full font-medium',
          statusClass
        ]"
      >
        {{ statusLabel }}
      </span>
    </div>
    
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="flex items-center space-x-2">
        <Clock class="w-4 h-4 text-gray-400" />
        <div>
          <p class="text-xs text-gray-500">Départ</p>
          <p class="text-sm font-medium text-gray-900">{{ departureTime }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <Users class="w-4 h-4 text-gray-400" />
        <div>
          <p class="text-xs text-gray-500">Places</p>
          <p class="text-sm font-medium text-gray-900">{{ seatsBooked }}/{{ totalSeats }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
      <div class="flex items-center space-x-2">
        <Truck class="w-4 h-4 text-gray-400" />
        <span class="text-xs text-gray-600">{{ vehicleName }}</span>
      </div>
      <div class="flex items-center space-x-1">
        <span class="text-sm font-bold text-corail-600">{{ price }} FCFA</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPin, Clock, Users, Truck } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  origin: string
  destination: string
  lineName: string
  departureTime: string
  seatsBooked: number
  totalSeats: number
  vehicleName: string
  price: number
  status: 'open' | 'closed' | 'cancelled'
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  const labels = {
    open: 'Ouvert',
    closed: 'Complet',
    cancelled: 'Annulé'
  }
  return labels[props.status]
})

const statusClass = computed(() => {
  const classes = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return classes[props.status]
})
</script>
