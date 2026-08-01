/**
 * 投稿草稿仓储（Story 4）
 * 未提交成功的菜谱投稿草稿（Story 26 使用，提交失败保留可重试）
 */
import { Recipe } from '../../types'
import { LocalDataRepository } from '../repository'

interface DraftData {
  /** 最近一次未提交成功的草稿 */
  draft?: Recipe
  /** 草稿保存时间 */
  savedAt?: number
}

export const draftRepository = new LocalDataRepository<DraftData>(
  'draft',
  1,
  {},
  () => ({}),
)

export function getDraft(): Recipe | undefined {
  return draftRepository.read()?.draft
}

export function saveDraft(recipe: Recipe): void {
  draftRepository.write({ draft: recipe, savedAt: Date.now() })
}

export function clearDraft(): void {
  draftRepository.clear()
}
