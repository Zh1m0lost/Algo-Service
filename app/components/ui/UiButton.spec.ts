import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UiButton from './UiButton.vue'

describe('UiButton', () => {
  it('по умолчанию variant=primary и type=button', () => {
    const w = mount(UiButton)
    const btn = w.get('button')
    expect(btn.classes()).toContain('ui-btn--primary')
    expect(btn.attributes('type')).toBe('button')
  })

  it('применяет переданный variant', () => {
    const w = mount(UiButton, { props: { variant: 'outline' } })
    expect(w.get('button').classes()).toContain('ui-btn--outline')
  })

  it('прокидывает type=submit', () => {
    const w = mount(UiButton, { props: { type: 'submit' } })
    expect(w.get('button').attributes('type')).toBe('submit')
  })

  it('loading=true делает кнопку disabled', () => {
    const w = mount(UiButton, { props: { loading: true } })
    expect(w.get('button').attributes('disabled')).toBeDefined()
  })

  it('рендерит содержимое слота', () => {
    const w = mount(UiButton, { slots: { default: 'Войти' } })
    expect(w.text()).toBe('Войти')
  })

  it('эмитит событие click по нажатию', async () => {
    const w = mount(UiButton)
    await w.get('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })
})
