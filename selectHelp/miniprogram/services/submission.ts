/**
 * 菜谱投稿服务（Story 26 服务层）
 * 封装云端调用与降级语义：页面只拿结果，不直接调云函数
 */
import { Recipe, RecipeSubmission } from '../types'
import { callCloudFunction, CLOUD_FUNCTIONS, toAppError, CloudApiError } from '../cloud/api'
import { track } from '../core/analytics'

export interface SubmitResult {
  ok: boolean
  submissionId?: string
  error?: string
}

/** 提交投稿（携带幂等键；失败返回可展示错误） */
export async function submitRecipe(recipe: Recipe, submissionId?: string): Promise<SubmitResult> {
  try {
    const idempotencyKey = `sub_${recipe.name}_${Date.now()}`
    const res = await callCloudFunction<{ recipe: Recipe; submissionId?: string }, { id: string }>(
      CLOUD_FUNCTIONS.submitRecipe,
      { recipe, submissionId },
      { idempotencyKey },
    )
    track('submission_submitted')
    return { ok: true, submissionId: res.id }
  } catch (e) {
    const err = toAppError(e)
    return { ok: false, error: err.message }
  }
}

/** 查询我的投稿列表（失败返回空列表，不阻断页面） */
export async function listMySubmissions(): Promise<RecipeSubmission[]> {
  try {
    const res = await callCloudFunction<unknown, { submissions: RecipeSubmission[] }>(
      CLOUD_FUNCTIONS.listMySubmissions,
      {},
    )
    return res.submissions
  } catch (_e) {
    return []
  }
}

export { CloudApiError }
