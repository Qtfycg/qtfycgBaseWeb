import { describe, it, expect } from 'vitest'
import { getMealPeriod, daysUntil, isExpired, isExpiring, getPantryStatus, formatDate } from '../miniprogram/core/dates'

const at = (h: number, m = 0) => new Date(2026, 6, 29, h, m)

describe('dates: 餐次识别边界（FIL-001）', () => {
  it('05:00 起为早餐', () => {
    expect(getMealPeriod(at(5))).toBe('breakfast')
  })
  it('09:59 仍为早餐，10:00 转午餐', () => {
    expect(getMealPeriod(at(9, 59))).toBe('breakfast')
    expect(getMealPeriod(at(10))).toBe('lunch')
  })
  it('14:59 仍为午餐，15:00 转晚餐', () => {
    expect(getMealPeriod(at(14, 59))).toBe('lunch')
    expect(getMealPeriod(at(15))).toBe('dinner')
  })
  it('20:59 仍为晚餐，21:00 转夜宵', () => {
    expect(getMealPeriod(at(20, 59))).toBe('dinner')
    expect(getMealPeriod(at(21))).toBe('late_night')
  })
  it('凌晨 04:00 为夜宵', () => {
    expect(getMealPeriod(at(4))).toBe('late_night')
  })
})

describe('dates: 过期与临期边界（Story 18）', () => {
  const now = new Date(2026, 6, 29) // 2026-07-29

  it('当天到期 = 0 天，未过期且临期', () => {
    expect(daysUntil('2026-07-29', now)).toBe(0)
    expect(isExpired('2026-07-29', now)).toBe(false)
    expect(isExpiring('2026-07-29', now, 3)).toBe(true)
  })

  it('次日到期 = 1 天，临期', () => {
    expect(daysUntil('2026-07-30', now)).toBe(1)
    expect(isExpiring('2026-07-30', now, 3)).toBe(true)
  })

  it('昨天到期 = -1 天，已过期', () => {
    expect(daysUntil('2026-07-28', now)).toBe(-1)
    expect(isExpired('2026-07-28', now)).toBe(true)
    expect(isExpiring('2026-07-28', now, 3)).toBe(false)
  })

  it('阈值 3 天：4 天后到期不算临期', () => {
    expect(isExpiring('2026-08-02', now, 3)).toBe(false)
    expect(getPantryStatus('2026-08-02', now, 3)).toBe('normal')
  })

  it('状态判定：正常/临期/过期', () => {
    expect(getPantryStatus('2026-08-10', now, 3)).toBe('normal')
    expect(getPantryStatus('2026-07-31', now, 3)).toBe('expiring')
    expect(getPantryStatus('2026-07-20', now, 3)).toBe('expired')
  })
})

describe('dates: 格式化', () => {
  it('yyyy-MM-dd 补零', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
