/**
 * 家中食材管理服务（Story 17）
 * 增删改查 + 状态计算 + 自定义食材（RR-008）
 */
import { PantryItem, PantryStatus } from '../types'
import { getPantryItems, savePantryItems } from './repositories/pantry'
import { getPantryStatus as computeStatus, formatDate } from '../core/dates'
import { getAllRecipes } from '../core/recipe-loader'
import { DEFAULT_SCORING_CONFIG } from '../core/scoring/config'
import { genId } from '../core/ids'

export { getPantryItems } from './repositories/pantry'

/** 临期阈值（单一来源：评分配置） */
const EXPIRING_THRESHOLD = DEFAULT_SCORING_CONFIG.expiringThresholdDays

/** 添加食材（标准或自定义） */
export function addPantryItem(input: {
  ingredientId: string
  name: string
  amount: number
  unit: string
  unitCategory: PantryItem['unitCategory']
  expiryDate: string
  source: 'standard' | 'custom'
}): PantryItem {
  const item: PantryItem = {
    id: genId('p'),
    ingredientId: input.ingredientId,
    name: input.name,
    amount: input.amount,
    unit: input.unit,
    unitCategory: input.unitCategory,
    expiryDate: input.expiryDate,
    source: input.source,
    createdAt: Date.now(),
  }
  savePantryItems([...getPantryItems(), item])
  return item
}

/** 更新食材 */
export function updatePantryItem(id: string, patch: Partial<Omit<PantryItem, 'id'>>): void {
  const items = getPantryItems()
  const next = items.map((i) => (i.id === id ? { ...i, ...patch } : i))
  savePantryItems(next)
}

/** 删除食材 */
export function removePantryItem(id: string): void {
  savePantryItems(getPantryItems().filter((i) => i.id !== id))
}

/** 计算食材状态（含当天边界） */
export function getItemStatus(item: PantryItem, now = new Date()): PantryStatus {
  return computeStatus(item.expiryDate, now, EXPIRING_THRESHOLD)
}

/** 过期食材是否计入可用库存（Story 18：过期不计入） */
export function isUsable(item: PantryItem, now = new Date()): boolean {
  return computeStatus(item.expiryDate, now, EXPIRING_THRESHOLD) !== 'expired'
}

/** 可用库存（推荐引擎使用） */
export function getUsablePantry(now = new Date()): PantryItem[] {
  return getPantryItems().filter((i) => isUsable(i, now))
}

/** 食材目录：从内置菜谱自动汇总（Story 17，随 Story 32 同步扩充）。模块级缓存：种子数据静态，无需每次重建 */
let catalogCache: Array<{ ingredientId: string; name: string }> | null = null

export function getIngredientCatalog(): Array<{ ingredientId: string; name: string }> {
  if (catalogCache) return catalogCache
  const map = new Map<string, string>()
  for (const recipe of getAllRecipes()) {
    for (const ing of recipe.ingredients) {
      if (!map.has(ing.ingredientId)) {
        map.set(ing.ingredientId, ing.name)
      }
    }
  }
  catalogCache = Array.from(map.entries()).map(([ingredientId, name]) => ({ ingredientId, name }))
  return catalogCache
}

/** 自定义食材：生成本地自定义标识 */
export function createCustomIngredientId(): string {
  return genId('custom')
}

/** 保质期默认值：今天 + 7 天 */
export function defaultExpiryDate(now = new Date()): string {
  const d = new Date(now)
  d.setDate(d.getDate() + 7)
  return formatDate(d)
}
