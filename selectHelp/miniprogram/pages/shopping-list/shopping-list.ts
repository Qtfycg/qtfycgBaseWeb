// pages/shopping-list/shopping-list.ts — 采购清单（Story 19）
// 展示缺少量、勾选完成、手动添加、删除条目
import { getShoppingList, ShoppingItem } from '../../services/repositories/shopping-list'
import { addManualItem, clearDone, removeItem, toggleDone } from '../../services/shopping'
import { formatAmount } from '../../core/units'

Component({
  data: {
    items: [] as ShoppingItem[],
    doneCount: 0,
    manualVisible: false,
    manualName: '',
    manualAmount: '',
  },

  lifetimes: {
    attached() {
      this.refresh()
    },
  },

  methods: {
    refresh() {
      const items = getShoppingList().slice().sort((a, b) => b.createdAt - a.createdAt)
      const doneCount = items.filter((i) => i.done).length
      this.setData({ items, doneCount })
    },

    displayAmount(item: ShoppingItem): string {
      const text = item.convertible
        ? formatAmount(item.missingAmount, item.unit)
        : `${formatAmount(item.needAmount, item.unit)}（需人工确认）`
      return text
    },

    onToggle(e: WechatMiniprogram.TouchEvent) {
      toggleDone(e.currentTarget.dataset.id)
      this.refresh()
    },

    onDelete(e: WechatMiniprogram.TouchEvent) {
      removeItem(e.currentTarget.dataset.id)
      this.refresh()
    },

    onClearDone() {
      wx.showModal({
        title: '清理已完成',
        content: `将移除 ${this.data.doneCount} 个已完成项，确定？`,
        success: (res) => {
          if (res.confirm) {
            clearDone()
            this.refresh()
          }
        },
      })
    },

    // === 手动添加 ===
    onOpenManual() {
      this.setData({ manualVisible: true, manualName: '', manualAmount: '' })
    },

    onCloseManual() {
      this.setData({ manualVisible: false })
    },

    onManualName(e: WechatMiniprogram.Input) {
      this.setData({ manualName: e.detail.value })
    },

    onManualAmount(e: WechatMiniprogram.Input) {
      this.setData({ manualAmount: e.detail.value })
    },

    onManualSubmit() {
      const name = this.data.manualName.trim()
      const amount = Number(this.data.manualAmount)
      if (!name || !amount || amount <= 0) {
        wx.showToast({ title: '请填写名称和数量', icon: 'none' })
        return
      }
      addManualItem({ name, missingAmount: amount, unit: '个' })
      this.setData({ manualVisible: false })
      this.refresh()
    },

    noop() {
      // 阻止弹层冒泡
    },
  },
})
