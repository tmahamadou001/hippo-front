<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Modifier le départ' : 'Nouveau départ'"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Ligne et Véhicule -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ligne <span class="text-red-500">*</span>
                </label>
                <LineAutocomplete
                  v-model="form.line_id"
                  @select="onLineSelect"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Véhicule
                </label>
                <select
                  v-model="form.vehicle_id"
                  @change="onVehicleChange"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Aucun véhicule</option>
                  <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.name }} - {{ vehicle.plate }} ({{ vehicle.seats }} places)
                  </option>
                </select>
              </div>
            </div>

            <!-- Date et heures -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.depart_at"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Heure départ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.departure_time"
                  type="time"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Heure arrivée
                </label>
                <input
                  v-model="form.arrival_time"
                  type="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <!-- Prix et capacité -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Prix (XOF) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  required
                  min="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Capacité
                </label>
                <input
                  v-model.number="form.capacity"
                  type="number"
                  min="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <!-- Gare et confort -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Gare de départ
                </label>
                <input
                  v-model="form.departure_station"
                  type="text"
                  placeholder="Ex: Gare d'Adjamé"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Type de confort
                </label>
                <select
                  v-model="form.comfort_type"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="vvip">VVIP</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                v-model="form.status"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              >
                <option value="open">Ouvert</option>
                <option value="closed">Fermé</option>
                <option value="cancelled">Annulé</option>
              </select>
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
        :disabled="loading"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed, onMounted } from 'vue'
import departureService from '@/services/departureService'
import LineAutocomplete from '@/components/common/LineAutocomplete.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { Departure, CreateDepartureDto } from '@/types/departure'
import type { Line } from '@/types/line'
import type { Vehicle } from '@/types/vehicle'

// Créer un service temporaire pour les véhicules
import api from '@/services/api'
const vehicleService = {
  async getAll() {
    const response = await api.get<{ success: boolean; data: Vehicle[] }>('/vehicles')
    return response.data
  }
}

const props = defineProps<{
  modelValue: boolean
  departure?: Departure | null
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

const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const isEdit = ref(false)

const form = reactive<CreateDepartureDto>({
  line_id: '',
  vehicle_id: '',
  depart_at: '',
  departure_time: '',
  arrival_time: '',
  departure_station: '',
  comfort_type: 'standard',
  price: 0,
  capacity: undefined,
  status: 'open'
})

const resetForm = () => {
  form.line_id = ''
  form.vehicle_id = ''
  form.depart_at = ''
  form.departure_time = ''
  form.arrival_time = ''
  form.departure_station = ''
  form.comfort_type = 'standard'
  form.price = 0
  form.capacity = undefined
  form.status = 'open'
}

const onLineSelect = (line: Line) => {
  console.log('Ligne sélectionnée:', line)
}

const loadVehicles = async () => {
  try {
    const response = await vehicleService.getAll()
    vehicles.value = response.data
  } catch (error) {
    console.error('Error loading vehicles:', error)
  }
}

const onVehicleChange = () => {
  const selectedVehicle = vehicles.value.find((v: Vehicle) => v.id === form.vehicle_id)
  if (selectedVehicle && !form.capacity) {
    form.capacity = selectedVehicle.seats
  }
}

const handleClose = () => {
  isOpen.value = false
  resetForm()
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value && props.departure) {
      await departureService.update(props.departure.id, form)
    } else {
      await departureService.create(form)
    }
    emit('saved')
    isOpen.value = false
    resetForm()
  } catch (error: any) {
    console.error('Error saving departure:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    isEdit.value = !!props.departure
    if (props.departure) {
      form.line_id = props.departure.line_id
      form.vehicle_id = props.departure.vehicle_id || ''
      form.depart_at = props.departure.depart_at
      form.departure_time = props.departure.departure_time
      form.arrival_time = props.departure.arrival_time || ''
      form.departure_station = props.departure.departure_station || ''
      form.comfort_type = props.departure.comfort_type
      form.price = props.departure.price
      form.capacity = props.departure.capacity
      form.status = props.departure.status
    } else {
      resetForm()
    }
  }
})

onMounted(() => {
  loadVehicles()
})
</script>
