<template>
  <AppModal
    v-model="isOpen"
    :title="user ? 'Modifier un utilisateur' : 'Créer un utilisateur'"
    size="lg"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="form-label">
            Email <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            :disabled="!!user"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
            placeholder="email@exemple.com"
          />
          <small v-if="user" class="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</small>
        </div>

        <!-- Prénom et Nom -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
            <input 
              v-model="form.first_name" 
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              placeholder="Prénom"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input 
              v-model="form.last_name" 
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              placeholder="Nom"
            />
          </div>
        </div>

        <!-- Téléphone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input 
            v-model="form.phone" 
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
            placeholder="+225 XX XX XX XX XX"
          />
        </div>

        <!-- Rôle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rôle <span class="text-red-500">*</span>
          </label>
          <select v-model="form.role" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600">
            <option value="operator">Opérateur</option>
            <option value="manager">Gestionnaire</option>
            <option value="owner">Propriétaire</option>
            <option v-if="isGeyavo" value="geyavo">Geyavo (Super Admin)</option>
          </select>
          <small class="text-xs text-gray-500 mt-1">
            {{ getRoleDescription(form.role) }}
          </small>
        </div>

        <!-- Compagnie (si Geyavo) -->
        <div v-if="isGeyavo && !user">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Compagnie <span class="text-red-500">*</span>
          </label>
          <select v-model="form.company_id" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600">
            <option value="">Sélectionner une compagnie</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
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
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? 'Enregistrement...' : (user ? 'Modifier' : 'Créer') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import apiClient from '@/services/api';
import AppModal from '@/components/common/AppModal.vue';

const props = defineProps<{
  modelValue: boolean;
  user?: any;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

// Computed pour gérer le v-model avec AppModal
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const { isGeyavo } = usePermissions();

const form = ref({
  email: props.user?.email || '',
  first_name: props.user?.first_name || '',
  last_name: props.user?.last_name || '',
  phone: props.user?.phone || '',
  role: props.user?.role || 'operator',
  company_id: props.user?.company_id || ''
});

const companies = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    operator: 'Accès limité aux opérations quotidiennes',
    manager: 'Gestion des réservations et des véhicules',
    owner: 'Accès complet à la gestion de la compagnie',
    geyavo: 'Accès super administrateur à toutes les compagnies'
  };
  return descriptions[role] || '';
}

async function loadCompanies() {
  if (isGeyavo.value) {
    try {
      const response = await apiClient.get('/companies');
      companies.value = response.data.companies;
    } catch (err) {
      console.error('Erreur lors du chargement des compagnies:', err);
    }
  }
}

const handleClose = () => {
  isOpen.value = false;
};

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';

    if (props.user) {
      // Modifier
      await apiClient.put(`/users/${props.user.id}`, form.value);
    } else {
      // Créer
      await apiClient.post('/users', form.value);
    }
    
    emit('saved');
    isOpen.value = false;
  } catch (err: any) {
    console.error('Erreur:', err);
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCompanies();
});
</script>
