/**
 * 推荐管道编排（Story 13 服务层）
 * 管道：候选提供器 → 规则评分 → 归一化 → 相似分组去重 → 加权随机抽取 → 不足递补 → 推荐理由
 *
 * 依赖本地仓储（学习权重、库存），页面只调用本服务，不直接编排算法。
 */
import {
  MealCandidate,
  RecommendationContext,
} from '../types'
import { DEFAULT_SCORING_CONFIG } from '../core/scoring/config'
import { scoreCandidate, isHardExcluded } from '../core/scoring/rules'
import { computeFinalScore, weightedDraw } from '../core/scoring/normalize'
import { dedupeThenDraw } from '../core/scoring/dedup'
import { generateReasons } from '../core/reasons'
import { CandidateProvider } from '../core/providers'
import { getDefaultProviders } from './providers'
import { getPantryItems } from './repositories/pantry'
import { getLearningWeights } from './repositories/learning'
import { getPreference } from './repositories/preference'
import { getMealPeriod } from '../core/dates'
import { buildPantryStock } from '../core/scoring/rules'
import { track } from '../core/analytics'

export interface RecommendOutput {
  candidates: Array<MealCandidate & { reasons: string[] }>
  shortfallReason?: string
  diversityDegraded: boolean
}

/**
 * 执行推荐
 * @param context 推荐上下文（条件）
 * @param providers 候选提供器（默认：自做 + 外卖 stub）
 */
export async function recommend(
  context: RecommendationContext,
  providers: CandidateProvider[] = getDefaultProviders(),
): Promise<RecommendOutput> {
  const config = DEFAULT_SCORING_CONFIG
  const learning = getLearningWeights()

  // 近期已选候选（7 天窗口，统一用 pruneRecentSelections 口径）
  const recentWindowMs = config.recentWindowDays * 86400000
  const now = context.now.getTime()
  const recentIds = new Set(
    learning.recentSelections
      .filter((s) => now - s.at < recentWindowMs)
      .map((s) => s.candidateId),
  )

  // 预聚合可用库存（一次性构建，供所有候选评分复用；已排除过期）
  const pantryStock = buildPantryStock(getPantryItems(), context.now, config.expiringThresholdDays)

  try {
    // 1. 收集候选（各提供器独立失败降级）
    const collected = await Promise.all(
      providers.map(async (p) => {
        if (!p.canProvide(context)) return []
        try {
          return await p.getCandidates(context)
        } catch (e) {
          track('provider_failed', { provider: p.constructor.name, error: String(e) })
          return []
        }
      }),
    )
    const candidates = collected.flat()

    // 2. 评分
    for (const c of candidates) {
      c.scoringEvidence = scoreCandidate({
        candidate: c,
        context,
        config,
        pantryStock,
        recentCandidateIds: recentIds,
        learningWeights: learning,
      })
    }

    // 3. 归一化：先剔除硬排除，再计算最终得分
    const scorable = candidates.filter((c) => !isHardExcluded(c.scoringEvidence))
    for (const c of scorable) {
      c.finalScore = computeFinalScore(c.scoringEvidence)
    }

    // 4. 相似分组去重 + 加权随机抽取 + 递补
    const { candidates: drawn, shortfallReason, diversityDegraded } = dedupeThenDraw(
      scorable,
      (pool) => weightedDraw(pool, 3),
    )

    // 5. 生成推荐理由
    const result = drawn.map((c) => ({
      ...c,
      reasons: generateReasons(c),
    }))

    track('recommend_done', {
      count: result.length,
      candidateCount: scorable.length,
      shortfall: shortfallReason ? 1 : 0,
    })

    return { candidates: result, shortfallReason, diversityDegraded }
  } catch (e) {
    track('recommend_failed', { error: String(e) })
    return { candidates: [], shortfallReason: '推荐生成失败，请稍后重试', diversityDegraded: false }
  }
}

/** 从偏好仓储构建默认推荐上下文 */
export function buildContext(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  const now = new Date()
  const pref = getPreference()
  return {
    now,
    mealPeriod: overrides.mealPeriod ?? getMealPeriod(now),
    budget: overrides.budget ?? pref.budget,
    maxTimeMinutes: overrides.maxTimeMinutes ?? pref.maxTimeMinutes,
    tastePreferences: overrides.tastePreferences ?? pref.tastePreferences,
    maxDistanceKm: overrides.maxDistanceKm ?? pref.maxDistanceKm,
    lat: overrides.lat,
    lng: overrides.lng,
    weather: overrides.weather,
  }
}
