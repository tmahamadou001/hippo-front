<template>
  <div class="relative" ref="menuContainer">
    <!-- Bouton 3 points -->
    <button
      @click.stop="toggleMenu"
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      :class="{ 'bg-gray-100': isOpen }"
    >
      <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>

    <!-- Menu déroulant -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        @click.stop
      >
        <button
          v-for="(action, index) in actions"
          :key="index"
          @click="handleAction(action)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
          :class="action.className || 'text-gray-700'"
        >
          <component
            v-if="action.icon"
            :is="action.icon"
            class="w-4 h-4"
          />
          <svg
            v-else-if="action.iconPath"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="action.iconPath"
            />
          </svg>
          <span>{{ action.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface ActionMenuItem {
  label: string
  onClick: (data: any) => void
  icon?: any // Composant Vue
  iconPath?: string // SVG path
  className?: string // Classes CSS personnalisées (ex: 'text-red-600')
}

interface Props {
  actions: ActionMenuItem[]
  data: any
}

const props = defineProps<Props>()

const isOpen = ref(false)
const menuContainer = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleAction = (action: ActionMenuItem) => {
  action.onClick(props.data)
  isOpen.value = false
}

// Fermer le menu si on clique en dehors
const handleClickOutside = (event: MouseEvent) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Styles pour le menu */
</style>
