import { useCsmStore } from '~/stores/csm'

/* Vuex-shaped facade over the Pinia store.

   Pinia exposes state, getters and actions directly on the store instance, and
   the raw state object as `$state` — there is no `.state`. The ported
   components were written against Vuex and still read `store.state.X`
   (56 sites) and call `store.dispatch(...)` (2 sites), so returning the Pinia
   instance from `state`/`getters` keeps every one of those call sites working
   unchanged.

   Note the components reference the bare global `store` (the legacy
   `global.store`), not `this.$store` — there are currently zero `this.$store`
   uses. Assigning the raw Pinia instance to `window.store` therefore left
   `store.state` undefined everywhere, so `store.state.configData` read as
   undefined and blew up on the next property access. Both names now get the
   same facade. */
export default defineNuxtPlugin((nuxtApp) => {
  const store = useCsmStore(nuxtApp.$pinia)

  const vuexCompat = {
    get state() { return store },
    get getters() { return store },
    dispatch: (name, payload) => store[name](payload)
  }

  nuxtApp.vueApp.config.globalProperties.$store = vuexCompat

  window.store = vuexCompat
})
