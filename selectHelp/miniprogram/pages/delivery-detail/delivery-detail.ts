// pages/delivery-detail/delivery-detail.ts — 外卖候选详情页（Story 25）
// 展示商家可获得的字段；缺失字段明确标注"暂无实时数据"
import { getMerchantById } from '../../services/merchant'
import { confirmDecision } from '../../services/decisions'
import { toCandidate } from '../../core/providers'
import { getPageParam } from '../../utils/page-options'
import { Merchant } from '../../types'

interface MerchantView {
  name: string
  distanceText: string
  ratingText: string
  openText: string
  deliveryText: string
  sourceText: string
  menuText: string
  menuItems: Array<{ name: string; priceText: string }>
  hasMenu: boolean
  hasDelivery: boolean
}

Component({
  data: {
    loading: true,
    notFound: false,
    merchant: null as MerchantView | null,
    merchantId: '',
    /** 完整商家数据（确认选择时构造候选用，保留 features） */
    merchantData: null as Merchant | null,
  },

  lifetimes: {
    attached() {
      const id = getPageParam('id')
      this.setData({ merchantId: id })
      this.load(id)
    },
  },

  methods: {
    async load(id: string) {
      const merchant = await getMerchantById(id)
      if (!merchant) {
        this.setData({ loading: false, notFound: true })
        return
      }
      this.setData({
        merchant: this.toView(merchant),
        merchantData: merchant,
        loading: false,
      })
    },

    toView(m: Merchant): MerchantView {
      return {
        name: m.name,
        distanceText: m.features.distanceKm != null ? `距离 ${m.features.distanceKm} km` : '暂无距离数据',
        ratingText: m.rating != null ? `评分 ${m.rating}` : '暂无评分数据',
        openText: m.features.open != null ? (m.features.open ? '营业中' : '已打烊') : '营业状态未知',
        deliveryText:
          m.deliveryFee != null && m.estimatedDeliveryMinutes != null
            ? `配送费 ¥${m.deliveryFee} · 约 ${m.estimatedDeliveryMinutes} 分钟送达`
            : '暂无配送数据',
        sourceText: `数据来源：${m.dataSource} · 更新于 ${m.updatedAt.slice(0, 10)}`,
        menuText: m.menuItems && m.menuItems.length ? '菜品列表' : '暂无菜品数据（待数据授权）',
        menuItems: (m.menuItems ?? []).map((item) => ({
          name: item.name,
          priceText: item.price != null ? `¥${item.price}` : '价格未知',
        })),
        hasMenu: !!m.menuItems && m.menuItems.length > 0,
        hasDelivery: m.deliveryFee != null,
      }
    },

    onConfirm() {
      const merchant = this.data.merchantData
      if (!merchant) return
      // 构造候选 → 确认选择（Story 20；保留完整 features 供历史相似度/权重学习）
      const candidate = toCandidate(merchant.id, merchant.name, merchant.features, 'delivery')
      confirmDecision(candidate)
      wx.showToast({ title: '已记录本次选择（预计花费）', icon: 'none' })
    },
  },
})
