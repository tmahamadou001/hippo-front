import { ref } from 'vue'

export interface UseModalOptions {
  /** Initial open state */
  defaultOpen?: boolean
  /** Callback when modal opens */
  onOpen?: () => void
  /** Callback when modal closes */
  onClose?: () => void
  /** Callback when close is prevented */
  onClosePrevent?: () => void
}

export function useModal(options: UseModalOptions = {}) {
  const isOpen = ref(options.defaultOpen ?? false)

  const open = () => {
    isOpen.value = true
    options.onOpen?.()
  }

  const close = () => {
    isOpen.value = false
    options.onClose?.()
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  const handleClosePrevent = () => {
    options.onClosePrevent?.()
  }

  return {
    isOpen,
    open,
    close,
    toggle,
    handleClosePrevent
  }
}
