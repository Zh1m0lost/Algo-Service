import { describe, it, expect } from 'vitest'
import { assignPair, countCorrect, totalPairs } from './matchTask'

describe('конструктор: подсчёт верных сопоставлений', () => {
  it('на пустых назначениях верных пар нет', () => {
    expect(countCorrect({})).toBe(0)
  })

  it('пара с совпадающими индексами засчитывается как верная', () => {
    expect(countCorrect({ 0: 0, 1: 1 })).toBe(2)
  })

  it('пара с разными индексами не засчитывается', () => {
    expect(countCorrect({ 0: 2, 1: 0 })).toBe(0)
  })
})

describe('конструктор: правила назначения пар', () => {
  it('назначает левому элементу правый', () => {
    expect(assignPair({}, 0, 0)).toEqual({ 0: 0 })
  })

  it('один правый слот не может быть занят двумя левыми', () => {
    expect(assignPair({ 0: 0 }, 1, 0)).toEqual({ 1: 0 })
  })

  it('повторный клик по той же паре снимает назначение', () => {
    expect(assignPair({ 0: 0 }, 0, 0)).toEqual({})
  })

  it('общее число пар равно меньшему из столбцов', () => {
    expect(totalPairs(4, 4)).toBe(4)
    expect(totalPairs(3, 5)).toBe(3)
  })
})
