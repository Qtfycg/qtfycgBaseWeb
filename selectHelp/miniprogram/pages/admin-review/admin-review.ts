// pages/admin-review/admin-review.ts — 管理员审核界面（Story 30 客户端）
// 待审核列表 + 详情 + 通过/拒绝（云端调用走 services/review）
import { RecipeSubmission } from '../../types'
import { getIdentity } from '../../cloud/api'
import { listPendingSubmissions, reviewRecipe } from '../../services/review'

Component({
  data: {
    loading: true,
    isAdmin: false,
    list: [] as Array<{ id: string; name: string; timeText: string }>,
    detail: null as null | { id: string; recipe: RecipeSubmission['recipe']; rejectReason: string; submitting: boolean },
    detailVisible: false,
  },

  lifetimes: {
    attached() {
      const identity = getIdentity()
      this.setData({ isAdmin: identity?.isAdmin ?? false })
      this.loadList()
    },
  },

  methods: {
    async loadList() {
      this.setData({ loading: true })
      const submissions = await listPendingSubmissions()
      const list = submissions
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((s) => ({
          id: s.id,
          name: s.recipe.name,
          timeText: new Date(s.createdAt).toLocaleDateString(),
        }))
      this.setData({ list, loading: false })
    },

    onDetail() {
      // 详情数据：云端联调后从列表携带；当前 mock 为空
      this.setData({
        detail: null,
        detailVisible: true,
      })
      wx.showToast({ title: '暂无待审核投稿（云端联调后可用）', icon: 'none' })
    },

    onRejectReason(e: WechatMiniprogram.Input) {
      if (this.data.detail) {
        this.setData({ 'detail.rejectReason': e.detail.value })
      }
    },

    async onApprove() {
      const detail = this.data.detail
      if (!detail || detail.submitting) return
      this.setData({ 'detail.submitting': true })
      const result = await reviewRecipe(detail.id, 'approve')
      this.setData({ 'detail.submitting': false })
      if (result.ok) {
        wx.showToast({ title: '已通过', icon: 'success' })
        this.setData({ detailVisible: false, detail: null })
        this.loadList()
      } else {
        wx.showToast({ title: result.error ?? '操作失败', icon: 'none' })
      }
    },

    async onReject() {
      const detail = this.data.detail
      if (!detail || detail.submitting) return
      if (!detail.rejectReason.trim()) {
        wx.showToast({ title: '请填写拒绝原因', icon: 'none' })
        return
      }
      this.setData({ 'detail.submitting': true })
      const result = await reviewRecipe(detail.id, 'reject', detail.rejectReason.trim())
      this.setData({ 'detail.submitting': false })
      if (result.ok) {
        wx.showToast({ title: '已拒绝', icon: 'success' })
        this.setData({ detailVisible: false, detail: null })
        this.loadList()
      } else {
        wx.showToast({ title: result.error ?? '操作失败', icon: 'none' })
      }
    },

    onCloseDetail() {
      this.setData({ detailVisible: false })
    },
  },
})
