<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="close"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
            <button
              @click="close"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Success Message -->
          <div
            v-if="success"
            class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-green-800">Email envoyé !</p>
              <p class="text-sm text-green-700 mt-1">
                Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
              </p>
            </div>
          </div>

          <!-- Form -->
          <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
            <p class="text-sm text-gray-600 mb-4">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <div>
              <label for="reset-email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="reset-email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
                :class="{ 'border-red-500': error }"
                placeholder="admin@company.com"
                :disabled="loading"
              />
              <p v-if="error" class="mt-1 text-sm text-red-600">
                {{ error }}
              </p>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="close"
                class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                :disabled="loading"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span>{{ loading ? 'Envoi...' : 'Envoyer' }}</span>
              </button>
            </div>
          </form>

          <!-- Close button after success -->
          <button
            v-if="success"
            @click="close"
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    email.value = ''
    error.value = ''
    success.value = false
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    // TODO: Implement forgot password API call
    // await authService.forgotPassword(email.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    success.value = true
    
    // Auto close after 3 seconds
    setTimeout(() => {
      close()
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue'
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

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
