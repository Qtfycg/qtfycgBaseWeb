/**
 * 云调用封装 CloudApiClient（Story 6 客户端部分）
 *
 * 统一云函数调用入口：Promise 化、统一错误处理。
 * 云端云函数（Story 27/29/31/33 等）尚未实现时，通过 MOCK_MODE 提供 mock 数据，
 * 云端实现后切换 wx.cloud.callFunction 即可，业务代码无需改动。
 */
import { AppError, CloudApiResponse, UserIdentity } from '../types'

/** 云函数名（与云端 Story 的云函数目录一致） */
export const CLOUD_FUNCTIONS = {
  login: 'login',
  submitRecipe: 'submitRecipe',
  listMySubmissions: 'listMySubmissions',
  listPendingSubmissions: 'listPendingSubmissions',
  reviewRecipe: 'reviewRecipe',
  getPublicRecipes: 'getPublicRecipes',
  searchMerchants: 'searchMerchants',
  getWeather: 'getWeather',
} as const

/** 是否启用 mock 模式（云端实现后改为 false） */
const MOCK_MODE = true

export interface CallOptions {
  /** 幂等键（写操作） */
  idempotencyKey?: string
  /** 超时（ms，默认 8000） */
  timeout?: number
}

export class CloudApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

/**
 * 调用云函数
 * 云端实现前：调用 MockRegistry 中注册的 mock 处理器；
 * 云端实现后：MOCK_MODE = false 时走 wx.cloud.callFunction。
 */
export async function callCloudFunction<TReq, TRes>(
  name: string,
  data: TReq,
  options: CallOptions = {},
): Promise<TRes> {
  if (MOCK_MODE) {
    const handler = mockRegistry[name]
    if (!handler) {
      throw new CloudApiError('MOCK_NOT_REGISTERED', `云函数 ${name} 的 mock 未注册`)
    }
    // 模拟网络延迟
    await delay(100)
    return handler(data, options) as Promise<TRes>
  }

  // 真实云端调用（Story 27 云端实现后启用）
  const app = getApp<IAppOption>()
  if (!app.globalData.identity?.loggedIn && name !== CLOUD_FUNCTIONS.login) {
    throw new CloudApiError('NOT_LOGGED_IN', '请先登录')
  }
  const res = (await wx.cloud.callFunction({
    name,
    data: {
      data,
      idempotencyKey: options.idempotencyKey,
    },
  })) as unknown as { result: CloudApiResponse<TRes> }
  const body = res.result
  if (body.code !== 0) {
    throw new CloudApiError(`${body.code}`, body.message)
  }
  return body.data as TRes
}

/** 错误转 AppError（降级判断用，Story 22） */
export function toAppError(e: unknown): AppError {
  if (e instanceof CloudApiError) {
    return { code: e.code, message: e.message, source: 'cloud' }
  }
  return { code: 'CLOUD_UNKNOWN', message: '云端服务暂不可用', source: 'cloud', cause: e }
}

// ================= mock 注册表 =================

type MockHandler = (data: unknown, options: CallOptions) => Promise<unknown>

const mockRegistry: Record<string, MockHandler> = {}

/** 注册 mock 处理器（各 Story 前端 mock 数据层使用） */
export function registerMock(name: string, handler: MockHandler): void {
  mockRegistry[name] = handler
}

/** 判断 mock 模式是否启用 */
export function isMockMode(): boolean {
  return MOCK_MODE
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ================= 登录（Story 6） =================

/** 登录结果：复用统一身份类型（types.UserIdentity） */
export type LoginResult = UserIdentity

/** 登录：获取匿名身份（云端实现为调用 login 云函数） */
export async function login(): Promise<LoginResult> {
  const result = await callCloudFunction<unknown, LoginResult>(CLOUD_FUNCTIONS.login, {})
  const app = getApp<IAppOption>()
  app.globalData.identity = { ...result, loggedIn: true }
  return result
}

/** 获取当前身份（未登录返回 null） */
export function getIdentity(): IAppIdentity | null {
  return getApp<IAppOption>().globalData.identity
}
