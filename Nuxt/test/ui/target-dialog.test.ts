import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TargetDialog from '../../app/components/ui/TargetDialog.vue'

describe('TargetDialog', () => {
  it('connects the dialog label to its visible title', async () => {
    const wrapper = mount(TargetDialog, {
      props: { open: true, title: 'Attachment details' },
    })

    const dialog = wrapper.get('dialog')
    const title = wrapper.get('h2')

    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(title.text()).toBe('Attachment details')
  })

  it('emits close from the accessible close button', async () => {
    const wrapper = mount(TargetDialog, {
      props: { open: true, title: 'Attachment details' },
    })

    await wrapper.get('button[aria-label="Close dialog"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the native dialog is cancelled', async () => {
    const wrapper = mount(TargetDialog, {
      props: { open: true, title: 'Attachment details' },
    })

    await wrapper.get('dialog').trigger('cancel')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the backdrop is selected', async () => {
    const wrapper = mount(TargetDialog, {
      props: { open: true, title: 'Attachment details' },
    })

    await wrapper.get('dialog').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
