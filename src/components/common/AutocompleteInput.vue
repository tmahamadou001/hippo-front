<template>
  <div class="autocomplete-input relative" ref="autocompleteRef">
    <!-- Input field -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="handleFocus"
        @input="handleInput"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="closeDropdown"
        :class="[
          'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
          error ? 'border-red-500' : 'border-gray-300'
        ]"
      />
      
      <!-- Loading spinner -->
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Clear button -->
      <button
        v-if="searchQuery && !disabled"
        @click="clearSelection"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <!-- Dropdown -->
    <div
      v-if="isOpen && !disabled"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden"
    >
      <!-- Virtual scroll container -->
      <div
        ref="scrollContainerRef"
        @scroll="handleScroll"
        class="overflow-y-auto"
        :style="{ maxHeight: maxHeight }"
      >
        <!-- Empty state -->
        <div v-if="!loading && displayedItems.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
          {{ emptyMessage }}
        </div>

        <!-- Items list -->
        <div v-else>
          <button
            v-for="(item, index) in displayedItems"
            :key="getItemKey(item)"
            type="button"
            @click="selectItem(item)"
            @mouseenter="highlightedIndex = index"
            :class="[
              'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors',
              highlightedIndex === index ? 'bg-gray-100' : '',
              isSelected(item) ? 'bg-primary-50 text-primary-700 font-medium' : ''
            ]"
          >
            <slot name="item" :item="item">
              {{ getItemLabel(item) }}
            </slot>
          </button>

          <!-- Loading more indicator -->
          <div v-if="loadingMore" class="px-4 py-3 text-center">
            <svg class="animate-spin h-5 w-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: any | null
  placeholder?: string
  disabled?: boolean
  error?: string
  // Function to fetch items - receives (search: string, offset: number, limit: number)
  fetchItems: (search: string, offset: number, limit: number) => Promise<{ items: any[], hasMore: boolean }>
  // Function to get item label for display
  itemLabel: (item: any) => string
  // Function to get unique key for item
  itemKey: (item: any) => string | number
  // Initial items to display
  initialItems?: any[]
  // Page size for virtual scroll
  pageSize?: number
  // Debounce delay in ms
  debounceDelay?: number
  // Max height of dropdown
  maxHeight?: string
  // Empty message
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher...',
  disabled: false,
  error: '',
  initialItems: () => [],
  pageSize: 25,
  debounceDelay: 300,
  maxHeight: '320px',
  emptyMessage: 'Aucun résultat'
})

const emit = defineEmits<{
  'update:modelValue': [value: any | null]
  'select': [value: any]
}>()

// Refs
const autocompleteRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const scrollContainerRef = ref<HTMLElement>()

// State
const searchQuery = ref('')
const isOpen = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const displayedItems = ref<any[]>([...props.initialItems])
const highlightedIndex = ref(0)
const currentOffset = ref(0)
const hasMore = ref(true)
const debounceTimer = ref<number>()

// Computed
const getItemLabel = (item: any) => props.itemLabel(item)
const getItemKey = (item: any) => props.itemKey(item)

const isSelected = (item: any) => {
  if (!props.modelValue) return false
  return getItemKey(item) === getItemKey(props.modelValue)
}

// Methods
const handleFocus = () => {
  isOpen.value = true
  if (displayedItems.value.length === 0) {
    loadInitialItems()
  }
}

const handleInput = () => {
  // Clear previous timer
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  // Set new timer
  debounceTimer.value = window.setTimeout(() => {
    performSearch()
  }, props.debounceDelay)
}

const performSearch = async () => {
  loading.value = true
  currentOffset.value = 0
  highlightedIndex.value = 0

  try {
    const result = await props.fetchItems(searchQuery.value, 0, props.pageSize)
    displayedItems.value = result.items
    hasMore.value = result.hasMore
    currentOffset.value = result.items.length
  } catch (error) {
    console.error('Error fetching items:', error)
    displayedItems.value = []
  } finally {
    loading.value = false
  }
}

const loadInitialItems = async () => {
  if (displayedItems.value.length > 0) return

  loading.value = true
  try {
    const result = await props.fetchItems('', 0, props.pageSize)
    displayedItems.value = result.items
    hasMore.value = result.hasMore
    currentOffset.value = result.items.length
  } catch (error) {
    console.error('Error loading initial items:', error)
  } finally {
    loading.value = false
  }
}

const loadMoreItems = async () => {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true
  try {
    const result = await props.fetchItems(searchQuery.value, currentOffset.value, props.pageSize)
    displayedItems.value = [...displayedItems.value, ...result.items]
    hasMore.value = result.hasMore
    currentOffset.value += result.items.length
  } catch (error) {
    console.error('Error loading more items:', error)
  } finally {
    loadingMore.value = false
  }
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // Load more when scrolled to bottom (with 50px threshold)
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadMoreItems()
  }
}

const selectItem = (item: any) => {
  searchQuery.value = getItemLabel(item)
  emit('update:modelValue', item)
  emit('select', item)
  closeDropdown()
}

const clearSelection = () => {
  searchQuery.value = ''
  emit('update:modelValue', null)
  highlightedIndex.value = 0
  performSearch()
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = 0
}

const navigateDown = () => {
  if (highlightedIndex.value < displayedItems.value.length - 1) {
    highlightedIndex.value++
    scrollToHighlighted()
  }
}

const navigateUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
    scrollToHighlighted()
  }
}

const selectHighlighted = () => {
  if (displayedItems.value[highlightedIndex.value]) {
    selectItem(displayedItems.value[highlightedIndex.value])
  }
}

const scrollToHighlighted = () => {
  // Scroll the highlighted item into view
  const container = scrollContainerRef.value
  if (!container) return

  const itemHeight = 40 // Approximate height of each item
  const scrollTop = highlightedIndex.value * itemHeight
  container.scrollTop = scrollTop
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (autocompleteRef.value && !autocompleteRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Watch modelValue to update search query
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = getItemLabel(newValue)
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>

<style scoped>
.autocomplete-input {
  position: relative;
}
</style>
