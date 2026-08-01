/**
 * 外卖候选提供器（Story 24 客户端部分）
 * 通过云端 searchMerchants（Story 24 云端代理）获取商家，映射为外卖候选。
 * 云端未实现时由 mock 数据层（cloud/mocks.ts）提供数据。
 * 依赖 cloud API（含 wx API 调用），故放 services/ 而非 core/。
 */
import { CandidateProvider, toCandidate } from '../core/providers'
import { callCloudFunction, CLOUD_FUNCTIONS, toAppError } from '../cloud/api'
import { track } from '../core/analytics'
import { MealCandidate, Merchant, RecommendationContext } from '../types'

export class MerchantCandidateProvider implements CandidateProvider {
  canProvide(context: RecommendationContext): boolean {
    // 需要位置才能搜索附近商家
    return context.lat != null && context.lng != null
  }

  async getCandidates(context: RecommendationContext): Promise<MealCandidate[]> {
    try {
      const merchants = await callCloudFunction<{ lat: number; lng: number; radiusKm?: number }, Merchant[]>(
        CLOUD_FUNCTIONS.searchMerchants,
        {
          lat: context.lat!,
          lng: context.lng!,
          radiusKm: context.maxDistanceKm,
        },
      )
      return merchants.map((m) => toCandidate(m.id, m.name, m.features, 'delivery'))
    } catch (e) {
      track('provider_failed', { provider: 'merchant', error: toAppError(e).code })
      return []
    }
  }
}
