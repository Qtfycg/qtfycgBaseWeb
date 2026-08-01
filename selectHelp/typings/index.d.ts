/// <reference path="./types/index.d.ts" />

/** 客户端身份状态（Story 6 填充） */
interface IAppIdentity {
  /** 匿名用户标识 */
  userId: string
  /** 是否为管理员 */
  isAdmin: boolean
  /** 是否已登录 */
  loggedIn: boolean
}

interface IAppOption {
  globalData: {
    /** 身份状态（Story 6 阶段四填充，未登录时为 null） */
    identity: IAppIdentity | null
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
