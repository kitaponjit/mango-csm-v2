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
    /* Vuex logged an unknown action and returned undefined; it did not throw.
       Three screens dispatch `findDataType`, which the legacy store never had
       either (v_csm_rpt_001, v_csm_rpt_005, empty_o): harmless there, but
       `store[name](...)` threw "store[name] is not a function" and broke them. */
    dispatch: (name, payload) => {
      if (typeof store[name] !== 'function') {
        console.error(`[store] unknown action type: ${name}`)
        return undefined
      }
      return store[name](payload)
    }
  }

  nuxtApp.vueApp.config.globalProperties.$store = vuexCompat

  window.store = vuexCompat
})
