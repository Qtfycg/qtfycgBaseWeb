/**
 * 个性化权重更新（Story 11）
 * 纯 TypeScript 模块：不依赖 wx API。
 *
 * 规则：
 * - 喜欢 → 对应菜系、口味、食材权重 +1
 * - 一般 → 不调整
 * - 不喜欢 → 对应菜系、口味、食材权重 -1（下限为负值允许，但钳制在 -10..+10）
 * - 近期已选候选 7 天后自动移出
 */
import { CandidateFeatures, LearningWeights, MealRatingValue } from '../types'

/** 权重上下限 */
const WEIGHT_MIN = -10
const WEIGHT_MAX = 10

/** 空权重 */
export function emptyWeights(): LearningWeights {
  return { cuisine: {}, taste: {}, ingredient: {}, recentSelections: [] }
}

/** 应用 delta：结果 0 时删除键（保持干净），非 0 时钳制在上下限 */
function applyDelta(map: Record<string, number>, key: string, delta: number): void {
  const value = (map[key] ?? 0) + delta
  if (value === 0) {
    delete map[key]
  } else {
    map[key] = clamp(value)
  }
}

/** 对特征各维度应用统一 delta（updateWeights / revertWeights 共用） */
function applyWeights(weights: LearningWeights, features: CandidateFeatures, delta: number): LearningWeights {
  if (delta === 0) return weights
  const next = {
    cuisine: { ...weights.cuisine },
    taste: { ...weights.taste },
    ingredient: { ...weights.ingredient },
    recentSelections: [...weights.recentSelections],
  }
  for (const tag of features.cuisineTags) {
    applyDelta(next.cuisine, tag, delta)
  }
  for (const tag of features.tasteTags) {
    applyDelta(next.taste, tag, delta)
  }
  for (const id of features.mainIngredientIds) {
    applyDelta(next.ingredient, id, delta)
  }
  return next
}

/**
 * 根据评价更新权重
 * @param weights 当前权重
 * @param rating 评价：喜欢 +1 / 一般 0 / 不喜欢 -1
 * @param features 被评价候选的特征
 */
export function updateWeights(
  weights: LearningWeights,
  rating: MealRatingValue,
  features: CandidateFeatures,
): LearningWeights {
  const delta = rating === 'like' ? 1 : rating === 'dislike' ? -1 : 0
  return applyWeights(weights, features, delta)
}

/** 记录近期已选候选（短期降权，不永久排除） */
export function addRecentSelection(
  weights: LearningWeights,
  candidateId: string,
  at: number,
): LearningWeights {
  return {
    ...weights,
    recentSelections: [
      ...weights.recentSelections,
      { candidateId, at },
    ],
  }
}

/** 清理超过窗口期的近期选择（默认 7 天） */
export function pruneRecentSelections(
  weights: LearningWeights,
  now: number,
  windowMs: number,
): LearningWeights {
  return {
    ...weights,
    recentSelections: weights.recentSelections.filter((s) => now - s.at < windowMs),
  }
}

/** 撤销之前的权重更新（修改评价时使用，Story 21） */
export function revertWeights(
  weights: LearningWeights,
  rating: MealRatingValue,
  features: CandidateFeatures,
): LearningWeights {
  const delta = rating === 'like' ? -1 : rating === 'dislike' ? 1 : 0
  return applyWeights(weights, features, delta)
}

function clamp(v: number): number {
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, v))
}
