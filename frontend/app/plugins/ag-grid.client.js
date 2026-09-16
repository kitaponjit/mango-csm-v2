import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

/* ag-Grid v33 is modular: nothing renders until modules are registered, and the
   grid instead throws "No AG Grid modules are registered!" — which left
   `gridOptions.api` undefined and surfaced downstream as
   "Cannot read properties of undefined (reading 'setRowData')".

   The legacy app used ag-Grid v27, which had no registration step, so the port
   had none either. Registering the full Community bundle keeps every feature the
   screens already used available; per MIGRATION.md only row grouping (3 screens)
   needs Enterprise, and that remains an open decision. */
export default defineNuxtPlugin(() => {
  ModuleRegistry.registerModules([AllCommunityModule])
})
