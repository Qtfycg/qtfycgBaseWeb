/**
 * 餐后评价服务（Story 21）
 * 三档评价（喜欢/一般/不喜欢）+ 权重更新 + 修改评价撤销重算
 */
import { MealDecision, MealRatingValue } from '../types'
import { getHistory, saveHistory } from './repositories/history'
import { getRatings, saveRatings, RatingRecord } from './repositories/rating'
import { getLearningWeights, saveLearningWeights } from './repositories/learning'
import { getPromptCounts, savePromptCounts } from './repositories/rating-prompt'
import { updateWeights, revertWeights, addRecentSelection } from '../core/learning'

/** 待评价记录（最多提示 2 次：记录跳过次数） */
export interface PendingRating {
  decision: MealDecision
  promptCount: number
}

/** 获取待评价记录（未评价且未跳过或提示次数 < 2） */
export function getPendingRatings(): PendingRating[] {
  const history = getHistory()
  const records = getRatings()
  const ratedIds = new Set(records.map((r) => r.decisionId))
  const promptMap = getPromptCounts()

  return history
    .filter((d) => d.ratingStatus === 'pending' && !ratedIds.has(d.id))
    .map((decision) => ({
      decision,
      promptCount: promptMap[decision.id] ?? 0,
    }))
    .filter((p) => p.promptCount < 2)
    .slice(0, 1) // 每次只提示最近一条
}

/** 记录一次提示 */
export function markPrompted(decisionId: string): void {
  const map = getPromptCounts()
  map[decisionId] = (map[decisionId] ?? 0) + 1
  savePromptCounts(map)
}

/** 标记跳过（不再提示） */
export function markSkipped(decisionId: string): void {
  const history = getHistory()
  saveHistory(
    history.map((d) => (d.id === decisionId ? { ...d, ratingStatus: 'skipped' } : d)),
  )
}

/**
 * 提交评价
 * @param decisionId 历史记录 id
 * @param rating 评价档位
 */
export function rateDecision(decisionId: string, rating: MealRatingValue): void {
  const history = getHistory()
  const decision = history.find((d) => d.id === decisionId)
  if (!decision) return

  // 1. 撤销旧评价的权重影响（修改评价时）
  const records = getRatings()
  const old = records.find((r) => r.decisionId === decisionId)
  let weights = getLearningWeights()
  if (old && old.rating !== rating) {
    weights = revertWeights(weights, old.rating, decision.featuresSnapshot)
  }

  // 2. 应用新评价的权重影响
  weights = updateWeights(weights, rating, decision.featuresSnapshot)

  // 3. 记录近期已选（短期降权）
  weights = addRecentSelection(weights, decision.candidateId, Date.now())

  saveLearningWeights(weights)

  // 4. 保存评价记录
  const nextRecords = old
    ? records.map((r) => (r.decisionId === decisionId ? { ...r, rating, ratedAt: Date.now() } : r))
    : [...records, { decisionId, rating, ratedAt: Date.now() } as RatingRecord]
  saveRatings(nextRecords)

  // 5. 更新历史记录状态
  saveHistory(
    history.map((d) =>
      d.id === decisionId ? { ...d, ratingStatus: 'rated' as const, rating, ratedAt: Date.now() } : d,
    ),
  )
}

