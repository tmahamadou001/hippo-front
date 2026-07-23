<template>
  <div class="p-4 hover:bg-gray-50 transition-colors rounded-lg">
    <div class="flex items-start space-x-3">
      <div
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          bgColor
        ]"
      >
        <component :is="icon" :class="['w-5 h-5', iconColor]" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900">{{ title }}</p>
        <p class="text-sm text-gray-600 mt-0.5">{{ description }}</p>
        <div class="flex items-center mt-2 space-x-3">
          <p class="text-xs text-gray-500">{{ time }}</p>
          <span v-if="badge" :class="['text-xs px-2 py-0.5 rounded-full font-medium', badgeClass]">
            {{ badge }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  time: string
  icon: any
  bgColor?: string
  iconColor?: string
  badge?: string
  badgeClass?: string
}

withDefaults(defineProps<Props>(), {
  bgColor: 'bg-gray-100',
  iconColor: 'text-gray-600',
  badgeClass: 'bg-gray-100 text-gray-700'
})
</script>
