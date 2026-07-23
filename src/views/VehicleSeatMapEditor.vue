<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Editor - Le composant SeatMapEditor charge lui-même le seat_map -->
    <SeatMapEditor
      :vehicle-id="vehicleId"
      :initial-seat-map="null"
      @saved="handleSaved"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import SeatMapEditor from '../components/seats/SeatMapEditor.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const vehicleId = route.params.id as string

function handleSaved() {
  toast.success('Configuration enregistrée avec succès')
  router.push('/vehicles')
}

function handleCancel() {
  router.push('/vehicles')
}
</script>
