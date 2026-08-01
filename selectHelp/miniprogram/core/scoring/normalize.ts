/**
 * 评分归一化与加权随机抽取（Story 9 / RR-002）
 *
 * 规则：
 * - 所有维度输出 0-100 的统一量纲。
 * - 最终得分 = Σ(可用维度得分 × 权重) ÷ Σ(可用维度权重)——缺失维度不进分子分母。
 * - 不按候选类型分组归一化：自做与外卖在同一尺度竞争。
 * - 硬性排除（打烊/超距离）在归一化前剔除。
 * - 加权随机：得分越高被抽中概率越大，但不是确定性前 3 名。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */
import { MealCandidate, ScoringEvidence } from '../../types'
import { isHardExcluded } from './rules'

/** 依据证据计算最终得分（0-100） */
export function computeFinalScore(evidence: Record<string, ScoringEvidence>): number {
  let numerator = 0
  let denominator = 0
  for (const e of Object.values(evidence)) {
    if (e.excluded) continue
    numerator += e.score * e.weight
    denominator += e.weight
  }
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 10) / 10
}

export interface RecommendResult {
  candidates: MealCandidate[]
  /** 不足原因：候选池不足 3 个时说明（如 "符合条件仅 2 个"） */
  shortfallReason?: string
}

/**
 * 归一化 + 加权随机抽取：
 * @param scored 已评分候选（含证据）
 * @param count 抽取数量（默认 3）
 * @param random 随机源（注入以便测试）
 */
export function weightedDraw(
  scored: MealCandidate[],
  count = 3,
  random: () => number = Math.random,
): RecommendResult {
  // 剔除硬排除候选；finalScore 由调用方（recommend 管道）预先计算
  const pool = scored.filter((c) => !isHardExcluded(c.scoringEvidence))
  if (pool.length === 0) {
    return { candidates: [], shortfallReason: '没有符合条件的候选' }
  }

  const drawn: MealCandidate[] = []
  const remaining = [...pool]
  while (drawn.length < count && remaining.length > 0) {
    const picked = drawOne(remaining, random)
    drawn.push(picked)
    remaining.splice(remaining.indexOf(picked), 1)
  }

  const shortfallReason =
    drawn.length < count
      ? `符合当前条件的候选仅 ${drawn.length} 个，可放宽条件获得更多选择`
      : undefined

  return { candidates: drawn, shortfallReason }
}

/** 加权抽取一个：权重 = max(score, 0.1) */
function drawOne(pool: MealCandidate[], random: () => number): MealCandidate {
  const weights = pool.map((c) => Math.max(c.finalScore ?? 0, 0.1))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}
