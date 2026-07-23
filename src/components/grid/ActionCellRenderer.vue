<template>
  <ActionMenu :actions="actions" :data="params.data" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ActionMenu, { type ActionMenuItem } from '@/components/common/ActionMenu.vue'

interface Props {
  params: any
}

const props = defineProps<Props>()

// Récupérer les actions depuis les params de la colonne
const actions = computed<ActionMenuItem[]>(() => {
  return props.params.colDef?.cellRendererParams?.actions || []
})
</script>
