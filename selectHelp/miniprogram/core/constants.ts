/**
 * 共享 UI 常量（选项词汇表、显示名）
 * 各页面统一引用，避免多份拷贝分叉
 */
import { MealPeriod } from '../types'

/** 口味选项（推荐条件面板 / 偏好设置 / 投稿表单） */
export const TASTE_OPTIONS = ['辣', '清淡', '酸甜', '咸香', '麻', '蒜香', '甜']

/** 预算选项（元），0 表示不限 */
export const BUDGET_OPTIONS = [20, 30, 40, 50, 60, 0]

/** 时间选项（分钟） */
export const TIME_OPTIONS = [15, 30, 45, 60, 90]

/** 最大距离上限（km） */
export const DISTANCE_MAX = 10

/** 候选类型显示名 */
export const CANDIDATE_TYPE_LABELS: Record<'cook' | 'delivery', string> = {
  cook: '自做',
  delivery: '外卖',
}

/** 餐次选项（投稿表单用） */
export const PERIOD_OPTIONS: Array<{ value: MealPeriod; label: string }> = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'late_night', label: '夜宵' },
]
