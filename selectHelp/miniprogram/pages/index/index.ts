// pages/index/index.ts — "吃什么"推荐首页（Story 13）+ 条件面板（Story 14）+ 评价入口（Story 21）
import { buildContext, recommend } from '../../services/recommend'
import { getPreference } from '../../services/repositories/preference'
import { getPendingRatings, markPrompted, markSkipped, rateDecision } from '../../services/rating'
import { getLocation } from '../../services/location'
import { track } from '../../core/analytics'
import { getMealPeriod, MEAL_PERIOD_LABELS } from '../../core/dates'
import { BUDGET_OPTIONS, CANDIDATE_TYPE_LABELS, DISTANCE_MAX, TASTE_OPTIONS, TIME_OPTIONS } from '../../core/constants'
import { MealRatingValue } from '../../types'

interface DisplayCandidate {
  type: string
  id: string
  name: string
  typeLabel: string
  costText: string
  timeText: string
  reasons: string[]
}

Component({
  data: {
    candidates: [] as DisplayCandidate[],
    loading: true,
    shortfallReason: '',
    diversityNote: '',
    // 条件面板
    panelVisible: false,
    tasteOptions: TASTE_OPTIONS,
    budgetOptions: BUDGET_OPTIONS,
    timeOptions: TIME_OPTIONS,
    distanceMax: DISTANCE_MAX,
    conditions: {
      budget: 40,
      maxTimeMinutes: 30,
      tastePreferences: [] as string[],
      maxDistanceKm: 3,
    },
    // 评价入口（Story 21）
    ratingPrompt: null as null | { decisionId: string; candidateName: string },
    // 定位状态（Story 22 降级整合）
    locationBanner: '',
    // 顶部问候
    greeting: '',
    periodLabel: '',
    // 定位坐标（定位成功后传给推荐管道 → 外卖候选）
    lat: 0,
    lng: 0,
  },

  lifetimes: {
    attached() {
      this.initConditions()
      this.initGreeting()
      this.checkRatingPrompt()
      // 推荐不等待定位：先展示自做候选（无位置 → 外卖提供器降级），定位成功后刷新启用外卖
      this.onRefresh()
      this.initLocation().then(() => this.onRefresh())
    },
  },

  methods: {
    initGreeting() {
      const h = new Date().getHours()
      let greeting = '晚上好'
      if (h >= 5 && h < 11) greeting = '早上好'
      else if (h >= 11 && h < 14) greeting = '中午好'
      else if (h >= 14 && h < 18) greeting = '下午好'
      this.setData({
        greeting,
        periodLabel: MEAL_PERIOD_LABELS[getMealPeriod(new Date())],
      })
    },

    initConditions() {
      // 偏好默认值单一来源：仓储 DEFAULTS（getPreference 返回完整默认对象）
      const pref = getPreference()
      this.setData({
        conditions: {
          budget: pref.budget ?? 0,
          maxTimeMinutes: pref.maxTimeMinutes ?? 30,
          tastePreferences: pref.tastePreferences,
          maxDistanceKm: pref.maxDistanceKm ?? 3,
        },
      })
    },

    async onRefresh() {
      this.setData({ loading: true })
      const c = this.data.conditions
      const context = buildContext({
        budget: c.budget || undefined,
        maxTimeMinutes: c.maxTimeMinutes,
        tastePreferences: c.tastePreferences,
        maxDistanceKm: c.maxDistanceKm,
        lat: this.data.lat || undefined,
        lng: this.data.lng || undefined,
      })
      const result = await recommend(context)
      const candidates: DisplayCandidate[] = result.candidates.map((cd) => ({
        type: cd.type,
        id: cd.id,
        name: cd.name,
        typeLabel: CANDIDATE_TYPE_LABELS[cd.type],
        costText: cd.features.estimatedCost != null ? `约 ¥${cd.features.estimatedCost}` : '',
        timeText: cd.features.estimatedDurationMinutes != null ? `${cd.features.estimatedDurationMinutes} 分钟` : '',
        reasons: cd.reasons,
      }))
      this.setData({
        candidates,
        shortfallReason: result.shortfallReason ?? '',
        diversityNote: result.diversityDegraded ? '已尽量提供多样化选择' : '',
        loading: false,
      })
    },

    // === 条件面板（Story 14） ===
    openPanel() {
      this.setData({ panelVisible: true })
    },

    closePanel() {
      this.setData({ panelVisible: false })
    },

    noop() {
      // 阻止弹层内容点击冒泡到遮罩
    },

    onBudgetTap(e: WechatMiniprogram.TouchEvent) {
      const value = Number(e.currentTarget.dataset.value)
      this.setData({ 'conditions.budget': value })
    },

    onTimeTap(e: WechatMiniprogram.TouchEvent) {
      const value = Number(e.currentTarget.dataset.value)
      this.setData({ 'conditions.maxTimeMinutes': value })
    },

    onTasteTap(e: WechatMiniprogram.TouchEvent) {
      const value = String(e.currentTarget.dataset.value)
      const prefs = this.data.conditions.tastePreferences
      const next = prefs.includes(value) ? prefs.filter((t) => t !== value) : [...prefs, value]
      this.setData({ 'conditions.tastePreferences': next })
    },

    onDistanceChange(e: WechatMiniprogram.SliderChange) {
      this.setData({ 'conditions.maxDistanceKm': e.detail.value })
    },

    onApplyConditions() {
      track('conditions_modified')
      this.setData({ panelVisible: false })
      this.onRefresh()
    },

    onResetConditions() {
      // 与初始化共用同一逻辑（默认值单一来源）
      this.initConditions()
    },

    // === 跳转 ===
    onCandidateTap(e: WechatMiniprogram.TouchEvent) {
      const { type, id } = e.currentTarget.dataset
      if (type === 'cook') {
        wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
      } else {
        wx.navigateTo({ url: `/pages/delivery-detail/delivery-detail?id=${id}` })
      }
    },

    onShortfallTap() {
      this.openPanel()
    },

    // === 定位（Story 22）：成功后启用外卖候选，失败降级自做 ===
    async initLocation(): Promise<void> {
      const result = await getLocation()
      this.setData({
        locationBanner: result.banner ?? '',
        lat: result.lat ?? 0,
        lng: result.lng ?? 0,
      })
    },

    onLocationBannerTap() {
      wx.navigateTo({ url: '/pages/data-manage/data-manage' })
    },

    // === 评价入口（Story 21） ===
    checkRatingPrompt() {
      const pending = getPendingRatings()
      if (pending.length === 0) return
      const p = pending[0]
      this.setData({
        ratingPrompt: { decisionId: p.decision.id, candidateName: p.decision.candidateName },
      })
      markPrompted(p.decision.id)
    },

    onRatingTap(e: WechatMiniprogram.TouchEvent) {
      const rating = e.currentTarget.dataset.rating as MealRatingValue
      const prompt = this.data.ratingPrompt
      if (!prompt) return
      rateDecision(prompt.decisionId, rating)
      this.setData({ ratingPrompt: null })
      wx.showToast({ title: '感谢反馈', icon: 'success' })
    },

    onRatingSkip() {
      const prompt = this.data.ratingPrompt
      if (!prompt) return
      markSkipped(prompt.decisionId)
      this.setData({ ratingPrompt: null })
    },
  },
})
