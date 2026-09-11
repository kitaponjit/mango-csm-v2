<template>
  <input type="text" class="text-right" v-model="dValue" @keyup="onKeyup" @focus="checkState($event)" @blur="checkState($event)" @keypress="isNumber" @paste="onPaste" />
</template>
<script>
  let vc = {
    props: ['value', 'decimals'],
    data() {
      return {
        isFocus: false
      }
    },
    methods: {
      checkState(el) {
        this.isFocus = el.type === 'focus';
      },
      isNumber(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46 && charCode !== 45) {
          evt.preventDefault();;
        } else {
          return true;
        }
      },
      onPaste(evt) {
        evt.preventDefault();
      },
      onKeyup() {
        this.$emit('keyup', this.dValue);
      },
    },
    computed: {
      dValue: {
        get() {

          let dec = $xt.dec(this.decimals || 0)
          let val = this.value;

          if ($xt.isEmpty(val)) return ''

          let deci = new Decimal(parseFloat(val))
          if (deci.isNaN()) { return val }
          let ret = '';

          if (this.isFocus) {
            ret = val.toString().replace(/,/g, '');
          } else {
            ret = $xt.formatNumber(deci.toFixed(10), dec);
          }

          return ret
        },
        set(newValue) {

          if ($xt.isEmpty(newValue)) {
            this.$emit('input', '');
            return
          }

          let f = parseFloat(newValue);
          if (isNaN(f)) {
            this.$emit('input', newValue);
            return
          }

          let dd = new Decimal(f);
          let dec = $xt.dec(this.decimals || 0)
          this.$emit('input', $xt.dec(dd.toFixed(10), dec));

        }
      }
    }
  }
  export default vc
</script>
