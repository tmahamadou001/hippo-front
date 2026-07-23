<template>
  <div class="seat-map-editor">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">
        Configuration de la disposition des sièges
      </h2>
      <p class="text-sm text-gray-600 mt-1">
        Configurez la disposition des sièges pour ce véhicule
      </p>
    </div>

    <!-- Configuration Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <!-- Left Panel: Controls -->
      <div class="space-y-6">
        <!-- Templates -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            📋 Templates prédéfinis
          </h3>
          <div class="space-y-2">
            <button
              v-for="template in templates"
              :key="template.id"
              @click="loadTemplate(template.id)"
              class="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ template.icon }}</span>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ template.name }}</div>
                  <div class="text-xs text-gray-500">{{ template.description }}</div>
                </div>
              </div>
            </button>
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
                  @click="decrementRows"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  −
                </button>
                <input
                  v-model.number="layout.rows"
                  type="number"
                  min="1"
                  max="20"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  @click="incrementRows"
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
                  @click="decrementColumns"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  −
                </button>
                <input
                  v-model.number="layout.columns"
                  type="number"
                  min="2"
                  max="6"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  @click="incrementColumns"
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
              <select
                v-model.number="aisleAfterColumn"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option :value="null">Pas d'allée</option>
                <option v-for="col in layout.columns - 1" :key="col" :value="col">
                  {{ columnNumberToLetter(col) }}
                </option>
              </select>
            </div>

            <!-- Apply Button -->
            <button
              @click="regenerateSeats"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer la configuration
            </button>
          </div>
        </div>

        <!-- Seat Configuration (when selected) -->
        <div v-if="selectedSeat" class="bg-white rounded-lg border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            🪑 Configuration du siège {{ selectedSeat.id }}
          </h3>
          
          <div class="space-y-4">
            <!-- Seat Type -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Type de siège
              </label>
              <select
                v-model="selectedSeat.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="comfort">Confort</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <!-- Price Modifier -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Supplément de prix (FCFA)
              </label>
              <input
                v-model.number="selectedSeat.price_modifier"
                type="number"
                min="0"
                step="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <!-- Features -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-2">
                Caractéristiques
              </label>
              <div class="space-y-2">
                <label
                  v-for="feature in availableFeatures"
                  :key="feature.value"
                  class="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    :value="feature.value"
                    v-model="selectedSeat.features"
                    class="rounded border-gray-300"
                  />
                  <span>{{ feature.label }}</span>
                </label>
              </div>
            </div>

            <!-- Available Toggle -->
            <div>
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  v-model="selectedSeat.available"
                  class="rounded border-gray-300"
                />
                <span class="font-medium">Siège disponible</span>
              </label>
              <p class="text-xs text-gray-500 mt-1">
                Décochez pour désactiver ce siège (siège cassé, réservé, etc.)
              </p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="deleteSeat(selectedSeat.id)"
                class="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Supprimer
              </button>
              <button
                @click="selectedSeat = null"
                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
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
              <span class="text-gray-600">Sièges actifs:</span>
              <span class="font-semibold text-green-600">{{ activeSeats }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Sièges désactivés:</span>
              <span class="font-semibold text-red-600">{{ disabledSeats }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Sièges premium:</span>
              <span class="font-semibold text-yellow-600">{{ premiumSeats }}</span>
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
              Cliquez sur un siège pour le configurer
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
                v-for="row in layout.rows"
                :key="row"
                class="flex items-center gap-2"
              >
                <!-- Row Number -->
                <div class="w-8 text-center text-xs font-medium text-gray-500">
                  {{ row }}
                </div>

                <!-- Seats in this row -->
                <div class="flex gap-2 flex-1">
                  <template v-for="col in layout.columns" :key="col">
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
                      :is-selected="selectedSeat?.id === getSeat(row, col)?.id"
                      @click="selectSeat(getSeat(row, col))"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- Toilet (if configured) -->
            <div v-if="metadata.hasToilet" class="mt-6 pt-4 border-t-2 border-gray-300">
              <div class="flex items-center justify-center">
                <div class="bg-gray-200 px-4 py-2 rounded-lg">
                  <span class="text-lg">🚽</span>
                  <span class="text-sm font-medium text-gray-700 ml-2">Toilettes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
      <button
        @click="$emit('cancel')"
        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Annuler
      </button>
      
      <div class="flex gap-3">
        <button
          @click="resetToDefault"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Réinitialiser
        </button>
        <button
          @click="saveSeatMap"
          :disabled="saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Enregistrement...' : 'Enregistrer la configuration' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import SeatButton from './SeatButton.vue'
import vehicleService from '../../services/vehicleService'
import { 
  SeatMap, 
  SeatLayout, 
  Seat, 
  SeatMapMetadata,
  SeatMapUtils,
  SEAT_MAP_TEMPLATES,
  SeatFeature
} from '../../types/seat'

const props = defineProps<{
  vehicleId: string
  initialSeatMap?: SeatMap | null
}>()

const emit = defineEmits<{
  saved: [seatMap: SeatMap]
  cancel: []
}>()

const toast = useToast()

// State
const layout = ref<SeatLayout>({
  rows: 10,
  columns: 4,
  aisleAfter: [2]
})

const seats = ref<Seat[]>([])
const metadata = ref<SeatMapMetadata>({
  hasToilet: false,
  toiletPosition: 'back'
})

const selectedSeat = ref<Seat | null>(null)
const saving = ref(false)
const loading = ref(false)
const templates = SEAT_MAP_TEMPLATES

// Aisle configuration
const aisleAfterColumn = computed({
  get: () => layout.value.aisleAfter?.[0] ?? null,
  set: (value: number | null) => {
    layout.value.aisleAfter = value !== null ? [value] : undefined
  }
})

// Available features for configuration
const availableFeatures = [
  { value: 'extra-legroom' as SeatFeature, label: 'Espace jambes supplémentaire' },
  { value: 'panorama' as SeatFeature, label: 'Vue panoramique' },
  { value: 'table' as SeatFeature, label: 'Table pliante' },
  { value: 'power-outlet' as SeatFeature, label: 'Prise électrique' },
  { value: 'usb-port' as SeatFeature, label: 'Port USB' },
  { value: 'wifi' as SeatFeature, label: 'WiFi' },
  { value: 'reclining' as SeatFeature, label: 'Siège inclinable' }
]

// Computed
const totalSeats = computed(() => seats.value.length)
const activeSeats = computed(() => seats.value.filter(s => s.available).length)
const disabledSeats = computed(() => seats.value.filter(s => !s.available).length)
const premiumSeats = computed(() => seats.value.filter(s => s.type === 'premium').length)

const gridMaxWidth = computed(() => {
  const seatWidth = 60 // px
  const gap = 8 // px
  const aisleWidth = 32 // px
  const rowNumberWidth = 32 // px
  
  const aisleCount = layout.value.aisleAfter?.length ?? 0
  const width = rowNumberWidth + (layout.value.columns * seatWidth) + ((layout.value.columns - 1) * gap) + (aisleCount * aisleWidth)
  
  return `${width}px`
})

// Methods
function columnNumberToLetter(col: number): string {
  return SeatMapUtils.columnNumberToLetter(col)
}

function getSeat(row: number, col: number): Seat | undefined {
  const column = columnNumberToLetter(col)
  const id = SeatMapUtils.generateSeatId(row, column)
  return seats.value.find(s => s.id === id)
}

function isAisleAfter(col: number): boolean {
  return layout.value.aisleAfter?.includes(col) ?? false
}

function selectSeat(seat: Seat | undefined) {
  if (seat) {
    selectedSeat.value = seat
  }
}

function deleteSeat(seatId: string) {
  const index = seats.value.findIndex(s => s.id === seatId)
  if (index > -1) {
    seats.value.splice(index, 1)
    selectedSeat.value = null
    toast.success('Siège supprimé')
  }
}

function incrementRows() {
  if (layout.value.rows < 20) {
    layout.value.rows++
  }
}

function decrementRows() {
  if (layout.value.rows > 1) {
    layout.value.rows--
  }
}

function incrementColumns() {
  if (layout.value.columns < 6) {
    layout.value.columns++
  }
}

function decrementColumns() {
  if (layout.value.columns > 2) {
    layout.value.columns--
  }
}

function regenerateSeats() {
  const newSeats = SeatMapUtils.generateDefaultSeats(
    layout.value.rows,
    layout.value.columns,
    layout.value.aisleAfter
  )
  
  // Conserver les configurations existantes si possible
  seats.value = newSeats.map(newSeat => {
    const existingSeat = seats.value.find(s => s.id === newSeat.id)
    return existingSeat || newSeat
  })
  
  selectedSeat.value = null
  toast.success('Disposition régénérée')
}

function loadTemplate(templateId: string) {
  const template = templates.find(t => t.id === templateId)
  if (!template) return

  // Extraire la configuration du template
  const match = templateId.match(/bus-(\d+)-(\d+)x(\d+)/)
  if (match) {
    const [, , leftCols, rightCols] = match
    const cols = parseInt(leftCols) + parseInt(rightCols)
    const totalSeats = template.totalSeats
    const rows = Math.ceil(totalSeats / cols)

    layout.value = {
      rows,
      columns: cols,
      aisleAfter: [parseInt(leftCols)]
    }

    metadata.value = {
      hasToilet: totalSeats >= 40,
      toiletPosition: 'back'
    }

    regenerateSeats()
    toast.success(`Template "${template.name}" chargé`)
  }
}

function resetToDefault() {
  if (props.initialSeatMap) {
    layout.value = { ...props.initialSeatMap.layout }
    seats.value = [...props.initialSeatMap.seats]
    metadata.value = { ...props.initialSeatMap.metadata }
  } else {
    layout.value = { rows: 10, columns: 4, aisleAfter: [2] }
    regenerateSeats()
  }
  selectedSeat.value = null
  toast.info('Configuration réinitialisée')
}

async function saveSeatMap() {
  try {
    saving.value = true

    const seatMap: SeatMap = {
      layout: layout.value,
      seats: seats.value,
      metadata: metadata.value
    }

    const response = await vehicleService.updateSeatMap(props.vehicleId, seatMap)
    
    console.log('✅ Seat map saved successfully:', response)
    toast.success('Configuration enregistrée avec succès')
    emit('saved', seatMap)
  } catch (error: any) {
    console.error('❌ Error saving seat map:', error)
    toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

// Initialize - Charger le seat_map depuis l'API
async function loadSeatMap() {
  try {
    loading.value = true
    
    console.log('🔄 Loading seat map for vehicle:', props.vehicleId)
    
    // Charger le seat_map via le service
    const response = await vehicleService.getSeatMap(props.vehicleId)
    const seatMap = response.data
    
    console.log('📦 Seat map loaded:', seatMap)
    
    if (seatMap) {
      layout.value = { ...seatMap.layout }
      seats.value = [...seatMap.seats]
      metadata.value = seatMap.metadata ? { ...seatMap.metadata } : { hasToilet: false, toiletPosition: 'back' }
      console.log('✅ Seat map applied successfully')
    } else {
      // Pas de seat_map configuré, générer une disposition par défaut
      console.log('⚠️ No seat map found, generating default')
      regenerateSeats()
    }
  } catch (error: any) {
    console.error('❌ Error loading seat map:', error)
    // Si erreur 404 ou pas de seat_map, générer une disposition par défaut
    if (error.response?.status === 404 || error.response?.data?.message?.includes('not have a seat map')) {
      console.log('⚠️ Vehicle has no seat map, generating default')
      regenerateSeats()
    } else {
      toast.error('Erreur lors du chargement de la disposition')
    }
  } finally {
    loading.value = false
  }
}

// Charger au montage
if (props.initialSeatMap) {
  layout.value = { ...props.initialSeatMap.layout }
  seats.value = [...props.initialSeatMap.seats]
  metadata.value = { ...props.initialSeatMap.metadata }
} else {
  loadSeatMap()
}
</script>

<style scoped>
.seat-map-editor {
  @apply bg-gray-50 min-h-screen;
}
</style>
