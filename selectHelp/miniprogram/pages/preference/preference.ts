// pages/preference/preference.ts — 默认偏好设置（Story 37）
// 预算 / 时间 / 口味 / 距离；修改自动保存到 PreferenceRepository
import { getPreference, preferenceRepository } from '../../services/repositories/preference'
import { BUDGET_OPTIONS, DISTANCE_MAX, TASTE_OPTIONS, TIME_OPTIONS } from '../../core/constants'

Component({
  data: {
    tasteOptions: TASTE_OPTIONS,
    budgetOptions: BUDGET_OPTIONS,
    timeOptions: TIME_OPTIONS,
    distanceMax: DISTANCE_MAX,
    form: {
      budget: 40,
      maxTimeMinutes: 30,
      tastePreferences: [] as string[],
      maxDistanceKm: 3,
    },
  },

  lifetimes: {
    attached() {
      const pref = getPreference()
      this.setData({
        form: {
          budget: pref.budget ?? 0,
          maxTimeMinutes: pref.maxTimeMinutes ?? 30,
          tastePreferences: pref.tastePreferences,
          maxDistanceKm: pref.maxDistanceKm ?? 3,
        },
      })
    },
  },

  methods: {
    onBudgetTap(e: WechatMiniprogram.TouchEvent) {
      this.setData({ 'form.budget': Number(e.currentTarget.dataset.value) })
      this.save()
    },

    onTimeTap(e: WechatMiniprogram.TouchEvent) {
      this.setData({ 'form.maxTimeMinutes': Number(e.currentTarget.dataset.value) })
      this.save()
    },

    onTasteTap(e: WechatMiniprogram.TouchEvent) {
      const value = String(e.currentTarget.dataset.value)
      const prefs = this.data.form.tastePreferences
      const next = prefs.includes(value) ? prefs.filter((t) => t !== value) : [...prefs, value]
      this.setData({ 'form.tastePreferences': next })
      this.save()
    },

    onDistanceChange(e: WechatMiniprogram.SliderChange) {
      this.setData({ 'form.maxDistanceKm': e.detail.value })
      this.save()
    },

    save() {
      const f = this.data.form
      preferenceRepository.write({
        budget: f.budget || undefined,
        maxTimeMinutes: f.maxTimeMinutes,
        tastePreferences: f.tastePreferences,
        maxDistanceKm: f.maxDistanceKm,
      })
      wx.showToast({ title: '已保存', icon: 'success' })
    },
  },
})
