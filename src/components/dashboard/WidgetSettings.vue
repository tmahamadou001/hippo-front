<template>
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

  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-x-full"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Personnalisation</h2>
            <p class="text-sm text-gray-600 mt-1">Configurez votre tableau de bord</p>
          </div>
          <button
            @click="close"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Widgets Visibility -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Widgets visibles</h3>
          <div class="space-y-2">
            <label
              v-for="widget in widgets"
              :key="widget.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center space-x-3">
                <component :is="widget.icon" class="w-5 h-5 text-gray-600" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ widget.label }}</p>
                  <p class="text-xs text-gray-500">{{ widget.description }}</p>
                </div>
              </div>
              <input
                type="checkbox"
                :checked="widget.visible"
                @change="toggleWidget(widget.id)"
                class="w-5 h-5 text-corail-500 border-gray-300 rounded focus:ring-corail-500"
              />
            </label>
          </div>
        </div>

        <!-- Theme Selection -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Thème de couleur</h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="theme in themes"
              :key="theme.value"
              @click="applyTheme(theme.value)"
              :class="[
                'p-4 rounded-lg border-2 transition-all',
                selectedTheme === theme.value
                  ? 'border-corail-500 bg-corail-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div :class="['w-full h-12 rounded-lg mb-2', theme.preview]"></div>
              <p class="text-xs font-medium text-gray-900">{{ theme.label }}</p>
              <CheckCircle 
                v-if="selectedTheme === theme.value"
                class="w-4 h-4 text-corail-600 mx-auto mt-2"
              />
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">✨ Changement appliqué immédiatement</p>
        </div>

        <!-- Layout Density -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Densité d'affichage</h3>
          <div class="space-y-2">
            <label
              v-for="density in densities"
              :key="density.value"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ density.label }}</p>
                <p class="text-xs text-gray-500">{{ density.description }}</p>
              </div>
              <input
                type="radio"
                :value="density.value"
                v-model="selectedDensity"
                @change="applyDensity"
                class="w-4 h-4 text-corail-500 border-gray-300 focus:ring-corail-500"
              />
            </label>
          </div>
        </div>

        <!-- Auto-refresh -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Actualisation automatique</h3>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">Activer</p>
              <p class="text-xs text-gray-500">Rafraîchir les données toutes les 30s</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="autoRefresh"
                @change="applyAutoRefresh"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-corail-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corail-500"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
        <div class="flex items-center space-x-3">
          <button
            @click="resetToDefault"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            @click="saveSettings"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-corail-500 rounded-lg hover:bg-corail-600 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  X,
  BarChart3,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  CheckCircle
} from 'lucide-vue-next'

interface Widget {
  id: string
  label: string
  description: string
  icon: any
  visible: boolean
}

const isOpen = ref(false)
const selectedTheme = ref('default')
const selectedDensity = ref('comfortable')
const autoRefresh = ref(false)

const widgets = ref<Widget[]>([
  {
    id: 'revenue-chart',
    label: 'Graphique des revenus',
    description: 'Évolution des revenus',
    icon: TrendingUp,
    visible: true
  },
  {
    id: 'bookings-chart',
    label: 'Réservations',
    description: 'Graphique des réservations',
    icon: BarChart3,
    visible: true
  },
  {
    id: 'calendar',
    label: 'Calendrier',
    description: 'Calendrier des départs',
    icon: Calendar,
    visible: true
  },
  {
    id: 'donut-chart',
    label: 'Répartition',
    description: 'Graphique donut',
    icon: PieChart,
    visible: true
  },
  {
    id: 'activity',
    label: 'Activité récente',
    description: 'Dernières actions',
    icon: Activity,
    visible: true
  }
])

const themes = [
  {
    label: 'Par défaut',
    value: 'default',
    preview: 'bg-gradient-to-br from-corail-500 to-primary-600'
  },
  {
    label: 'Océan',
    value: 'ocean',
    preview: 'bg-gradient-to-br from-blue-500 to-cyan-600'
  },
  {
    label: 'Forêt',
    value: 'forest',
    preview: 'bg-gradient-to-br from-green-500 to-emerald-600'
  }
]

const densities = [
  {
    label: 'Compact',
    value: 'compact',
    description: 'Plus d\'informations, moins d\'espace'
  },
  {
    label: 'Confortable',
    value: 'comfortable',
    description: 'Équilibre entre espace et contenu'
  },
  {
    label: 'Spacieux',
    value: 'spacious',
    description: 'Plus d\'espace, moins de contenu'
  }
]

const toggleWidget = (widgetId: string) => {
  const widget = widgets.value.find(w => w.id === widgetId)
  if (widget) {
    widget.visible = !widget.visible
    // Appliquer immédiatement
    applySettings()
  }
}

const applyTheme = (themeValue: string) => {
  selectedTheme.value = themeValue
  // Appliquer immédiatement
  applySettings()
  
  // Feedback visuel
  const root = document.documentElement
  if (themeValue === 'ocean') {
    root.style.setProperty('--color-primary', '#3b82f6')
    root.style.setProperty('--color-corail', '#06b6d4')
  } else if (themeValue === 'forest') {
    root.style.setProperty('--color-primary', '#10b981')
    root.style.setProperty('--color-corail', '#059669')
  } else {
    root.style.setProperty('--color-primary', '#0A2540')
    root.style.setProperty('--color-corail', '#FF6B4A')
  }
}

const applyDensity = () => {
  applySettings()
  
  // Appliquer la densité visuellement
  const root = document.documentElement
  if (selectedDensity.value === 'compact') {
    root.style.setProperty('--spacing-unit', '0.75rem')
  } else if (selectedDensity.value === 'spacious') {
    root.style.setProperty('--spacing-unit', '1.5rem')
  } else {
    root.style.setProperty('--spacing-unit', '1rem')
  }
}

const applyAutoRefresh = () => {
  applySettings()
  console.log('Auto-refresh:', autoRefresh.value ? 'activé' : 'désactivé')
}

const applySettings = () => {
  const settings = {
    widgets: widgets.value,
    theme: selectedTheme.value,
    density: selectedDensity.value,
    autoRefresh: autoRefresh.value
  }
  localStorage.setItem('dashboardSettings', JSON.stringify(settings))
  
  // Émettre un événement pour notifier le changement
  window.dispatchEvent(new CustomEvent('dashboard-settings-changed', { detail: settings }))
}

const resetToDefault = () => {
  widgets.value.forEach(w => w.visible = true)
  selectedTheme.value = 'default'
  selectedDensity.value = 'comfortable'
  autoRefresh.value = false
  applyTheme('default')
  applySettings()
}

const saveSettings = () => {
  applySettings()
  close()
}

const open = () => {
  // Load saved settings
  const saved = localStorage.getItem('dashboardSettings')
  if (saved) {
    const settings = JSON.parse(saved)
    if (settings.widgets) widgets.value = settings.widgets
    if (settings.theme) selectedTheme.value = settings.theme
    if (settings.density) selectedDensity.value = settings.density
    if (settings.autoRefresh !== undefined) autoRefresh.value = settings.autoRefresh
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

defineExpose({
  open,
  close
})
</script>
