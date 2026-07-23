<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-corail-50 dark:from-gray-950 dark:to-gray-900">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
