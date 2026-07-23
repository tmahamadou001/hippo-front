<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>
      <p class="text-gray-600 mt-1">Gérez vos informations personnelles et votre mot de passe</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Info Card -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              :value="authStore.user?.email"
              disabled
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <input
              type="text"
              :value="authStore.user?.role"
              disabled
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed capitalize"
            />
          </div>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>
        
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              :class="{ 'border-red-500': errors.currentPassword }"
              :disabled="loading"
            />
            <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">
              {{ errors.currentPassword }}
            </p>
          </div>

          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              :class="{ 'border-red-500': errors.newPassword }"
              :disabled="loading"
            />
            <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">
              {{ errors.newPassword }}
            </p>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              :class="{ 'border-red-500': errors.confirmPassword }"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-green-800">{{ successMessage }}</p>
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

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <span>{{ loading ? 'Changement...' : 'Changer le mot de passe' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const validateForm = () => {
  let isValid = true
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Le mot de passe actuel est requis'
    isValid = false
  }

  if (!passwordForm.newPassword) {
    errors.newPassword = 'Le nouveau mot de passe est requis'
    isValid = false
  } else if (passwordForm.newPassword.length < 6) {
    errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    isValid = false
  }

  if (!passwordForm.confirmPassword) {
    errors.confirmPassword = 'Veuillez confirmer le mot de passe'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    isValid = false
  }

  return isValid
}

const handleChangePassword = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await authStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    successMessage.value = 'Mot de passe changé avec succès !'
    
    // Reset form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors du changement de mot de passe'
  } finally {
    loading.value = false
  }
}
</script>
