/**
 * 本地数据仓储与迁移（Story 4）
 * 统一数据访问层：页面禁止直接调用 wx.getStorageSync / wx.setStorageSync。
 *
 * 特性：
 * - 每种数据带 schema 版本号（version），读取时按迁移链升级。
 * - 原子写入：主键 + 临时键 + 校验后切换（写入失败保留上一次有效快照）。
 * - 迁移失败 / 数据损坏：恢复默认值并记录异常。
 * - 存储容量估算检查。
 */

/** 存储记录包装：版本号 + 数据 */
export interface StoredRecord<T> {
  version: number
  data: T
}

/** 仓储接口 */
export interface Repository<T> {
  /** 读取当前数据；无数据时返回 null */
  read(): T | null
  /** 写入数据（原子写入） */
  write(data: T): void
  /** 清除数据 */
  clear(): void
}

const KEY_PREFIX = 'sh:'
const TEMP_SUFFIX = '_tmp'

/** 容量阈值：超过则提示清理 */
const CAPACITY_WARN_PERCENT = 0.9

/** 容量检查节流间隔（ms）：避免每次写入都扫描存储信息 */
const CAPACITY_CHECK_INTERVAL = 30000
let lastCapacityCheck = 0

/**
 * 通用本地数据仓储实现
 * @param key 数据域键名（自动加 sh: 前缀）
 * @param currentVersion 当前 schema 版本
 * @param migrations 迁移链：{ 旧版本号: (旧数据) => 新数据 }
 * @param defaults 无数据或迁移失败时的默认值
 */
export class LocalDataRepository<T> implements Repository<T> {
  private readonly key: string
  private readonly currentVersion: number
  private readonly migrations: Record<number, (old: unknown) => T>
  private readonly defaults: () => T

  constructor(
    key: string,
    currentVersion: number,
    migrations: Record<number, (old: unknown) => T>,
    defaults: () => T,
  ) {
    this.key = KEY_PREFIX + key
    this.currentVersion = currentVersion
    this.migrations = migrations
    this.defaults = defaults
  }

  read(): T | null {
    try {
      const raw = wx.getStorageSync(this.key)
      if (!raw || typeof raw !== 'object' || typeof (raw as StoredRecord<T>).version !== 'number') {
        return null
      }
      return this.migrateIfNeeded(raw as StoredRecord<T>)
    } catch (e) {
      console.error(`[repository] 读取失败 ${this.key}:`, e)
      this.recoverCorrupt()
      return null
    }
  }

  write(data: T): void {
    this.checkCapacity()
    const record: StoredRecord<T> = { version: this.currentVersion, data }
    const tmpKey = this.key + TEMP_SUFFIX
    try {
      // 1. 写入临时键
      wx.setStorageSync(tmpKey, record)
      // 2. 读回校验
      const verify = wx.getStorageSync(tmpKey) as StoredRecord<T> | undefined
      if (!verify || verify.version !== this.currentVersion) {
        throw new Error('写入校验失败')
      }
      // 3. 切换：写入主键并删除临时键
      wx.setStorageSync(this.key, verify)
      wx.removeStorageSync(tmpKey)
    } catch (e) {
      // 校验失败或写入异常：丢弃临时数据，保留原主键
      try {
        wx.removeStorageSync(tmpKey)
      } catch (_) {
        // ignore
      }
      console.error(`[repository] 写入失败 ${this.key}:`, e)
      throw new Error(`保存失败：${this.key}`)
    }
  }

  clear(): void {
    try {
      wx.removeStorageSync(this.key)
      wx.removeStorageSync(this.key + TEMP_SUFFIX)
    } catch (e) {
      console.error(`[repository] 清除失败 ${this.key}:`, e)
    }
  }

  /** 版本迁移：按迁移链逐级升级，失败恢复默认值 */
  private migrateIfNeeded(record: StoredRecord<T>): T {
    if (record.version === this.currentVersion) {
      return record.data
    }
    if (record.version > this.currentVersion) {
      // 数据版本高于当前支持：无法解析，恢复默认值
      console.warn(`[repository] ${this.key} 数据版本 ${record.version} 高于当前 ${this.currentVersion}，恢复默认值`)
      return this.defaults()
    }
    // 逐级迁移
    let data: unknown = record.data
    let version = record.version
    try {
      while (version < this.currentVersion) {
        const migrate = this.migrations[version]
        if (!migrate) {
          throw new Error(`缺少 ${version} → ${version + 1} 的迁移函数`)
        }
        data = migrate(data)
        version++
      }
      // 迁移成功：写回新版本（不阻塞读取，写失败仅记录）
      try {
        wx.setStorageSync(this.key, { version: this.currentVersion, data } as StoredRecord<T>)
      } catch (e) {
        console.warn(`[repository] 迁移写回失败 ${this.key}:`, e)
      }
      return data as T
    } catch (e) {
      console.error(`[repository] 迁移失败 ${this.key}:`, e)
      this.recoverCorrupt()
      return this.defaults()
    }
  }

  /** 数据损坏恢复：清除损坏记录（保留原键内容由调用方决定） */
  private recoverCorrupt(): void {
    try {
      wx.removeStorageSync(this.key)
      wx.removeStorageSync(this.key + TEMP_SUFFIX)
    } catch (_) {
      // ignore
    }
  }

  /** 容量估算：接近上限时告警（不阻断写入）；节流避免每次写入都扫描 */
  private checkCapacity(): void {
    const now = Date.now()
    if (now - lastCapacityCheck < CAPACITY_CHECK_INTERVAL) return
    lastCapacityCheck = now
    try {
      const info = wx.getStorageInfoSync()
      const usedPercent = info.currentSize / info.limitSize
      if (usedPercent > CAPACITY_WARN_PERCENT) {
        console.warn(`[repository] 存储空间接近上限：${Math.round(usedPercent * 100)}%`)
      }
    } catch (_) {
      // ignore
    }
  }
}
