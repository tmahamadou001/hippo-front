<template>
  <AppModal
    v-model="isOpen"
    :title="schedule ? 'Modifier l\'horaire' : 'Nouvel horaire'"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Ligne -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ligne <span class="text-red-500">*</span>
          </label>
          <LineAutocomplete
            v-model="formData.line_id"
            @select="onLineSelect"
          />
        </div>

        <!-- Gare de départ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Gare de départ <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.departure_station"
            type="text"
            required
            placeholder="Ex: Gare d'Adjamé"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Récurrence -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Récurrence <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-3 gap-3">
            <label
              v-for="type in recurrenceTypes"
              :key="type.value"
              class="relative flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all"
              :class="formData.recurrence_type === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
            >
              <input
                type="radio"
                v-model="formData.recurrence_type"
                :value="type.value"
                class="sr-only"
              />
              <span class="text-sm font-medium" :class="formData.recurrence_type === type.value ? 'text-blue-700' : 'text-gray-700'">
                {{ type.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Jours de la semaine (si hebdomadaire) -->
        <div v-if="formData.recurrence_type === 'weekly'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Jours de la semaine <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-7 gap-2">
            <label
              v-for="day in weekDays"
              :key="day.value"
              class="relative flex flex-col items-center justify-center p-2 border rounded-lg cursor-pointer transition-all"
              :class="formData.days_of_week.includes(day.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
            >
              <input
                type="checkbox"
                :value="day.value"
                v-model="formData.days_of_week"
                class="sr-only"
              />
              <span class="text-xs font-medium" :class="formData.days_of_week.includes(day.value) ? 'text-blue-700' : 'text-gray-700'">
                {{ day.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Heure de départ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Heure de départ <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.departure_time"
            type="time"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Véhicule par défaut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Véhicule par défaut (optionnel)
          </label>
          <select
            v-model="formData.default_vehicle_id"
            @change="onVehicleChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Aucun véhicule par défaut</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.name }} ({{ vehicle.plate }}) - {{ vehicle.seats }} places
            </option>
          </select>
        </div>

        <!-- Capacité par défaut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Capacité par défaut
            <span v-if="formData.default_vehicle_id" class="text-xs text-green-600 font-normal">
              (définie par le véhicule)
            </span>
          </label>
          <input
            v-model.number="formData.default_capacity"
            type="number"
            min="1"
            :placeholder="formData.default_vehicle_id ? 'Auto-rempli depuis le véhicule' : 'Saisir la capacité'"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p v-if="!formData.default_vehicle_id && !formData.default_capacity" class="text-xs text-gray-500 mt-1">
            Sélectionnez un véhicule ou saisissez la capacité manuellement
          </p>
        </div>

        <!-- Type de confort -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type de confort
          </label>
          <select
            v-model="formData.default_comfort_type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">Standard</option>
            <option value="vip">VIP</option>
            <option value="vvip">VVIP</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <!-- Prix par défaut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Prix par défaut (FCFA)
          </label>
          <input
            v-model.number="formData.default_price"
            type="number"
            min="0"
            step="100"
            placeholder="Laisser vide pour utiliser le prix de la ligne"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Période de validité -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Valide du <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.valid_from"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Valide jusqu'au (optionnel)
            </label>
            <input
              v-model="formData.valid_until"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Jours exclus -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Jours exclus (jours fériés, maintenance, etc.)
          </label>
          <div class="space-y-2">
            <div v-for="(date, index) in formData.excluded_dates" :key="index" class="flex gap-2">
              <input
                v-model="formData.excluded_dates[index]"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                @click="removeExcludedDate(index)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addExcludedDate"
              class="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Ajouter une date
            </button>
          </div>
        </div>

      </form>
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
        type="submit"
        @click="handleSubmit"
        :disabled="saving"
        class="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
      >
        {{ saving ? 'Enregistrement...' : (schedule ? 'Modifier' : 'Créer') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/services/api'
import AppModal from '@/components/common/AppModal.vue'
import LineAutocomplete from '@/components/common/LineAutocomplete.vue'
import type { Line } from '@/types/line'

const props = defineProps<{
  modelValue: boolean
  schedule?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  isOpen.value = false
}

// État
const vehicles = ref<any[]>([])
const saving = ref(false)

const recurrenceTypes = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' }
]

const weekDays = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 7, label: 'Dim' }
]

const formData = ref({
  line_id: '',
  departure_station: '',
  recurrence_type: 'weekly',
  days_of_week: [] as number[],
  departure_time: '',
  default_vehicle_id: '',
  default_capacity: null as number | null,
  default_comfort_type: 'standard',
  default_price: null as number | null,
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: '',
  excluded_dates: [] as string[]
})

// Handler pour la sélection de ligne
function onLineSelect(line: Line) {
  console.log('Ligne sélectionnée:', line)
}

// Charger les données
async function loadVehicles() {
  try {
    const response = await apiClient.get('/vehicles')
    vehicles.value = response.data.vehicles || []
  } catch (error) {
    console.error('Erreur lors du chargement des véhicules:', error)
  }
}

// Auto-remplir la capacité quand le véhicule change
function onVehicleChange() {
  if (formData.value.default_vehicle_id) {
    const selectedVehicle = vehicles.value.find(v => v.id === formData.value.default_vehicle_id)
    if (selectedVehicle && selectedVehicle.seats) {
      formData.value.default_capacity = selectedVehicle.seats
    }
  }
}

// Gestion des dates exclues
function addExcludedDate() {
  formData.value.excluded_dates.push('')
}

function removeExcludedDate(index: number) {
  formData.value.excluded_dates.splice(index, 1)
}

// Soumettre le formulaire
async function handleSubmit() {
  try {
    saving.value = true

    const payload = {
      ...formData.value,
      days_of_week: formData.value.recurrence_type === 'weekly' ? formData.value.days_of_week : [],
      excluded_dates: formData.value.excluded_dates.filter(d => d !== ''),
      default_vehicle_id: formData.value.default_vehicle_id || null,
      default_price: formData.value.default_price || null,
      valid_until: formData.value.valid_until || null
    }

    if (props.schedule) {
      await apiClient.put(`/schedules/${props.schedule.id}`, payload)
    } else {
      await apiClient.post('/schedules', payload)
    }

    emit('saved')
    isOpen.value = false
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

// Initialiser le formulaire si modification
watch(() => props.schedule, (schedule) => {
  if (schedule) {
    formData.value = {
      line_id: schedule.line_id || '',
      departure_station: schedule.departure_station || '',
      recurrence_type: schedule.recurrence_type || 'weekly',
      days_of_week: schedule.days_of_week || [],
      departure_time: schedule.departure_time?.substring(0, 5) || '',
      default_vehicle_id: schedule.default_vehicle_id || '',
      default_capacity: schedule.default_capacity || null,
      default_comfort_type: schedule.default_comfort_type || 'standard',
      default_price: schedule.default_price || null,
      valid_from: schedule.valid_from || new Date().toISOString().split('T')[0],
      valid_until: schedule.valid_until || '',
      excluded_dates: schedule.excluded_dates || []
    }
  }
}, { immediate: true })

onMounted(() => {
  loadVehicles()
})
</script>
