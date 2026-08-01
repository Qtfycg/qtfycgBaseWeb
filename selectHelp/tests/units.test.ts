import { describe, it, expect } from 'vitest'
import {
  combineAmounts,
  scaleForServings,
  roundByCategory,
  formatAmount,
  toBaseAmount,
  getUnitCategory,
} from '../miniprogram/core/units'

describe('units: 单位换算（Story 16）', () => {
  it('同类别重量单位可换算：1 千克 = 1000 克', () => {
    const r = toBaseAmount(1, '千克')
    expect(r.baseAmount).toBe(1000)
    expect(r.category).toBe('weight')
    expect(r.convertible).toBe(true)
  })

  it('同类别体积单位可换算：1 升 = 1000 毫升', () => {
    const r = toBaseAmount(2, '升')
    expect(r.baseAmount).toBe(2000)
    expect(r.category).toBe('volume')
  })

  it('计数类不可跨类别换算', () => {
    const r = toBaseAmount(3, '个')
    expect(r.convertible).toBe(false)
    expect(r.category).toBe('count')
  })

  it('描述性单位标记不可换算', () => {
    expect(getUnitCategory('适量')).toBe('descriptive')
    expect(toBaseAmount(1, '适量').convertible).toBe(false)
  })

  it('未知单位按描述性处理', () => {
    expect(getUnitCategory('把')).toBe('descriptive')
  })
})

describe('units: 合并（Story 16）', () => {
  it('同类别可换算单位合并到展示单位', () => {
    const r = combineAmounts({ amount: 500, unit: '克' }, { amount: 0.5, unit: '千克' })
    expect(r).toEqual({ amount: 1000, unit: '克' })
  })

  it('跨类别不可换算返回 null', () => {
    const r = combineAmounts({ amount: 2, unit: '个' }, { amount: 100, unit: '克' })
    expect(r).toBeNull()
  })

  it('描述性单位不可合并', () => {
    const r = combineAmounts({ amount: 1, unit: '适量' }, { amount: 2, unit: '适量' })
    expect(r).toBeNull()
  })
})

describe('units: 份数缩放（Story 16）', () => {
  it('2 人份菜谱缩放到 4 人份翻倍', () => {
    expect(scaleForServings(200, 2, 4, '克')).toBe(400)
  })

  it('计数单位向上取整', () => {
    // 2 人份需 1 个鸡蛋 → 3 人份需 1.5 个 → 向上取整 2 个
    expect(scaleForServings(1, 2, 3, '个')).toBe(2)
  })

  it('重量单位保留 1 位小数', () => {
    expect(scaleForServings(150, 2, 3, '克')).toBe(225)
    expect(scaleForServings(100, 3, 2, '克')).toBe(66.7)
  })
})

describe('units: 精度与格式化', () => {
  it('计数向上取整', () => {
    expect(roundByCategory(2.1, 'count')).toBe(3)
  })

  it('重量保留 1 位小数', () => {
    expect(roundByCategory(66.66, 'weight')).toBe(66.7)
  })

  it('描述性单位保持原值', () => {
    expect(roundByCategory(1.5, 'descriptive')).toBe(1.5)
  })

  it('格式化：整数不显示小数', () => {
    expect(formatAmount(200, '克')).toBe('200克')
    expect(formatAmount(66.7, '克')).toBe('66.7克')
  })

  it('格式化：描述性单位只显示单位', () => {
    expect(formatAmount(1, '适量')).toBe('适量')
  })
})
