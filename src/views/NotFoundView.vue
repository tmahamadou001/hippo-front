<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p class="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="space-x-4">
        <button
          @click="$router.go(-1)"
          class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          Go Back
        </button>
        <button
          @click="$router.push('/dashboard')"
          class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
