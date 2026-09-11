<template>
  <date-picker type="time" format="HH:mm" :value="computedValue" :input-class="inputClass" :append-to-body="true" @input="evtInput" @change="evtChange" :disabled="disabledDate()" placeholder="00:00" style="width:100%"></date-picker>
</template>

<script type="text/javascript">
import DatePicker from 'vue2-datepicker';
export default {
 props: ['inputClass', 'value', 'disabled'],
  components: {
    'date-picker': DatePicker
  },
  computed: {
    computedValue() {
      if (!this.value) return null;
      if (typeof this.value === 'string') {
        return moment(this.value, 'HH:mm').toDate();
      }
      return this.value;
    }
  },
  data: function () {
    return {
      date: this.value,
      lang: {
        placeholder: {
          date: "__/__/____"
        }
      }
    };
  },
  methods: {
    evtInput(date) {
      this.$emit('input', date);
    },
    evtChange(date) {
      this.$emit('change', date);
    },
    dateBefore() {
      return new Date();
    },
    disabledDate() {
      return this.disabled ? true : false;
    },
    showValue() {
      return moment(this.value, moment.defaultFormat).toDate()
    },
  },
  watch: {
    value(newValue, oldValue) {
      this.$set(this, 'date', newValue)
    }
  }
};
</script>
