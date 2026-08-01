import { describe, it, expect } from 'vitest'
import { MealCandidate, RecommendationContext, PantryItem } from '../miniprogram/types'
import { DEFAULT_SCORING_CONFIG } from '../miniprogram/core/scoring/config'
import { scoreCandidate, isHardExcluded, buildPantryStock } from '../miniprogram/core/scoring/rules'
import { computeFinalScore, weightedDraw } from '../miniprogram/core/scoring/normalize'
import { dedupeThenDraw, groupSimilar } from '../miniprogram/core/scoring/dedup'
import { generateReasons } from '../miniprogram/core/reasons'

const config = DEFAULT_SCORING_CONFIG

function cookCandidate(id: string, over: Partial<MealCandidate['features']> = {}): MealCandidate {
  return {
    type: 'cook',
    id,
    name: `菜谱${id}`,
    features: {
      cuisineTags: ['家常'],
      tasteTags: ['咸香'],
      mainIngredientIds: ['tomato'],
      mealPeriodTags: ['lunch', 'dinner'],
      temperatureTags: ['warm'],
      estimatedCost: 10,
      estimatedDurationMinutes: 15,
      ...over,
    },
    scoringEvidence: {},
  }
}

function deliveryCandidate(id: string, over: Partial<MealCandidate['features']> = {}): MealCandidate {
  return {
    type: 'delivery',
    id,
    name: `商家${id}`,
    features: {
      cuisineTags: ['粤菜'],
      tasteTags: ['清淡'],
      mainIngredientIds: ['fish'],
      mealPeriodTags: ['lunch', 'dinner'],
      temperatureTags: ['warm'],
      estimatedCost: 25,
      estimatedDurationMinutes: 30,
      distanceKm: 1,
      open: true,
      ...over,
    },
    scoringEvidence: {},
  }
}

const ctx = (over: Partial<RecommendationContext> = {}): RecommendationContext => ({
  now: new Date(2026, 6, 29, 12, 0), // 午餐
  mealPeriod: 'lunch',
  budget: 30,
  maxTimeMinutes: 30,
  tastePreferences: ['咸香'],
  maxDistanceKm: 3,
  ...over,
})

describe('scoring: 规则评分（Story 8）', () => {
  it('餐次匹配：包含当前餐次得 100', () => {
    const c = cookCandidate('a')
    const ev = scoreCandidate({ candidate: c, context: ctx(), config })
    expect(ev.meal_period.score).toBe(100)
  })

  it('预算匹配：预算内满分，超出递减', () => {
    const inBudget = scoreCandidate({ candidate: cookCandidate('a', { estimatedCost: 20 }), context: ctx({ budget: 30 }), config })
    expect(inBudget.budget.score).toBe(100)

    const over = scoreCandidate({ candidate: cookCandidate('b', { estimatedCost: 45 }), context: ctx({ budget: 30 }), config })
    expect(over.budget.score).toBeLessThan(100)
  })

  it('无价格且未设预算时跳过预算维度', () => {
    const ev = scoreCandidate({
      candidate: cookCandidate('a', { estimatedCost: undefined }),
      context: ctx({ budget: undefined }),
      config,
    })
    expect(ev.budget).toBeUndefined()
  })

  it('时间匹配：超时可接受但降分', () => {
    const ev = scoreCandidate({ candidate: cookCandidate('a', { estimatedDurationMinutes: 45 }), context: ctx({ maxTimeMinutes: 30 }), config })
    expect(ev.time.score).toBeLessThan(100)
  })

  it('口味匹配：交集比例计分', () => {
    const ev = scoreCandidate({ candidate: cookCandidate('a'), context: ctx({ tastePreferences: ['咸香'] }), config })
    expect(ev.taste.score).toBe(100)
    const noMatch = scoreCandidate({ candidate: cookCandidate('a', { tasteTags: ['辣'] }), context: ctx({ tastePreferences: ['咸香'] }), config })
    expect(noMatch.taste.score).toBe(0)
  })

  it('食材覆盖率：按库存比例计分', () => {
    const pantry: PantryItem[] = [
      { id: 'p1', ingredientId: 'tomato', name: '番茄', amount: 2, unit: '个', unitCategory: 'count', expiryDate: '2026-08-10', source: 'standard', createdAt: 1 },
    ]
    const pantryStock = buildPantryStock(pantry, ctx().now, config.expiringThresholdDays)
    const ev = scoreCandidate({ candidate: cookCandidate('a'), context: ctx(), config, pantryStock })
    expect(ev.coverage.score).toBe(100)
  })

  it('外卖打烊 → 硬排除', () => {
    const c = deliveryCandidate('m1', { open: false })
    const ev = scoreCandidate({ candidate: c, context: ctx(), config })
    expect(isHardExcluded(ev)).toBe(true)
  })

  it('外卖超距离 → 硬排除', () => {
    const c = deliveryCandidate('m2', { distanceKm: 10 })
    const ev = scoreCandidate({ candidate: c, context: ctx({ maxDistanceKm: 3 }), config })
    expect(isHardExcluded(ev)).toBe(true)
  })

  it('近期重复 → 降权证据', () => {
    const ev = scoreCandidate({
      candidate: cookCandidate('a'),
      context: ctx(),
      config,
      recentCandidateIds: new Set(['a']),
    })
    expect(ev.recent.score).toBe(30)
  })

  it('临期食材 → 覆盖率得分乘加权系数（Story 18）', () => {
    const pantry: PantryItem[] = [
      // 番茄明天到期（临期）
      { id: 'p1', ingredientId: 'tomato', name: '番茄', amount: 2, unit: '个', unitCategory: 'count', expiryDate: '2026-07-30', source: 'standard', createdAt: 1 },
    ]
    const now = new Date(2026, 6, 29) // 2026-07-29
    const pantryStock = buildPantryStock(pantry, now, config.expiringThresholdDays)
    const ev = scoreCandidate({
      candidate: cookCandidate('a'),
      context: ctx({ now }),
      config,
      pantryStock,
    })
    // 覆盖率 100% × 1.5，钳制在 100
    expect(ev.coverage.score).toBe(100)
  })

  it('过期食材不计入可用库存（覆盖率不覆盖）', () => {
    const pantry: PantryItem[] = [
      // 番茄已过期
      { id: 'p1', ingredientId: 'tomato', name: '番茄', amount: 2, unit: '个', unitCategory: 'count', expiryDate: '2026-07-20', source: 'standard', createdAt: 1 },
    ]
    const now = new Date(2026, 6, 29)
    const pantryStock = buildPantryStock(pantry, now, config.expiringThresholdDays)
    const c = cookCandidate('a')
    // 手动构造 2 个主食材验证
    c.features.mainIngredientIds = ['tomato', 'beef']
    const ev = scoreCandidate({ candidate: c, context: ctx({ now }), config, pantryStock })
    // 已过期食材不计入 → 覆盖率 0/2 = 0
    expect(ev.coverage.score).toBe(0)
  })
})

describe('normalize: 统一量纲（Story 9 / RR-002）', () => {
  it('最终得分 = Σ(得分×权重) ÷ Σ(权重)', () => {
    const c = cookCandidate('a')
    c.scoringEvidence = scoreCandidate({ candidate: c, context: ctx(), config })
    const s = computeFinalScore(c.scoringEvidence)
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThanOrEqual(100)
  })

  it('缺失维度不进分母：单维度候选得分 = 该维度得分', () => {
    const evidence = {
      budget: { factor: 'budget', score: 80, weight: 1 },
    }
    expect(computeFinalScore(evidence)).toBe(80)
  })

  it('自做全面优于外卖时，抽取允许全部为自做', () => {
    const cook = [
      cookCandidate('c1', { estimatedCost: 5, estimatedDurationMinutes: 5, tasteTags: ['咸香'] }),
      cookCandidate('c2', { estimatedCost: 6, estimatedDurationMinutes: 6 }),
      cookCandidate('c3', { estimatedCost: 7, estimatedDurationMinutes: 7 }),
    ]
    const delivery = [
      deliveryCandidate('m1', { estimatedCost: 60, distanceKm: 3, open: true }),
      deliveryCandidate('m2', { estimatedCost: 65, distanceKm: 3, open: true }),
    ]
    const scored = [...cook, ...delivery].map((c) => {
      c.scoringEvidence = scoreCandidate({ candidate: c, context: ctx(), config })
      c.finalScore = computeFinalScore(c.scoringEvidence)
      return c
    })
    // 排除超预算外卖：60 > 30 预算 → 递减到 0
    const drawable = scored.filter((c) => !isHardExcluded(c.scoringEvidence))
    const { candidates } = weightedDraw(drawable, 3, () => 0.01)
    expect(candidates.every((c) => c.type === 'cook')).toBe(true)
  })

  it('候选不足 3 个时返回全部并说明原因', () => {
    const { candidates, shortfallReason } = weightedDraw([cookCandidate('c1')], 3)
    expect(candidates.length).toBe(1)
    expect(shortfallReason).toBeTruthy()
  })

  it('单一类型候选池正常抽取', () => {
    const pool = [cookCandidate('c1'), cookCandidate('c2')]
    pool.forEach((c) => {
      c.scoringEvidence = scoreCandidate({ candidate: c, context: ctx(), config })
      c.finalScore = computeFinalScore(c.scoringEvidence)
    })
    const { candidates } = weightedDraw(pool, 3)
    expect(candidates.length).toBe(2)
  })
})

describe('dedup: 相似候选去重（Story 10 / RR-003）', () => {
  it('同一 id 只保留一个', () => {
    const a = cookCandidate('x')
    const b = cookCandidate('x')
    const grouped = groupSimilar([a, b])
    expect(grouped.length).toBe(1)
  })

  it('特征交集 ≥ 2 视为相似组', () => {
    const a = cookCandidate('a', { cuisineTags: ['川菜'], tasteTags: ['辣'], mainIngredientIds: ['chicken'] })
    const b = cookCandidate('b', { cuisineTags: ['川菜'], tasteTags: ['辣'], mainIngredientIds: ['beef'] })
    const grouped = groupSimilar([a, b])
    expect(grouped.length).toBe(1)
  })

  it('先去重再抽取，不足时从次优递补', () => {
    const a = cookCandidate('a')
    const b = cookCandidate('b', { cuisineTags: ['川菜'], tasteTags: ['辣'], mainIngredientIds: ['beef'] })
    const c = cookCandidate('c', { cuisineTags: ['粤菜'], tasteTags: ['清淡'], mainIngredientIds: ['fish'] })
    ;[a, b, c].forEach((x) => {
      x.scoringEvidence = scoreCandidate({ candidate: x, context: ctx(), config })
      x.finalScore = computeFinalScore(x.scoringEvidence)
    })
    const { candidates } = dedupeThenDraw([a, b, c], (pool) => weightedDraw(pool, 3, () => 0.99))
    expect(candidates.length).toBe(3)
  })
})

describe('reasons: 推荐理由（Story 12）', () => {
  it('只生成有证据支撑的理由，长度 ≤ 20 字', () => {
    const c = cookCandidate('a')
    c.scoringEvidence = scoreCandidate({ candidate: c, context: ctx(), config })
    const reasons = generateReasons(c)
    expect(reasons.length).toBeGreaterThan(0)
    for (const r of reasons) {
      expect(r.length).toBeLessThanOrEqual(20)
    }
  })

  it('近期吃过不生成正面理由', () => {
    const c = cookCandidate('a')
    c.scoringEvidence = scoreCandidate({
      candidate: c,
      context: ctx(),
      config,
      recentCandidateIds: new Set(['a']),
    })
    const reasons = generateReasons(c)
    expect(reasons.some((r) => r.includes('近 7 天'))).toBe(false)
  })
})
