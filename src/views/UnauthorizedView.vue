<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <svg
          class="mx-auto h-24 w-24 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p class="text-lg text-gray-600 mb-8">
        You don't have permission to access this page. Please contact your administrator if you
        believe this is an error.
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
