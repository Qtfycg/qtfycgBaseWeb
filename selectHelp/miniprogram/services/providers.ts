/**
 * 候选提供器实现（Story 7）
 * - RecipeCandidateProvider：读取合并后的菜谱（内置种子 + 云端缓存，Story 32）
 * - MerchantCandidateProvider：通过云端搜索商家（Story 24）
 */
import { CandidateProvider, toCandidate } from '../core/providers'
import { getAllRecipesMerged } from './recipe-sync'
import { MerchantCandidateProvider } from './merchant-provider'
import { track } from '../core/analytics'
import { MealCandidate } from '../types'

/** 自做候选提供器：读取合并后的菜谱库 */
export class RecipeCandidateProvider implements CandidateProvider {
  canProvide(_context: unknown): boolean {
    return true
  }

  async getCandidates(): Promise<MealCandidate[]> {
    try {
      const recipes = getAllRecipesMerged()
      return recipes.map((r) =>
        toCandidate(r.id, r.name, {
          cuisineTags: r.cuisineTags,
          tasteTags: r.tasteTags,
          mainIngredientIds: r.mainIngredientIds,
          mealPeriodTags: r.mealPeriods,
          temperatureTags: r.temperatureTags,
          estimatedCost: r.estimatedCost,
          estimatedDurationMinutes: r.durationMinutes,
        }, 'cook'),
      )
    } catch (e) {
      track('provider_failed', { provider: 'recipe', error: String(e) })
      return []
    }
  }
}

/** 默认提供器集合（自做 + 外卖） */
export function getDefaultProviders(): CandidateProvider[] {
  return [new RecipeCandidateProvider(), new MerchantCandidateProvider()]
}
