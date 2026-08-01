/**
 * 确认选择与历史记录（Story 20 服务层）
 * 记录用餐决策（含 featuresSnapshot 快照），供历史列表、评价和相似度计算使用。
 */
import { MealCandidate, MealDecision } from '../types'
import { getMealPeriod } from '../core/dates'
import { genId } from '../core/ids'
import { getHistory, saveHistory } from './repositories/history'

/** 确认选择：写入历史记录（标记为待评价） */
export function confirmDecision(candidate: MealCandidate): MealDecision {
  const decision: MealDecision = {
    id: genId('d'),
    timestamp: Date.now(),
    mealPeriod: getMealPeriod(new Date()),
    type: candidate.type,
    candidateId: candidate.id,
    candidateName: candidate.name,
    featuresSnapshot: { ...candidate.features },
    estimatedCost: candidate.features.estimatedCost,
    ratingStatus: 'pending',
  }
  const history = getHistory()
  history.unshift(decision)
  saveHistory(history)
  return decision
}

/** 按条件筛选历史 */
export function queryHistory(options: {
  mealType?: 'cook' | 'delivery'
  range?: 'week' | 'month' | 'all'
} = {}): MealDecision[] {
  const all = getHistory()
  const now = Date.now()
  const weekMs = 7 * 86400000
  const monthMs = 30 * 86400000

  return all.filter((d) => {
    if (options.mealType && d.type !== options.mealType) return false
    if (options.range === 'week' && now - d.timestamp > weekMs) return false
    if (options.range === 'month' && now - d.timestamp > monthMs) return false
    return true
  })
}
