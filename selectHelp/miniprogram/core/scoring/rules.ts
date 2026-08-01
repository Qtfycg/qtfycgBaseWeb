/**
 * 规则评分引擎（Story 8）
 * 每条规则返回一个 ScoringEvidence；数据不可用时返回 null（维度跳过，不进分子分母）。
 * 硬性排除（打烊/超距离）以 excluded: true 标记，由 normalize 阶段从候选池剔除。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */
import {
  MealCandidate,
  PantryItem,
  RecommendationContext,
  ScoringEvidence,
} from '../../types'
import { getMealPeriod, isExpired, isExpiring } from '../dates'
import { combineAmounts } from '../units'
import { ScoringConfig } from './config'

/** 评分辅助数据（页面/提供器组装后传入） */
export interface ScoringInput {
  candidate: MealCandidate
  context: RecommendationContext
  config: ScoringConfig
  /** 预聚合库存（recommend 构建一次，供所有候选复用；已排除过期） */
  pantryStock?: Map<string, StockEntry>
  /** 近期已选候选 id 集合（Story 11 提供，7 天窗口内） */
  recentCandidateIds?: Set<string>
  /** 学习权重：菜系/口味/食材加权分（Story 11 提供） */
  learningWeights?: {
    cuisine: Record<string, number>
    taste: Record<string, number>
    ingredient: Record<string, number>
  }
}

/** 预聚合库存条目（buildPantryStock 构建） */
export interface StockEntry {
  amount: number
  unit: string
  expiring: boolean
}

type Rule = (input: ScoringInput) => ScoringEvidence | null

/** 餐次匹配（FIL-001）：候选餐次包含当前餐次 → 100 */
const mealPeriodRule: Rule = ({ candidate, context, config }) => {
  const features = candidate.features
  if (!features.mealPeriodTags.length) return null
  const current = context.mealPeriod ?? getMealPeriod(context.now)
  const matched = features.mealPeriodTags.includes(current)
  return {
    factor: 'meal_period',
    rawValue: { current, tags: features.mealPeriodTags },
    score: matched ? 100 : 30,
    weight: config.weights.mealPeriod,
    description: matched ? `适合${current}` : undefined,
  }
}

/** 预算匹配（FIL-002）：预估花费在预算内满分，超出递减 */
const budgetRule: Rule = ({ candidate, context, config }) => {
  const cost = candidate.features.estimatedCost
  const budget = context.budget
  if (cost == null || budget == null) return null // 无价格或未设预算 → 跳过
  let score: number
  if (cost <= budget) {
    score = 100
  } else {
    // 超出部分按 2 倍预算为 0 分线性递减
    score = Math.max(0, 100 * (1 - (cost - budget) / budget))
  }
  return {
    factor: 'budget',
    rawValue: { cost, budget },
    score,
    weight: config.weights.budget,
    description: cost <= budget ? `约 ${cost} 元，在预算内` : `约 ${cost} 元，超出预算`,
  }
}

/** 时间匹配（FIL-003）：耗时在可用时间内满分，超出递减 */
const timeRule: Rule = ({ candidate, context, config }) => {
  const duration = candidate.features.estimatedDurationMinutes
  const maxTime = context.maxTimeMinutes
  if (duration == null || maxTime == null) return null
  const score = duration <= maxTime ? 100 : Math.max(0, 100 * (1 - (duration - maxTime) / maxTime))
  return {
    factor: 'time',
    rawValue: { duration, maxTime },
    score,
    weight: config.weights.time,
    description: duration <= maxTime ? `约 ${duration} 分钟` : `需 ${duration} 分钟，可能偏久`,
  }
}

/** 口味匹配（FIL-004）：口味交集 / 候选口味数 */
const tasteRule: Rule = ({ candidate, context, config }) => {
  const pref = context.tastePreferences
  const tags = candidate.features.tasteTags
  if (!pref.length || !tags.length) return null
  const matched = tags.filter((t) => pref.includes(t))
  const score = Math.round((matched.length / tags.length) * 100)
  return {
    factor: 'taste',
    rawValue: { pref, tags },
    score,
    weight: config.weights.taste,
    description: matched.length > 0 ? `符合你的${matched.join('/')}偏好` : undefined,
  }
}

/** 食材覆盖率（FIL-005, PAN-004）：已有食材 / 所需食材；临期额外加权（Story 18） */
const coverageRule: Rule = ({ candidate, config, pantryStock }) => {
  if (candidate.type !== 'cook') return null
  const features = candidate.features
  const required = features.mainIngredientIds
  if (!required.length || !pantryStock) return null

  const covered = required.filter((id) => pantryStock.has(id)).length
  const coverage = covered / required.length
  let score = Math.round(coverage * 100)

  // 临期加权：所需食材中存在临期食材 → 覆盖率得分 × 加权系数（上限 100）
  const hasExpiring = required.some((id) => pantryStock.get(id)?.expiring)
  if (hasExpiring) {
    score = Math.min(100, Math.round(score * config.expiringBoostFactor))
  }

  return {
    factor: 'coverage',
    rawValue: { covered, required: required.length },
    score,
    weight: config.weights.coverage,
    description: `食材覆盖 ${Math.round(coverage * 100)}%`,
  }
}

/** 距离与营业状态（FIL-006）：营业中且距离在范围内满分，越近越高；打烊/超距离 → 硬排除 */
const distanceRule: Rule = ({ candidate, context, config }) => {
  if (candidate.type !== 'delivery') return null
  const maxDistance = context.maxDistanceKm
  const open = candidate.features.open
  const distance = candidate.features.distanceKm
  if (open === false) {
    return { factor: 'distance', rawValue: { open }, score: 0, weight: config.weights.distance, description: '已打烊', excluded: true }
  }
  if (distance == null || maxDistance == null) return null
  if (distance > maxDistance) {
    return {
      factor: 'distance',
      rawValue: { distance, maxDistance },
      score: 0,
      weight: config.weights.distance,
      description: `距离 ${distance}km，超出范围`,
      excluded: true,
    }
  }
  const score = Math.max(0, Math.round(100 * (1 - distance / maxDistance)))
  return {
    factor: 'distance',
    rawValue: { distance, maxDistance },
    score,
    weight: config.weights.distance,
    description: `距离 ${distance}km${open === true ? '，营业中' : ''}`,
  }
}

/** 近期重复降权（FIL-007）：7 天内出现过的相似候选降权 */
const recentRule: Rule = ({ candidate, recentCandidateIds, config }) => {
  if (!recentCandidateIds || !recentCandidateIds.has(candidate.id)) return null
  return {
    factor: 'recent',
    rawValue: { recent: true },
    score: 30,
    weight: config.weights.recent,
    description: '近 7 天吃过',
  }
}

/** 历史评价加权（HIS-003）：学习权重累加（Story 11 提供，阶段三启用） */
const ratingRule: Rule = ({ candidate, learningWeights, config }) => {
  if (!learningWeights) return null
  const f = candidate.features
  let bonus = 0
  for (const tag of f.cuisineTags) bonus += learningWeights.cuisine[tag] ?? 0
  for (const tag of f.tasteTags) bonus += learningWeights.taste[tag] ?? 0
  for (const id of f.mainIngredientIds) bonus += learningWeights.ingredient[id] ?? 0
  if (bonus === 0) return null
  // 每个加权分 ±10 分，钳制在 0-100
  const score = Math.min(100, Math.max(0, 50 + bonus * 10))
  return {
    factor: 'rating',
    rawValue: { bonus },
    score,
    weight: config.weights.rating,
    description: bonus > 0 ? '符合你的历史偏好' : '不太符合你的历史偏好',
  }
}

/** 天气适配（FIL-008）：P0 默认关闭（config.weatherEnabled=false），Story 43 启用 */
const weatherRule: Rule = ({ candidate, context, config }) => {
  if (!config.weatherEnabled || !context.weather) return null
  const temp = context.weather.temperature
  const tags = candidate.features.temperatureTags
  if (!tags.length) return null
  if (temp > 30 && tags.includes('cold')) return { factor: 'weather', rawValue: { temp }, score: 100, weight: config.weights.weather, description: `今天 ${temp}°C，推荐清爽冷食` }
  if (temp < 10 && (tags.includes('hot') || tags.includes('soup'))) return { factor: 'weather', rawValue: { temp }, score: 100, weight: config.weights.weather, description: `今天 ${temp}°C，推荐热食` }
  return null
}

/** 规则表（顺序即优先级） */
export const RULES: Array<{ factor: string; rule: Rule }> = [
  { factor: 'meal_period', rule: mealPeriodRule },
  { factor: 'budget', rule: budgetRule },
  { factor: 'time', rule: timeRule },
  { factor: 'taste', rule: tasteRule },
  { factor: 'coverage', rule: coverageRule },
  { factor: 'distance', rule: distanceRule },
  { factor: 'recent', rule: recentRule },
  { factor: 'rating', rule: ratingRule },
  { factor: 'weather', rule: weatherRule },
]

/** 对单个候选执行全部规则，返回证据映射（含被硬排除的标记） */
export function scoreCandidate(input: ScoringInput): Record<string, ScoringEvidence> {
  const evidence: Record<string, ScoringEvidence> = {}
  for (const { factor, rule } of RULES) {
    const result = rule(input)
    if (result) {
      evidence[factor] = result
    }
  }
  return evidence
}

/** 是否被硬排除（任一证据 excluded） */
export function isHardExcluded(evidence: Record<string, ScoringEvidence>): boolean {
  return Object.values(evidence).some((e) => e.excluded)
}

/**
 * 构建预聚合库存 Map（recommend 构建一次供所有候选复用）
 * 排除过期食材；同单位类别换算合并；标记临期
 */
export function buildPantryStock(
  pantry: PantryItem[],
  now: Date,
  thresholdDays: number,
): Map<string, StockEntry> {
  const stock = new Map<string, StockEntry>()
  for (const item of pantry) {
    if (isExpired(item.expiryDate, now)) continue
    const existing = stock.get(item.ingredientId)
    if (existing) {
      const combined = combineAmounts({ amount: existing.amount, unit: existing.unit }, { amount: item.amount, unit: item.unit })
      if (combined) {
        existing.amount = combined.amount
        existing.unit = combined.unit
      }
      existing.expiring = existing.expiring || isExpiring(item.expiryDate, now, thresholdDays)
    } else {
      stock.set(item.ingredientId, {
        amount: item.amount,
        unit: item.unit,
        expiring: isExpiring(item.expiryDate, now, thresholdDays),
      })
    }
  }
  return stock
}
