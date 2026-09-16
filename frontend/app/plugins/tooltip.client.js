/*
 * Replacement for the `v-tooltip` (v-tooltip v2) directive, which has no Vue 3
 * build. Its Vue 3 successor, floating-vue, would add a dependency and a second
 * tooltip style to a UI that already ships Bootstrap's.
 *
 * Bootstrap's jQuery tooltip is already loaded as a vendor script and matches
 * the surrounding AdminLTE look, so the directive is backed by that instead.
 *
 * All 35 call sites pass a plain string — a literal or a `ui.*` translation —
 * with no modifiers and no object config, so only that shape is supported.
 * `ui.*` values arrive from the backend and can change after first render (the
 * language switcher), which is why `updated` re-syncs the title.
 */

const hasBootstrapTooltip = () =>
  typeof window !== 'undefined' && window.jQuery && window.jQuery.fn && window.jQuery.fn.tooltip

const titleOf = (value) => (value === null || value === undefined ? '' : String(value))

function create(el, value) {
  const title = titleOf(value)
  if (!title || !hasBootstrapTooltip()) return
  window.jQuery(el).tooltip({
    title,
    // Appended to <body> so the tooltip is not clipped by table/modal overflow,
    // which is where most of these icons live.
    container: 'body',
    trigger: 'hover',
    placement: 'top'
  })
  el.__tooltipTitle = title
}

function destroy(el) {
  if (!hasBootstrapTooltip()) return
  try { window.jQuery(el).tooltip('destroy') } catch (err) { /* never initialised */ }
  delete el.__tooltipTitle
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', {
    mounted(el, binding) {
      create(el, binding.value)
    },
    updated(el, binding) {
      const next = titleOf(binding.value)
      if (next === el.__tooltipTitle) return
      destroy(el)
      create(el, next)
    },
    beforeUnmount(el) {
      destroy(el)
    }
  })
})
