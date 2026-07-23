<template>
  <AppModal
    v-model="isOpen"
    :title="line ? 'Modifier la ligne' : 'Nouvelle ligne'"
    size="2xl"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Origin & Destination -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Origine <span class="text-red-500">*</span>
                </label>
                <CityAutocomplete
                  v-model="form.origin"
                  placeholder="Ex: Abidjan"
                  required
                  :error="errors.origin"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Destination <span class="text-red-500">*</span>
                </label>
                <CityAutocomplete
                  v-model="form.destination"
                  placeholder="Ex: Yamoussoukro"
                  required
                  :error="errors.destination"
                />
              </div>
            </div>

            <!-- Distance & Duration -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Distance (km)
                </label>
                <input
                  v-model.number="form.distance_km"
                  type="number"
                  min="0"
                  placeholder="Ex: 240"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée
                </label>
                <input
                  v-model="form.estimated_duration"
                  type="text"
                  placeholder="Ex: 03:30:00"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500">Format: HH:MM:SS</p>
              </div>
            </div>

            <!-- Base Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prix de base (XOF)
              </label>
              <input
                v-model.number="form.base_price"
                type="number"
                min="0"
                step="100"
                placeholder="Ex: 5000"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <!-- Stops -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Arrêts intermédiaires
              </label>
              <div class="space-y-2">
                <div
                  v-for="(stop, index) in form.stops"
                  :key="index"
                  class="flex gap-2"
                >
                  <input
                    v-model="(form.stops as any)[index]"
                    type="text"
                    placeholder="Ex: Bouaké"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    @click="removeStop(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addStop"
                  class="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  + Ajouter un arrêt
                </button>
              </div>
            </div>

            <!-- Active Status -->
            <div class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
              />
              <label for="is_active" class="ml-2 text-sm text-gray-700">
                Ligne active
              </label>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

      </form>
    </template>

    <template #footer="{ close }">
      <button
        type="button"
        @click="close"
        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        :disabled="loading"
      >
        Annuler
      </button>
      <button
        type="submit"
        @click="handleSubmit"
        :disabled="loading"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? 'Enregistrement...' : line ? 'Mettre à jour' : 'Créer' }}</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import lineService from '@/services/lineService'
import AppModal from '@/components/common/AppModal.vue'
import type { Line, CreateLineDto, UpdateLineDto } from '@/types/line'
import CityAutocomplete from '@/components/shared/CityAutocomplete.vue'

const props = defineProps<{
  modelValue: boolean
  line?: Line | null
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

const form = reactive<CreateLineDto>({
  origin: '',
  destination: '',
  estimated_duration: '',
  base_price: undefined,
  distance_km: undefined,
  stops: [],
  is_active: true
})

const errors = reactive({
  origin: '',
  destination: ''
})

const loading = ref(false)
const errorMessage = ref('')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset or populate form
    if (props.line) {
      form.origin = props.line.origin
      form.destination = props.line.destination
      form.estimated_duration = props.line.estimated_duration || ''
      form.base_price = props.line.base_price
      form.distance_km = props.line.distance_km
      form.stops = props.line.stops ? [...props.line.stops] : []
      form.is_active = props.line.is_active
    } else {
      form.origin = ''
      form.destination = ''
      form.estimated_duration = ''
      form.base_price = undefined
      form.distance_km = undefined
      form.stops = []
      form.is_active = true
    }
    errors.origin = ''
    errors.destination = ''
    errorMessage.value = ''
  }
})

const handleClose = () => {
  isOpen.value = false
}

const addStop = () => {
  form.stops!.push('')
}

const removeStop = (index: number) => {
  form.stops!.splice(index, 1)
}

const validateForm = () => {
  let isValid = true
  errors.origin = ''
  errors.destination = ''

  if (!form.origin.trim()) {
    errors.origin = "L'origine est requise"
    isValid = false
  }

  if (!form.destination.trim()) {
    errors.destination = 'La destination est requise'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Clean up stops (remove empty ones)
    const cleanedStops = form.stops?.filter(stop => stop.trim() !== '')

    const data: CreateLineDto | UpdateLineDto = {
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      estimated_duration: form.estimated_duration || undefined,
      base_price: form.base_price,
      distance_km: form.distance_km,
      stops: cleanedStops,
      is_active: form.is_active
    }

    if (props.line) {
      await lineService.update(props.line.id, data)
    } else {
      await lineService.create(data as any)
    }

    emit('saved')
    isOpen.value = false
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
