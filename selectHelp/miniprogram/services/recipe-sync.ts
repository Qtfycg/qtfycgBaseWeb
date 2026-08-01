/**
 * 公共菜谱增量同步（Story 32 客户端）
 * 调用 getPublicRecipes 云函数（Story 33），按 contentVersion 增量拉取，
 * 与内置种子合并（云端同 ID 覆盖内置）；失败回退内置种子。
 */
import { Recipe } from '../types'
import { callCloudFunction, CLOUD_FUNCTIONS, toAppError } from '../cloud/api'
import { getCachedRecipes, getSyncedVersion, saveCachedRecipes } from './repositories/recipe-cache'
import { getAllRecipes as getBuiltinRecipes } from '../core/recipe-loader'
import { track } from '../core/analytics'

export interface SyncResult {
  ok: boolean
  added: number
  error?: string
}

interface GetPublicRecipesParams {
  sinceContentVersion?: number
  cursor?: string | null
  limit?: number
}

interface GetPublicRecipesResponse {
  recipes: Recipe[]
  nextCursor: string | null
  latestContentVersion: number
  schemaVersion: number
}

/**
 * 执行增量同步（幂等：按 ID 去重保留高版本）
 */
export async function syncRecipes(): Promise<SyncResult> {
  try {
    const since = getSyncedVersion()
    let cursor: string | null = null
    let all: Recipe[] = []
    let latestVersion = since

    while (true) {
      const page: GetPublicRecipesResponse = await callCloudFunction<GetPublicRecipesParams, GetPublicRecipesResponse>(
        CLOUD_FUNCTIONS.getPublicRecipes,
        { sinceContentVersion: since || undefined, cursor, limit: 50 },
      )
      all = all.concat(page.recipes)
      latestVersion = Math.max(latestVersion, page.latestContentVersion)
      cursor = page.nextCursor
      if (!cursor) break
    }

    // 合并：幂等（同 ID 保留高 contentVersion）
    const merged = mergeById(getCachedRecipes(), all)

    // 软删除：deleted 标记的移除
    const alive = merged.filter((r) => !r.deleted)

    saveCachedRecipes(alive, latestVersion)
    track('recipe_sync_done', { added: all.length, version: latestVersion })
    return { ok: true, added: all.length }
  } catch (e) {
    const appErr = toAppError(e)
    track('recipe_sync_failed', { error: appErr.code })
    // 失败回退内置种子（不清空已有缓存）
    return { ok: false, added: 0, error: appErr.message }
  }
}

/** 合并云端菜谱到内置种子（云端同 ID 覆盖内置） */
export function getAllRecipesMerged(): Recipe[] {
  const builtin = getBuiltinRecipes()
  const cloud = getCachedRecipes()
  return mergeById(builtin, cloud)
}

/** 按 id 查找合并后的菜谱（详情页使用，与推荐管道同一数据源） */
export function getRecipeByIdMerged(id: string): Recipe | undefined {
  return getAllRecipesMerged().find((r) => r.id === id)
}

/** 按 ID 合并，保留高 contentVersion（无版本的视为 0） */
function mergeById(base: Recipe[], incoming: Recipe[]): Recipe[] {
  const map = new Map<string, Recipe>()
  for (const r of base) {
    map.set(r.id, r)
  }
  for (const r of incoming) {
    const existing = map.get(r.id)
    const incomingV = r.contentVersion ?? 0
    const existingV = existing?.contentVersion ?? 0
    if (!existing || incomingV >= existingV) {
      map.set(r.id, r)
    }
  }
  return Array.from(map.values())
}
