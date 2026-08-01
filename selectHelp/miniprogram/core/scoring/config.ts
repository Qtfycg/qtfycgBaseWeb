/**
 * 评分权重集中配置（Story 8）
 * 所有规则权重集中在此，禁止在规则函数中散落硬编码。
 */
export interface ScoringConfig {
  weights: {
    /** 餐次匹配权重 */
    mealPeriod: number
    /** 预算匹配权重 */
    budget: number
    /** 时间匹配权重 */
    time: number
    /** 口味匹配权重 */
    taste: number
    /** 食材覆盖率权重 */
    coverage: number
    /** 距离与营业状态权重 */
    distance: number
    /** 近期重复降权权重（负向） */
    recent: number
    /** 历史评价加权权重 */
    rating: number
    /** 天气适配权重（P0 默认 0，Story 43 P1 启用） */
    weather: number
  }
  /** 临期阈值（天） */
  expiringThresholdDays: number
  /** 临期食材加权系数（覆盖率得分 × 系数） */
  expiringBoostFactor: number
  /** 近期重复降权窗口（天） */
  recentWindowDays: number
  /** 天气规则启用（P0 关闭，Story 43 打开） */
  weatherEnabled: boolean
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    mealPeriod: 1,
    budget: 1,
    time: 1,
    taste: 1,
    coverage: 1.5,
    distance: 1,
    recent: 1,
    rating: 0.5,
    weather: 1,
  },
  expiringThresholdDays: 3,
  expiringBoostFactor: 1.5,
  recentWindowDays: 7,
  weatherEnabled: false,
}
