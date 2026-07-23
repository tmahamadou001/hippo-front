<template>
  <AppModal
    v-model="isOpen"
    size="2xl"
   :title="company?.name"
   :description="`@${company?.slug}`"
    @close="handleClose"
  >
    <template #body>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des détails...</p>
        </div>

        <div v-else>
          <!-- Informations générales -->
          <section class="section">
            <h3 class="section-title">Informations générales</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nom</span>
                <span class="info-value">{{ company?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Slug</span>
                <span class="info-value">{{ company?.slug }}</span>
              </div>
              <div v-if="company?.contact_email" class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ company?.contact_email }}</span>
              </div>
              <div v-if="company?.contact_phone" class="info-item">
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{ company?.contact_phone }}</span>
              </div>
              <div v-if="company?.address" class="info-item full-width">
                <span class="info-label">Adresse</span>
                <span class="info-value">{{ company?.address }}</span>
              </div>
            </div>
          </section>

          <!-- Statistiques -->
          <section class="section">
            <h3 class="section-title">Statistiques</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-icon">👥</span>
                <div>
                  <div class="stat-value">{{ stats?.users || 0 }}</div>
                  <div class="stat-label">Utilisateurs</div>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🚗</span>
                <div>
                  <div class="stat-value">{{ stats?.vehicles || 0 }}</div>
                  <div class="stat-label">Véhicules</div>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🛣️</span>
                <div>
                  <div class="stat-value">{{ stats?.lines || 0 }}</div>
                  <div class="stat-label">Lignes</div>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🎫</span>
                <div>
                  <div class="stat-value">{{ stats?.reservations || 0 }}</div>
                  <div class="stat-label">Réservations</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Utilisateurs -->
          <!-- <section class="section">
            <h3 class="section-title">Utilisateurs ({{ users.length }})</h3>
            <div v-if="users.length === 0" class="empty-state-small">
              Aucun utilisateur
            </div>
            <div v-else class="users-list">
              <div v-for="user in users" :key="user.id" class="user-item">
                <div class="user-avatar">
                  {{ getInitials(user) }}
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
                <span :class="['role-badge', `role-${user.role}`]">
                  {{ getRoleName(user.role) }}
                </span>
              </div>
            </div>
          </section> -->
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
  company: any;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleClose = () => {
  isOpen.value = false;
};

const loading = ref(false);
const stats = ref<any>(null);
const users = ref<any[]>([]);

// function getInitials(user: any): string {
//   if (!user) return '?';
  
//   const first = user.first_name?.[0] || '';
//   const last = user.last_name?.[0] || '';
//   const initials = (first + last).toUpperCase();
  
//   if (initials) return initials;
  
//   // Fallback sur l'email si disponible
//   if (user.email && user.email.length > 0) {
//     return user.email[0].toUpperCase();
//   }
  
//   return '?';
// }

// function getRoleName(role: string): string {
//   const names: Record<string, string> = {
//     geyavo: 'Super Admin',
//     owner: 'Propriétaire',
//     manager: 'Gestionnaire',
//     operator: 'Opérateur'
//   };
//   return names[role] || role;
// }

async function loadDetails() {
  if (!props.company?.id) return;
  
  try {
    loading.value = true;
    
    const [statsRes, usersRes] = await Promise.all([
      apiClient.get(`/companies/${props.company.id}/stats`),
      apiClient.get(`/companies/${props.company.id}/users`)
    ]);
    
    stats.value = statsRes.data.stats;
    users.value = usersRes.data.users;
  } catch (error) {
    console.error('Erreur lors du chargement des détails:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.company?.id) {
    loadDetails();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0A2540;
  margin: 0 0 0.25rem 0;
}

.company-slug {
  font-size: 0.875rem;
  color: #64748b;
  font-family: monospace;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  background: #f1f5f9;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.btn-close:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.loading-state {
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

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0A2540;
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.875rem;
  color: #0A2540;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0A2540;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.empty-state-small {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.875rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0A2540;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0A2540;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.role-geyavo {
  background: #f3e8ff;
  color: #7c3aed;
}

.role-owner {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #d1fae5;
  color: #065f46;
}

.role-operator {
  background: #f1f5f9;
  color: #475569;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0A2540;
}

.btn-secondary:hover {
  background: #e2e8f0;
}
</style>
