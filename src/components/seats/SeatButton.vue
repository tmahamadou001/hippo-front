<template>
  <button
    v-if="seat"
    @click="$emit('click', seat)"
    :class="[
      'seat-button',
      'relative w-14 h-14 rounded-lg border-2 transition-all duration-200',
      'flex flex-col items-center justify-center',
      'text-xs font-semibold',
      getSeatClass(),
      isSelected && 'ring-4 ring-blue-400 scale-110'
    ]"
    :disabled="!seat.available && !isSelected"
    :title="getSeatTitle()"
  >
    <!-- Seat ID -->
    <span class="text-xs font-bold">{{ seat.id }}</span>
    
    <!-- Type indicator -->
    <span v-if="seat.type && seat.type !== 'standard'" class="text-[8px] opacity-75">
      {{ getTypeLabel(seat.type) }}
    </span>

    <!-- Price modifier indicator -->
    <span v-if="seat.price_modifier && seat.price_modifier > 0" class="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] px-1 rounded-full">
      +{{ (seat.price_modifier / 1000).toFixed(0) }}k
    </span>

    <!-- Features indicator -->
    <div v-if="seat.features && seat.features.length > 0" class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
      <span
        v-for="feature in seat.features.slice(0, 3)"
        :key="feature"
        class="w-1 h-1 rounded-full bg-current opacity-50"
      ></span>
    </div>

    <!-- Disabled overlay -->
    <div v-if="!seat.available" class="absolute inset-0 bg-gray-900 bg-opacity-20 rounded-lg flex items-center justify-center">
      <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </button>

  <!-- Empty slot if no seat -->
  <div v-else class="w-14 h-14"></div>
</template>

<script setup lang="ts">
import { Seat, SeatType, SeatMapUtils } from '../../types/seat'

const props = defineProps<{
  seat?: Seat
  isSelected?: boolean
  isOccupied?: boolean
  isLocked?: boolean
}>()

defineEmits<{
  click: [seat: Seat]
}>()

function getSeatClass(): string {
  if (!props.seat) return ''

  // Si sélectionné
  if (props.isSelected) {
    return 'bg-blue-500 border-blue-600 text-white shadow-lg'
  }

  // Si occupé ou locké (pour le mode sélection client)
  if (props.isOccupied) {
    return 'bg-red-100 border-red-400 text-red-800 cursor-not-allowed opacity-60'
  }

  if (props.isLocked) {
    return 'bg-orange-100 border-orange-400 text-orange-800 cursor-not-allowed opacity-60'
  }

  // Si désactivé
  if (!props.seat.available) {
    return 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed opacity-50'
  }

  // Couleur selon le type
  return SeatMapUtils.getSeatTypeColor(props.seat.type)
}

function getTypeLabel(type: SeatType): string {
  switch (type) {
    case 'premium':
      return '⭐'
    case 'comfort':
      return '💺'
    case 'vip':
      return '👑'
    default:
      return ''
  }
}

function getSeatTitle(): string {
  if (!props.seat) return ''

  const parts: string[] = [`Siège ${props.seat.id}`]

  if (props.seat.type && props.seat.type !== 'standard') {
    parts.push(`Type: ${props.seat.type}`)
  }

  if (props.seat.price_modifier && props.seat.price_modifier > 0) {
    parts.push(`+${props.seat.price_modifier} FCFA`)
  }

  if (props.seat.features && props.seat.features.length > 0) {
    parts.push(`Caractéristiques: ${props.seat.features.join(', ')}`)
  }

  if (!props.seat.available) {
    parts.push('(Désactivé)')
  }

  return parts.join(' • ')
}
</script>

<style scoped>
.seat-button {
  @apply hover:shadow-md active:scale-95;
}

.seat-button:disabled {
  @apply hover:shadow-none active:scale-100;
}
</style>
