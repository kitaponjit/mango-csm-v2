<template>
  <date-picker :model-value="innerValue"
               :format="displayFormat"
               :input-class-name="inputClass"
               :clearable="clearableDate()"
               :disabled="disabledDate()"
               :disabled-dates="disabledBefore"
               :enable-time-picker="isDateTime"
               :year-picker="isYear"
               :month-picker="isMonth"
               :placeholder="placeholder || '__/__/____'"
               :teleport="true"
               :auto-apply="!isDateTime"
               :action-row="{ showNow: true, showSelect: isDateTime, showCancel: isDateTime }"
               :now-button-label="`Today (${cvDate()})`"
               text-input
               @update:model-value="evtInput"
               style="width:100%">
  </date-picker>
</template>

<script type="text/javascript">
  import DatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  export default {
    props: ['inputClass', 'value', 'modelValue', 'type', 'format', 'disabled', 'dateBefore', 'dateAfter', 'clearable', 'placeholder'],
    emits: ['input', 'change', 'update:modelValue'],
    components: {
      'date-picker': DatePicker
    },
    computed: {
      // `v-model` in Vue 3 binds `modelValue`; the legacy call sites that pass
      // `:value` keep working because we fall back to it.
      boundValue() {
        return this.modelValue !== undefined ? this.modelValue : this.value
      },
      isDateTime() {
        return this.type === 'datetime'
      },
      isYear() {
        return this.type === 'year'
      },
      isMonth() {
        return this.type === 'month'
      },
      // @vuepic wants a Date (or a plain year number in year-picker mode); the
      // legacy contract passed strings in `moment.defaultFormat`.
      innerValue() {
        let v = this.boundValue
        if ($xt.isEmpty(v)) return null
        if (this.isYear) {
          let y = moment.isDate(v) ? moment(v) : moment(v, moment.defaultFormat)
          return y.isValid() ? y.year() : Number(v) || null
        }
        if (moment.isDate(v)) return v
        let m = moment(v, moment.defaultFormat)
        return m.isValid() ? m.toDate() : null
      },
      // vue2-datepicker took moment tokens; @vuepic takes date-fns tokens or a
      // function. Formatting through moment keeps the legacy output identical.
      displayFormat() {
        let fmt = this.format || 'DD/MM/YYYY'
        return (date) => {
          if ($xt.isEmpty(date)) return ''
          let d = Array.isArray(date) ? date[0] : date
          if (typeof d === 'number') return String(d)
          return moment(d).format(fmt)
        }
      }
    },
    methods: {
      cvDate() {
        return moment().format('DD/MM/YYYY')
      },
      // @vuepic emits one `update:model-value`; the legacy wrapper emitted both
      // `input` and `change`, and 9 + 14 call sites still listen for them.
      evtInput(date) {
        let out = date
        if (this.isYear && typeof date === 'number') {
          out = moment({ year: date, month: 0, day: 1 }).toDate()
        } else if (this.isMonth && date && typeof date === 'object' && !moment.isDate(date)) {
          out = moment({ year: date.year, month: date.month, day: 1 }).toDate()
        }
        this.$emit('update:modelValue', out)
        this.$emit('input', out)
        this.$emit('change', out)
      },
      disabledDate() {
        return this.disabled ? true : false
      },
      // NOTE: preserved verbatim from the Vue 2 wrapper, including its existing
      // `dateBefore`-instead-of-`dateAfter` checks — see MIGRATION.md.
      disabledBefore(date) {
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        if ($xt.isEmpty(this.dateBefore) && $xt.isEmpty(this.dateAfter)) {
          return false
        }
        if (!$xt.isEmpty(this.dateBefore) && $xt.isEmpty(this.dateBefore)) {
          return date < moment(new Date).add(-(this.dateBefore + 1), 'days')
        }
        if ($xt.isEmpty(this.dateBefore) && !$xt.isEmpty(this.dateBefore)) {
          return date > moment(new Date).add(this.dateAfter, 'days')
        }
        if (!$xt.isEmpty(this.dateBefore) && !$xt.isEmpty(this.dateBefore)) {
          return date < moment(new Date).add(-(this.dateBefore + 1), 'days') || date > moment(new Date).add(this.dateAfter, 'days')
        }
        return false
      },
      clearableDate() {
         return this.clearable === undefined ? true : this.clearable;
      },
    }
  }
</script>

<style>
/* ── @vuepic/vue-datepicker override — reproduces the previous .mx-* design ── */
.dp__theme_light {
  --dp-background-color: #ffffff;
  --dp-text-color: #1e293b;
  --dp-primary-color: #3b82f6;
  --dp-primary-text-color: #ffffff;
  --dp-border-color: #e5e7eb;
  --dp-border-color-hover: #3b82f6;
  --dp-hover-color: #eff6ff;
  --dp-hover-text-color: #1d4ed8;
  --dp-secondary-color: #cbd5e1;
  --dp-icon-color: #94a3b8;
  --dp-danger-color: #ef4444;
  --dp-border-radius: 8px;
  --dp-font-size: 13.5px;
  --dp-input-padding: 3px 10px;
  --dp-menu-min-width: 260px;
}

/* Input */
.dp__input {
  border: 1.5px solid #e5e7eb !important;
  border-radius: 8px !important;
  height: 30px !important;
  min-height: 30px !important;
  font-size: 13.5px !important;
  color: #1e293b !important;
  box-shadow: none !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  padding-left: 10px !important;
}
.dp__input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13) !important;
  outline: none !important;
}
.dp__input_readonly,
.dp__disabled {
  background-color: #eeeeee !important;
  color: #555 !important;
  cursor: not-allowed !important;
}

/* Popup panel */
.dp__menu {
  border: none !important;
  border-radius: 14px !important;
  box-shadow: 0 8px 32px rgba(2, 35, 78, 0.14), 0 2px 8px rgba(0,0,0,0.08) !important;
  overflow: hidden !important;
  font-size: 13px !important;
}

/* Header (month/year nav) */
.dp__month_year_row {
  background: #ffffff !important;
  padding: 4px 6px !important;
}
.dp__month_year_select {
  color: #1e293b !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  transition: color 0.15s !important;
}
.dp__month_year_select:hover {
  color: #3b82f6 !important;
  background: #eff6ff !important;
  border-radius: 6px !important;
}

/* Day-of-week header row */
.dp__calendar_header_item {
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
}

/* Date cells */
.dp__cell_inner {
  border-radius: 8px !important;
  font-size: 13px !important;
  color: #1e293b !important;
  transition: background 0.12s, color 0.12s !important;
}
.dp__cell_inner:hover {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
}
.dp__active_date {
  background: #3b82f6 !important;
  color: #fff !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}
.dp__today {
  border: 1px solid #ef4444 !important;
  color: #ef4444 !important;
  font-weight: 700 !important;
}
.dp__active_date.dp__today {
  color: #fff !important;
}
.dp__cell_disabled {
  color: #cbd5e1 !important;
  background: transparent !important;
  cursor: not-allowed !important;
}
.dp__cell_offset {
  color: #c0c9d6 !important;
}

/* Footer (action row / Today button) */
.dp__action_row {
  background: #f8fafc !important;
  border-top: 1px solid #f0f2f7 !important;
  padding: 8px 12px !important;
}
.dp__action_button {
  color: #3b82f6 !important;
  font-weight: 600 !important;
  font-size: 12.5px !important;
  background: transparent !important;
  border: none !important;
}
.dp__action_button:hover {
  color: #1d4ed8 !important;
  background: #eff6ff !important;
  border-radius: 6px !important;
}
</style>
