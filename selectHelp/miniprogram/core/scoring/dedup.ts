/**
 * 相似候选去重（Story 10 / RR-003）
 *
 * 流程（在加权随机抽取之前执行）：
 * 1. 对评分后的所有候选按相似规则分组。
 * 2. 每个相似组保留得分最高的候选进入主候选池。
 * 3. 加权随机抽取后不足 3 个时，从各组次优候选按分数递补，标记"多样性降级"。
 *
 * 相似规则（基于 CandidateFeatures）：
 * - 同一 Recipe.id 只出现一次。
 * - 同一 Merchant.id 只出现一次。
 * - 菜系 + 口味 + 主食材交集 ≥ 2 视为相似组。
 *
 * 纯 TypeScript 模块：不依赖 wx API。
 */
import { MealCandidate } from '../../types'

interface DedupGroup {
  primary: MealCandidate
  backups: MealCandidate[]
}

/** 特征相似度：菜系 + 口味 + 主食材的交集数量 */
function featureOverlap(a: MealCandidate, b: MealCandidate): number {
  const setA = new Set([
    ...a.features.cuisineTags,
    ...a.features.tasteTags,
    ...a.features.mainIngredientIds,
  ])
  let overlap = 0
  for (const tag of new Set([
    ...b.features.cuisineTags,
    ...b.features.tasteTags,
    ...b.features.mainIngredientIds,
  ])) {
    if (setA.has(tag)) overlap++
  }
  return overlap
}

/** 是否应分到同一相似组 */
function isSimilar(a: MealCandidate, b: MealCandidate): boolean {
  // 同一实体 id
  if (a.id === b.id) return true
  // 特征交集 ≥ 2
  return featureOverlap(a, b) >= 2
}

/**
 * 按相似规则分组：每组保留 primary（分数更高者当 primary，backups 存其余）
 * @param preferHigher 是否按分数把更高者提升为 primary（dedupeThenDraw 使用；groupSimilar 保持输入顺序）
 */
function groupBySimilarity(scored: MealCandidate[], preferHigher: boolean): DedupGroup[] {
  const groups: DedupGroup[] = []
  for (const candidate of scored) {
    let placed = false
    for (const group of groups) {
      if (isSimilar(group.primary, candidate)) {
        if (preferHigher && (candidate.finalScore ?? 0) > (group.primary.finalScore ?? 0)) {
          group.backups.push(group.primary)
          group.primary = candidate
        } else {
          group.backups.push(candidate)
        }
        placed = true
        break
      }
    }
    if (!placed) {
      groups.push({ primary: candidate, backups: [] })
    }
  }
  return groups
}

/** 分组后取主候选（保持输入顺序稳定；测试与简单场景使用） */
export function groupSimilar(scored: MealCandidate[]): MealCandidate[] {
  return groupBySimilarity(scored, false).map((g) => g.primary)
}

/**
 * 去重 + 递补：
 * @param scored 已评分候选
 * @param draw 抽取函数（接收去重后的主候选池，返回抽取结果）
 * @returns 最终推荐 + 是否发生多样性降级
 */
export function dedupeThenDraw(
  scored: MealCandidate[],
  draw: (primaryPool: MealCandidate[]) => { candidates: MealCandidate[]; shortfallReason?: string },
): { candidates: MealCandidate[]; shortfallReason?: string; diversityDegraded: boolean } {
  // 1. 分组，每组保留最高分（finalScore 由归一化阶段先计算）
  const groups = groupBySimilarity(scored, true)

  const primaryPool = groups.map((g) => g.primary)
  const result = draw(primaryPool)

  // 2. 不足时按分数从各组次优递补
  if (result.candidates.length < 3) {
    const pickedIds = new Set(result.candidates.map((c) => c.id))
    const backups = groups
      .flatMap((g) => g.backups.map((b) => ({ b, primaryId: g.primary.id })))
      .filter(({ b, primaryId }) => !pickedIds.has(b.id) && !pickedIds.has(primaryId))
      .sort((x, y) => (y.b.finalScore ?? 0) - (x.b.finalScore ?? 0))

    for (const { b } of backups) {
      if (result.candidates.length >= 3) break
      if (pickedIds.has(b.id)) continue
      result.candidates.push(b)
      pickedIds.add(b.id)
    }
  }

  const diversityDegraded = result.candidates.some((c) =>
    groups.some((g) => g.backups.includes(c)),
  )

  // 不足时 weightedDraw 已生成 shortfallReason；递补后达到 3 个则清除
  const shortfallReason = result.candidates.length < 3 ? result.shortfallReason : undefined
  return { candidates: result.candidates, shortfallReason, diversityDegraded }
}
