<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
        <div v-if="change" class="flex items-center mt-3">
          <span
            :class="[
              'text-sm font-medium flex items-center',
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            ]"
          >
            <component
              v-if="trend !== 'neutral'"
              :is="trend === 'up' ? TrendingUp : TrendingDown"
              class="w-4 h-4 mr-1"
            />
            {{ change }}
          </span>
          <span class="text-xs text-gray-500 ml-2">{{ changeLabel }}</span>
        </div>
      </div>
      <div
        :class="[
          'w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
          bgColor
        ]"
      >
        <component :is="icon" :class="['w-7 h-7', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Props {
  label: string
  value: string | number
  change?: string
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: any
  bgColor?: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  changeLabel: 'vs mois dernier',
  trend: 'neutral',
  bgColor: 'bg-primary-50',
  iconColor: 'text-primary-600'
})
</script>
