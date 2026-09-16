<template>
  <div :id="id"
       class="dropzone"
       :class="{ 'dz-drag-hover': dragging }"
       @click="pick"
       @dragover.prevent="dragging = true"
       @dragenter.prevent="dragging = true"
       @dragleave.prevent="dragging = false"
       @drop.prevent="onDrop">
    <input ref="picker"
           type="file"
           multiple
           class="dz-hidden-input"
           :accept="options.acceptedFiles || undefined"
           @change="onPick">
    <slot></slot>
  </div>
</template>

<script type="text/javascript">
  /*
   * Drop-in replacement for `vue2-dropzone`, which has no Vue 3 build.
   *
   * Only the surface the CSM screens actually used is reproduced: the custom
   * slot, `@vdropzone-file-added` (one event per file) and `removeAllFiles()`.
   * The old `options.url` was a dummy (httpbin.org) because dropzone never did
   * the upload — `uploadFiletoTemp` posts through `$xt` — so no request is made
   * here either.
   */
  export default {
    props: {
      id: { type: String, default: 'dropzone' },
      options: { type: Object, default: () => ({}) },
      useCustomSlot: { type: Boolean, default: false }
    },
    emits: ['vdropzone-file-added', 'vdropzone-error'],
    data() {
      return {
        dragging: false
      }
    },
    methods: {
      pick(e) {
        // Let clicks on real controls inside the slot through.
        if (e.target !== e.currentTarget && e.target.closest('a,button,input,select,textarea')) return
        this.$refs.picker.click()
      },
      onPick(e) {
        this.addFiles(Array.from(e.target.files || []))
      },
      onDrop(e) {
        this.dragging = false
        this.addFiles(Array.from((e.dataTransfer && e.dataTransfer.files) || []))
      },
      addFiles(files) {
        let maxBytes = (this.options.maxFilesize || 0) * 1024 * 1024
        for (let f of files) {
          if (maxBytes && f.size > maxBytes) {
            this.$emit('vdropzone-error', f, `File is larger than ${this.options.maxFilesize} MB`)
            continue
          }
          this.$emit('vdropzone-file-added', f)
        }
      },
      // Called by the parents after a successful upload. There is no preview
      // list to clear, so this only resets the native input so re-picking the
      // same filename still fires `change`.
      removeAllFiles() {
        if (this.$refs.picker) this.$refs.picker.value = ''
      }
    }
  }
</script>

<style>
/* Replaces vue2Dropzone.min.css — only the container styling was ever used,
   because these screens render their own content through the custom slot. */
.dropzone {
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  background: #fafbfc;
  padding: 22px 18px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone:hover {
  border-color: #3b82f6;
  background: #f5f9ff;
}
.dropzone.dz-drag-hover {
  border-color: #3b82f6;
  background: #eff6ff;
}
.dropzone .dz-hidden-input {
  display: none;
}
.dropzone .dropzone-custom-title {
  margin: 0 0 4px;
}
</style>
