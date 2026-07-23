<template>
  <AppModal
    v-model="isOpen"
    :title="company ? 'Modifier une compagnie' : 'Créer une compagnie'"
    size="lg"
    @close="handleClose"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nom -->
        <div class="form-group">
          <label class="form-label">
            Nom de la compagnie <span class="required">*</span>
          </label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            class="form-input"
            placeholder="Ex: Transport Express CI"
          />
        </div>

        <!-- Slug -->
        <div class="form-group">
          <label class="form-label">
            Slug (identifiant unique) <span class="required">*</span>
          </label>
          <input 
            v-model="form.slug" 
            type="text" 
            required
            :disabled="!!company"
            class="form-input"
            placeholder="Ex: transport-express-ci"
            pattern="[a-z0-9-]+"
          />
          <small class="form-hint">
            {{ company ? 'Le slug ne peut pas être modifié' : 'Uniquement lettres minuscules, chiffres et tirets' }}
          </small>
        </div>

        <!-- Email de contact -->
        <div class="form-group">
          <label class="form-label">Email de contact</label>
          <input 
            v-model="form.contact_email" 
            type="email"
            class="form-input"
            placeholder="contact@exemple.com"
          />
        </div>

        <!-- Téléphone de contact -->
        <div class="form-group">
          <label class="form-label">Téléphone de contact</label>
          <input 
            v-model="form.contact_phone" 
            type="tel"
            class="form-input"
            placeholder="+225 XX XX XX XX XX"
          />
        </div>

        <!-- Adresse -->
        <div class="form-group">
          <label class="form-label">Adresse</label>
          <textarea 
            v-model="form.address"
            class="form-textarea"
            rows="3"
            placeholder="Adresse complète de la compagnie"
          ></textarea>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

      </form>
    </template>

    <template #footer="{ close }">
      <button type="button" @click="close" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
        Annuler
      </button>
      <button type="submit" @click="handleSubmit" :disabled="loading" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
        <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? 'Enregistrement...' : (company ? 'Modifier' : 'Créer') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import apiClient from '@/services/api';
import AppModal from '@/components/common/AppModal.vue';

const props = defineProps<{
  modelValue: boolean;
  company?: any;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleClose = () => {
  isOpen.value = false;
};

const form = ref({
  name: props.company?.name || '',
  slug: props.company?.slug || '',
  contact_email: props.company?.contact_email || '',
  contact_phone: props.company?.contact_phone || '',
  address: props.company?.address || ''
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';

    if (props.company) {
      // Modifier
      await apiClient.put(`/companies/${props.company.id}`, form.value);
    } else {
      // Créer
      await apiClient.post('/companies', form.value);
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
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0A2540;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0A2540;
  box-shadow: 0 0 0 3px rgba(10, 37, 64, 0.1);
}

.form-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
</style>
