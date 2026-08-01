import { describe, it, expect } from 'vitest'
import { emptyWeights, updateWeights, addRecentSelection, pruneRecentSelections, revertWeights } from '../miniprogram/core/learning'
import { CandidateFeatures } from '../miniprogram/types'

const features: CandidateFeatures = {
  cuisineTags: ['川菜'],
  tasteTags: ['辣'],
  mainIngredientIds: ['chicken'],
  mealPeriodTags: ['dinner'],
  temperatureTags: ['hot'],
  estimatedCost: 20,
  estimatedDurationMinutes: 20,
}

describe('learning: 权重更新（Story 11）', () => {
  it('喜欢 → 菜系/口味/食材 +1', () => {
    const w = updateWeights(emptyWeights(), 'like', features)
    expect(w.cuisine['川菜']).toBe(1)
    expect(w.taste['辣']).toBe(1)
    expect(w.ingredient['chicken']).toBe(1)
  })

  it('一般 → 不调整', () => {
    const w = updateWeights(emptyWeights(), 'neutral', features)
    expect(w.cuisine['川菜']).toBeUndefined()
  })

  it('不喜欢 → -1（有下限不为负）', () => {
    const w = updateWeights(emptyWeights(), 'dislike', features)
    expect(w.cuisine['川菜']).toBe(-1)
    // 连续多次不喜欢，钳制在下限
    let cur = emptyWeights()
    for (let i = 0; i < 20; i++) {
      cur = updateWeights(cur, 'dislike', features)
    }
    expect(cur.cuisine['川菜']).toBe(-10)
  })
})

describe('learning: 近期选择（Story 11）', () => {
  it('7 天后自动移出', () => {
    const now = 1000000
    const windowMs = 7 * 86400000
    let w = emptyWeights()
    w = addRecentSelection(w, 'r001', now)
    w = pruneRecentSelections(w, now + 6 * 86400000, windowMs)
    expect(w.recentSelections.length).toBe(1)
    w = pruneRecentSelections(w, now + 8 * 86400000, windowMs)
    expect(w.recentSelections.length).toBe(0)
  })
})

describe('learning: 撤销（Story 21 修改评价）', () => {
  it('不喜欢 → 改为喜欢时撤销旧的 -1 再应用 +1', () => {
    let w = updateWeights(emptyWeights(), 'dislike', features)
    expect(w.cuisine['川菜']).toBe(-1)
    w = revertWeights(w, 'dislike', features)
    expect(w.cuisine['川菜']).toBeUndefined()
    w = updateWeights(w, 'like', features)
    expect(w.cuisine['川菜']).toBe(1)
  })
})
