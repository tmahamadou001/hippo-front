<template>
  <div class="seat-map-editor">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ isEdit ? 'Modifier le template' : 'Nouveau template de sièges' }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ isEdit ? 'Modifiez la configuration de votre template' : 'Créez un template personnalisé pour vos véhicules' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="handleSave"
            :disabled="saving || !isValid"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer le template') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Configuration Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <!-- Left Panel: Controls -->
      <div class="space-y-6">
        <!-- Informations générales -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            📝 Informations
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Nom du template <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Ex: Bus 45 places (2-2)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Description du template..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Layout Configuration -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            ⚙️ Configuration de la grille
          </h3>
          
          <div class="space-y-4">
            <!-- Rows -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Nombre de rangées
              </label>
              <div class="flex items-center gap-2">
                <button
                  @click="form.layout.rows = Math.max(1, form.layout.rows - 1)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  −
                </button>
                <input
                  v-model.number="form.layout.rows"
                  type="number"
                  min="1"
                  max="20"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  @click="form.layout.rows = Math.min(20, form.layout.rows + 1)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Columns -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Nombre de colonnes
              </label>
              <div class="flex items-center gap-2">
                <button
                  @click="form.layout.columns = Math.max(2, form.layout.columns - 1)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  −
                </button>
                <input
                  v-model.number="form.layout.columns"
                  type="number"
                  min="2"
                  max="6"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  @click="form.layout.columns = Math.min(6, form.layout.columns + 1)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Aisle Position -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Allée après la colonne
              </label>
              <input
                v-model="aisleAfterInput"
                type="text"
                placeholder="Ex: 2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">Séparer par des virgules</p>
            </div>
          </div>
        </div>

        <!-- Options -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            🎛️ Options
          </h3>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <input
                v-model="form.metadata.hasToilet"
                type="checkbox"
                id="hasToilet"
                class="rounded border-gray-300"
              />
              <label for="hasToilet" class="ml-2 block text-sm text-gray-700">
                Le véhicule a des toilettes
              </label>
            </div>

            <div v-if="form.metadata.hasToilet" class="ml-6">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Position des toilettes
              </label>
              <select
                v-model="form.metadata.toiletPosition"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="back">Arrière</option>
                <option value="middle">Milieu</option>
                <option value="front">Avant</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            📊 Statistiques
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Total de sièges:</span>
              <span class="font-semibold">{{ totalSeats }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Rangées:</span>
              <span class="font-semibold">{{ form.layout.rows }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Colonnes:</span>
              <span class="font-semibold">{{ form.layout.columns }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center/Right Panel: Preview -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-900">
              👁️ Aperçu de la disposition
            </h3>
            <div class="text-xs text-gray-500">
              Prévisualisation du template
            </div>
          </div>

          <!-- Bus Preview -->
          <div class="bg-gray-50 rounded-lg p-6 overflow-x-auto">
            <!-- Driver Section -->
            <div class="flex items-center justify-center mb-6 pb-4 border-b-2 border-gray-300">
              <div class="flex items-center gap-3 bg-blue-100 px-4 py-2 rounded-lg">
                <span class="text-2xl">🧑‍✈️</span>
                <span class="text-sm font-medium text-blue-900">Conducteur</span>
              </div>
            </div>

            <!-- Seats Grid -->
            <div class="space-y-2" :style="{ maxWidth: gridMaxWidth }">
              <div
                v-for="row in form.layout.rows"
                :key="row"
                class="flex items-center gap-2"
              >
                <!-- Row Number -->
                <div class="w-8 text-center text-xs font-medium text-gray-500">
                  {{ row }}
                </div>

                <!-- Seats in this row -->
                <div class="flex gap-2 flex-1">
                  <template v-for="col in form.layout.columns" :key="col">
                    <!-- Aisle -->
                    <div
                      v-if="isAisleAfter(col)"
                      class="w-12 flex items-center justify-center"
                    >
                      <div class="h-full w-1 bg-gray-300 rounded"></div>
                    </div>

                    <!-- Seat -->
                    <div
                      class="w-12 h-12 flex items-center justify-center bg-blue-100 border-2 border-blue-300 rounded-lg text-xs font-medium text-blue-800"
                    >
                      {{ getSeatLabel(row, col) }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import seatTemplateService from '@/services/seatTemplateService'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

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

// Validation
const isValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.layout.rows > 0 &&
         form.value.layout.columns > 0
})

// Calculer le nombre total de sièges
const totalSeats = computed(() => {
  return form.value.layout.rows * form.value.layout.columns
})

// Largeur max de la grille
const gridMaxWidth = computed(() => {
  const seatsPerRow = form.value.layout.columns
  const aisleCount = form.value.layout.aisleAfter.length
  return `${(seatsPerRow * 48) + (aisleCount * 48) + ((seatsPerRow - 1) * 8)}px`
})

// Vérifier si c'est une allée après cette colonne
const isAisleAfter = (col: number) => {
  return form.value.layout.aisleAfter.includes(col)
}

// Obtenir le label du siège
const getSeatLabel = (row: number, col: number) => {
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return `${row}${rowLabels[col - 1] || col}`
}

// Convertir aisleAfterInput en array
watch(aisleAfterInput, (value) => {
  if (value) {
    form.value.layout.aisleAfter = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
  } else {
    form.value.layout.aisleAfter = []
  }
})

// Charger le template si édition
const loadTemplate = async () => {
  if (!route.params.id) return
  
  try {
    loading.value = true
    const response = await seatTemplateService.getById(route.params.id as string)
    const template = response.data
    
    form.value = {
      name: template.name,
      description: template.description,
      layout: { ...template.layout },
      metadata: { ...template.metadata }
    }
    aisleAfterInput.value = template.layout.aisleAfter?.join(', ') || ''
  } catch (error: any) {
    console.error('Error loading template:', error)
    alert('Erreur lors du chargement du template')
    router.push('/settings')
  } finally {
    loading.value = false
  }
}

// Sauvegarder
const handleSave = async () => {
  if (!isValid.value) return
  
  try {
    saving.value = true

    const data = {
      name: form.value.name,
      description: form.value.description,
      total_seats: totalSeats.value,
      layout: form.value.layout,
      metadata: form.value.metadata
    }

    if (isEdit.value) {
      await seatTemplateService.update(route.params.id as string, data as any)
    } else {
      await seatTemplateService.create(data as any)
    }

    router.push('/settings?tab=templates')
  } catch (error: any) {
    console.error('Error saving template:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

// Annuler
const handleCancel = () => {
  if (confirm('Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.')) {
    router.push('/settings?tab=templates')
  }
}

onMounted(() => {
  loadTemplate()
})
</script>
