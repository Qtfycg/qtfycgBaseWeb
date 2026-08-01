/**
 * 内置菜谱种子读取（Story 5）
 * 只读内置种子数据。合并云端菜谱请使用 services/recipe-sync 的 getAllRecipesMerged。
 */
import { Recipe } from '../types'
import { SEED_RECIPES } from '../data/seed-recipes'

export function getAllRecipes(): Recipe[] {
  return SEED_RECIPES as Recipe[]
}

export function getRecipeById(id: string): Recipe | undefined {
  return getAllRecipes().find((r) => r.id === id)
}
