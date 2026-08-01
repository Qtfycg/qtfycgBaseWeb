// pages/submission/submission.ts — 菜谱投稿界面（Story 26 客户端）
// 表单（Recipe 字段，无图片）+ 本地草稿恢复 + 提交（调用 submitRecipe 云函数，云端未实现走 mock）
import { Recipe, SubmissionStatus } from '../../types'
import { getDraft, saveDraft, clearDraft } from '../../services/repositories/draft'
import { listMySubmissions, submitRecipe } from '../../services/submission'
import { PERIOD_OPTIONS, TASTE_OPTIONS } from '../../core/constants'

interface SubmissionView {
  id: string
  name: string
  status: string
  statusClass: string
  timeText: string
}

const STATUS_MAP: Record<SubmissionStatus, { text: string; cls: string }> = {
  draft: { text: '草稿', cls: 'tag-muted' },
  pending_review: { text: '待审核', cls: 'tag-warning' },
  approved: { text: '已通过', cls: 'tag-success' },
  rejected: { text: '已拒绝', cls: 'tag-danger' },
}

Component({
  data: {
    tasteOptions: TASTE_OPTIONS,
    periodOptions: PERIOD_OPTIONS,
    form: {
      name: '',
      description: '',
      mealPeriods: [] as string[],
      tasteTags: [] as string[],
      durationMinutes: '20',
      steps: '',
      ingredients: '',
    },
    submitting: false,
    formError: '',
    submissions: [] as SubmissionView[],
  },

  lifetimes: {
    attached() {
      this.restoreDraft()
      this.loadSubmissions()
    },
  },

  methods: {
    /** 恢复本地草稿（Story 26：提交失败保留可重试） */
    restoreDraft() {
      const draft = getDraft()
      if (!draft) return
      this.setData({
        form: {
          name: draft.name,
          description: draft.description,
          mealPeriods: draft.mealPeriods,
          tasteTags: draft.tasteTags,
          durationMinutes: `${draft.durationMinutes}`,
          steps: draft.steps.join('\n'),
          ingredients: draft.ingredients.map((i) => `${i.name} ${i.amount}${i.unit}`).join('\n'),
        },
      })
      wx.showToast({ title: '已恢复未提交草稿', icon: 'none' })
    },

    async loadSubmissions() {
      const list = await listMySubmissions()
      const submissions: SubmissionView[] = list
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((s) => ({
          id: s.id,
          name: s.recipe.name,
          status: STATUS_MAP[s.status].text,
          statusClass: STATUS_MAP[s.status].cls,
          timeText: new Date(s.createdAt).toLocaleDateString(),
        }))
      this.setData({ submissions })
    },

    onNameInput(e: WechatMiniprogram.Input) { this.setData({ 'form.name': e.detail.value }) },
    onDescInput(e: WechatMiniprogram.Input) { this.setData({ 'form.description': e.detail.value }) },
    onDurationInput(e: WechatMiniprogram.Input) { this.setData({ 'form.durationMinutes': e.detail.value }) },
    onStepsInput(e: WechatMiniprogram.Input) { this.setData({ 'form.steps': e.detail.value }) },
    onIngredientsInput(e: WechatMiniprogram.Input) { this.setData({ 'form.ingredients': e.detail.value }) },

    onPeriodTap(e: WechatMiniprogram.TouchEvent) {
      const value = String(e.currentTarget.dataset.value)
      const list = this.data.form.mealPeriods
      this.setData({ 'form.mealPeriods': list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })
    },

    onTasteTap(e: WechatMiniprogram.TouchEvent) {
      const value = String(e.currentTarget.dataset.value)
      const list = this.data.form.tasteTags
      this.setData({ 'form.tasteTags': list.includes(value) ? list.filter((v) => v !== value) : [...list, value] })
    },

    /** 构建 Recipe（食材行解析：名称 数量单位） */
    buildRecipe(): Recipe | null {
      const f = this.data.form
      if (!f.name.trim()) {
        this.setData({ formError: '请填写菜名' })
        wx.showToast({ title: '请填写菜名', icon: 'none' })
        return null
      }
      const duration = Number(f.durationMinutes)
      if (!duration || duration <= 0) {
        this.setData({ formError: '请填写耗时（分钟）' })
        wx.showToast({ title: '请填写耗时（分钟）', icon: 'none' })
        return null
      }
      const ingredients = f.ingredients
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          // "名称 数量单位" 简单解析（如 "番茄 2个"）
          const m = line.match(/^(.+?)\s*(\d+(?:\.\d+)?)\s*([^\d]+)?$/)
          const name = m ? m[1] : line
          const amount = m ? Number(m[2]) : 1
          const unit = m?.[3] ?? '个'
          return { ingredientId: `custom_${name}`, name, amount, unit, unitCategory: 'count' as const }
        })
      if (ingredients.length === 0) {
        this.setData({ formError: '请填写食材清单' })
        wx.showToast({ title: '请填写食材清单', icon: 'none' })
        return null
      }

      return {
        id: `sub_draft_${Date.now()}`,
        name: f.name.trim(),
        description: f.description.trim(),
        mealPeriods: f.mealPeriods as Recipe['mealPeriods'],
        tasteTags: f.tasteTags,
        cuisineTags: [],
        temperatureTags: [],
        baseServings: 2,
        durationMinutes: duration,
        ingredients,
        mainIngredientIds: ingredients.map((i) => i.ingredientId),
        steps: f.steps.split('\n').map((s) => s.trim()).filter(Boolean),
        source: 'user_submission',
      }
    },

    async onSubmit() {
      if (this.data.submitting) return
      this.setData({ formError: '' })
      const recipe = this.buildRecipe()
      if (!recipe) return
      if (recipe.steps.length === 0) {
        this.setData({ formError: '请填写烹饪步骤' })
        wx.showToast({ title: '请填写烹饪步骤', icon: 'none' })
        return
      }
      this.setData({ submitting: true })
      // 保存本地草稿（失败可重试）
      saveDraft(recipe)
      const result = await submitRecipe(recipe)
      this.setData({ submitting: false })
      if (result.ok) {
        clearDraft()
        this.setData({ formError: '' })
        wx.showToast({ title: '已提交，等待审核', icon: 'success' })
        this.loadSubmissions()
      } else {
        const message = result.error ?? '提交失败'
        this.setData({ formError: message })
        wx.showToast({ title: message, icon: 'none' })
      }
    },
  },
})
