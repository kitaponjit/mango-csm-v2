<template>
  <iframe v-if="src" :src="src" class="doc-preview-frame" frameborder="0"></iframe>
  <div v-else class="doc-preview-empty">No document selected.</div>
</template>

<script type="text/javascript">
  /*
   * Drop-in replacement for `vue-doc-preview`, which has no Vue 3 build.
   *
   * The CSM screens only ever used `type="office"`, which that package rendered
   * as an Office Online viewer iframe. Same behaviour here — including the
   * caveat it always had: view.officeapps.live.com must be able to reach `url`,
   * so previews of files served from localhost do not render.
   */
  export default {
    props: {
      url: { type: String, default: '' },
      type: { type: String, default: 'office' }
    },
    computed: {
      src() {
        if (!this.url) return ''
        if (this.type !== 'office') return this.url
        return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(this.url)
      }
    }
  }
</script>

<style>
.doc-preview-frame {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border: 0;
}
.doc-preview-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
}
</style>
