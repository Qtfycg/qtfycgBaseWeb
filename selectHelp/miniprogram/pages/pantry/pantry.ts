// pages/pantry/pantry.ts — 家中食材管理（Story 17）
// 列表 + 状态标签 + 新增/编辑（标准食材目录 + 自定义食材，RR-008）
import { PantryItem } from '../../types'
import {
  addPantryItem,
  getItemStatus,
  getIngredientCatalog,
  getPantryItems,
  removePantryItem,
  updatePantryItem,
  createCustomIngredientId,
  defaultExpiryDate,
} from '../../services/pantry'
import { getUnitCategory } from '../../core/units'

interface PantryView extends PantryItem {
  statusText: string
  statusClass: string
  expiryText: string
}

const STATUS_MAP = {
  normal: { text: '正常', cls: 'tag-success' },
  expiring: { text: '临期', cls: 'tag-warning' },
  expired: { text: '已过期', cls: 'tag-danger' },
} as const

/** 标准单位选项（Story 16 受控列表） */
const UNIT_OPTIONS = ['克', '千克', '毫升', '升', '个', '根', '颗', '片', '适量']

Component({
  data: {
    items: [] as PantryView[],
    // 新增/编辑表单
    formVisible: false,
    editingId: '',
    catalog: [] as Array<{ ingredientId: string; name: string }>,
    unitOptions: UNIT_OPTIONS,
    form: {
      ingredientId: '',
      name: '',
      amount: '',
      unit: '个',
      expiryDate: '',
      isCustom: false,
    },
  },

  lifetimes: {
    attached() {
      this.refresh()
    },
  },

  methods: {
    refresh() {
      const now = new Date()
      const items: PantryView[] = getPantryItems()
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((i) => {
          const status = getItemStatus(i, now)
          return {
            ...i,
            statusText: STATUS_MAP[status].text,
            statusClass: STATUS_MAP[status].cls,
            expiryText: i.expiryDate,
          }
        })
      this.setData({
        items,
        catalog: getIngredientCatalog(),
      })
    },

    // === 新增 ===
    onAddTap() {
      this.setData({
        formVisible: true,
        editingId: '',
        form: this.createEmptyForm(),
      })
    },

    onSelectIngredient(e: WechatMiniprogram.TouchEvent) {
      const { id, name } = e.currentTarget.dataset
      this.setData({
        'form.ingredientId': id,
        'form.name': name,
        'form.isCustom': false,
      })
    },

    onToggleCustom() {
      const isCustom = !this.data.form.isCustom
      this.setData({
        'form.isCustom': isCustom,
        'form.ingredientId': '',
      })
    },

    onNameInput(e: WechatMiniprogram.Input) {
      this.setData({ 'form.name': e.detail.value })
    },

    onAmountInput(e: WechatMiniprogram.Input) {
      this.setData({ 'form.amount': e.detail.value })
    },

    onUnitTap(e: WechatMiniprogram.TouchEvent) {
      this.setData({ 'form.unit': e.currentTarget.dataset.value })
    },

    onExpiryChange(e: WechatMiniprogram.PickerChange) {
      this.setData({ 'form.expiryDate': e.detail.value })
    },

    onFormClose() {
      this.setData({ formVisible: false })
    },

    onFormSubmit() {
      const f = this.data.form
      const amount = Number(f.amount)
      if (!f.name || !amount || amount <= 0) {
        wx.showToast({ title: '请填写食材名称和数量', icon: 'none' })
        return
      }
      const unitCategory = getUnitCategory(f.unit)
      // 自定义或未选标准食材 → 生成本地自定义标识（复用服务层）
      const ingredientId = !f.isCustom && f.ingredientId ? f.ingredientId : createCustomIngredientId()

      if (this.data.editingId) {
        updatePantryItem(this.data.editingId, {
          name: f.name,
          amount,
          unit: f.unit,
          unitCategory,
          expiryDate: f.expiryDate,
        })
      } else {
        addPantryItem({
          ingredientId,
          name: f.name,
          amount,
          unit: f.unit,
          unitCategory,
          expiryDate: f.expiryDate,
          source: f.isCustom || ingredientId.startsWith('custom_') ? 'custom' : 'standard',
        })
      }
      this.setData({ formVisible: false })
      this.refresh()
      wx.showToast({ title: '已保存', icon: 'success' })
    },

    // === 编辑 / 删除 ===
    onEditTap(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id
      const item = getPantryItems().find((i) => i.id === id)
      if (!item) return
      this.setData({
        formVisible: true,
        editingId: id,
        form: {
          ingredientId: item.ingredientId,
          name: item.name,
          amount: `${item.amount}`,
          unit: item.unit,
          expiryDate: item.expiryDate,
          isCustom: item.source === 'custom',
        },
      })
    },

    /** 空表单工厂（data 初始值与新增共用） */
    createEmptyForm() {
      return {
        ingredientId: '',
        name: '',
        amount: '',
        unit: '个',
        expiryDate: defaultExpiryDate(),
        isCustom: false,
      }
    },

    onDeleteTap(e: WechatMiniprogram.TouchEvent) {
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '删除食材',
        content: '删除后不可恢复，确定删除？',
        confirmColor: '#ee0a24',
        success: (res) => {
          if (res.confirm) {
            removePantryItem(id)
            this.refresh()
          }
        },
      })
    },

    noop() {
      // 阻止弹层冒泡
    },
  },
})
