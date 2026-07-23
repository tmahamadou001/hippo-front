<template>
  <div class="seat-templates-view">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Templates de Sièges</h2>
        <p class="text-sm text-gray-600 mt-1">
          Gérez les templates de configuration de sièges pour vos véhicules
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouveau template
      </button>
    </div>

    <!-- Info message -->
    <div v-if="!isGeyavo" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-blue-900">À propos des templates</h4>
          <p class="text-sm text-blue-700 mt-1">
            Les templates <strong>globaux</strong> (violet) sont fournis par Geyavo et ne peuvent pas être modifiés. 
            Créez vos propres templates personnalisés pour avoir accès aux boutons de modification et suppression.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Liste des templates -->
    <div v-else class="space-y-4">
      <div
        v-for="template in templates"
        :key="template.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start gap-6">
          <!-- Badge et infos -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span
                v-if="template.company_id === null"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Global (lecture seule)
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                Ma compagnie
              </span>
              
              <h3 class="text-lg font-semibold text-gray-900">{{ template.name }}</h3>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">{{ template.description }}</p>

            <!-- Métadonnées -->
            <div class="flex flex-wrap gap-2">
              <span
                v-if="template.metadata.hasToilet"
                class="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Toilettes
              </span>
              <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                Allée après col. {{ template.layout.aisleAfter?.join(', ') || 'N/A' }}
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center min-w-[100px]">
              <div class="text-2xl font-bold text-primary-600">{{ template.total_seats }}</div>
              <div class="text-xs text-gray-600">Places</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center min-w-[100px]">
              <div class="text-2xl font-bold text-primary-600">
                {{ template.layout.rows }} × {{ template.layout.columns }}
              </div>
              <div class="text-xs text-gray-600">Rangées × Colonnes</div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <button
              @click="openEditModal(template)"
              v-if="canEditTemplate(template)"
              class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(template)"
              v-if="canDeleteTemplate(template)"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && templates.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun template</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par créer un nouveau template de sièges.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import seatTemplateService, { type SeatMapTemplate } from '@/services/seatTemplateService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const templates = ref<SeatMapTemplate[]>([])

// Vérifier si l'utilisateur est Geyavo
const isGeyavo = computed(() => authStore.user?.role === 'geyavo')

// Vérifier si on peut éditer un template
const canEditTemplate = (template: SeatMapTemplate) => {
  // Geyavo peut tout éditer
  if (isGeyavo.value) return true
  // Les autres peuvent éditer uniquement leurs templates
  return template.company_id !== null
}

// Vérifier si on peut supprimer un template
const canDeleteTemplate = (template: SeatMapTemplate) => {
  // Geyavo peut tout supprimer
  if (isGeyavo.value) return true
  // Les autres peuvent supprimer uniquement leurs templates
  return template.company_id !== null
}

// Charger les templates
const loadTemplates = async () => {
  try {
    loading.value = true
    const response = await seatTemplateService.getAll()
    templates.value = response.data || []
  } catch (error: any) {
    console.error('Error loading templates:', error)
    alert('Erreur lors du chargement des templates')
  } finally {
    loading.value = false
  }
}

// Naviguer vers création
const openCreateModal = () => {
  router.push('/settings/templates/new')
}

// Naviguer vers édition
const openEditModal = (template: SeatMapTemplate) => {
  router.push(`/settings/templates/${template.id}/edit`)
}

// Confirmer suppression
const confirmDelete = async (template: SeatMapTemplate) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ?`)) {
    return
  }

  try {
    await seatTemplateService.delete(template.id)
    alert('Template supprimé avec succès')
    loadTemplates()
  } catch (error: any) {
    console.error('Error deleting template:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.seat-templates-view {
  @apply p-6;
}
</style>
