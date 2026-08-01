/**
 * 候选提供器接口（Story 7）
 * 将自做菜品和外卖商家以统一 MealCandidate 格式输入推荐管道。
 * 任一提供器失败返回空数组并记录降级事件，不阻断其他提供器。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */
import { MealCandidate, RecommendationContext } from '../types'

export interface CandidateProvider {
  /** 能力声明：当前上下文下是否可提供候选 */
  canProvide(context: RecommendationContext): boolean
  getCandidates(context: RecommendationContext): Promise<MealCandidate[]>
}

/** 统一候选构造工具（供各提供器使用） */
export function toCandidate(
  id: string,
  name: string,
  features: MealCandidate['features'],
  type: MealCandidate['type'],
): MealCandidate {
  return {
    type,
    id,
    name,
    features,
    scoringEvidence: {},
  }
}
