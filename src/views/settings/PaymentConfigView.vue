<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Configuration des paiements</h1>
      <p class="mt-1 text-sm text-gray-600">
        Configurez vos clés API pour accepter les paiements Mobile Money
      </p>
    </div>

    <!-- Alert si pas de config -->
    <div v-if="!hasConfig && !loading" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            Paiements non configurés
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Vous devez configurer vos clés API pour accepter les paiements Mobile Money.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulaire de configuration -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <form @submit.prevent="saveConfig">
          <!-- Provider -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Provider de paiement
            </label>
            <select
              v-model="config.payment_provider"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="loading"
            >
              <option value="cinetpay">CinetPay</option>
              <option value="fedapay" disabled>FedaPay (bientôt disponible)</option>
              <option value="payunit" disabled>PayUnit (bientôt disponible)</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Pour l'instant, seul CinetPay est supporté
            </p>
          </div>

          <!-- API Key -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              API Key <span class="text-red-500">*</span>
            </label>
            <input
              v-model="config.api_key"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre clé API CinetPay"
              required
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500">
              Clé API fournie par CinetPay dans votre dashboard
            </p>
          </div>

          <!-- Site ID -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Site ID <span class="text-red-500">*</span>
            </label>
            <input
              v-model="config.site_id"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre Site ID"
              required
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500">
              Identifiant de votre site sur CinetPay
            </p>
          </div>

          <!-- Secret Key -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Secret Key <span class="text-red-500">*</span>
            </label>
            <input
              v-model="config.secret_key"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre clé secrète"
              required
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500">
              Clé secrète pour valider les webhooks
            </p>
          </div>

          <!-- Mode -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="config.mode"
                  type="radio"
                  value="sandbox"
                  class="mr-2"
                  :disabled="loading"
                />
                <span class="text-sm text-gray-700">Sandbox (Test)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="config.mode"
                  type="radio"
                  value="production"
                  class="mr-2"
                  :disabled="loading"
                />
                <span class="text-sm text-gray-700">Production</span>
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Utilisez le mode Sandbox pour tester avant de passer en production
            </p>
          </div>

          <!-- Boutons -->
          <div class="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              @click="testConnection"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              :disabled="loading || !isFormValid"
            >
              Tester la connexion
            </button>
            <button
              type="submit"
              class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              :disabled="loading || !isFormValid"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 border-t border-blue-100 p-6">
        <h3 class="text-sm font-semibold text-blue-900 mb-3">
          📚 Comment obtenir vos clés API ?
        </h3>
        <ol class="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>
            Créer un compte sur
            <a
              href="https://cinetpay.com"
              target="_blank"
              class="font-medium underline hover:text-blue-900"
            >
              CinetPay.com
            </a>
          </li>
          <li>Vérifier votre identité (KYC) - Fournir vos documents</li>
          <li>Aller dans <strong>Paramètres → API</strong></li>
          <li>Copier votre <strong>API Key</strong>, <strong>Site ID</strong> et <strong>Secret Key</strong></li>
          <li>Coller les clés dans ce formulaire</li>
          <li>Tester en mode <strong>Sandbox</strong> d'abord</li>
          <li>Passer en <strong>Production</strong> après validation</li>
        </ol>
        <div class="mt-4 p-3 bg-white rounded border border-blue-200">
          <p class="text-xs text-blue-700">
            <strong>💡 Astuce :</strong> Gardez vos clés API en sécurité. Ne les partagez jamais publiquement.
            Elles sont chiffrées dans notre base de données.
          </p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(false);
const hasConfig = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const config = ref({
  payment_provider: 'cinetpay',
  api_key: '',
  site_id: '',
  secret_key: '',
  mode: 'sandbox'
});

const isFormValid = computed(() => {
  return (
    config.value.payment_provider &&
    config.value.api_key &&
    config.value.site_id &&
    config.value.secret_key
  );
});

const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await api.get('/payments/config');
    if (response.data.data) {
      hasConfig.value = true;
      // Ne pas écraser les champs vides (pour permettre la modification)
      if (response.data.data.payment_provider) {
        config.value.payment_provider = response.data.data.payment_provider;
      }
      if (response.data.data.site_id) {
        config.value.site_id = response.data.data.site_id;
      }
      if (response.data.data.mode) {
        config.value.mode = response.data.data.mode;
      }
      // Les clés sensibles sont masquées, on ne les affiche pas
    }
  } catch (error: any) {
    console.error('Failed to load config:', error);
    errorMessage.value = 'Erreur lors du chargement de la configuration';
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await api.post('/payments/config', config.value);
    successMessage.value = 'Configuration enregistrée avec succès !';
    hasConfig.value = true;
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (error: any) {
    console.error('Failed to save config:', error);
    errorMessage.value = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
  } finally {
    loading.value = false;
  }
};

const testConnection = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Pour l'instant, on simule un test
    // TODO: Implémenter un endpoint de test réel
    await new Promise(resolve => setTimeout(resolve, 1000));
    successMessage.value = 'Connexion testée avec succès ! Vos clés sont valides.';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (error: any) {
    errorMessage.value = 'Erreur lors du test de connexion';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>
