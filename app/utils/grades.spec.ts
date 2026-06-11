import { describe, it, expect } from 'vitest'
import { avg } from './grades'

describe('журнал: средний балл', () => {
  it('считает среднее по оценкам', () => {
    expect(avg([5, 4, 5])).toBe(4.7)
  })

  it('игнорирует пустые оценки (null)', () => {
    expect(avg([5, null, 4])).toBe(4.5)
  })

  it('возвращает null, если оценок нет', () => {
    expect(avg([null, null])).toBeNull()
  })

  it('округляет до одного знака после запятой', () => {
    expect(avg([5, 4, 4])).toBe(4.3)
  })

  it('по одной оценке возвращает её саму', () => {
    expect(avg([3])).toBe(3)
  })
})
