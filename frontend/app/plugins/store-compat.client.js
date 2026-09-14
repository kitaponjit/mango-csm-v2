import { useCsmStore } from '~/stores/csm'

/* Keeps `this.$store.dispatch('findService')` and `this.$store.state.config`
   working in ported components. Pinia exposes state, getters and actions on the
   store instance itself, so both accessors return it directly. */
export default defineNuxtPlugin((nuxtApp) => {
  const store = useCsmStore(nuxtApp.$pinia)

  nuxtApp.vueApp.config.globalProperties.$store = {
    get state() { return store },
    get getters() { return store },
    dispatch: (name, payload) => store[name](payload)
  }

  window.store = store
})
