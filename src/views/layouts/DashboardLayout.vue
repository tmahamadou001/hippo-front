<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-primary-600">Geyavo Admin</h1>
      </div>
      <nav class="px-4 space-y-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ currentPageTitle }}</h2>
          <button @click="logout" class="btn-secondary">
            Déconnexion
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Bus, 
  Calendar, 
  TicketCheck, 
  BarChart3, 
  Settings 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { name: 'dashboard', path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { name: 'departures', path: '/departures', label: 'Départs', icon: Calendar },
  { name: 'vehicles', path: '/vehicles', label: 'Véhicules', icon: Bus },
  { name: 'reservations', path: '/reservations', label: 'Réservations', icon: TicketCheck },
  { name: 'statistics', path: '/statistics', label: 'Statistiques', icon: BarChart3 },
  { name: 'settings', path: '/settings', label: 'Paramètres', icon: Settings },
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(i => i.name === route.name)
  return item?.label || 'Geyavo Admin'
})

const logout = () => {
  localStorage.removeItem('auth_token')
  router.push({ name: 'login' })
}
</script>
