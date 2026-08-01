// components/district-picker/district-picker.ts — 深圳行政区选择器（Story 22 可复用组件）
// 定位被拒绝时手动选择行政区，供推荐首页和隐私设置等场景使用
const DISTRICTS = [
  '福田区', '罗湖区', '南山区', '盐田区',
  '宝安区', '龙岗区', '龙华区', '坪山区', '光明区', '大鹏新区',
]

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    districts: DISTRICTS,
    selected: '',
  },
  methods: {
    onSelect(e: WechatMiniprogram.TouchEvent) {
      this.setData({ selected: e.currentTarget.dataset.value })
    },
    onConfirm() {
      if (!this.data.selected) {
        wx.showToast({ title: '请选择行政区', icon: 'none' })
        return
      }
      this.triggerEvent('confirm', { district: this.data.selected })
      this.setData({ selected: '' })
    },
    onClose() {
      this.triggerEvent('close')
    },
    noop() {
      // 阻止冒泡
    },
  },
})
