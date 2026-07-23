<template>
  <AppModal
    v-model="isOpen"
    title="Assigner un groupe"
    size="4xl"
    @close="handleClose"
  >
    <template #body>
        <p class="modal-description">
          Sélectionnez un groupe de permissions à assigner à cet utilisateur.
        </p>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des groupes...</p>
        </div>

        <div v-else-if="availableGroups.length === 0" class="empty-state">
          <p>Aucun groupe disponible</p>
        </div>

        <div v-else class="groups-list">
          <div 
            v-for="group in availableGroups" 
            :key="group.id"
            @click="selectGroup(group)"
            class="group-item"
          >
            <div class="group-content">
              <div class="group-header">
                <h4 class="group-name">{{ group.name }}</h4>
                <span v-if="group.is_system" class="badge badge-system">Système</span>
              </div>
              <p class="group-description">{{ group.description }}</p>
              <div class="group-meta">
                <span class="meta-item">
                  🔑 {{ group.permissions_count || 0 }} permissions
                </span>
              </div>
            </div>
            <div class="group-action">
              <span class="action-icon">→</span>
            </div>
          </div>
        </div>
    </template>

    <template #footer="{ close }">
      <button @click="close" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
        Annuler
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import AppModal from '@/components/common/AppModal.vue';

const props = defineProps<{
  modelValue: boolean;
  userId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  added: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleClose = () => {
  isOpen.value = false;
};

const availableGroups = ref<any[]>([]);
const loading = ref(false);

async function loadGroups() {
  try {
    loading.value = true;
    const response = await apiClient.get('/permissions/groups');
    availableGroups.value = response.data.groups;
  } catch (error) {
    console.error('Erreur lors du chargement des groupes:', error);
  } finally {
    loading.value = false;
  }
}

async function selectGroup(group: any) {
  if (!confirm(`Assigner le groupe "${group.name}" à cet utilisateur ?`)) {
    return;
  }

  try {
    await apiClient.post(`/permissions/users/${props.userId}/groups/${group.id}`);
    emit('added');
    isOpen.value = false;
  } catch (error: any) {
    console.error('Erreur:', error);
    alert(error.response?.data?.message || 'Erreur lors de l\'assignation du groupe');
  }
}

onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.modal-description {
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0A2540;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.group-item:hover {
  border-color: #0A2540;
  background: #f8fafc;
}

.group-content {
  flex: 1;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.group-name {
  font-size: 1rem;
  font-weight: 600;
  color: #0A2540;
  margin: 0;
}

.badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 500;
}

.badge-system {
  background: #dbeafe;
  color: #1e40af;
}

.group-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
}

.group-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  font-size: 0.75rem;
  color: #64748b;
}

.group-action {
  margin-left: 1rem;
}

.action-icon {
  font-size: 1.5rem;
  color: #94a3b8;
  transition: all 0.2s;
}

.group-item:hover .action-icon {
  color: #0A2540;
  transform: translateX(4px);
}
</style>
