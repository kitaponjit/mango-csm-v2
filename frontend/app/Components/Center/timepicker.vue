<template>
  <date-picker time-picker
               :model-value="innerValue"
               :format="displayFormat"
               :input-class-name="inputClass"
               :disabled="disabledDate()"
               :teleport="true"
               placeholder="00:00"
               @update:model-value="evtInput"
               style="width:100%"></date-picker>
</template>

<script type="text/javascript">
import DatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
export default {
  props: ['inputClass', 'value', 'modelValue', 'disabled'],
  emits: ['input', 'change', 'update:modelValue'],
  components: {
    'date-picker': DatePicker
  },
  computed: {
    boundValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    // @vuepic's time-picker works in {hours, minutes, seconds}, not Date.
    innerValue() {
      let v = this.boundValue
      if ($xt.isEmpty(v)) return null;
      let m = typeof v === 'string' ? moment(v, 'HH:mm') : moment(v);
      if (!m.isValid()) return null;
      return { hours: m.hours(), minutes: m.minutes(), seconds: 0 };
    },
    displayFormat() {
      return (t) => {
        if (!t) return '';
        return moment({ hour: t.hours, minute: t.minutes }).format('HH:mm');
      };
    }
  },
  methods: {
    // The legacy wrapper emitted a Date; keep that so call sites are unchanged.
    evtInput(t) {
      let out = null;
      if (t) {
        out = moment().hours(t.hours).minutes(t.minutes).seconds(0).milliseconds(0).toDate();
      }
      this.$emit('update:modelValue', out);
      this.$emit('input', out);
      this.$emit('change', out);
    },
    disabledDate() {
      return this.disabled ? true : false;
    }
  }
};
</script>
