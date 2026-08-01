/**
 * 云端接口 mock 数据层（前端占位）
 * 云端云函数（Story 27/29/31/33/24）实现前，提供可用的假数据保证前端联调。
 * 云端实现后删除本文件并设置 api.ts 中 MOCK_MODE = false。
 */
import { registerMock, CLOUD_FUNCTIONS, CallOptions } from './api'
import { getAllRecipes } from '../core/recipe-loader'
import { Merchant, Recipe } from '../types'

/** 登录 mock：返回固定匿名身份 */
registerMock(CLOUD_FUNCTIONS.login, async () => ({
  userId: 'mock_user_001',
  isAdmin: false,
}))

/** 投稿 mock：固定成功，返回模拟 submissionId */
registerMock(CLOUD_FUNCTIONS.submitRecipe, async (data: unknown) => {
  const input = data as { recipe: Recipe; submissionId?: string }
  if (input.submissionId) {
    return { id: input.submissionId, status: 'pending_review' }
  }
  return { id: `sub_mock_${Date.now()}`, status: 'pending_review' }
})

/** 我的投稿列表 mock：空列表 */
registerMock(CLOUD_FUNCTIONS.listMySubmissions, async () => ({
  submissions: [],
}))

/** 待审核投稿 mock：空列表 */
registerMock(CLOUD_FUNCTIONS.listPendingSubmissions, async () => ({
  submissions: [],
}))

/** 审核 mock：固定成功 */
registerMock(CLOUD_FUNCTIONS.reviewRecipe, async (data: unknown) => {
  const input = data as { submissionId: string; action: 'approve' | 'reject'; rejectReason?: string }
  if (input.action === 'reject' && !input.rejectReason) {
    throw new Error('拒绝原因不能为空')
  }
  return { ok: true }
})

/** 公共菜谱查询 mock：返回内置种子（contentVersion = 0，首次同步即全部） */
registerMock(CLOUD_FUNCTIONS.getPublicRecipes, async () => {
  const recipes = getAllRecipes().map((r) => ({
    ...r,
    source: 'cloud' as const,
    contentVersion: 1,
    updatedAt: new Date(2026, 6, 29).toISOString(),
  }))
  return {
    recipes,
    nextCursor: null,
    latestContentVersion: 1,
    schemaVersion: 1,
  }
})

/** 商家搜索 mock：深圳固定商家数据（外卖详情/评分演示用） */
registerMock(CLOUD_FUNCTIONS.searchMerchants, async (_data: unknown, _options: CallOptions) => {
  const merchants: Merchant[] = [
    {
      id: 'm001',
      name: '老字号砂锅粥',
      lat: 22.5431,
      lng: 114.0579,
      rating: 4.5,
      menuItems: [
        { name: '招牌虾蟹粥', price: 38 },
        { name: '潮汕卤味拼盘', price: 45 },
      ],
      deliveryFee: 3,
      estimatedDeliveryMinutes: 35,
      dataSource: 'tencent_map',
      updatedAt: new Date().toISOString(),
      features: {
        cuisineTags: ['潮汕'],
        tasteTags: ['清淡'],
        mainIngredientIds: ['shrimp'],
        mealPeriodTags: ['dinner', 'late_night'],
        temperatureTags: ['hot', 'soup'],
        estimatedCost: 38,
        estimatedDurationMinutes: 35,
        distanceKm: 0.8,
        open: true,
      },
    },
    {
      id: 'm002',
      name: '川味小炒王',
      lat: 22.545,
      lng: 114.06,
      rating: 4.2,
      menuItems: [
        { name: '水煮鱼', price: 52 },
        { name: '辣子鸡丁', price: 32 },
      ],
      deliveryFee: 4,
      estimatedDeliveryMinutes: 40,
      dataSource: 'tencent_map',
      updatedAt: new Date().toISOString(),
      features: {
        cuisineTags: ['川菜'],
        tasteTags: ['辣'],
        mainIngredientIds: ['fish'],
        mealPeriodTags: ['lunch', 'dinner'],
        temperatureTags: ['hot'],
        estimatedCost: 42,
        estimatedDurationMinutes: 40,
        distanceKm: 1.2,
        open: true,
      },
    },
  ]
  return merchants
})

/** 天气 mock：深圳 32°C 晴 */
registerMock(CLOUD_FUNCTIONS.getWeather, async () => ({
  temperature: 32,
  condition: '晴',
  icon: 'sunny',
}))
