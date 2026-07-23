<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gérez les paramètres de votre compagnie
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- Général -->
      <div v-if="activeTab === 'general'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Paramètres généraux</h2>
        <p class="text-gray-500">Configuration générale de l'application (à venir)...</p>
      </div>

      <!-- API Keys (Paiements) -->
      <div v-if="activeTab === 'api-keys'">
        <PaymentConfigView />
      </div>

      <!-- Templates de Sièges -->
      <div v-if="activeTab === 'templates'">
        <SeatTemplatesView />
      </div>

      <!-- Notifications -->
      <div v-if="activeTab === 'notifications'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
        <p class="text-gray-500">Configuration des notifications (à venir)...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PaymentConfigView from './PaymentConfigView.vue';
import SeatTemplatesView from './SeatTemplatesView.vue';

const activeTab = ref('api-keys');

const tabs = [
  { id: 'general', name: 'Général' },
  { id: 'api-keys', name: 'Clés API' },
  { id: 'templates', name: 'Templates de Sièges' },
  { id: 'notifications', name: 'Notifications' }
];
</script>
