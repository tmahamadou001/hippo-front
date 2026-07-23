<template>
  <button
    @click="$emit('click')"
    class="bg-white rounded-xl p-6 border border-gray-200 hover:border-corail-300 hover:shadow-lg transition-all duration-300 text-left group"
  >
    <div class="flex items-center space-x-4">
      <div
        :class="[
          'w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110',
          bgColor
        ]"
      >
        <component :is="icon" :class="['w-6 h-6', iconColor]" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-gray-900 group-hover:text-corail-600 transition-colors">
          {{ title }}
        </h3>
        <p class="text-xs text-gray-600 mt-1">{{ description }}</p>
      </div>
      <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-corail-500 transition-colors" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

interface Props {
  title: string
  description: string
  icon: any
  bgColor?: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  bgColor: 'bg-corail-50',
  iconColor: 'text-corail-600'
})

defineEmits<{
  click: []
}>()
</script>
