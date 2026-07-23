<template>
  <div
    :class="[
      'bg-white rounded-xl border border-gray-200 transition-all',
      isVisible ? 'block' : 'hidden'
    ]"
  >
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-if="refreshable"
          @click="$emit('refresh')"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Actualiser"
        >
          <RefreshCw class="w-4 h-4 text-gray-600" />
        </button>
        <button
          @click="toggleVisibility"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          :title="isVisible ? 'Masquer' : 'Afficher'"
        >
          <component :is="isVisible ? EyeOff : Eye" class="w-4 h-4 text-gray-600" />
        </button>
        <button
          v-if="configurable"
          @click="$emit('configure')"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Configurer"
        >
          <Settings class="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw, Eye, EyeOff, Settings } from 'lucide-vue-next'

interface Props {
  title: string
  widgetId: string
  refreshable?: boolean
  configurable?: boolean
  defaultVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  refreshable: false,
  configurable: false,
  defaultVisible: true
})

const emit = defineEmits<{
  refresh: []
  configure: []
  visibilityChange: [widgetId: string, visible: boolean]
}>()

const isVisible = ref(props.defaultVisible)

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
  emit('visibilityChange', props.widgetId, isVisible.value)
}
</script>
