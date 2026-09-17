import mitt from 'mitt'
import { create as createJsonDiffPatch } from 'jsondiffpatch'

const formatNumberFilter = function (x, n) {
  return $xt.formatNumber(x, n)
}

const formatDateFilter = function (d, f) {
  return $xt.formatDate(d, f)
}

/*
 * `$xt.compareObject` in the vendor xtools.js calls `window.jsondiffpatch.diff(...)`
 * to work out what a form actually changed before saving. The legacy main.js built
 * that instance and put it on `window`; the port kept the dependency but never
 * created it, so the global was undefined and the six call sites across the three
 * CustomerConfigCenter save paths threw.
 *
 * The objectHash is copied from main.js — it is what lets the differ match array
 * items by identity instead of position, so a reordered list is not reported as a
 * wholesale rewrite.
 */
const installJsonDiffPatch = () => {
  if (typeof window === 'undefined' || window.jsondiffpatch) return
  window.jsondiffpatch = createJsonDiffPatch({
    objectHash: obj => obj.itemno || obj.id || JSON.stringify(obj)
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  installJsonDiffPatch()

  const emitter = mitt()

  nuxtApp.vueApp.config.globalProperties.$date = formatDateFilter
  nuxtApp.vueApp.config.globalProperties.$num = formatNumberFilter
  nuxtApp.vueApp.config.globalProperties.$eventBus = {
    $on: emitter.on,
    $off: emitter.off,
    $emit: emitter.emit
  }

  return {
    provide: {
      date: formatDateFilter,
      num: formatNumberFilter,
      eventBus: emitter
    }
  }
})
