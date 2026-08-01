/**
 * 定位适配器（Story 22/24）
 * 外部服务统一适配接口：页面不直接调 wx.getLocation。
 * 成功返回坐标；失败返回可展示的降级提示（配合手动选择行政区）。
 */
export interface LocationResult {
  lat?: number
  lng?: number
  /** 定位失败时的降级提示文案（成功时为空） */
  banner?: string
}

export function getLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({ lat: res.latitude, lng: res.longitude })
      },
      fail: () => {
        resolve({ banner: '未开启定位，仅展示自做推荐 · 手动选择行政区' })
      },
    })
  })
}
