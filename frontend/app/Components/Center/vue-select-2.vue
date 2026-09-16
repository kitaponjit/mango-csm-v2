<template>
  <select ref="sel" :disabled="disabled"></select>
</template>

<script type="text/javascript">
  /*
   * Replacement for `v-select2-component`, which has no Vue 3 build.
   *
   * It only ever wrapped the jQuery Select2 plugin, and that plugin is still
   * loaded as a vendor script (Scripts/Others/select2/dist/js/select2.full.min.js
   * plus its bootstrap theme CSS), so this wraps the same plugin directly and
   * keeps the original contract: `options`, `settings`, `v-model`, `change` and
   * `disabled`. All 40 call sites stay unchanged.
   */
  export default {
    props: {
      options: { type: Array, default: () => [] },
      settings: { type: Object, default: () => ({}) },
      modelValue: { default: '' },
      // The Vue 2 contract; still honoured for any `:value` call site.
      value: { default: undefined },
      disabled: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'input', 'change', 'select'],
    computed: {
      bound() {
        return this.modelValue !== undefined ? this.modelValue : this.value
      }
    },
    mounted() {
      this.build()
    },
    beforeUnmount() {
      this.destroy()
    },
    watch: {
      options: {
        deep: true,
        handler() { this.rebuild() }
      },
      bound(v) {
        const $el = this.$el && window.jQuery ? window.jQuery(this.$refs.sel) : null
        if (!$el || !$el.data('select2')) return
        if (String($el.val() ?? '') !== String(v ?? '')) {
          // `change.select2` repaints the widget without re-firing our handler.
          $el.val(v).trigger('change.select2')
        }
      },
      disabled(v) {
        const $el = window.jQuery ? window.jQuery(this.$refs.sel) : null
        if ($el && $el.data('select2')) $el.prop('disabled', !!v)
      }
    },
    methods: {
      build() {
        const $ = window.jQuery
        if (!$ || !$.fn || !$.fn.select2) {
          console.warn('[vue-select-2] jQuery Select2 is not loaded — falling back to a plain select.')
          return
        }
        const $el = $(this.$refs.sel)
        $el.select2(Object.assign({ data: this.options || [] }, this.settings || {}))
        if (this.bound !== undefined && this.bound !== null) {
          $el.val(this.bound).trigger('change.select2')
        }
        $el.on('change', this.onChange)
      },
      onChange() {
        const $el = window.jQuery(this.$refs.sel)
        const v = $el.val()
        this.$emit('update:modelValue', v)
        this.$emit('input', v)
        this.$emit('change', v)
      },
      rebuild() {
        this.destroy()
        this.$nextTick(() => this.build())
      },
      destroy() {
        const $ = window.jQuery
        if (!$ || !$.fn || !$.fn.select2) return
        const $el = $(this.$refs.sel)
        if ($el.data('select2')) {
          $el.off('change', this.onChange)
          $el.select2('destroy')
        }
        $el.empty()
      }
    }
  }
</script>
