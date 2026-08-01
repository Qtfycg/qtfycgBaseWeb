/**
 * 核心领域模型（Story 3）
 * 客户端（miniprogram）与云端（cloudfunctions，通过共享目录引用）共用的统一类型体系。
 * 禁止在页面中内联重复定义类型。
 */

/**
 * 统一候选特征（RR-001）
 * 供评分、去重、个性化、推荐理由使用；Recipe 与 Merchant 必须可映射为 CandidateFeatures
 */
export interface CandidateFeatures {
  /** 菜系标签，如 "川菜" "粤菜" "家常" */
  cuisineTags: string[]
  /** 口味标签，如 "辣" "清淡" "酸甜" */
  tasteTags: string[]
  /** 主食材标识列表（ingredientId） */
  mainIngredientIds: string[]
  /** 适用餐次：早餐/午餐/晚餐/夜宵 */
  mealPeriodTags: string[]
  /** 冷热属性，用于天气适配 */
  temperatureTags: Array<'cold' | 'warm' | 'hot' | 'soup'>
  /** 预估花费（元）；自做候选使用食材成本估算，无可靠价格时为 undefined */
  estimatedCost?: number
  /** 预估耗时（分钟） */
  estimatedDurationMinutes?: number
  /** 距离（km），外卖候选使用（FIL-006） */
  distanceKm?: number
  /** 营业状态，外卖候选使用（FIL-006） */
  open?: boolean
}

/** 候选类型 */
export type CandidateType = 'cook' | 'delivery'

/** 推荐候选：推荐管道的统一输出 */
export interface MealCandidate {
  /** 类型：自做 / 外卖 */
  type: CandidateType
  /** 候选标识（菜谱 id 或商家 id） */
  id: string
  /** 显示名称 */
  name: string
  /** 统一特征（RR-001） */
  features: CandidateFeatures
  /** 评分证据映射：因素键 → 证据（Story 8 填充） */
  scoringEvidence: Record<string, ScoringEvidence>
  /** 最终得分（Story 9 填充，0-100） */
  finalScore?: number
}

/** 评分证据：单条评分因素的输入、输出与可读描述 */
export interface ScoringEvidence {
  /** 因素键，如 'meal_period' 'budget' 'coverage' */
  factor: string
  /** 原始输入值 */
  rawValue?: unknown
  /** 该维度得分（0-100） */
  score: number
  /** 该维度权重（来自 ScoringConfig） */
  weight: number
  /** 可读描述（供推荐理由生成使用） */
  description?: string
  /** 硬性排除标记（如打烊、超距离）：候选不进入最终推荐池 */
  excluded?: boolean
}

/** 菜谱 */
export interface Recipe {
  id: string
  /** 菜名 */
  name: string
  /** 简介 */
  description: string
  /** 适用餐次 */
  mealPeriods: MealPeriod[]
  /** 口味标签 */
  tasteTags: string[]
  /** 菜系标签 */
  cuisineTags: string[]
  /** 冷热属性 */
  temperatureTags: Array<'cold' | 'warm' | 'hot' | 'soup'>
  /** 基础份数（如 2 人份），采购计算支持份数缩放 */
  baseServings: number
  /** 预计耗时（分钟） */
  durationMinutes: number
  /** 预估食材成本（元）；无可靠价格时为 undefined */
  estimatedCost?: number
  /** 所需食材 */
  ingredients: RecipeIngredient[]
  /** 烹饪步骤 */
  steps: string[]
  /** 来源：内置 / 云端 / 用户投稿 */
  source: 'builtin' | 'cloud' | 'user_submission'
  /** 主食材标识（用于相似度计算） */
  mainIngredientIds: string[]
  /** 内容版本（云端同步用） */
  contentVersion?: number
  /** 软删除标记（云端同步用） */
  deleted?: boolean
}

/** 菜谱食材用量 */
export interface RecipeIngredient {
  /** 稳定食材标识 */
  ingredientId: string
  /** 显示名称 */
  name: string
  /** 数量 */
  amount: number
  /** 单位 */
  unit: string
  /** 单位类别（冗余存储，便于换算；来自 Story 16） */
  unitCategory: UnitCategory
}

/** 餐次 */
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'late_night'

/** 单位类别（Story 16） */
export type UnitCategory = 'weight' | 'volume' | 'count' | 'descriptive'

/** 家中食材 */
export interface PantryItem {
  id: string
  /** 稳定食材标识（标准或自定义 custom_<uuid>） */
  ingredientId: string
  /** 显示名称 */
  name: string
  /** 数量 */
  amount: number
  /** 单位 */
  unit: string
  /** 单位类别 */
  unitCategory: UnitCategory
  /** 保质期（yyyy-MM-dd） */
  expiryDate: string
  /** 来源：标准 / 自定义 */
  source: 'standard' | 'custom'
  /** 创建时间戳（ms） */
  createdAt: number
}

/** 食材状态（由保质期计算，Story 18） */
export type PantryStatus = 'normal' | 'expiring' | 'expired'

/** 商家（外卖候选）。距离/营业状态等评分字段在 features 中（单一来源），展示字段如下 */
export interface Merchant {
  id: string
  /** 商家名称 */
  name: string
  /** 纬度 */
  lat: number
  /** 经度 */
  lng: number
  /** 评分（0-5），无可靠数据时 undefined */
  rating?: number
  /** 菜品列表（有授权数据时提供） */
  menuItems?: MenuItem[]
  /** 配送费（元） */
  deliveryFee?: number
  /** 预计送达时间（分钟） */
  estimatedDeliveryMinutes?: number
  /** 数据来源服务商标识 */
  dataSource: string
  /** 数据更新时间（ISO 字符串） */
  updatedAt: string
  /** 统一特征（含距离 distanceKm / 营业状态 open，供评分与展示） */
  features: CandidateFeatures
}

/** 商家菜品 */
export interface MenuItem {
  /** 菜品名 */
  name: string
  /** 价格（元） */
  price?: number
  /** 月销量（可选） */
  monthlySales?: number
}

/** 用餐决策（历史记录） */
export interface MealDecision {
  id: string
  /** 时间戳（ms） */
  timestamp: number
  /** 餐次 */
  mealPeriod: MealPeriod
  /** 类型：自做 / 外卖 */
  type: CandidateType
  /** 候选标识 */
  candidateId: string
  /** 候选名称（快照，候选下线仍可显示） */
  candidateName: string
  /** 候选特征快照（RR-001：历史相似度计算不依赖当前候选库） */
  featuresSnapshot: CandidateFeatures
  /** 预计花费（元，外卖标记为"预计"） */
  estimatedCost?: number
  /** 评价状态 */
  ratingStatus: 'pending' | 'rated' | 'skipped'
  /** 评价结果（rated 时有效） */
  rating?: MealRatingValue
  /** 评价时间戳 */
  ratedAt?: number
}

/** 评价档位：喜欢 / 一般 / 不喜欢 */
export type MealRatingValue = 'like' | 'neutral' | 'dislike'

/** 用户匿名身份（客户端可见，不含 openId） */
export interface UserIdentity {
  /** 匿名用户标识 */
  userId: string
  /** 是否为管理员 */
  isAdmin: boolean
}

/** 推荐学习权重（Story 11） */
export interface LearningWeights {
  /** 菜系权重：{ 菜系: 加权分 } */
  cuisine: Record<string, number>
  /** 口味权重：{ 口味: 加权分 } */
  taste: Record<string, number>
  /** 食材权重：{ ingredientId: 加权分 } */
  ingredient: Record<string, number>
  /** 近期已选候选 id 列表（含选择时间戳，7 天后自动移出） */
  recentSelections: Array<{ candidateId: string; at: number }>
}

/** 投稿状态机（Story 29 云端强制） */
export type SubmissionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'

/** 菜谱投稿 */
export interface RecipeSubmission {
  id: string
  /** 菜谱内容 */
  recipe: Recipe
  /** 状态 */
  status: SubmissionStatus
  /** 拒绝原因（rejected 时必填） */
  rejectReason?: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 统一错误类型：支持降级判断 */
export interface AppError {
  code: string
  message: string
  /** 错误来源 */
  source: 'local' | 'cloud' | 'external'
  /** 原始错误（调试用，不展示给用户） */
  cause?: unknown
}

/** 云函数响应契约（Story 3 / Story 6） */
export interface CloudApiResponse<T> {
  /** 0 表示成功；非 0 为统一错误码 */
  code: number
  message: string
  data?: T
}

/** 推荐上下文：推荐管道的输入（Story 7） */
export interface RecommendationContext {
  /** 当前时间（注入以便测试） */
  now: Date
  /** 餐次 */
  mealPeriod: MealPeriod
  /** 预算上限（元） */
  budget?: number
  /** 最大可用时间（分钟） */
  maxTimeMinutes?: number
  /** 口味偏好 */
  tastePreferences: string[]
  /** 最大距离（km） */
  maxDistanceKm?: number
  /** 纬度（可选） */
  lat?: number
  /** 经度（可选） */
  lng?: number
  /** 天气（可选，Story 43 提供） */
  weather?: {
    temperature: number
    condition: string
  }
}
