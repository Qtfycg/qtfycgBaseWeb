/**
 * 餐后评价仓储（Story 4）
 * 评价与历史记录关联（Story 21）
 */
import { MealRatingValue } from '../../types'
import { LocalDataRepository } from '../repository'

/** 评价记录：按历史决策 id 关联 */
export interface RatingRecord {
  decisionId: string
  rating: MealRatingValue
  ratedAt: number
}

interface RatingData {
  records: RatingRecord[]
}

export const ratingRepository = new LocalDataRepository<RatingData>(
  'rating',
  1,
  {},
  () => ({ records: [] }),
)

export function getRatings(): RatingRecord[] {
  return ratingRepository.read()?.records ?? []
}

export function saveRatings(records: RatingRecord[]): void {
  ratingRepository.write({ records })
}
