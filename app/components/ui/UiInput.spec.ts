import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UiInput from './UiInput.vue'

describe('UiInput', () => {
  it('показывает label, когда он задан', () => {
    const w = mount(UiInput, { props: { modelValue: '', label: 'Логин' } })
    expect(w.get('.ui-input__label').text()).toBe('Логин')
  })

  it('не рендерит label, когда он не задан', () => {
    const w = mount(UiInput, { props: { modelValue: '' } })
    expect(w.find('.ui-input__label').exists()).toBe(false)
  })

  it('отображает modelValue в поле', () => {
    const w = mount(UiInput, { props: { modelValue: 'abc' } })
    expect((w.get('input').element as HTMLInputElement).value).toBe('abc')
  })

  it('эмитит update:modelValue при вводе', async () => {
    const w = mount(UiInput, { props: { modelValue: '' } })
    const input = w.get('input')
    ;(input.element as HTMLInputElement).value = 'qq'
    await input.trigger('input')
    expect(w.emitted('update:modelValue')![0]).toEqual(['qq'])
  })

  it('type по умолчанию text и прокидывает password', () => {
    const a = mount(UiInput, { props: { modelValue: '' } })
    expect(a.get('input').attributes('type')).toBe('text')
    const b = mount(UiInput, { props: { modelValue: '', type: 'password' } })
    expect(b.get('input').attributes('type')).toBe('password')
  })
})
