<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

          <!-- Modal -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <!-- Header -->
            <div class="bg-white px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ isEdit ? 'Modifier le template' : 'Nouveau template' }}
                </h3>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Ex: Bus 45 places (2-2)"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Description du template..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                ></textarea>
              </div>

              <!-- Configuration du layout -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Rangées <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.layout.rows"
                    type="number"
                    required
                    min="1"
                    max="20"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Colonnes <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="form.layout.columns"
                    type="number"
                    required
                    min="2"
                    max="6"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Allée après col.
                  </label>
                  <input
                    v-model="aisleAfterInput"
                    type="text"
                    placeholder="Ex: 2"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  />
                  <p class="text-xs text-gray-500 mt-1">Séparer par des virgules</p>
                </div>
              </div>

              <!-- Prévisualisation du layout -->
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 class="text-sm font-semibold text-gray-900 mb-4">Prévisualisation</h4>
                
                <!-- Grille de sièges générée -->
                <div class="bg-white rounded-lg p-4 max-h-[300px] overflow-auto">
                  <div 
                    class="grid gap-2"
                    :style="{
                      gridTemplateColumns: `repeat(${form.layout.columns}, minmax(0, 1fr))`
                    }"
                  >
                    <div
                      v-for="(seat, index) in previewSeats"
                      :key="index"
                      :class="[
                        'flex items-center justify-center h-10 rounded text-xs font-medium transition-colors',
                        seat.isAisle 
                          ? 'bg-transparent' 
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      ]"
                    >
                      {{ seat.isAisle ? '' : seat.number }}
                    </div>
                  </div>
                </div>
                
                <div class="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <span>
                    <strong>{{ totalSeats }} places</strong> - {{ form.layout.rows }} rangées × {{ form.layout.columns }} colonnes
                  </span>
                </div>
              </div>

              <!-- Métadonnées -->
              <div class="space-y-4">
                <h4 class="text-sm font-semibold text-gray-900">Options</h4>
                
                <div class="flex items-center">
                  <input
                    v-model="form.metadata.hasToilet"
                    type="checkbox"
                    id="hasToilet"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="hasToilet" class="ml-2 block text-sm text-gray-700">
                    Le véhicule a des toilettes
                  </label>
                </div>

                <div v-if="form.metadata.hasToilet" class="ml-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Position des toilettes
                  </label>
                  <select
                    v-model="form.metadata.toiletPosition"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="back">Arrière</option>
                    <option value="middle">Milieu</option>
                    <option value="front">Avant</option>
                  </select>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {{ loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import seatTemplateService, { type SeatMapTemplate } from '@/services/seatTemplateService'

const props = defineProps<{
  template?: SeatMapTemplate | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const modelValue = ref(true)
const loading = ref(false)
const isEdit = computed(() => !!props.template)

const form = ref({
  name: '',
  description: '',
  layout: {
    rows: 10,
    columns: 4,
    aisleAfter: [2] as number[]
  },
  metadata: {
    hasToilet: false,
    toiletPosition: 'back' as 'back' | 'middle' | 'front'
  }
})

const aisleAfterInput = ref('2')

// Calculer le nombre total de sièges
const totalSeats = computed(() => {
  return form.value.layout.rows * form.value.layout.columns
})

// Générer les sièges pour la prévisualisation
const previewSeats = computed(() => {
  const seats: Array<{ number: string; isAisle: boolean }> = []
  const { rows, columns, aisleAfter } = form.value.layout
  
  let seatNumber = 1
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      // Vérifier si c'est une allée
      const isAisle = aisleAfter.includes(col)
      
      if (isAisle) {
        seats.push({ number: '', isAisle: true })
      } else {
        const label = `${row + 1}${rowLabels[col] || col}`
        seats.push({ number: label, isAisle: false })
        seatNumber++
      }
    }
  }
  
  return seats
})

// Charger les données du template si édition
watch(() => props.template, (template) => {
  if (template) {
    form.value = {
      name: template.name,
      description: template.description,
      layout: { ...template.layout },
      metadata: { ...template.metadata }
    }
    aisleAfterInput.value = template.layout.aisleAfter?.join(', ') || ''
  }
}, { immediate: true })

// Convertir aisleAfterInput en array
watch(aisleAfterInput, (value) => {
  if (value) {
    form.value.layout.aisleAfter = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
  } else {
    form.value.layout.aisleAfter = []
  }
})

// Soumettre le formulaire
const handleSubmit = async () => {
  try {
    loading.value = true

    const data = {
      name: form.value.name,
      description: form.value.description,
      total_seats: totalSeats.value,
      layout: form.value.layout,
      metadata: form.value.metadata
    }

    if (isEdit.value && props.template) {
      await seatTemplateService.update(props.template.id, data)
    } else {
      await seatTemplateService.create(data)
    }

    emit('saved')
  } catch (error: any) {
    console.error('Error saving template:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
