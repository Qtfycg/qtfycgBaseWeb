// pages/recipe-detail/recipe-detail.ts — 自做候选详情页（Story 15）
// 展示菜谱完整信息 + 库存匹配 + 确认选择（Story 20）+ 采购清单（Story 19）
import { getRecipeByIdMerged } from '../../services/recipe-sync'
import { getPantryItems } from '../../services/repositories/pantry'
import { isUsable } from '../../services/pantry'
import { confirmDecision } from '../../services/decisions'
import { buildShoppingItems, mergeIntoList } from '../../services/shopping'
import { formatAmount } from '../../core/units'
import { toCandidate } from '../../core/providers'
import { getPageParam } from '../../utils/page-options'
import { PantryItem, Recipe, RecipeIngredient } from '../../types'

interface IngredientView {
  name: string
  text: string
  status: 'have' | 'insufficient' | 'missing' | 'unknown'
  note: string
}

Component({
  data: {
    recipe: null as Recipe | null,
    ingredients: [] as IngredientView[],
    coverage: 0,
    loading: true,
    notFound: false,
  },

  lifetimes: {
    attached() {
      this.load()
    },
  },

  methods: {
    load() {
      const recipe = getRecipeByIdMerged(getPageParam('id'))
      if (!recipe) {
        this.setData({ loading: false, notFound: true })
        return
      }
      const now = new Date()
      const ingredients = this.buildIngredients(recipe, getPantryItems(), now)
      const covered = ingredients.filter((i) => i.status === 'have' || i.status === 'insufficient').length
      const coverage = ingredients.length ? Math.round((covered / ingredients.length) * 100) : 0
      this.setData({
        recipe,
        ingredients,
        coverage,
        loading: false,
      })
    },

    buildIngredients(recipe: Recipe, pantry: PantryItem[], now: Date): IngredientView[] {
      // 预聚合库存：按 ingredientId 分组，避免每个食材全量扫描 pantry
      const stockByIngredient = new Map<string, PantryItem[]>()
      for (const p of pantry) {
        const list = stockByIngredient.get(p.ingredientId) ?? []
        list.push(p)
        stockByIngredient.set(p.ingredientId, list)
      }

      return recipe.ingredients.map((ing: RecipeIngredient) => {
        const stocks = (stockByIngredient.get(ing.ingredientId) ?? []).filter((s) => isUsable(s, now))
        if (stocks.length === 0) {
          return { name: ing.name, text: formatAmount(ing.amount, ing.unit), status: 'missing' as const, note: '缺少' }
        }
        // 数量比较（计数单位精确比较；其他单位按状态提示）
        if (ing.unitCategory === 'count') {
          const total = stocks.reduce((sum, s) => sum + s.amount, 0)
          return total >= ing.amount
            ? { name: ing.name, text: formatAmount(ing.amount, ing.unit), status: 'have' as const, note: '已有' }
            : { name: ing.name, text: formatAmount(ing.amount, ing.unit), status: 'insufficient' as const, note: `库存 ${total}${stocks[0]?.unit ?? ''} 不足` }
        }
        return { name: ing.name, text: formatAmount(ing.amount, ing.unit), status: 'have' as const, note: '已有' }
      })
    },

    onConfirm() {
      const recipe = this.data.recipe
      if (!recipe) return
      // 构造候选 → 确认选择（Story 20，复用 toCandidate）
      const candidate = toCandidate(recipe.id, recipe.name, {
        cuisineTags: recipe.cuisineTags,
        tasteTags: recipe.tasteTags,
        mainIngredientIds: recipe.mainIngredientIds,
        mealPeriodTags: recipe.mealPeriods,
        temperatureTags: recipe.temperatureTags,
        estimatedCost: recipe.estimatedCost,
        estimatedDurationMinutes: recipe.durationMinutes,
      }, 'cook')
      confirmDecision(candidate)
      wx.showToast({ title: '已记录本次选择', icon: 'success' })
    },

    onViewShoppingList() {
      const recipe = this.data.recipe
      if (!recipe) return
      // Story 19：生成采购清单并跳转
      mergeIntoList(buildShoppingItems(recipe))
      wx.navigateTo({ url: '/pages/shopping-list/shopping-list' })
    },
  },
})
