import { mapState as piniaMapState, mapActions as piniaMapActions } from 'pinia'
import { useCsmStore } from './csm'

/* Vuex-shaped array syntax so ported components keep `mapState(['config'])`
   unchanged. In Pinia one helper covers both state and getters. */
export const mapState = (keys) => piniaMapState(useCsmStore, keys)
export const mapGetters = (keys) => piniaMapState(useCsmStore, keys)
export const mapActions = (keys) => piniaMapActions(useCsmStore, keys)
