<template>
  <div>
    <AutocompleteInput
      v-model="selectedLine"
      placeholder="Rechercher une ligne (o:origine, d:destination)..."
      :disabled="disabled"
      :fetch-items="fetchLines"
      :item-label="getLineLabel"
      :item-key="(item) => item.id"
      @select="onLineSelect"
    >
      <template #item="{ item }">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-medium text-gray-900">
              {{ cityStore.getDisplayName(item.origin) }} → {{ cityStore.getDisplayName(item.destination) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ item.distance ? `${item.distance} km` : 'Distance non définie' }}
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="text-sm font-medium text-blue-600">
              {{ formatPrice(item.base_price) }}
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
        <div class="pt-1 border-t border-gray-200 mt-2">
          <span class="font-mono bg-white px-1.5 py-0.5 rounded border">o:man d:abidjan</span> → Combiner les filtres
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AutocompleteInput from './AutocompleteInput.vue'
import lineService from '@/services/lineService'
import { useCityStore } from '@/stores/city'
import type { Line } from '@/types/line'

const cityStore = useCityStore()

interface Props {
  modelValue?: string | null
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'select': [line: Line]
}>()

const selectedLine = ref<Line | null>(null)

// Fetch lines avec recherche avancée
const fetchLines = async (search: string, offset: number, limit: number) => {
  try {
    const response = await lineService.search(search, offset, limit)
    return {
      items: response.data,
      hasMore: response.hasMore,
      total: response.total
    }
  } catch (error) {
    console.error('Error fetching lines:', error)
    return {
      items: [],
      hasMore: false,
      total: 0
    }
  }
}

// Get line label
const getLineLabel = (line: Line | null) => {
  if (!line) return ''
  return `${cityStore.getDisplayName(line.origin)} → ${cityStore.getDisplayName(line.destination)}`
}

// Format price
const formatPrice = (price: number | undefined) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price)
}

// Handle line selection
const onLineSelect = (line: Line | null) => {
  if (line) {
    emit('update:modelValue', line.id)
    emit('select', line)
  }
}

// Watch modelValue changes
watch(() => props.modelValue, async (newValue) => {
  if (newValue && (!selectedLine.value || selectedLine.value.id !== newValue)) {
    try {
      const response = await lineService.getById(newValue)
      selectedLine.value = response.data
    } catch (error) {
      console.error('Error loading line:', error)
    }
  } else if (!newValue) {
    selectedLine.value = null
  }
}, { immediate: true })
</script>
