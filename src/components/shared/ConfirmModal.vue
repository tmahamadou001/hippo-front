<template>
  <AppModal
    v-model="isOpen"
    :title="title"
    size="md"
    @close="handleClose"
  >
    <template #body>
      <p class="text-gray-600">{{ message }}</p>
    </template>

    <template #footer="{ close }">
      <button
        @click="close"
        class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        {{ cancelText }}
      </button>
      <button
        @click="confirm"
        :class="[
          'px-4 py-2 text-white font-medium rounded-lg transition-colors',
          confirmClass
        ]"
      >
        {{ confirmText }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmClass?: string
}>(), {
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  confirmClass: 'bg-primary-600 hover:bg-primary-700'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  isOpen.value = false
}

const confirm = () => {
  emit('confirm')
  isOpen.value = false
}
</script>
