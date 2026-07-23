<template>
  <div class="min-h-screen flex">
    <!-- Left side - Login Form -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo & Title -->
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary-600 mb-2">Geyavo Admin</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <LoginForm />
      </div>
    </div>

    <!-- Right side - Branding -->
    <div
      class="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-12"
    >
      <div class="max-w-md text-white space-y-6">
        <h2 class="text-4xl font-bold">Welcome back!</h2>
        <p class="text-xl text-primary-100">
          Manage your transport company with ease. Track departures, reservations, and more.
        </p>
        <div class="space-y-4 pt-8">
          <div class="flex items-start gap-3">
            <svg
              class="w-6 h-6 text-corail-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <h3 class="font-semibold">Real-time Management</h3>
              <p class="text-primary-100 text-sm">
                Monitor your fleet and bookings in real-time
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <svg
              class="w-6 h-6 text-corail-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <h3 class="font-semibold">Secure & Reliable</h3>
              <p class="text-primary-100 text-sm">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <svg
              class="w-6 h-6 text-corail-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <h3 class="font-semibold">Easy to Use</h3>
              <p class="text-primary-100 text-sm">
                Intuitive interface designed for transport professionals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
</script>
