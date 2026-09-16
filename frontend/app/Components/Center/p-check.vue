<template>
  <div class="pretty" :class="$attrs.class">
    <input type="checkbox"
           :checked="isChecked"
           :disabled="disabled"
           @change="toggle">
    <div class="state" :class="`p-${color}`">
      <slot name="extra"></slot>
      <label><slot></slot></label>
    </div>
  </div>
</template>

<script type="text/javascript">
  /*
   * Replacement for `pretty-checkbox-vue`, which has no Vue 3 build.
   *
   * It reproduces the markup pretty-checkbox's CSS expects
   * (.pretty > input + .state > .icon + label) because those rules already ship
   * in Content/Site.css — note only a subset is there, so this matches the
   * structure the existing rules target rather than the full upstream library.
   *
   * The CSM call sites all use the same shape: a class list, `color`,
   * `true-value="Y"` / `false-value="N"` and `v-model`, plus an `extra` slot
   * holding the check icon.
   */
  export default {
    inheritAttrs: false,
    props: {
      modelValue: { default: undefined },
      value: { default: undefined },
      trueValue: { default: true },
      falseValue: { default: false },
      color: { type: String, default: 'primary' },
      disabled: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'change'],
    computed: {
      bound() {
        return this.modelValue !== undefined ? this.modelValue : this.value
      },
      isChecked() {
        return this.bound === this.trueValue
      }
    },
    methods: {
      toggle(e) {
        const next = e.target.checked ? this.trueValue : this.falseValue
        this.$emit('update:modelValue', next)
        this.$emit('change', next)
      }
    }
  }
</script>
