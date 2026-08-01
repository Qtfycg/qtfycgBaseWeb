// pages/history/history.ts — 历史记录（Story 20）
// 按时间倒序展示用餐决策，支持按时间范围和用餐方式筛选
import { queryHistory } from '../../services/decisions'
import { MealDecision } from '../../types'
import { CANDIDATE_TYPE_LABELS } from '../../core/constants'

interface HistoryView extends MealDecision {
  timeText: string
  typeLabel: string
  ratingLabel: string
}

const RATING_LABELS = { pending: '待评价', rated: '已评价', skipped: '已跳过' } as const

Component({
  data: {
    items: [] as HistoryView[],
    filterType: '' as '' | 'cook' | 'delivery',
    filterRange: 'all' as 'week' | 'month' | 'all',
  },

  lifetimes: {
    attached() {
      this.refresh()
    },
  },

  methods: {
    refresh() {
      const list = queryHistory({
        mealType: this.data.filterType || undefined,
        range: this.data.filterRange,
      })
      const items: HistoryView[] = list.map((d) => ({
        ...d,
        timeText: this.formatTime(d.timestamp),
        typeLabel: CANDIDATE_TYPE_LABELS[d.type],
        ratingLabel: RATING_LABELS[d.ratingStatus],
      }))
      this.setData({ items })
    },

    formatTime(ts: number): string {
      const d = new Date(ts)
      const pad = (n: number) => `${n}`.padStart(2, '0')
      return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    onFilterType(e: WechatMiniprogram.TouchEvent) {
      const value = e.currentTarget.dataset.value as '' | 'cook' | 'delivery'
      this.setData({ filterType: value })
      this.refresh()
    },

    onFilterRange(e: WechatMiniprogram.TouchEvent) {
      const value = e.currentTarget.dataset.value as 'week' | 'month' | 'all'
      this.setData({ filterRange: value })
      this.refresh()
    },

    onItemTap(e: WechatMiniprogram.TouchEvent) {
      const { type, id } = e.currentTarget.dataset
      if (type === 'cook') {
        wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
      }
    },
  },
})
