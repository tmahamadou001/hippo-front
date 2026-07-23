<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @input="handleSearch"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      type="text"
      :placeholder="placeholder"
      :required="required"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
      :class="{ 'border-red-500': error }"
    />
    
    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && filteredCities.length > 0"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="city in filteredCities"
        :key="city.id"
        @mousedown.prevent="selectCity(city)"
        type="button"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
      >
        <span class="font-medium">{{ city.display_name }}</span>
        <span v-if="city.region" class="text-sm text-gray-500">{{ city.region }}</span>
      </button>
    </div>

    <!-- No results -->
    <div
      v-if="showSuggestions && searchQuery && filteredCities.length === 0 && !loading"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
    >
      Aucune ville trouvée
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import cityService from '@/services/cityService'
import type { City } from '@/types/city'
import { formatCityName } from '@/utils/cityUtils'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  required?: boolean
  error?: string
}>(), {
  placeholder: 'Rechercher une ville...',
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'citySelected', city: City): void
}>()

const searchQuery = ref('')
const showSuggestions = ref(false)
const cities = ref<City[]>([])
const loading = ref(false)

// Filtrer les villes selon la recherche
const filteredCities = computed(() => {
  if (!searchQuery.value) return cities.value.slice(0, 10)
  
  const query = searchQuery.value.toLowerCase()
  return cities.value.filter(city => 
    city.display_name.toLowerCase().includes(query) ||
    city.normalized_name.includes(query)
  ).slice(0, 10)
})

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    return
  }

  loading.value = true
  try {
    const response = await cityService.search(searchQuery.value)
    cities.value = response.data
    showSuggestions.value = true
  } catch (error) {
    console.error('Error searching cities:', error)
  } finally {
    loading.value = false
  }
}

const selectCity = (city: City) => {
  searchQuery.value = city.display_name
  emit('update:modelValue', city.normalized_name)
  emit('citySelected', city)
  showSuggestions.value = false
}

const handleBlur = () => {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Load initial cities
onMounted(async () => {
  try {
    const response = await cityService.getActive()
    cities.value = response.data
  } catch (error) {
    console.error('Error loading cities:', error)
  }
})

// Watch modelValue to update display
watch(() => props.modelValue, (newVal) => {
  if (newVal && !searchQuery.value) {
    // Find city by normalized name
    const city = cities.value.find(c => c.normalized_name === newVal)
    if (city) {
      searchQuery.value = city.display_name
    } else {
      // Format the normalized name
      searchQuery.value = formatCityName(newVal)
    }
  }
}, { immediate: true })
</script>
