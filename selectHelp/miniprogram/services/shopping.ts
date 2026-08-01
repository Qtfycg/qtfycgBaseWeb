/**
 * 采购清单生成（Story 19）
 * 缺少量 = 菜谱用量 × (目标份数 / 基础份数) − 已有库存量
 * 同单位类别换算合并；跨类别保留独立行标注"需人工确认"
 */
import { PantryItem, Recipe } from '../types'
import { getPantryItems } from './repositories/pantry'
import { getShoppingList, saveShoppingList, ShoppingItem } from './repositories/shopping-list'
import { combineAmounts, roundByCategory, getUnitCategory, scaleForServings } from '../core/units'
import { genId } from '../core/ids'

/**
 * 根据菜谱生成采购条目（与库存对比）
 * @param recipe 菜谱
 * @param targetServings 目标份数（默认按基础份数）
 */
export function buildShoppingItems(recipe: Recipe, targetServings?: number): ShoppingItem[] {
  const servings = targetServings ?? recipe.baseServings
  const pantry = getPantryItems()

  // 预聚合库存：按 ingredientId 分组，避免循环内全量扫描
  const stockByIngredient = new Map<string, PantryItem[]>()
  for (const p of pantry) {
    const list = stockByIngredient.get(p.ingredientId) ?? []
    list.push(p)
    stockByIngredient.set(p.ingredientId, list)
  }

  const items: ShoppingItem[] = []
  for (const ing of recipe.ingredients) {
    // 缩放后的需求量（复用 units.scaleForServings，含精度舍入）
    const scaled = scaleForServings(ing.amount, recipe.baseServings, servings, ing.unit)

    // 汇总同 ingredientId 库存（换算合并）
    const stocks = stockByIngredient.get(ing.ingredientId) ?? []
    let haveAmount = 0
    let haveUnit = ing.unit
    for (const s of stocks) {
      const combined = combineAmounts({ amount: haveAmount, unit: haveUnit }, { amount: s.amount, unit: s.unit })
      if (combined) {
        haveAmount = combined.amount
        haveUnit = combined.unit
      }
    }

    const missing = Math.max(0, roundByCategory(scaled - haveAmount, getUnitCategory(ing.unit)))

    items.push({
      id: genId('s'),
      ingredientId: ing.ingredientId,
      name: ing.name,
      needAmount: scaled,
      haveAmount: roundByCategory(haveAmount, getUnitCategory(ing.unit)),
      missingAmount: missing,
      unit: ing.unit,
      convertible: getUnitCategory(ing.unit) !== 'descriptive',
      done: false,
      source: 'recipe',
      createdAt: Date.now(),
    })
  }
  return items
}

/** 将菜谱采购条目合并进当前清单（同 ingredientId 且可换算则合并） */
export function mergeIntoList(items: ShoppingItem[]): void {
  const current = getShoppingList()
  const merged = [...current]
  for (const item of items) {
    const existing = merged.find(
      (m) => m.ingredientId === item.ingredientId && m.source === 'recipe' && m.convertible && item.convertible,
    )
    if (existing) {
      const combined = combineAmounts(
        { amount: existing.missingAmount, unit: existing.unit },
        { amount: item.missingAmount, unit: item.unit },
      )
      if (combined) {
        existing.missingAmount = combined.amount
        existing.needAmount = roundByCategory(existing.needAmount + item.needAmount, getUnitCategory(existing.unit))
        existing.unit = combined.unit
        continue
      }
    }
    merged.push(item)
  }
  saveShoppingList(merged)
}

/** 添加手动采购项 */
export function addManualItem(input: { name: string; missingAmount: number; unit: string }): void {
  const current = getShoppingList()
  current.push({
    id: genId('s'),
    ingredientId: genId('manual'),
    name: input.name,
    needAmount: input.missingAmount,
    haveAmount: 0,
    missingAmount: input.missingAmount,
    unit: input.unit,
    convertible: getUnitCategory(input.unit) !== 'descriptive',
    done: false,
    source: 'manual',
    createdAt: Date.now(),
  })
  saveShoppingList(current)
}

/** 标记完成 / 取消完成 */
export function toggleDone(id: string): void {
  saveShoppingList(getShoppingList().map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
}

/** 删除条目 */
export function removeItem(id: string): void {
  saveShoppingList(getShoppingList().filter((i) => i.id !== id))
}

/** 清空已完成项 */
export function clearDone(): void {
  saveShoppingList(getShoppingList().filter((i) => !i.done))
}
