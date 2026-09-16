<template>
  <div class="cp-panel">
    <input class="cp-swatch" type="color" :value="hex" :disabled="disabled" @input="pick($event.target.value)">
    <input class="cp-hex form-control input-sm" type="text" :value="bound" :disabled="disabled"
           placeholder="#000000" spellcheck="false" @change="pick($event.target.value)">
    <div class="cp-presets">
      <button v-for="c in presets" :key="c" type="button" class="cp-preset"
              :class="{ 'cp-preset--on': sameColor(c, hex) }"
              :style="{ background: c }" :title="c" @click="pick(c)"></button>
    </div>
  </div>
</template>

<script type="text/javascript">
  /*
   * Replacement for `one-colorpicker`'s <color-panel>, which has no Vue 3 build.
   * It was a `Vue.use(ColorPanel)` registration in the legacy main.js that the
   * port dropped, so both call sites currently render nothing.
   *
   * The contract is just `v-model` over a colour string, which is what the two
   * screens store on `priority_color` / `column_name`. This is a deliberately
   * plain rebuild on the native colour input plus the palette rows those screens
   * used — it is NOT a pixel match for one-colorpicker's panel, so the picker
   * looks different even though the stored value is the same.
   */
  const PRESETS = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#3b82f6', '#9b59b6', '#34495e', '#7f8c8d',
    '#000000', '#ffffff'
  ]

  export default {
    props: {
      modelValue: { type: String, default: '' },
      // Vue 2 contract, kept for any `:value` call site.
      value: { type: String, default: undefined },
      disabled: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'input', 'change'],
    data() {
      return { presets: PRESETS }
    },
    computed: {
      bound() {
        return this.modelValue !== undefined && this.modelValue !== ''
          ? this.modelValue
          : (this.value || '')
      },
      // <input type="color"> only accepts #rrggbb, so anything else falls back.
      hex() {
        const v = (this.bound || '').trim()
        if (/^#[0-9a-f]{6}$/i.test(v)) return v
        if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(c => c + c).join('')
        return '#000000'
      }
    },
    methods: {
      sameColor(a, b) {
        return String(a).toLowerCase() === String(b).toLowerCase()
      },
      pick(v) {
        this.$emit('update:modelValue', v)
        this.$emit('input', v)
        this.$emit('change', v)
      }
    }
  }
</script>

<style>
.cp-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.cp-swatch {
  width: 42px; height: 30px; padding: 2px;
  border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer;
}
.cp-hex { width: 104px; height: 30px; font-size: 13px; }
.cp-presets { display: flex; flex-wrap: wrap; gap: 5px; }
.cp-preset {
  width: 20px; height: 20px; padding: 0;
  border: 1.5px solid #e5e7eb; border-radius: 5px; cursor: pointer;
}
.cp-preset--on { outline: 2px solid #3b82f6; outline-offset: 1px; }
.cp-panel input:disabled, .cp-preset:disabled { opacity: .55; cursor: not-allowed; }
</style>
