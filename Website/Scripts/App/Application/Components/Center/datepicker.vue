<template>
  <date-picker :type="setProps('type')"
               :format="setProps('format')"
               :value="setProps('value')"
               :input-class="inputClass"
               @input="evtInput"
               @change="evtChange"
               :clearable="clearableDate()"
               :disabled="disabledDate()"
               :default-value="new Date()"
               :disabled-date="disabledBefore"
               placeholder="__/__/____"
               style="width:100%">

    <template v-slot:footer="{ emit }">
      <div class="text-center font-default">
        <button class="mx-btn mx-btn-text" @click="emit(new Date)">Today ({{cvDate()}})</button>
      </div>
    </template>

  </date-picker>
</template>

<script type="text/javascript">
  import DatePicker from 'vue2-datepicker'
  import 'vue2-datepicker/index.css'
  export default {
    props: ['inputClass', 'value', 'type', 'format', 'disabled', 'dateBefore', 'dateAfter', 'clearable'],
    components: {
      'date-picker': DatePicker
    },
    data: function () {
      return {
        date: this.value,
        lang: {
          placeholder: {
            date: "__/__/____"
          }
        }
      }
    },
    methods: {
      cvDate() {
        return moment().format('DD/MM/YYYY')
      },
      evtInput(date) {
        this.$emit('input', date)
      },
      evtChange(date) {
        this.$emit('change', date)
      },
      disabledDate() {
        return this.disabled ? true : false
      },
      disabledBefore(date) {
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        if ($xt.isEmpty(this.dateBefore) && $xt.isEmpty(this.dateAfter)) {
          return null
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
      },
      setProps(key) {
        switch (key) {
          case 'type':
            return this.type || 'date'
            break
          case 'format':
            return this.format || 'DD/MM/YYYY'
            break
          case 'value':
            return moment(this.value, moment.defaultFormat).toDate()
            break
        }
      },
      clearableDate() {
         return this.clearable === undefined ? true : this.clearable;
      },
    },
    watch: {
      value(newValue, oldValue) {
        this.$set(this, 'date', moment(newValue, moment.defaultFormat).toDate())
      }
    }
  }
</script>

<style>
/* ── vue2-datepicker modern override ── */

/* Input */
.mx-input {
  border: 1.5px solid #e5e7eb !important;
  border-radius: 8px !important;
  height: 30px !important;
  font-size: 13.5px !important;
  color: #1e293b !important;
  box-shadow: none !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  padding-left: 10px !important;
}
.mx-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13) !important;
  outline: none !important;
}
.mx-input:disabled,
.mx-input[readonly] {
  background-color: #eeeeee !important;
  color: #555 !important;
  cursor: not-allowed !important;
}

/* Calendar icon */
.mx-icon-calendar,
.mx-icon-clear {
  color: #94a3b8 !important;
}

/* Popup panel */
.mx-datepicker-popup {
  border: none !important;
  border-radius: 14px !important;
  box-shadow: 0 8px 32px rgba(2, 35, 78, 0.14), 0 2px 8px rgba(0,0,0,0.08) !important;
  overflow: hidden !important;
  font-size: 13px !important;
}

/* Header (month/year nav) */
.mx-calendar-header {
  background: #ffffff !important;
  padding: 10px 12px 14px !important;
}
.mx-calendar-header button,
.mx-btn-text {
  color: #1e293b !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  transition: color 0.15s !important;
}
.mx-calendar-header button:hover {
  color: #3b82f6 !important;
  background: #eff6ff !important;
  border-radius: 6px !important;
}
.mx-icon-left::before,
.mx-icon-right::before,
.mx-icon-double-left::before,
.mx-icon-double-right::before {
  border-color: #64748b !important;
}

/* Day-of-week header row */
.mx-calendar-content .mx-table-date th {
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  padding: 6px 0 !important;
  text-transform: uppercase !important;
}

/* Date cells */
.mx-calendar-content .cell {
  border-radius: 8px !important;
  font-size: 13px !important;
  color: #1e293b !important;
  transition: background 0.12s, color 0.12s !important;
  height: 32px !important;
  line-height: 32px !important;
}
.mx-calendar-content .cell:hover {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
}
.mx-calendar-content .cell.active {
  background: #3b82f6 !important;
  color: #fff !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}
.mx-calendar-content .cell.today {
  color: #ef4444 !important;
  font-weight: 700 !important;
}
.mx-calendar-content .cell.today.active {
  color: #fff !important;
}
.mx-calendar-content .cell.disabled {
  color: #cbd5e1 !important;
  background: transparent !important;
  cursor: not-allowed !important;
}
.mx-calendar-content .cell.not-current-month {
  color: #c0c9d6 !important;
}

/* Footer (Today button) */
.mx-datepicker-footer {
  background: #f8fafc !important;
  border-top: 1px solid #f0f2f7 !important;
  padding: 8px 12px !important;
}
.mx-datepicker-footer .mx-btn-text {
  color: #3b82f6 !important;
  font-weight: 600 !important;
  font-size: 12.5px !important;
  background: transparent !important;
}
.mx-datepicker-footer .mx-btn-text:hover {
  color: #1d4ed8 !important;
  background: #eff6ff !important;
  border-radius: 6px !important;
}
</style>
