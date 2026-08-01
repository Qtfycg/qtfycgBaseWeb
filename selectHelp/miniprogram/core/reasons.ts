/**
 * 推荐理由生成（Story 12）
 * 理由直接来自评分证据（ScoringEvidence）的 description，不重算、不建立另一套独立判断逻辑。
 * 只生成有正面证据支撑的理由；每个理由 ≤ 20 字。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */
import { MealCandidate } from '../types'

/** 不生成正面理由的因素（降权/默认维度） */
const NO_POSITIVE_REASON = new Set(['recent', 'meal_period'])

/**
 * 生成候选的推荐理由（取分数最高的 2-3 条正面因素）
 */
export function generateReasons(candidate: MealCandidate, maxCount = 3): string[] {
  const reasons: Array<{ text: string; score: number }> = []
  for (const factor of Object.keys(candidate.scoringEvidence)) {
    const e = candidate.scoringEvidence[factor]
    if (!e || e.excluded || e.score < 60 || NO_POSITIVE_REASON.has(factor)) continue
    if (e.description) {
      reasons.push({ text: truncate(e.description, 20), score: e.score })
    }
  }
  // 按得分降序取前 N 条
  reasons.sort((a, b) => b.score - a.score)
  return reasons.slice(0, maxCount).map((r) => r.text)
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
