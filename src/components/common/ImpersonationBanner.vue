<template>
  <div
    v-if="authStore.isImpersonating"
    class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
  >
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Info -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm">⚠️ Mode Impersonate</span>
            </div>
            <div class="text-xs opacity-90">
              Vous êtes connecté en tant que
              <span class="font-semibold">{{ authStore.impersonatedUser?.email }}</span>
              <span v-if="authStore.impersonatedUser?.role" class="ml-1">
                ({{ getRoleName(authStore.impersonatedUser.role) }})
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <button
          @click="stopImpersonation"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div v-else class="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          {{ loading ? 'Chargement...' : 'Revenir à mon compte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    geyavo: 'Admin Geyavo',
    owner: 'Propriétaire',
    manager: 'Gestionnaire',
    operator: 'Opérateur'
  }
  return names[role] || role
}

async function stopImpersonation() {
  if (loading.value) return
  
  try {
    loading.value = true
    await authStore.stopImpersonation()
    
    // Rediriger vers la page utilisateurs
    router.push('/users')
  } catch (error: any) {
    console.error('Error stopping impersonation:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'arrêt de l\'impersonation')
  } finally {
    loading.value = false
  }
}
</script>
