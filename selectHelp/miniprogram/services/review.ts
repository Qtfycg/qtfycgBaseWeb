/**
 * 投稿审核服务（Story 30 服务层）
 * 封装云端调用与降级语义
 */
import { RecipeSubmission } from '../types'
import { callCloudFunction, CLOUD_FUNCTIONS, toAppError } from '../cloud/api'
import { track } from '../core/analytics'

export interface ReviewResult {
  ok: boolean
  error?: string
}

/** 待审核列表（失败返回空列表） */
export async function listPendingSubmissions(): Promise<RecipeSubmission[]> {
  try {
    const res = await callCloudFunction<unknown, { submissions: RecipeSubmission[] }>(
      CLOUD_FUNCTIONS.listPendingSubmissions,
      {},
    )
    return res.submissions
  } catch (_e) {
    return []
  }
}

/** 审核操作：通过 / 拒绝（拒绝必须携带原因） */
export async function reviewRecipe(
  submissionId: string,
  action: 'approve' | 'reject',
  rejectReason?: string,
): Promise<ReviewResult> {
  try {
    await callCloudFunction<{ submissionId: string; action: 'approve' | 'reject'; rejectReason?: string }, unknown>(
      CLOUD_FUNCTIONS.reviewRecipe,
      { submissionId, action, rejectReason },
    )
    track(action === 'approve' ? 'review_approved' : 'review_rejected')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: toAppError(e).message }
  }
}
