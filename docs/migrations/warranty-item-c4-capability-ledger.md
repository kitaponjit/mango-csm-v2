# Warranty Item C4 capability ledger

Audit scope: legacy `frontend/app/Components/Pages/Master/v_csm_mas_002.vue` / `Website/Scripts/App/Application/Components/Pages/Master/v_csm_mas_002.vue` versus target `frontend/app/features/warranty-item/WarrantyItemPage.vue` and its feature seams.

Final audit result: `FULL_CAPABILITY_AUDITED` — `GAP 0` — `UNKNOWN 0`.

| Capability | Legacy evidence | Target evidence | Status |
| --- | --- | --- | --- |
| List/read | `WarrantyItem_ReadList` / `load()` | `list/warranty-item-list-service.ts`, list-state tests | `PARITY` |
| Search/filter | `search.field`, `search.text`, `active` | page filters and list controller | `PARITY` |
| Paging | `skip/take`, pagination component | list state page/max-page controls; Reference IC has independent paging | `PARITY` |
| Create | `WarrantyItem_Create` | edit service/form controller and create tests | `PARITY` |
| Edit | `WarrantyItem_Read`, `WarrantyItem_Update` | edit service/form controller and edit tests | `PARITY` |
| Delete | `WarrantyItem_Delete` and permission guard | delete service/controller, confirmation, refresh tests | `PARITY` |
| Reference IC | `WarrantyRefIC`, `addRefIC`, default `WarrantyGroup_ReadList`, one create per selected row | `reference-ic/warranty-item-reference-ic-service.ts`, state/controller, page workflow, reference-ic tests | `PARITY` |
| Standard Import | `ImportExcel`, `WarrantyItemImportData_Master`, `importFormMaster` | `import/warranty-item-import-service.ts`, state/controller, page workflow | `PARITY` |
| Import All Warranty | `onImportAuto`, `WarrantyAutoImportData`, `importFormAuto` | `import/warranty-item-import-all-service.ts`, state/controller, page workflow | `PARITY` |
| Standard mappings | Legacy A–M mapping, including ignored I and vendor J | `DEFAULT_WARRANTY_ITEM_IMPORT_MAPPING`, editable page selects | `PARITY` |
| Import All mappings | Legacy A–V mapping | `DEFAULT_WARRANTY_ITEM_IMPORT_ALL_MAPPING`, editable page selects | `PARITY` |
| `.xls` workbook | Legacy import component accepts Excel workbook input | both file inputs and parser accept `.xls` | `PARITY` |
| `.xlsx` workbook | Legacy import component accepts Excel workbook input | both file inputs and parser accept `.xlsx` | `PARITY` |
| Standard template | `Template_List_Warranty` download | standard template token/download workflow | `PARITY` |
| Import All template | `Template_All_Warranty` download | Import All template token/download workflow | `PARITY` |
| Export | `exportData`, `csm/master/WarrantyItemExport_Master` | export service/controller/download capability | `PARITY` |
| Grid sorting | `ag-table :sorting="true"`, sort event | registered `ag-table`, `on-sort-changed` handler, grid contract | `PARITY` |
| Saved columns | `saveColumns="Y"`, `MSCSM`, `v_csm_mas_002` | same props and page identity | `PARITY` |
| Grid columns/actions | legacy action, identity, status, duration and audit fields | `list/warranty-item-grid.ts`, action routing | `PARITY` |
| Audit formatting | legacy `datetime` cells use `DD/MM/YYYY HH:mm:ss` | grid adapter formats add/edit timestamps before display | `PARITY` |
| Permissions | legacy `permission()` and `maincomp.iccost == '3'` gate | access snapshot/page policy, edit compatibility, Reference IC `iccost === '3'` gate | `PARITY` |
| Readonly/editable behavior | menu right and edit permission behavior | mutation controls gated by page access and edit compatibility | `PARITY` |
| Validation | legacy save path has no client required/integer rejection; UI max lengths remain | draft validation keeps max lengths and allows legacy-accepted empty/non-integer values | `PARITY` |
| Status/error handling | legacy loading box, alerts, refresh after mutations | independent workflow states preserve preview/import/refresh/error outcomes | `PARITY` |
| i18n | legacy search labels read `ui.search_by` and `ui.search` | page reads those runtime keys through `warrantyItemUi()` with fallbacks; no new i18n system introduced | `PARITY` |

## Evidence index

- Standard import: `frontend/test/warranty-item/import/warranty-item-import-service.test.ts`, `warranty-item-import-state.test.ts`, `warranty-item-import-page-contract.test.ts`, `warranty-item-import-template-service.test.ts`.
- Import All: `frontend/test/warranty-item/import/warranty-item-import-all-service.test.ts`, `warranty-item-import-all-state.test.ts`, `warranty-item-import-all-page-contract.test.ts`.
- Reference IC: `frontend/test/warranty-item/reference-ic/warranty-item-reference-ic-service.test.ts`, `warranty-item-reference-ic-state.test.ts`, `warranty-item-reference-ic-page-contract.test.ts`.
- Grid and audit: `frontend/test/warranty-item/list/warranty-item-grid.test.ts`, `warranty-item-grid-page-contract.test.ts`.
- Legacy validation: `frontend/test/warranty-item/edit/warranty-item-legacy-validation.test.ts`, updated draft/service tests.
