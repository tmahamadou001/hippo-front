<template>
  <div class="relative">
    <!-- Notification Button -->
    <button
      @click="toggleNotifications"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Bell class="w-5 h-5 text-gray-600" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 w-5 h-5 bg-corail-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Notifications Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        v-click-outside="closeNotifications"
        class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
            <p class="text-xs text-gray-600 mt-0.5">{{ unreadCount }} non lues</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-xs font-medium text-corail-600 hover:text-corail-700"
            >
              Tout marquer lu
            </button>
            <button
              @click="closeNotifications"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="p-3 border-b border-gray-200 flex items-center space-x-2 overflow-x-auto">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
              selectedFilter === filter.value
                ? 'bg-corail-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="filteredNotifications.length === 0" class="p-8 text-center">
            <Bell class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-600">Aucune notification</p>
          </div>
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="[
              'p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
              !notification.read && 'bg-corail-50/30'
            ]"
            @click="markAsRead(notification.id)"
          >
            <div class="flex items-start space-x-3">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  notification.bgColor
                ]"
              >
                <component :is="notification.icon" :class="['w-5 h-5', notification.iconColor]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <span v-if="!notification.read" class="w-2 h-2 bg-corail-500 rounded-full flex-shrink-0 mt-1.5"></span>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <div class="flex items-center mt-2 space-x-3">
                  <span class="text-xs text-gray-500">{{ notification.time }}</span>
                  <span
                    v-if="notification.badge"
                    :class="['text-xs px-2 py-0.5 rounded-full font-medium', notification.badgeClass]"
                  >
                    {{ notification.badge }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-gray-200 text-center">
          <button class="text-sm font-medium text-corail-600 hover:text-corail-700">
            Voir toutes les notifications
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, X, AlertCircle, CheckCircle, Info, TrendingUp, Calendar } from 'lucide-vue-next'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  icon: any
  bgColor: string
  iconColor: string
  badge?: string
  badgeClass?: string
}

const isOpen = ref(false)
const selectedFilter = ref('all')

const filters = [
  { label: 'Toutes', value: 'all' },
  { label: 'Non lues', value: 'unread' },
  { label: 'Réservations', value: 'bookings' },
  { label: 'Départs', value: 'departures' },
  { label: 'Système', value: 'system' }
]

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'Départ complet',
    message: 'Le départ Abidjan → Yamoussoukro de 08:00 est complet',
    time: 'Il y a 5 min',
    read: false,
    type: 'success',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    badge: 'Départ',
    badgeClass: 'bg-green-100 text-green-700'
  },
  {
    id: 2,
    title: 'Nouvelle réservation',
    message: 'Jean Kouassi a réservé 2 places pour demain',
    time: 'Il y a 12 min',
    read: false,
    type: 'info',
    icon: Info,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Réservation',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  {
    id: 3,
    title: 'Alerte occupation',
    message: 'Le départ de 14:00 n\'a que 3 places réservées',
    time: 'Il y a 1h',
    read: false,
    type: 'warning',
    icon: AlertCircle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badge: 'Alerte',
    badgeClass: 'bg-orange-100 text-orange-700'
  },
  {
    id: 4,
    title: 'Objectif atteint',
    message: 'Vous avez atteint 100% de votre objectif mensuel !',
    time: 'Il y a 2h',
    read: true,
    type: 'success',
    icon: TrendingUp,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 5,
    title: 'Rappel',
    message: 'Maintenance programmée pour le Bus VIP 01 demain',
    time: 'Il y a 3h',
    read: true,
    type: 'info',
    icon: Calendar,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Système',
    badgeClass: 'bg-gray-100 text-gray-700'
  }
])

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'all') {
    return notifications.value
  }
  if (selectedFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  }
  // Filtres par type à implémenter selon vos besoins
  return notifications.value
})

const toggleNotifications = () => {
  isOpen.value = !isOpen.value
}

const closeNotifications = () => {
  isOpen.value = false
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true
  })
}

// Directive pour fermer au clic extérieur
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    (el as any).clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', (el as any).clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>
