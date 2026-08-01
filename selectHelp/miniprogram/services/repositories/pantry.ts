/**
 * 家中食材仓储（Story 4）
 * 食材列表：名称、数量、单位、保质期（Story 17 管理）
 */
import { PantryItem } from '../../types'
import { LocalDataRepository } from '../repository'

interface PantryData {
  items: PantryItem[]
}

const DEFAULT_DATA: PantryData = { items: [] }

export const pantryRepository = new LocalDataRepository<PantryData>(
  'pantry',
  1,
  {},
  () => ({ items: [] }),
)

export function getPantryItems(): PantryItem[] {
  return pantryRepository.read()?.items ?? DEFAULT_DATA.items
}

export function savePantryItems(items: PantryItem[]): void {
  pantryRepository.write({ items })
}
