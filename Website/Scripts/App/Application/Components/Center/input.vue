<template>
  <input type="text" :class="inputClass" :value="showValue()" @input="updateValue" @change="evtChange" @keyup="evtKeyup" @keypress="isNumber" v-bind:disabled="disabled || false" v-bind:readonly="readonly || false" v-bind:maxlength="maxlength" autocomplete="off" />
</template>

<script type="text/javascript">
  export default {
    props: ['value', 'inputClass', 'numberOnly', 'maxlength', 'disabled', 'readonly'],
    data() {
      return {
        data: this.value
      }
    },
    methods: {
      evtChange() {
        this.$emit('change', this.data)
      },
      evtKeyup() {
        this.$emit('keyup', this.data)
      },
      updateValue(evt) {
        this.$emit('input', evt.target.value)
      },
      isNumber(evt) {
        let numberOnly = this.numberOnly || false
        if (numberOnly) {
          evt = (evt) ? evt : window.event
          var charCode = (evt.which) ? evt.which : evt.keyCode
          if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            evt.preventDefault()
          } else {
            return true
          }
        }
      },
      showValue() {
        return this.value
      },
    },
    computed: {

    },
    watch: {
      value(n, o) {
        this.$set(this, 'data', n)
      }
    }
  }
</script>
