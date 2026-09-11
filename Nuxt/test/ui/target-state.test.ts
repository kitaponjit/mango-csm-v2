import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TargetState from '../../app/components/ui/TargetState.vue'

describe('TargetState', () => {
  it('announces loading and empty states without presenting them as errors', () => {
    const loading = mount(TargetState, {
      props: { kind: 'loading', title: 'Loading updates' },
    })
    const empty = mount(TargetState, {
      props: { kind: 'empty', title: 'No updates found' },
    })

    expect(loading.attributes('role')).toBe('status')
    expect(loading.attributes('aria-live')).toBe('polite')
    expect(loading.classes()).toContain('target-state--loading')
    expect(empty.attributes('role')).toBe('status')
    expect(empty.text()).toContain('No updates found')
  })

  it('announces an error assertively and renders supporting detail', () => {
    const wrapper = mount(TargetState, {
      props: {
        kind: 'error',
        title: 'Unable to load updates',
        message: 'Try again in a moment.',
      },
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.attributes('aria-live')).toBe('assertive')
    expect(wrapper.text()).toContain('Unable to load updates')
    expect(wrapper.text()).toContain('Try again in a moment.')
  })
})
