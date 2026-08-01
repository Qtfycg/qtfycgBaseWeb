// pages/data-manage/data-manage.ts — 本地数据管理与隐私合规（Story 34）
// 清除操作统一走 services/data-manage（页面不直接操作仓储）
import { clearAllLocalData, clearHistory, clearPantry, resetLearning } from '../../services/data-manage'
import { track } from '../../core/analytics'

Component({
  data: {
    districtPickerVisible: false,
    selectedDistrict: '',
  },

  methods: {
    confirmAndRun(title: string, content: string, run: () => void, event: string) {
      wx.showModal({
        title,
        content,
        confirmColor: '#ee0a24',
        success: (res) => {
          if (res.confirm) {
            run()
            track(event)
            wx.showToast({ title: '已清除', icon: 'success' })
          }
        },
      })
    },

    onClearHistory() {
      this.confirmAndRun(
        '清除历史记录',
        '将删除全部用餐历史，且不可恢复。确定？',
        clearHistory,
        'data_cleared_history',
      )
    },

    onResetLearning() {
      this.confirmAndRun(
        '重置推荐学习',
        '将清除所有个性化权重和近期选择，恢复默认推荐。确定？',
        resetLearning,
        'data_reset_learning',
      )
    },

    onClearPantry() {
      this.confirmAndRun(
        '清除食材数据',
        '将删除家中全部食材记录，且不可恢复。确定？',
        clearPantry,
        'data_cleared_pantry',
      )
    },

    onClearAll() {
      this.confirmAndRun(
        '清除所有本地数据',
        '将删除历史、食材、偏好、学习权重、采购清单和草稿，且不可恢复。云端投稿记录不受影响。确定？',
        clearAllLocalData,
        'data_cleared_all',
      )
    },

    // === 定位授权说明 ===
    onLocationHelp() {
      wx.showModal({
        title: '定位用途说明',
        content: '定位仅用于搜索附近餐饮商家（默认 3km 内）。拒绝授权后可手动选择深圳行政区继续使用，自做推荐不受影响。',
        showCancel: false,
        confirmText: '知道了',
      })
    },

    onOpenDistrictPicker() {
      this.setData({ districtPickerVisible: true })
    },

    onDistrictConfirm(e: WechatMiniprogram.CustomEvent) {
      const district = e.detail.district as string
      this.setData({ districtPickerVisible: false, selectedDistrict: district })
      wx.showToast({ title: `已选择 ${district}`, icon: 'success' })
    },

    onDistrictClose() {
      this.setData({ districtPickerVisible: false })
    },

    onPrivacyGuide() {
      wx.showModal({
        title: '隐私保护指引',
        content: '隐私保护指引已按微信小程序要求配置，准确列出定位等数据用途。详见微信公众平台小程序隐私保护指引页面。',
        showCancel: false,
        confirmText: '知道了',
      })
    },
  },
})
