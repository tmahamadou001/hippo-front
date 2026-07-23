<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Impersonation Banner -->
    <ImpersonationBanner />
    
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo + Toggle Button -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div v-if="isSidebarOpen" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-corail-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">G</span>
          </div>
          <span class="font-bold text-xl text-gray-900">Geyavo</span>
        </div>
        <div v-else class="w-8 h-8 bg-corail-500 rounded-lg flex items-center justify-center mx-auto">
          <span class="text-white font-bold text-lg">G</span>
        </div>
        
        <!-- Toggle Button -->
        <button
          @click="toggleSidebar"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'absolute right-4': !isSidebarOpen }"
        >
          <Menu class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto" style="height: calc(100vh - 8rem)">
        <div v-for="section in navigationSections" :key="section.title" class="mb-6">
          <!-- Section Header -->
          <div 
            v-if="isSidebarOpen" 
            class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {{ section.title }}
          </div>
          
          <!-- Section Divider (when sidebar is closed) -->
          <div v-else class="border-t border-gray-200 mb-2"></div>

          <!-- Section Items -->
          <div class="space-y-1">
            <router-link
              v-for="item in section.items"
              :key="item.name"
              :to="item.path"
              v-slot="{ isActive }"
              custom
            >
              <a
                @click="$router.push(item.path)"
                :class="[
                  'flex items-center px-3 py-2.5 text-sm font-medium transition-all cursor-pointer relative rounded-lg',
                  isActive || isCurrentRoute(item.path)
                    ? 'text-corail-500 bg-corail-50'
                    : 'text-gray-700 hover:bg-gray-100',
                  !isSidebarOpen && 'justify-center'
                ]"
                :title="!isSidebarOpen ? item.label : ''"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="isSidebarOpen" class="ml-3">{{ item.label }}</span>
              </a>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- User Profile -->
      <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
        <div class="relative">
          <button
            @click="showProfileMenu = !showProfileMenu"
            :class="[
              'w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors',
              isSidebarOpen ? 'justify-start' : 'justify-center'
            ]"
          >
            <div class="w-8 h-8 bg-corail-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-medium">{{ userInitials }}</span>
            </div>
            <div v-if="isSidebarOpen" class="ml-3 text-left flex-1">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email?.split('@')[0] }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</p>
            </div>
          </button>

          <!-- Profile Menu -->
          <div
            v-if="showProfileMenu"
            :class="[
              'absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1',
              isSidebarOpen ? 'left-3 right-3' : 'left-full ml-2 w-48'
            ]"
          >
            <!-- User info (visible only when sidebar is closed) -->
            <div v-if="!isSidebarOpen" class="px-4 py-2 border-b border-gray-200">
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email?.split('@')[0] }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</p>
            </div>
            
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showProfileMenu = false"
            >
              Mon profil
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showProfileMenu = false"
            >
              Paramètres
            </router-link>
            <hr class="my-1" />
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarOpen ? 'ml-64' : 'ml-20'
      ]"
    >
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div class="h-full px-6 flex items-center justify-end">
          <!-- Right Actions -->
          <div class="flex items-center space-x-2">
            <!-- Notifications Center -->
            <NotificationCenter />

            <!-- FAQ -->
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <HelpCircle class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-2">
        <router-view />
      </main>
    </div>

    <!-- Command Palette -->
    <CommandPalette ref="commandPaletteRef" />

    <!-- Widget Settings -->
    <WidgetSettings ref="widgetSettingsRef" />

    <!-- Floating Action Buttons -->
    <div class="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
      <!-- Command Palette Button -->
      <button
        @click="openCommandPalette"
        class="w-12 h-12 bg-corail-500 hover:bg-corail-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="Raccourcis (⌘K)"
      >
        <Search class="w-5 h-5" />
      </button>

      <!-- Widget Settings Button -->
      <button
        @click="openWidgetSettings"
        class="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        title="Personnaliser"
      >
        <Settings class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import { 
  Home, 
  MapPin,
  Clock,
  Calendar, 
  Truck, 
  Ticket, 
  BarChart3, 
  Menu,
  HelpCircle,
  Users,
  Building2,
  Search,
  Settings
} from 'lucide-vue-next'
import NotificationCenter from '@/components/dashboard/NotificationCenter.vue'
import CommandPalette from '@/components/dashboard/CommandPalette.vue'
import WidgetSettings from '@/components/dashboard/WidgetSettings.vue'
import ImpersonationBanner from '@/components/common/ImpersonationBanner.vue'

const route = useRoute()
const authStore = useAuthStore()
const { can, isGeyavo } = usePermissions()

// Récupérer l'état sauvegardé de la sidebar (par défaut: ouverte)
const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')
const showProfileMenu = ref(false)
const commandPaletteRef = ref<InstanceType<typeof CommandPalette>>()
const widgetSettingsRef = ref<InstanceType<typeof WidgetSettings>>()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  // Sauvegarder l'état dans localStorage
  localStorage.setItem('sidebarOpen', String(isSidebarOpen.value))
}

const isCurrentRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

const handleLogout = async () => {
  showProfileMenu.value = false
  await authStore.logout()
}

const openCommandPalette = () => {
  commandPaletteRef.value?.open()
}

const openWidgetSettings = () => {
  widgetSettingsRef.value?.open()
}

// Navigation organisée par sections fonctionnelles
const navigationSections = computed(() => {
  const sections = [
    {
      title: 'Vue d\'ensemble',
      items: [
        {
          name: 'dashboard',
          label: 'Tableau de bord',
          path: '/dashboard',
          icon: Home,
          visible: true
        }
      ]
    },
    {
      title: 'Opérations',
      items: [
        {
          name: 'lines',
          label: 'Lignes',
          path: '/lines',
          icon: MapPin,
          visible: can('lines.view')
        },
        {
          name: 'schedules',
          label: 'Horaires',
          path: '/schedules',
          icon: Clock,
          visible: can('schedules.view')
        },
        {
          name: 'departures',
          label: 'Départs',
          path: '/departures',
          icon: Calendar,
          visible: can('departures.view')
        },
        {
          name: 'vehicles',
          label: 'Véhicules',
          path: '/vehicles',
          icon: Truck,
          visible: can('vehicles.view')
        }
      ]
    },
    {
      title: 'Réservations & Clients',
      items: [
        {
          name: 'reservations',
          label: 'Réservations',
          path: '/reservations',
          icon: Ticket,
          visible: can('reservations.view')
        }
      ]
    },
    {
      title: 'Analyse & Rapports',
      items: [
        {
          name: 'statistics',
          label: 'Statistiques',
          path: '/statistics',
          icon: BarChart3,
          visible: can('reports.view')
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          name: 'users',
          label: 'Utilisateurs',
          path: '/users',
          icon: Users,
          visible: can('users.view')
        },
        {
          name: 'companies',
          label: 'Compagnies',
          path: '/companies',
          icon: Building2,
          visible: isGeyavo.value && can('companies.view')
        }
      ]
    }
  ]

  // Filtrer les items invisibles et les sections vides
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.visible)
    }))
    .filter(section => section.items.length > 0)
})
</script>
