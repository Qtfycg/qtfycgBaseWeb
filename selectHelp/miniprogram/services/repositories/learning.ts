/**
 * 推荐学习权重仓储（Story 4）
 * 个性化权重（Story 11 更新，Story 8 评分读取）
 */
import { LearningWeights } from '../../types'
import { LocalDataRepository } from '../repository'

const DEFAULT_WEIGHTS: LearningWeights = {
  cuisine: {},
  taste: {},
  ingredient: {},
  recentSelections: [],
}

export const learningRepository = new LocalDataRepository<LearningWeights>(
  'learning',
  1,
  {},
  () => ({ ...DEFAULT_WEIGHTS }),
)

export function getLearningWeights(): LearningWeights {
  return learningRepository.read() ?? { ...DEFAULT_WEIGHTS }
}

export function saveLearningWeights(weights: LearningWeights): void {
  learningRepository.write(weights)
}

/** 重置学习结果（Story 11 / Story 34） */
export function resetLearningWeights(): void {
  learningRepository.clear()
}
