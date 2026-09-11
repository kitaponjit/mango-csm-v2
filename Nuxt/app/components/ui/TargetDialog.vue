<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  closeLabel?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

function requestClose() {
  emit('close')
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    requestClose()
  }
}

function syncOpenState(open: boolean) {
  const element = dialog.value
  if (!element) {
    return
  }

  if (open && !element.open) {
    if (typeof element.showModal === 'function') {
      element.showModal()
    }
    else {
      element.setAttribute('open', '')
    }
  }
  else if (!open && element.open) {
    element.close()
  }
}

watch(
  () => props.open,
  async open => {
    await nextTick()
    syncOpenState(open)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (dialog.value?.open) {
    dialog.value.close()
  }
})
</script>

<template>
  <dialog
    ref="dialog"
    class="target-dialog"
    :aria-labelledby="titleId"
    @cancel.prevent="requestClose"
    @click="onBackdropClick"
  >
    <div class="target-dialog__surface">
      <header class="target-dialog__header">
        <h2 :id="titleId" class="target-dialog__title">
          {{ title }}
        </h2>
        <button
          type="button"
          class="target-dialog__close"
          :aria-label="closeLabel || 'Close dialog'"
          @click="requestClose"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="target-dialog__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="target-dialog__footer">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>
