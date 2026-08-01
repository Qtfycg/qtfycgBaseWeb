/**
 * 页面参数读取（共享工具）
 * 从页面栈取当前页面导航参数（详情页共用）
 */
export function getPageParam(key: string): string {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as { options?: Record<string, string> }
  return page?.options?.[key] ?? ''
}
