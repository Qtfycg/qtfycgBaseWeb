/**
 * 通用 ID 生成（共享工具）
 * 各服务/页面统一使用，避免多份 genId 拷贝
 */
export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}
