/**
 * 本地数据管理服务（Story 34）
 * 清除操作集中于此：页面不直接操作仓储单例；关联数据（历史+评价）一起清除
 */
import { historyRepository } from './repositories/history'
import { ratingRepository } from './repositories/rating'
import { learningRepository } from './repositories/learning'
import { pantryRepository } from './repositories/pantry'
import { shoppingListRepository } from './repositories/shopping-list'
import { draftRepository } from './repositories/draft'
import { recipeCacheRepository } from './repositories/recipe-cache'

/** 清除历史记录（含关联评价） */
export function clearHistory(): void {
  historyRepository.clear()
  ratingRepository.clear()
}

/** 重置推荐学习 */
export function resetLearning(): void {
  learningRepository.clear()
}

/** 清除食材数据 */
export function clearPantry(): void {
  pantryRepository.clear()
}

/** 清除所有本地数据（不影响云端投稿与审核记录） */
export function clearAllLocalData(): void {
  historyRepository.clear()
  ratingRepository.clear()
  learningRepository.clear()
  pantryRepository.clear()
  shoppingListRepository.clear()
  draftRepository.clear()
  recipeCacheRepository.clear()
}
