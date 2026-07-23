<template>
  <AppModal
    v-model="isOpen"
    title="Accorder une permission"
    size="4xl"
    @close="handleClose"
  >
    <template #body>
        <!-- Recherche -->
        <div class="search-box">
          <input 
            v-model="search" 
            type="text"
            placeholder="Rechercher une permission..." 
            class="search-input"
          />
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des permissions...</p>
        </div>

        <div v-else-if="Object.keys(filteredPermissions).length === 0" class="empty-state">
          <p>Aucune permission trouvée</p>
        </div>

        <div v-else class="permissions-by-category">
          <div v-for="(perms, category) in filteredPermissions" :key="category" class="category-section">
            <h3 class="category-title">{{ category }}</h3>
            <div class="permissions-list">
              <div 
                v-for="perm in perms" 
                :key="perm.code"
                @click="grantPermission(perm)"
                class="permission-item"
              >
                <div class="permission-content">
                  <div class="permission-name">{{ perm.name }}</div>
                  <div class="permission-code">{{ perm.code }}</div>
                  <div v-if="perm.description" class="permission-description">
                    {{ perm.description }}
                  </div>
                </div>
                <div class="permission-action">
                  <span class="action-icon">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </template>

    <template #footer="{ close }">
      <button @click="close" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
        Fermer
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
  granted: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleClose = () => {
  isOpen.value = false;
};

const search = ref('');
const allPermissions = ref<any[]>([]);
const loading = ref(false);

const filteredPermissions = computed(() => {
  let filtered = allPermissions.value;
  
  if (search.value) {
    const query = search.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }
  
  // Grouper par catégorie
  const grouped: Record<string, any[]> = {};
  filtered.forEach(perm => {
    const category = perm.category || 'Autres';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(perm);
  });
  
  return grouped;
});

async function loadPermissions() {
  try {
    loading.value = true;
    const response = await apiClient.get('/permissions');
    allPermissions.value = response.data.permissions;
  } catch (error) {
    console.error('Erreur lors du chargement des permissions:', error);
  } finally {
    loading.value = false;
  }
}

async function grantPermission(perm: any) {
  if (!confirm(`Accorder la permission "${perm.name}" à cet utilisateur ?`)) {
    return;
  }

  try {
    await apiClient.post(`/permissions/users/${props.userId}`, {
      permissionCode: perm.code
    });
    emit('granted');
    isOpen.value = false;
  } catch (error: any) {
    console.error('Erreur:', error);
    alert(error.response?.data?.message || 'Erreur lors de l\'accord de la permission');
  }
}

onMounted(() => {
  loadPermissions();
});
</script>

<style scoped>
.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #0A2540;
  box-shadow: 0 0 0 3px rgba(10, 37, 64, 0.1);
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

.permissions-by-category {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0A2540;
  margin: 0;
  text-transform: capitalize;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.permission-item:hover {
  border-color: #059669;
  background: #f0fdf4;
}

.permission-content {
  flex: 1;
}

.permission-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0A2540;
  margin-bottom: 0.125rem;
}

.permission-code {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.permission-description {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.permission-action {
  margin-left: 1rem;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.2s;
}

.permission-item:hover .action-icon {
  background: #059669;
  color: white;
}
</style>
