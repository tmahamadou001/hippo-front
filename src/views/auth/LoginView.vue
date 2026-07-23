<template>
  <div class="card w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6">Connexion</h1>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Email</label>
        <input v-model="email" type="email" class="input-field" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Mot de passe</label>
        <input v-model="password" type="password" class="input-field" required />
      </div>
      <button type="submit" class="btn-primary w-full">Se connecter</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  // TODO: Implement API call
  localStorage.setItem('auth_token', 'demo-token')
  router.push({ name: 'dashboard' })
}
</script>
