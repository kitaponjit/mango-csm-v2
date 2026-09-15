<template>
  <div class="vec">
    <div class="vec-head">
      <span class="vec-title">{{ title }}</span>
      <span class="vec-selected" v-if="selectedDate">{{ selectedLabel }}</span>
    </div>

    <FullCalendar ref="fc" :options="calendarOptions" />

    <div class="vec-events">
      <slot :showEvents="showEvents" :selectedDate="selectedDate">
        <div v-if="!showEvents.length" class="vec-empty">No events on this date.</div>
      </slot>
    </div>
  </div>
</template>

<script type="text/javascript">
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'

  /*
   * Replacement for `vue-event-calendar`, which has no Vue 3 build.
   *
   * Rebuilt on FullCalendar, already a dependency. The original contract is
   * kept: an `events` array and a default scoped slot exposing `showEvents`
   * (the events on the selected day), which is what the one call site renders.
   *
   * The call site formats `date` as DD/MM/YYYY while upstream documented
   * YYYY/MM/DD, so both are parsed here rather than assuming either.
   */
  const DATE_FORMATS = ['DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD', moment.ISO_8601]

  export default {
    components: { FullCalendar },
    props: {
      title: { type: String, default: '' },
      events: { type: Array, default: () => [] }
    },
    emits: ['day-changed'],
    data() {
      return {
        selectedDate: moment().format('YYYY-MM-DD')
      }
    },
    computed: {
      // Keep the original object alongside the normalised key so the slot can
      // render whatever extra fields each screen put on its events.
      normalised() {
        return (this.events || []).map(e => {
          const m = moment(e.date, DATE_FORMATS, true)
          return { raw: e, key: m.isValid() ? m.format('YYYY-MM-DD') : null }
        }).filter(x => x.key)
      },
      countByDay() {
        return this.normalised.reduce((acc, x) => {
          acc[x.key] = (acc[x.key] || 0) + 1
          return acc
        }, {})
      },
      showEvents() {
        return this.normalised.filter(x => x.key === this.selectedDate).map(x => x.raw)
      },
      selectedLabel() {
        return moment(this.selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
      },
      calendarOptions() {
        return {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          height: 'auto',
          headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
          events: Object.keys(this.countByDay).map(day => ({
            start: day,
            display: 'background',
            classNames: ['vec-has-events']
          })),
          dateClick: (info) => {
            this.selectedDate = info.dateStr
            this.$emit('day-changed', { date: info.dateStr, events: this.showEvents })
          },
          dayCellDidMount: (arg) => {
            const key = moment(arg.date).format('YYYY-MM-DD')
            const n = this.countByDay[key]
            if (!n) return
            const badge = document.createElement('span')
            badge.className = 'vec-badge'
            badge.textContent = n
            arg.el.querySelector('.fc-daygrid-day-top')?.appendChild(badge)
          }
        }
      }
    }
  }
</script>

<style>
.vec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.vec-title {
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
}
.vec-selected {
  font-size: 12.5px;
  color: #64748b;
}
.vec .fc-daygrid-day.fc-day-today {
  background: #eff6ff;
}
.vec .vec-badge {
  display: inline-block;
  min-width: 18px;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 9px;
  background: #3b82f6;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}
.vec-events {
  margin-top: 12px;
}
.vec-empty {
  padding: 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
