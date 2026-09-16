<template>
  <iframe v-if="pdf" :src="pdf" class="pdf-app-frame" :class="{ 'pdf-app-dark': theme === 'dark' }"></iframe>
  <div v-else class="pdf-app-empty">No PDF selected.</div>
</template>

<script type="text/javascript">
  /*
   * Replacement for `vue-pdf-app`, which has no Vue 3 build.
   *
   * That package bundled its own PDF.js viewer chrome. Every modern browser
   * ships a PDF viewer with the same essentials (paging, zoom, search, print,
   * download), so embedding the file directly avoids adding a dependency for
   * the two screens that use this.
   *
   * `config` is accepted only so the existing call sites keep working; the
   * browser viewer has its own toolbar and it is not applied.
   */
  export default {
    props: {
      pdf: { type: String, default: '' },
      config: { type: Object, default: () => ({}) },
      theme: { type: String, default: 'light' }
    }
  }
</script>

<style>
.pdf-app-frame {
  width: 100%;
  height: 100%;
  min-height: 520px;
  border: 0;
  background: #f1f3f5;
}
.pdf-app-frame.pdf-app-dark {
  background: #2b2b2b;
}
.pdf-app-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
}
</style>
