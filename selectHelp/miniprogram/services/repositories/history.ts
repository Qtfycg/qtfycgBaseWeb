/**
 * 用餐历史仓储（Story 4）
 * 历史决策记录（Story 20 写入，Story 21 评价）
 */
import { MealDecision } from '../../types'
import { LocalDataRepository } from '../repository'

interface HistoryData {
  decisions: MealDecision[]
}

export const historyRepository = new LocalDataRepository<HistoryData>(
  'history',
  1,
  {},
  () => ({ decisions: [] }),
)

export function getHistory(): MealDecision[] {
  return historyRepository.read()?.decisions ?? []
}

export function saveHistory(decisions: MealDecision[]): void {
  historyRepository.write({ decisions })
}
