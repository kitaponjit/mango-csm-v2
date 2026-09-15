<template>
  <transition name="vel-fade">
    <div v-if="active" class="vel-overlay" :class="{ 'vel-fullscreen': isFullScreen }">
      <div class="vel-inner">
        <span class="vel-spinner" :style="{ borderTopColor: color }"></span>
        <span v-if="text" class="vel-text" :style="{ color }">{{ text }}</span>
      </div>
    </div>
  </transition>
</template>

<script type="text/javascript">
  /*
   * Replacement for `vue-element-loading`, which has no Vue 3 build.
   *
   * The CSM screens use a single shape — `:active`, `spinner`, `color`, `text`
   * — so this reproduces that overlay rather than pulling in a dependency.
   * The host element needs `position: relative` for the overlay to sit inside
   * it; that was true of the original too.
   */
  export default {
    props: {
      active: { type: Boolean, default: false },
      // Accepted for call-site compatibility; only one spinner shape is drawn.
      spinner: { type: String, default: 'spinner' },
      color: { type: String, default: '#02234e' },
      text: { type: String, default: '' },
      isFullScreen: { type: Boolean, default: false }
    }
  }
</script>

<style>
.vel-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.78);
  z-index: 1010;
}
.vel-overlay.vel-fullscreen {
  position: fixed;
  z-index: 2050;
}
.vel-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.vel-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-top-color: #02234e;
  border-radius: 50%;
  animation: vel-spin 0.7s linear infinite;
}
.vel-text {
  font-size: 13px;
  font-weight: 600;
}
@keyframes vel-spin {
  to { transform: rotate(360deg); }
}
.vel-fade-enter-active,
.vel-fade-leave-active {
  transition: opacity 0.15s;
}
.vel-fade-enter-from,
.vel-fade-leave-to {
  opacity: 0;
}
</style>
