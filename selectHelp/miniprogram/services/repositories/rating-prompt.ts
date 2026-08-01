/**
 * 评价提示计数仓储（Story 21）
 * 记录每条历史评价被提示的次数（最多 2 次）；统一走 LocalDataRepository（版本化 + 原子写）
 */
import { LocalDataRepository } from '../repository'

interface RatingPromptData {
  /** decisionId → 已提示次数 */
  counts: Record<string, number>
}

export const ratingPromptRepository = new LocalDataRepository<RatingPromptData>(
  'rating-prompt',
  1,
  {},
  () => ({ counts: {} }),
)

export function getPromptCounts(): Record<string, number> {
  return ratingPromptRepository.read()?.counts ?? {}
}

export function savePromptCounts(counts: Record<string, number>): void {
  ratingPromptRepository.write({ counts })
}
