/**
 * 云端菜谱缓存仓储（Story 32）
 * 存储从云端拉取的公共菜谱（含 contentVersion，用于增量同步）
 */
import { Recipe } from '../../types'
import { LocalDataRepository } from '../repository'

interface RecipeCacheData {
  recipes: Recipe[]
  /** 本地已同步到的最大 contentVersion */
  syncedVersion: number
  /** 最近同步时间戳 */
  syncedAt?: number
}

export const recipeCacheRepository = new LocalDataRepository<RecipeCacheData>(
  'recipe-cache',
  1,
  {},
  () => ({ recipes: [], syncedVersion: 0 }),
)

export function getCachedRecipes(): Recipe[] {
  return recipeCacheRepository.read()?.recipes ?? []
}

export function getSyncedVersion(): number {
  return recipeCacheRepository.read()?.syncedVersion ?? 0
}

export function saveCachedRecipes(recipes: Recipe[], syncedVersion: number): void {
  recipeCacheRepository.write({ recipes, syncedVersion, syncedAt: Date.now() })
}

export function clearCachedRecipes(): void {
  recipeCacheRepository.clear()
}
