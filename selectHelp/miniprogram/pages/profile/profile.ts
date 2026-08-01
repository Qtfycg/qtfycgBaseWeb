// pages/profile/profile.ts — "我的"Tab
// Section：偏好设置（Story 37）、历史记录（Story 20）、投稿（Story 26）、审核（Story 30，仅管理员）、数据管理（Story 34）
import { getHistory } from '../../services/repositories/history'
import { login } from '../../cloud/api'

Component({
  data: {
    historyCount: 0,
    isAdmin: false,
    identityReady: false,
  },

  lifetimes: {
    attached() {
      this.refreshCount()
      this.refreshIdentity()
    },
  },

  methods: {
    refreshCount() {
      this.setData({ historyCount: getHistory().length })
    },

    refreshIdentity() {
      // 阶段四：尝试静默登录（mock 模式下直接返回假身份）
      login()
        .then((identity: { isAdmin: boolean }) => {
          this.setData({ isAdmin: identity.isAdmin, identityReady: true })
        })
        .catch(() => {
          this.setData({ identityReady: true })
        })
    },

    onHistoryTap() {
      wx.navigateTo({ url: '/pages/history/history' })
    },

    onPreferenceTap() {
      wx.navigateTo({ url: '/pages/preference/preference' })
    },

    onSubmitTap() {
      wx.navigateTo({ url: '/pages/submission/submission' })
    },

    onAdminReviewTap() {
      wx.navigateTo({ url: '/pages/admin-review/admin-review' })
    },

    onDataManageTap() {
      wx.navigateTo({ url: '/pages/data-manage/data-manage' })
    },
  },
})
