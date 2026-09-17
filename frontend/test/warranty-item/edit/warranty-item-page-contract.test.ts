import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const pagePath = new URL('../../../app/features/warranty-item/WarrantyItemPage.vue', import.meta.url)
const source = readFileSync(pagePath, 'utf8')

describe('WarrantyItemPage Create/Edit/Delete source contract', () => {
  it('renders Create only for editable access and wires list-row Edit by code through detail loading', () => {
    expect(source).toContain('v-if="access.canCreate"')
    expect(source).toContain('@click="startCreate"')
    expect(source).toContain('@click="startEdit(item.code)"')
    expect(source).toContain('startEdit(item.code)')
    expect(source).toContain('createWarrantyItemFormController')
    expect(source).toContain('readWarrantyItemEditCompatibilitySnapshot')
  })

  it('uses immutable Edit code, active checkbox, structured duration, Group and Material controls', () => {
    expect(source).toContain('name="warranty-item-code"')
    expect(source).toContain(':maxlength="LEGACY_UI_WARRANTY_CODE_MAX"')
    expect(source).toContain(':maxlength="LEGACY_UI_WARRANTY_NAME_MAX"')
    expect(source).toContain(':readonly="formState.mode === \'edit\'"')
    expect(source).toContain('v-model="formState.draft.active"')
    expect(source).toContain('v-model.number="formState.draft.duration.years"')
    expect(source).toContain('v-model.number="formState.draft.duration.months"')
    expect(source).toContain('v-model.number="formState.draft.duration.days"')
    expect(source).toContain(':value="formState.draft.groupCode"')
    expect(source).toContain('@change="selectGroupByCode"')
    expect(source).toContain('setGroup')
    expect(source).toContain(':disabled="group.currentOnly"')
    expect(source).toContain('searchMaterials')
    expect(source).toContain('clearMaterial')
  })

  it('disables all form actions while pending, surfaces errors, and keeps mutation scope narrow', () => {
    expect(source).toContain(':disabled="formPending"')
    expect(source).toContain('formState.validationErrors')
    expect(source).toContain('formState.error')
    expect(source).toContain('@submit.prevent="saveForm"')
    expect(source).toContain('@click="cancelForm"')
    expect(source).toContain('refreshWarrantyItemList')
    expect(source).toContain('formPending || !controller')
    expect(source).toContain('@click="retry"')
    expect(source).toMatch(/<button[^>]+:disabled="busy \|\| formPending[^"]*"[^>]+@click="retry"/s)
    expect(source).not.toContain(':disabled="busy || formPending || !controller" @click="retry"')
    expect(source).not.toContain('Reference IC')
  })

  it('renders a guarded Delete action with explicit context and confirmation', () => {
    expect(source).toContain('createWarrantyItemDeleteService')
    expect(source).toContain('createWarrantyItemDeleteController')
    expect(source).toContain('deleteContext')
    expect(source).toContain('@click="deleteItem(item)"')
    expect(source).toContain('$msg.confirm')
    expect(source).toContain('formatWarrantyItemDeleteConfirmation')
    expect(source).toContain('retryDeleteRefresh')
    expect(source).not.toContain('{ header: item }')
    expect(source).not.toContain('{ header: row }')
  })

  it('refreshes compatibility globals at action time instead of freezing setup-time state', () => {
    expect(source).toContain('function refreshEditCompatibility')
    expect(source).toContain('globalThis')
    expect(source).toContain('formController.value?.startEdit')
    expect(source).toContain('formController.value?.save')
    expect(source).toContain('const editCompatibility = ref<WarrantyItemEditCompatibilitySnapshot>(readCurrentEditCompatibility())')
    expect(source).toContain('getWarrantyItemEditCompatibilityPolicy(editCompatibility.value).canEdit')
    expect(source).toContain('editCompatibility.value = snapshot')
    expect(source).toContain('const canEditNow = computed')
    expect(source).toContain('v-if="canEditNow"')
  })

  it('refreshes dynamic compatibility at mount/focus/visibility and removes listeners on unmount', () => {
    expect(source).toContain("window.addEventListener('focus', refreshEditCompatibility)")
    expect(source).toContain("document.addEventListener('visibilitychange', refreshEditCompatibility)")
    expect(source).toContain("window.removeEventListener('focus', refreshEditCompatibility)")
    expect(source).toContain("document.removeEventListener('visibilitychange', refreshEditCompatibility)")
  })

  it('retains the T1 connectController setup-retry seam for initial transport failures', () => {
    expect(source).toContain('function connectController')
    expect(source).toContain('createLegacyXtoolsTransport()')
    expect(source).toContain('if (!controller.value) connectController()')
    expect(source).toContain('formController.value = createWarrantyItemFormController')
  })
})
