<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'"
    size="lg"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom du véhicule <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Ex: Bus Mercedes 50 places"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <!-- Plaque et Type -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Plaque <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.plate"
                  type="text"
                  required
                  placeholder="Ex: AB-1234-CD"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Type <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Sélectionner</option>
                  <option value="bus">Bus</option>
                  <option value="minibus">Minibus</option>
                  <option value="van">Van</option>
                  <option value="car">Voiture</option>
                </select>
              </div>
            </div>

            <!-- Nombre de places -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de places <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.seats"
                type="number"
                required
                min="1"
                max="100"
                placeholder="Ex: 50"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <!-- Configuration de la disposition (uniquement en mode édition) -->
            <div v-if="isEdit && props.vehicle?.id" class="pt-4 border-t border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Disposition des sièges
              </label>
              <button
                type="button"
                @click="openSeatMapEditor"
                class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span class="text-gray-600 group-hover:text-primary-700 font-medium">
                    {{ props.vehicle.seat_map ? '✅ Modifier la disposition des sièges' : '⚙️ Configurer la disposition des sièges' }}
                  </span>
                </div>
              </button>
              <p class="text-xs text-gray-500 mt-2">
                💡 Configurez la disposition des sièges, les types (premium, standard) et les prix
              </p>
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
import { ref, watch, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import vehicleService from '@/services/vehicleService'
import AppModal from '@/components/common/AppModal.vue'
import type { Vehicle, CreateVehicleDto } from '@/types/vehicle'

const props = defineProps<{
  modelValue: boolean
  vehicle?: Vehicle | null
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

const router = useRouter()
const loading = ref(false)
const isEdit = ref(false)

const form = reactive<CreateVehicleDto>({
  name: '',
  plate: '',
  type: '',
  seats: 0
})

const resetForm = () => {
  form.name = ''
  form.plate = ''
  form.type = ''
  form.seats = 0
}

const handleClose = () => {
  isOpen.value = false
  resetForm()
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value && props.vehicle) {
      await vehicleService.update(props.vehicle.id, form)
    } else {
      await vehicleService.create(form)
    }
    emit('saved')
    isOpen.value = false
    resetForm()
  } catch (error: any) {
    console.error('Error saving vehicle:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
  } finally {
    loading.value = false
  }
}

// Fonction pour ouvrir l'éditeur de disposition des sièges
const openSeatMapEditor = () => {
  if (props.vehicle?.id) {
    // Fermer la modal
    emit('update:modelValue', false)
    
    // Naviguer vers l'éditeur de disposition
    router.push(`/vehicles/${props.vehicle.id}/seat-map`)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    isEdit.value = !!props.vehicle
    if (props.vehicle) {
      form.name = props.vehicle.name
      form.plate = props.vehicle.plate
      form.type = props.vehicle.type
      form.seats = props.vehicle.seats
    } else {
      resetForm()
    }
  }
})
</script>
