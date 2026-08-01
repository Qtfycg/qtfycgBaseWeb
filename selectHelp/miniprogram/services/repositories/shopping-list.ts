/**
 * 采购清单仓储（Story 4）
 * 采购条目（Story 19 生成，Story 41 合并）
 */
import { LocalDataRepository } from '../repository'

export interface ShoppingItem {
  id: string
  /** 稳定食材标识 */
  ingredientId: string
  /** 显示名称 */
  name: string
  /** 需要量 */
  needAmount: number
  /** 已有量 */
  haveAmount: number
  /** 缺少量（need - have） */
  missingAmount: number
  /** 单位 */
  unit: string
  /** 是否可自动换算（false 时标注"需人工确认"） */
  convertible: boolean
  /** 是否已完成采购 */
  done: boolean
  /** 来源：菜谱需求 / 手动添加 */
  source: 'recipe' | 'manual'
  /** 添加时间 */
  createdAt: number
}

interface ShoppingListData {
  items: ShoppingItem[]
}

export const shoppingListRepository = new LocalDataRepository<ShoppingListData>(
  'shopping-list',
  1,
  {},
  () => ({ items: [] }),
)

export function getShoppingList(): ShoppingItem[] {
  return shoppingListRepository.read()?.items ?? []
}

export function saveShoppingList(items: ShoppingItem[]): void {
  shoppingListRepository.write({ items })
}
