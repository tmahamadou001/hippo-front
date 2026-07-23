<template>
  <!-- Overlay -->
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50"
      @click="close"
    ></div>
  </transition>

  <!-- Command Palette -->
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
    >
      <div class="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Search Input -->
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher ou taper une commande..."
              class="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-corail-500 focus:border-transparent"
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              @keydown.enter.prevent="executeSelected"
              @keydown.esc="close"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <kbd class="px-2 py-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded">
                Esc
              </kbd>
            </div>
          </div>
        </div>

        <!-- Categories Tabs -->
        <div class="px-4 py-2 border-b border-gray-200 flex items-center space-x-2 overflow-x-auto">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap',
              selectedCategory === category.value
                ? 'bg-corail-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            <component :is="category.icon" class="w-3.5 h-3.5 inline mr-1.5" />
            {{ category.label }}
          </button>
        </div>

        <!-- Results -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Recent Searches -->
          <div v-if="!searchQuery && recentSearches.length > 0" class="p-2">
            <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recherches récentes
            </div>
            <button
              v-for="(item, index) in recentSearches"
              :key="'recent-' + index"
              @click="executeCommand(item)"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div class="flex items-center space-x-3">
                <Clock class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-900">{{ item.label }}</span>
              </div>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <!-- Filtered Commands -->
          <div v-if="filteredCommands.length > 0" class="p-2">
            <div v-if="searchQuery" class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ filteredCommands.length }} résultat(s)
            </div>
            <button
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              @click="executeCommand(command)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left',
                selectedIndex === index
                  ? 'bg-corail-50 border border-corail-200'
                  : 'hover:bg-gray-50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    command.bgColor
                  ]"
                >
                  <component :is="command.icon" :class="['w-4 h-4', command.iconColor]" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ command.label }}</p>
                  <p class="text-xs text-gray-500">{{ command.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  v-if="command.badge"
                  :class="['text-xs px-2 py-0.5 rounded-full font-medium', command.badgeClass]"
                >
                  {{ command.badge }}
                </span>
                <kbd
                  v-if="command.shortcut"
                  class="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded"
                >
                  {{ command.shortcut }}
                </kbd>
              </div>
            </button>
          </div>

          <!-- No Results -->
          <div v-if="searchQuery && filteredCommands.length === 0" class="p-8 text-center">
            <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-600">Aucun résultat pour "{{ searchQuery }}"</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div class="flex items-center space-x-4">
            <span class="flex items-center">
              <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded mr-1">↑</kbd>
              <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded mr-2">↓</kbd>
              Naviguer
            </span>
            <span class="flex items-center">
              <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded mr-2">Enter</kbd>
              Sélectionner
            </span>
          </div>
          <span>
            <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded">⌘K</kbd>
            pour ouvrir
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  ChevronRight,
  Clock,
  Plus,
  Calendar,
  Ticket,
  Truck,
  MapPin,
  Users,
  BarChart3,
  Settings,
  FileText,
  Home,
  Building2
} from 'lucide-vue-next'

interface Command {
  id: string
  label: string
  description: string
  action: string
  category: string
  icon: any
  bgColor: string
  iconColor: string
  badge?: string
  badgeClass?: string
  shortcut?: string
  keywords?: string[]
}

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const selectedCategory = ref('all')
const searchInput = ref<HTMLInputElement>()

const categories = [
  { label: 'Tout', value: 'all', icon: Home },
  { label: 'Navigation', value: 'navigation', icon: MapPin },
  { label: 'Actions', value: 'actions', icon: Plus },
  { label: 'Recherche', value: 'search', icon: Search }
]

const commands = ref<Command[]>([
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Tableau de bord',
    description: 'Aller au tableau de bord',
    action: '/dashboard',
    category: 'navigation',
    icon: Home,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    shortcut: '⌘H',
    keywords: ['home', 'accueil', 'dashboard']
  },
  {
    id: 'nav-departures',
    label: 'Départs',
    description: 'Gérer les départs',
    action: '/departures',
    category: 'navigation',
    icon: Calendar,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    shortcut: '⌘D',
    keywords: ['departures', 'départs', 'voyages']
  },
  {
    id: 'nav-reservations',
    label: 'Réservations',
    description: 'Voir les réservations',
    action: '/reservations',
    category: 'navigation',
    icon: Ticket,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    shortcut: '⌘R',
    keywords: ['reservations', 'bookings', 'tickets']
  },
  {
    id: 'nav-vehicles',
    label: 'Véhicules',
    description: 'Gérer la flotte',
    action: '/vehicles',
    category: 'navigation',
    icon: Truck,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    shortcut: '⌘V',
    keywords: ['vehicles', 'véhicules', 'bus', 'flotte']
  },
  {
    id: 'nav-lines',
    label: 'Lignes',
    description: 'Gérer les lignes',
    action: '/lines',
    category: 'navigation',
    icon: MapPin,
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
    shortcut: '⌘L',
    keywords: ['lines', 'lignes', 'routes', 'itinéraires']
  },
  {
    id: 'nav-users',
    label: 'Utilisateurs',
    description: 'Gérer les utilisateurs',
    action: '/users',
    category: 'navigation',
    icon: Users,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    keywords: ['users', 'utilisateurs', 'équipe']
  },
  {
    id: 'nav-statistics',
    label: 'Statistiques',
    description: 'Voir les statistiques',
    action: '/statistics',
    category: 'navigation',
    icon: BarChart3,
    bgColor: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    keywords: ['statistics', 'stats', 'rapports', 'analytics']
  },
  {
    id: 'nav-companies',
    label: 'Compagnies',
    description: 'Gérer les compagnies',
    action: '/companies',
    category: 'navigation',
    icon: Building2,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    keywords: ['companies', 'compagnies', 'entreprises']
  },
  // Actions
  {
    id: 'action-new-departure',
    label: 'Nouveau départ',
    description: 'Créer un nouveau départ',
    action: 'create-departure',
    category: 'actions',
    icon: Plus,
    bgColor: 'bg-corail-100',
    iconColor: 'text-corail-600',
    badge: 'Action',
    badgeClass: 'bg-corail-100 text-corail-700',
    keywords: ['nouveau', 'créer', 'départ', 'new', 'voyage', 'trajet']
  },
  {
    id: 'action-new-reservation',
    label: 'Nouvelle réservation',
    description: 'Enregistrer une réservation',
    action: 'create-reservation',
    category: 'actions',
    icon: Ticket,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Action',
    badgeClass: 'bg-blue-100 text-blue-700',
    keywords: ['nouveau', 'créer', 'réservation', 'booking']
  },
  {
    id: 'action-export',
    label: 'Exporter les données',
    description: 'Télécharger un rapport',
    action: 'export-data',
    category: 'actions',
    icon: FileText,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    badge: 'Action',
    badgeClass: 'bg-green-100 text-green-700',
    keywords: ['export', 'télécharger', 'rapport', 'download']
  },
  {
    id: 'action-settings',
    label: 'Paramètres',
    description: 'Configurer l\'application',
    action: '/settings',
    category: 'actions',
    icon: Settings,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    shortcut: '⌘,',
    keywords: ['settings', 'paramètres', 'configuration']
  }
])

const recentSearches = ref<Command[]>([])

// Données simulées pour la recherche contextuelle
const searchableData = ref({
  reservations: [
    { id: 'RES001', name: 'Jean Kouassi', destination: 'Yamoussoukro', date: '2024-11-15' },
    { id: 'RES002', name: 'Marie Traoré', destination: 'Bouaké', date: '2024-11-16' },
    { id: 'RES003', name: 'Amadou Diallo', destination: 'San-Pédro', date: '2024-11-17' }
  ],
  vehicles: [
    { id: 'VEH001', name: 'Bus VIP 01', plate: 'AB-1234-CI', type: 'VIP' },
    { id: 'VEH002', name: 'Bus Standard 03', plate: 'AB-5678-CI', type: 'Standard' },
    { id: 'VEH003', name: 'Bus Premium 02', plate: 'AB-9012-CI', type: 'Premium' }
  ],
  departures: [
    { id: 'DEP001', route: 'Abidjan → Yamoussoukro', time: '08:00', date: '2024-11-15' },
    { id: 'DEP002', route: 'Abidjan → Bouaké', time: '10:30', date: '2024-11-15' },
    { id: 'DEP003', route: 'Yamoussoukro → Korhogo', time: '14:00', date: '2024-11-16' }
  ]
})

const dynamicSearchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  const results: Command[] = []

  // Search in reservations
  searchableData.value.reservations.forEach(res => {
    if (
      res.name.toLowerCase().includes(query) ||
      res.id.toLowerCase().includes(query) ||
      res.destination.toLowerCase().includes(query)
    ) {
      results.push({
        id: `search-res-${res.id}`,
        label: `Réservation ${res.id} - ${res.name}`,
        description: `${res.destination} • ${res.date}`,
        action: `/reservations/${res.id}`,
        category: 'search',
        icon: Ticket,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        badge: 'Réservation',
        badgeClass: 'bg-blue-100 text-blue-700',
        keywords: [res.name, res.id, res.destination]
      })
    }
  })

  // Search in vehicles
  searchableData.value.vehicles.forEach(veh => {
    if (
      veh.name.toLowerCase().includes(query) ||
      veh.plate.toLowerCase().includes(query) ||
      veh.type.toLowerCase().includes(query)
    ) {
      results.push({
        id: `search-veh-${veh.id}`,
        label: veh.name,
        description: `${veh.plate} • ${veh.type}`,
        action: `/vehicles/${veh.id}`,
        category: 'search',
        icon: Truck,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        badge: 'Véhicule',
        badgeClass: 'bg-orange-100 text-orange-700',
        keywords: [veh.name, veh.plate, veh.type]
      })
    }
  })

  // Search in departures
  searchableData.value.departures.forEach(dep => {
    if (
      dep.route.toLowerCase().includes(query) ||
      dep.id.toLowerCase().includes(query) ||
      dep.time.includes(query)
    ) {
      results.push({
        id: `search-dep-${dep.id}`,
        label: `Départ ${dep.id}`,
        description: `${dep.route} • ${dep.time}`,
        action: `/departures/${dep.id}`,
        category: 'search',
        icon: Calendar,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        badge: 'Départ',
        badgeClass: 'bg-green-100 text-green-700',
        keywords: [dep.route, dep.id, dep.time]
      })
    }
  })

  return results
})

const filteredCommands = computed(() => {
  let filtered = commands.value

  // Filter by category (exclude search results from static commands)
  if (selectedCategory.value !== 'all' && selectedCategory.value !== 'search') {
    filtered = filtered.filter(cmd => cmd.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    
    // Filter static commands
    filtered = filtered.filter(cmd => {
      const matchLabel = cmd.label.toLowerCase().includes(query)
      const matchDescription = cmd.description.toLowerCase().includes(query)
      const matchKeywords = cmd.keywords?.some(kw => kw.toLowerCase().includes(query))
      return matchLabel || matchDescription || matchKeywords
    })

    // Add dynamic search results
    if (selectedCategory.value === 'all' || selectedCategory.value === 'search') {
      filtered = [...dynamicSearchResults.value, ...filtered]
    }
  }

  return filtered
})

// Keyboard navigation
const navigateDown = () => {
  if (selectedIndex.value < filteredCommands.value.length - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const executeSelected = () => {
  if (filteredCommands.value[selectedIndex.value]) {
    executeCommand(filteredCommands.value[selectedIndex.value])
  }
}

const executeCommand = (command: Command) => {
  // Add to recent searches
  if (!recentSearches.value.find(r => r.id === command.id)) {
    recentSearches.value.unshift(command)
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop()
    }
  }

  // Execute action
  if (command.action.startsWith('/')) {
    router.push(command.action)
  } else {
    // Custom actions
    console.log('Execute action:', command.action)
  }

  close()
}

const open = () => {
  isOpen.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
  selectedCategory.value = 'all'
}

// Global keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  // Cmd/Ctrl + K to open
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

// Watch search query to reset selection
watch(searchQuery, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Expose open method for external use
defineExpose({
  open,
  close
})
</script>
