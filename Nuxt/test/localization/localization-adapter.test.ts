import { describe, expect, it } from 'vitest'
import { createLocalizationAdapter } from '../../app/services/localization/localization-adapter'

describe('createLocalizationAdapter', () => {
  it('uses Thai by default without exposing the legacy storage key', () => {
    const adapter = createLocalizationAdapter({ getItem: () => null })

    expect(adapter.language).toBe('th')
    expect(adapter.t('manual.title')).toBe('รายการอัพเดทโปรแกรม')
    expect(Object.keys(adapter)).toEqual(['language', 't'])
  })

  it('uses English for the established EN preference', () => {
    const adapter = createLocalizationAdapter({ getItem: () => 'EN' })

    expect(adapter.language).toBe('en')
    expect(adapter.t('manual.title')).toBe('Program update list')
  })

  it('provides localized QCItem labels and states in both supported languages', () => {
    const keys = [
      'title',
      'description',
      'count',
      'number',
      'action',
      'actions',
      'descriptionColumn',
      'remark',
      'addDate',
      'add',
      'save',
      'saving',
      'export',
      'exporting',
      'import',
      'importTitle',
      'selectedFile',
      'chooseFile',
      'cancel',
      'upload',
      'uploading',
      'importHint',
      'loading',
      'empty',
      'error',
      'retry',
      'validation',
      'descriptionRequired',
      'remarkRequired',
      'deleteConfirm',
      'saveSuccess',
      'importSuccess',
      'exportError',
      'fileTypeError',
      'authChecking',
      'authRequired',
      'authUnavailable',
    ]
    const thai = createLocalizationAdapter({ getItem: () => null })
    const english = createLocalizationAdapter({ getItem: () => 'EN' })

    for (const key of keys) {
      expect(thai.t(`qcItem.${key}`)).not.toBe(`qcItem.${key}`)
      expect(english.t(`qcItem.${key}`)).not.toBe(`qcItem.${key}`)
    }
  })

  it('falls back to Thai for unknown preferences and missing keys', () => {
    const adapter = createLocalizationAdapter({ getItem: () => 'JP' })

    expect(adapter.language).toBe('th')
    expect(adapter.t('missing.key')).toBe('missing.key')
  })
})
