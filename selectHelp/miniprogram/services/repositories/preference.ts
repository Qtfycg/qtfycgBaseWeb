/**
 * 偏好设置仓储（Story 4）
 * 默认偏好：预算、时间、口味、距离（Story 32 设置页写入，Story 13/14 读取）
 */
import { LocalDataRepository } from '../repository'

export interface Preference {
  /** 默认预算上限（元）；undefined 表示不限制 */
  budget?: number
  /** 默认最大可用时间（分钟） */
  maxTimeMinutes?: number
  /** 口味偏好（多选） */
  tastePreferences: string[]
  /** 默认最大距离（km） */
  maxDistanceKm?: number
}

const DEFAULTS: Preference = {
  budget: 40,
  maxTimeMinutes: 30,
  tastePreferences: [],
  maxDistanceKm: 3,
}

export const preferenceRepository = new LocalDataRepository<Preference>(
  'preference',
  1,
  {},
  () => ({ ...DEFAULTS }),
)

/** 读取偏好（无数据时返回默认值） */
export function getPreference(): Preference {
  return preferenceRepository.read() ?? { ...DEFAULTS }
}
