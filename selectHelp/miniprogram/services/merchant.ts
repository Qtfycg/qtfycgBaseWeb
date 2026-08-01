/**
 * 商家查询服务（Story 24/25 服务层）
 * 封装 searchMerchants 云端调用：详情页不再直调云函数
 */
import { Merchant } from '../types'
import { callCloudFunction, CLOUD_FUNCTIONS } from '../cloud/api'

/** 按 id 查询商家详情（失败返回 undefined → 页面显示"暂不可用"） */
export async function getMerchantById(id: string): Promise<Merchant | undefined> {
  try {
    const merchants = await callCloudFunction<{ lat?: number; lng?: number }, Merchant[]>(
      CLOUD_FUNCTIONS.searchMerchants,
      {},
    )
    return merchants.find((m) => m.id === id)
  } catch (_e) {
    return undefined
  }
}
