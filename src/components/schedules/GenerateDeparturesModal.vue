<template>
  <AppModal
    v-model="isOpen"
    title="Générer les départs"
    size="4xl"
    @close="handleClose"
  >
    <template #body>
      <div class="space-y-6">
        <!-- Période -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Période de génération
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Du</label>
              <input
                v-model="startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Au</label>
              <input
                v-model="endDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="mt-2 flex gap-2">
            <button
              v-for="preset in datePresets"
              :key="preset.days"
              @click="setDatePreset(preset.days)"
              type="button"
              class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Horaires sélectionnés -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Horaires à générer
          </label>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
            <div v-if="activeSchedules.length === 0" class="text-sm text-gray-500 text-center py-2">
              Tous les horaires actifs seront générés
            </div>
            <div
              v-for="schedule in displaySchedules"
              :key="schedule.id"
              class="flex items-center gap-3 p-2 bg-white rounded border border-gray-200"
            >
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ schedule.line?.origin }} → {{ schedule.line?.destination }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ schedule.departure_station }} • {{ schedule.departure_time?.substring(0, 5) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div v-if="preview" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-blue-900 mb-1">Aperçu de la génération</h4>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• <strong>{{ preview.schedulesCount }}</strong> horaire(s) actif(s)</li>
                <li>• <strong>~{{ preview.estimatedDepartures }}</strong> départ(s) à générer</li>
                <li>• Période : <strong>{{ preview.days }}</strong> jour(s)</li>
                <li class="text-xs text-blue-600 mt-2">Les départs existants seront ignorés</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-yellow-800">
              Cette opération peut prendre quelques secondes selon le nombre de départs à générer.
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <button
        type="button"
        @click="close"
        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Annuler
      </button>
      <button
        @click="handleGenerate"
        :disabled="generating || !isValid"
        class="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
      >
          <svg v-if="generating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ generating ? 'Génération en cours...' : 'Générer les départs' }}
        </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import apiClient from '@/services/api'
import AppModal from '@/components/common/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  selectedSchedules: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  generated: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  isOpen.value = false
}

// État
const generating = ref(false)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

const datePresets = [
  { label: '30 jours', days: 30 },
  { label: '60 jours', days: 60 },
  { label: '90 jours', days: 90 }
]

// Horaires sélectionnés ou tous les actifs
const activeSchedules = computed(() => {
  return (props.selectedSchedules || []).filter((s: any) => s.is_active)
})

const displaySchedules = computed(() => {
  return activeSchedules.value.slice(0, 5)
})

// Validation
const isValid = computed(() => {
  return startDate.value && endDate.value && new Date(startDate.value) <= new Date(endDate.value)
})

// Aperçu
const preview = computed(() => {
  if (!isValid.value) return null
  
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  const schedulesCount = activeSchedules.value.length
  
  // Estimation grossière : moyenne de 4 départs par semaine par horaire
  const estimatedDepartures = Math.ceil(schedulesCount * (days / 7) * 4)
  
  return {
    schedulesCount,
    days,
    estimatedDepartures
  }
})

// Méthodes
function setDatePreset(days: number) {
  startDate.value = new Date().toISOString().split('T')[0]
  endDate.value = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

async function handleGenerate() {
  try {
    generating.value = true

    if (activeSchedules.value.length === 1) {
      // Générer pour un seul horaire
      await apiClient.post(`/schedules/${activeSchedules.value[0].id}/generate`, {
        start_date: startDate.value,
        end_date: endDate.value
      })
    } else {
      // Générer pour tous les horaires actifs
      const daysAhead = Math.ceil((new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) / (1000 * 60 * 60 * 24))
      await apiClient.post('/schedules/generate-all', {
        days_ahead: daysAhead
      })
    }

    emit('generated')
    isOpen.value = false
  } catch (error: any) {
    console.error('Erreur lors de la génération:', error)
    alert(error.response?.data?.message || 'Erreur lors de la génération des départs')
  } finally {
    generating.value = false
  }
}

// Initialiser les dates
watch(() => props.selectedSchedules, () => {
  // Reset dates when schedules change
}, { immediate: true })
</script>
