import mitt from 'mitt'

const formatNumberFilter = function (x, n) {
  return $xt.formatNumber(x, n)
}

const formatDateFilter = function (d, f) {
  return $xt.formatDate(d, f)
}

export default defineNuxtPlugin((nuxtApp) => {
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
