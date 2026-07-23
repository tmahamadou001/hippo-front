<template>
  <Teleport to="body">
    <Transition
      v-if="transition"
      name="modal"
      @after-enter="emit('after:enter')"
      @after-leave="emit('after:leave')"
    >
      <div
        v-if="isOpen"
        :class="[
          'fixed inset-0 z-50 flex items-center justify-center',
          overlay && 'bg-black bg-opacity-50',
          ui?.overlay
        ]"
        @click="handleOverlayClick"
      >
        <div
          :class="[
            'bg-white shadow-xl transition-all flex flex-col',
            fullscreen ? 'w-full h-full rounded-none' : `rounded-md ${sizeClasses[size]} max-h-[90vh]`,
            ui?.wrapper
          ]"
          @click.stop
        >
          <!-- Header -->
          <div
            v-if="$slots.header || title || description || showClose"
            :class="[
              'flex items-start justify-between px-6 py-4 border-b border-gray-200',
              fullscreen && 'sticky top-0 bg-white z-10',
              ui?.header
            ]"
          >
            <slot name="header" :close="close">
              <div class="flex-1">
                <!-- Title -->
                <slot name="title">
                  <h2
                    v-if="title"
                    :class="['text-xl font-semibold text-gray-900', ui?.title]"
                  >
                    {{ title }}
                  </h2>
                </slot>

                <!-- Description -->
                <slot name="description">
                  <p
                    v-if="description"
                    :class="['mt-1 text-sm text-gray-500', ui?.description]"
                  >
                    {{ description }}
                  </p>
                </slot>
              </div>

              <!-- Actions (Fullscreen + Close) -->
              <div class="flex items-center gap-2 ml-4">
                <slot name="actions">
                  <!-- Fullscreen Toggle -->
                  <button
                    v-if="allowFullscreen"
                    @click="toggleFullscreen"
                    :class="[
                      'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                      ui?.fullscreenButton
                    ]"
                    :title="fullscreen ? 'Quitter le plein écran' : 'Plein écran'"
                  >
                    <Minimize2 v-if="fullscreen" class="w-5 h-5" />
                    <Maximize2 v-else class="w-5 h-5" />
                  </button>
                </slot>

                <!-- Close Button -->
                <slot name="close" :ui="{ close: ui?.close }">
                  <button
                    v-if="showClose"
                    @click="close"
                    :class="[
                      'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                      ui?.close
                    ]"
                    :title="closeTitle"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </slot>
              </div>
            </slot>
          </div>

          <!-- Content/Body -->
          <div
            v-if="$slots.content || $slots.body || $slots.default"
            :class="[
              'flex-1 overflow-y-auto',
              ui?.content
            ]"
          >
            <slot name="content" :close="close">
              <div :class="['p-6', ui?.body]">
                <slot name="body" :close="close">
                  <slot :close="close" />
                </slot>
              </div>
            </slot>
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            :class="[
              'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200',
              fullscreen && 'sticky bottom-0 bg-white z-10',
              ui?.footer
            ]"
          >
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sans transition -->
    <div
      v-else-if="isOpen"
      :class="[
        'fixed inset-0 z-50 flex items-center justify-center',
        overlay && 'bg-black bg-opacity-50',
        ui?.overlay
      ]"
      @click="handleOverlayClick"
    >
      <div
        :class="[
          'bg-white shadow-xl flex flex-col',
          fullscreen ? 'w-full h-full rounded-none' : `rounded-xl ${sizeClasses[size]} max-h-[90vh]`,
          ui?.wrapper
        ]"
        @click.stop
      >
        <!-- Header -->
        <div
          v-if="$slots.header || title || description || showClose"
          :class="[
            'flex items-start justify-between px-6 py-4 border-b border-gray-200',
            fullscreen && 'sticky top-0 bg-white z-10',
            ui?.header
          ]"
        >
          <slot name="header" :close="close">
            <div class="flex-1">
              <slot name="title">
                <h2
                  v-if="title"
                  :class="['text-xl font-semibold text-gray-900', ui?.title]"
                >
                  {{ title }}
                </h2>
              </slot>
              <slot name="description">
                <p
                  v-if="description"
                  :class="['mt-1 text-sm text-gray-500', ui?.description]"
                >
                  {{ description }}
                </p>
              </slot>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <slot name="actions">
                <button
                  v-if="allowFullscreen"
                  @click="toggleFullscreen"
                  :class="[
                    'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                    ui?.fullscreenButton
                  ]"
                  :title="fullscreen ? 'Quitter le plein écran' : 'Plein écran'"
                >
                  <Minimize2 v-if="fullscreen" class="w-5 h-5" />
                  <Maximize2 v-else class="w-5 h-5" />
                </button>
              </slot>
              <slot name="close" :ui="{ close: ui?.close }">
                <button
                  v-if="showClose"
                  @click="close"
                  :class="[
                    'p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                    ui?.close
                  ]"
                  :title="closeTitle"
                >
                  <X class="w-5 h-5" />
                </button>
              </slot>
            </div>
          </slot>
        </div>

        <div
          v-if="$slots.content || $slots.body || $slots.default"
          :class="[
            'flex-1 overflow-y-auto',
            ui?.content
          ]"
        >
          <slot name="content" :close="close">
            <div :class="['p-6', ui?.body]">
              <slot name="body" :close="close">
                <slot :close="close" />
              </slot>
            </div>
          </slot>
        </div>

        <div
          v-if="$slots.footer"
          :class="[
            'flex items-center justify-end gap-3 p-6 border-t border-gray-200',
            fullscreen && 'sticky bottom-0 bg-white z-10',
            ui?.footer
          ]"
        >
          <slot name="footer" :close="close" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Maximize2, Minimize2 } from 'lucide-vue-next'

export interface AppModalProps {
  /** Controlled open state */
  modelValue?: boolean
  /** Title of the modal */
  title?: string
  /** Description below the title */
  description?: string
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  /** Show overlay behind modal */
  overlay?: boolean
  /** Enable transitions */
  transition?: boolean
  /** Make modal fullscreen */
  fullscreen?: boolean
  /** Allow fullscreen toggle button */
  allowFullscreen?: boolean
  /** Enable scrollable content */
  scrollable?: boolean
  /** Show close button */
  close?: boolean
  /** Close button title */
  closeTitle?: string
  /** Dismissible by clicking outside or pressing ESC */
  dismissible?: boolean
  /** Prevent interaction with outside content */
  modal?: boolean
  /** Custom classes for different parts */
  ui?: {
    overlay?: string
    wrapper?: string
    header?: string
    title?: string
    description?: string
    content?: string
    body?: string
    footer?: string
    close?: string
    fullscreenButton?: string
  }
}

const props = withDefaults(defineProps<AppModalProps>(), {
  modelValue: false,
  size: '5xl',
  overlay: true,
  transition: true,
  fullscreen: false,
  allowFullscreen: true,
  scrollable: false,
  close: true,
  closeTitle: 'Fermer',
  dismissible: true,
  modal: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'close:prevent': []
  'after:enter': []
  'after:leave': []
}>()

// Internal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const internalFullscreen = ref(false)
const fullscreen = computed(() => props.fullscreen || internalFullscreen.value)

// Size classes
const sizeClasses = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
  '2xl': 'w-full max-w-2xl',
  '3xl': 'w-full max-w-3xl',
  '4xl': 'w-full max-w-4xl',
  '5xl': 'w-full max-w-5xl',
  full: 'w-[calc(100%-4rem)] h-[calc(100vh-4rem)] rounded-xl'
}

const showClose = computed(() => props.close !== false)

// Methods
const close = () => {
  // Fermeture explicite (bouton close, footer) - toujours autorisée
  isOpen.value = false
  emit('close')
}

const dismiss = () => {
  // Fermeture implicite (overlay, ESC) - respecte dismissible
  if (props.dismissible) {
    isOpen.value = false
    emit('close')
  } else {
    emit('close:prevent')
  }
}

const handleOverlayClick = () => {
  if (props.dismissible && !props.modal) {
    dismiss()
  } else if (!props.dismissible) {
    emit('close:prevent')
  }
}

const toggleFullscreen = () => {
  internalFullscreen.value = !internalFullscreen.value
}

// Handle ESC key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    dismiss()
  }
}

// Watch for open state to add/remove event listeners
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscape)
    // Prevent body scroll when modal is open
    if (props.modal) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
    // Reset fullscreen when closing
    internalFullscreen.value = false
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
