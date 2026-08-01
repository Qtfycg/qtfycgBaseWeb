/**
 * Analytics 轻量接口（Story 2）
 * 各 Story 从一开始就调用该接口预留埋点调用点。
 * Story 35 负责替换为真实上报实现（本地缓存 + 补报），无需回头修改业务代码。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */

/** 产品事件类型，不含用户敏感内容，仅含匿名标识 */
export interface ProductEvent {
  /** 事件名，如 'recommend_success' */
  name: string
  /** 事件发生时间戳（ms） */
  timestamp: number
  /** 匿名用户标识（Story 6 提供，未登录时可为 undefined） */
  userId?: string
  /** 事件附加数据（不含敏感内容） */
  payload?: Record<string, unknown>
}

export interface Analytics {
  track(event: ProductEvent): void
}

/** 空实现：Story 35 之前的默认实现，所有事件丢弃 */
export class NoopAnalytics implements Analytics {
  track(_event: ProductEvent): void {
    // no-op
  }
}

/** 全局单例：各模块通过 getAnalytics() 获取，Story 35 可替换实现 */
let instance: Analytics = new NoopAnalytics()

export function getAnalytics(): Analytics {
  return instance
}

export function setAnalytics(impl: Analytics): void {
  instance = impl
}

/** 便捷方法：带当前时间戳的埋点 */
export function track(name: string, payload?: Record<string, unknown>): void {
  instance.track({
    name,
    timestamp: Date.now(),
    payload,
  })
}
