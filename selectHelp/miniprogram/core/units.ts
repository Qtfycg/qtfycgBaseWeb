/**
 * 食材与计量领域模型（Story 16）
 * 纯 TypeScript 模块：不依赖 wx API，可独立测试。
 *
 * 规则：
 * - 单位按类别分类，只在同一类别内自动换算。
 * - 计数类（个/根/颗/片）与描述性（适量/少许/勺）不可跨类别换算。
 * - 小数精度：重量/体积保留 1 位小数，计数向上取整。
 */
import { UnitCategory } from '../types'

/** 单位定义表：单位名 → 类别 + 相对基准单位的换算系数 */
export interface UnitDef {
  category: UnitCategory
  /** 换算到该类别基准单位的系数（基准单位系数为 1） */
  toBase: number
  /** 是否可自动换算（描述性单位不可换算） */
  convertible: boolean
}

const UNIT_DEFS: Record<string, UnitDef> = {
  // 重量（基准：克）
  克: { category: 'weight', toBase: 1, convertible: true },
  千克: { category: 'weight', toBase: 1000, convertible: true },
  公斤: { category: 'weight', toBase: 1000, convertible: true },
  // 体积（基准：毫升）
  毫升: { category: 'volume', toBase: 1, convertible: true },
  升: { category: 'volume', toBase: 1000, convertible: true },
  // 计数（不可跨类别换算）
  个: { category: 'count', toBase: 1, convertible: false },
  根: { category: 'count', toBase: 1, convertible: false },
  颗: { category: 'count', toBase: 1, convertible: false },
  片: { category: 'count', toBase: 1, convertible: false },
  只: { category: 'count', toBase: 1, convertible: false },
  条: { category: 'count', toBase: 1, convertible: false },
  瓣: { category: 'count', toBase: 1, convertible: false },
  朵: { category: 'count', toBase: 1, convertible: false },
  // 描述性（不可换算，标记需人工确认）
  适量: { category: 'descriptive', toBase: 1, convertible: false },
  少许: { category: 'descriptive', toBase: 1, convertible: false },
  勺: { category: 'descriptive', toBase: 1, convertible: false },
  克少许: { category: 'descriptive', toBase: 1, convertible: false },
}

export function getUnitCategory(unit: string): UnitCategory {
  return UNIT_DEFS[unit]?.category ?? 'descriptive'
}

/** 换算到基准单位（仅同类可换算；未知单位视为描述性） */
export function toBaseAmount(amount: number, unit: string): { baseAmount: number; category: UnitCategory; convertible: boolean } {
  const def = UNIT_DEFS[unit]
  if (!def || !def.convertible) {
    return { baseAmount: amount, category: def?.category ?? 'descriptive', convertible: false }
  }
  return { baseAmount: amount * def.toBase, category: def.category, convertible: true }
}

/**
 * 合并两个用量：仅当单位类别相同且可换算时自动换算求和。
 * 跨类别或不可换算时返回 null（调用方展示为独立条目并标注"需人工确认"）。
 */
export function combineAmounts(
  a: { amount: number; unit: string },
  b: { amount: number; unit: string },
): { amount: number; unit: string } | null {
  const defA = UNIT_DEFS[a.unit]
  const defB = UNIT_DEFS[b.unit]
  if (!defA || !defB || defA.category !== defB.category || !defA.convertible) {
    return null
  }
  // 统一换算到 a 的单位展示
  const baseA = a.amount * defA.toBase
  const baseB = b.amount * defB.toBase
  const combinedBase = baseA + baseB
  const amountInAUnit = combinedBase / defA.toBase
  return {
    amount: roundByCategory(amountInAUnit, defA.category),
    unit: a.unit,
  }
}

/**
 * 份数缩放：实际用量 = 菜谱用量 × (目标份数 / 基础份数)
 */
export function scaleForServings(
  recipeAmount: number,
  baseServings: number,
  targetServings: number,
  unit: string,
): number {
  if (baseServings <= 0 || targetServings <= 0) {
    return recipeAmount
  }
  const scaled = (recipeAmount * targetServings) / baseServings
  return roundByCategory(scaled, getUnitCategory(unit))
}

/**
 * 精度规则：
 * - 重量/体积：保留 1 位小数
 * - 计数：向上取整
 * - 描述性：保留原值
 */
export function roundByCategory(amount: number, category: UnitCategory): number {
  if (category === 'count') {
    return Math.ceil(amount)
  }
  if (category === 'weight' || category === 'volume') {
    return Math.round(amount * 10) / 10
  }
  return amount
}

/** 展示格式：按类别格式化数量 */
export function formatAmount(amount: number, unit: string): string {
  const category = getUnitCategory(unit)
  if (category === 'count') {
    return `${amount}${unit}`
  }
  if (category === 'descriptive') {
    return unit
  }
  // 整数时不显示小数
  const text = Number.isInteger(amount) ? `${amount}` : `${Math.round(amount * 10) / 10}`
  return `${text}${unit}`
}
