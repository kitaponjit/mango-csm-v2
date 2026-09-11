<script setup lang="ts">
import { computed } from 'vue'

type TargetStateKind = 'loading' | 'empty' | 'error'

const props = defineProps<{
  kind: TargetStateKind
  title: string
  message?: string
}>()

const role = computed(() => props.kind === 'error' ? 'alert' : 'status')
const liveMode = computed(() => props.kind === 'error' ? 'assertive' : 'polite')
</script>

<template>
  <section
    class="target-state"
    :class="`target-state--${kind}`"
    :role="role"
    :aria-live="liveMode"
  >
    <span v-if="kind === 'loading'" class="target-state__spinner" aria-hidden="true" />
    <div>
      <h3 class="target-state__title">
        {{ title }}
      </h3>
      <p v-if="message" class="target-state__message">
        {{ message }}
      </p>
      <slot />
    </div>
  </section>
</template>
