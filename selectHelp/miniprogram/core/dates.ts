/**
 * 日期与餐次工具（Story 8 / Story 18）
 * 纯 TypeScript 模块：不依赖 wx API，可独立测试。
 *
 * 餐次划分（全天覆盖，边界可测）：
 * - breakfast: 05:00–09:59
 * - lunch:     10:00–14:59
 * - dinner:    15:00–20:59
 * - late_night:21:00–04:59
 */
import { MealPeriod } from '../types'

/** 根据时间识别餐次（FIL-001） */
export function getMealPeriod(date: Date): MealPeriod {
  const h = date.getHours()
  if (h >= 5 && h < 10) return 'breakfast'
  if (h >= 10 && h < 15) return 'lunch'
  if (h >= 15 && h < 21) return 'dinner'
  return 'late_night'
}

/** 餐次显示名 */
export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  late_night: '夜宵',
}

/** 距离过期还有多少天（负数表示已过期；含当天：当天到期 = 0） */
export function daysUntil(dateStr: string, now: Date): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const expiry = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor((expiry.getTime() - today.getTime()) / 86400000)
}

/** 是否已过期（expiryDate 当天算未过期，次日算过期） */
export function isExpired(dateStr: string, now: Date): boolean {
  return daysUntil(dateStr, now) < 0
}

/** 是否临期：未过期且剩余天数 ≤ 阈值 */
export function isExpiring(dateStr: string, now: Date, thresholdDays: number): boolean {
  const days = daysUntil(dateStr, now)
  return days >= 0 && days <= thresholdDays
}

/** 食材状态判定（Story 18） */
export function getPantryStatus(dateStr: string, now: Date, thresholdDays: number): 'normal' | 'expiring' | 'expired' {
  const days = daysUntil(dateStr, now)
  if (days < 0) return 'expired'
  if (days <= thresholdDays) return 'expiring'
  return 'normal'
}

/** 日期 → yyyy-MM-dd */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}
