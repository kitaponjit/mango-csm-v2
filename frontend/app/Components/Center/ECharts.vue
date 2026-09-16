<template>
  <v-chart ref="chart" :option="option" />
</template>

<script type="text/javascript">
  import VChart from 'vue-echarts'
  // The full echarts build self-registers every chart type and component, which
  // is what the legacy `Vue.use(echartsPlugin, { echarts })` did. vue-echarts on
  // its own requires each piece to be `use()`d explicitly, and the screens draw
  // bar/line/pie/gauge with tooltips, legends and labels between them.
  import 'echarts'

  /*
   * Replacement for `echarts-for-vue`, which has no Vue 3 build.
   *
   * The Vue 3 successor, `vue-echarts`, is already a dependency but exposes a
   * different surface: it forwards chart events as Vue events and exposes the
   * instance as `.chart`. The 26 call sites were written against
   * echarts-for-vue, which took an `events` array of [name, handler] pairs and
   * exposed the instance as `.inst`. This wrapper keeps that older contract so
   * none of them changed.
   *
   * `autoresize` is deliberately left off, matching the legacy default — the
   * charts did not resize with their container before either.
   */
  export default {
    components: { VChart },
    props: {
      option: { type: Object, default: () => ({}) },
      // [['click', handler], ['legendselectchanged', handler], ...]
      events: { type: Array, default: () => [] }
    },
    created() {
      // Defined as a live getter rather than a computed: `$refs` is not
      // reactive, so a computed would cache the first (undefined) read and never
      // invalidate, leaving `this.$refs.someChart.inst` permanently empty.
      Object.defineProperty(this, 'inst', {
        get: () => (this.$refs.chart ? this.$refs.chart.chart : null),
        configurable: true
      })
    },
    mounted() {
      this.bindEvents()
    },
    beforeUnmount() {
      const inst = this.inst
      if (!inst || inst.isDisposed?.()) return
      for (const pair of this.events || []) {
        if (Array.isArray(pair) && pair.length >= 2) {
          try { inst.off(pair[0], pair[1]) } catch (err) { /* already disposed */ }
        }
      }
    },
    methods: {
      bindEvents() {
        const inst = this.inst
        if (!inst) return
        for (const pair of this.events || []) {
          if (!Array.isArray(pair) || pair.length < 2) continue
          const [name, handler] = pair
          if (typeof handler !== 'function') continue
          inst.on(name, handler)
        }
      }
    }
  }
</script>
