# UI Guidelines Compliance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复现有微信小程序页面的交互语义、表单可访问性、触控反馈、颜色对比度、长文本适配和非必要动画，同时保持业务流程与页面结构不变。

**Architecture:** 使用 `app.wxss` 维护全局可访问主题和通用交互类；各页面通过原生按钮或小程序 `aria-*` 属性补充语义；使用 Vitest 静态扫描防止关键违规重新出现。仅在防重复提交和内联错误状态需要时修改页面 TypeScript。

**Tech Stack:** 原生微信小程序、WXML、WXSS、TypeScript、Glass-Easel、Vitest。

---

## 执行约束

- 当前工作区已有用户预先暂存的项目文件，执行阶段不得使用会扩大提交范围的 `git add .`、`git commit -a` 或清理命令。
- 本计划实施期间不自动创建代码提交；每个任务完成后通过 `git diff -- <精确文件>` 和测试结果建立检查点。
- 不修改推荐算法、云端接口、页面路由和产品信息架构。
- Web Guidelines 中只适用于浏览器 DOM、URL、SSR 的规则不机械应用到微信小程序。

## 文件结构

### 新增

- `tests/ui-guidelines.test.ts`：静态扫描 WXML/WXSS 的关键合规规则。

### 修改

- `miniprogram/app.wxss`：可访问颜色、最小字号、按钮和通用交互状态。
- `miniprogram/pages/index/index.wxml`：候选、评分弹层、筛选项和加载状态语义。
- `miniprogram/pages/index/index.wxss`：首页触控目标、长文本、弹层与减少动画。
- `miniprogram/pages/pantry/pantry.wxml`：食材操作和表单控件名称。
- `miniprogram/pages/pantry/pantry.wxss`：触控目标、弹层滚动和表单错误样式。
- `miniprogram/pages/submission/submission.wxml`：表单名称、必填说明、提交状态。
- `miniprogram/pages/submission/submission.ts`：防重复提交和内联错误状态。
- `miniprogram/pages/submission/submission.wxss`：表单错误和长文本样式。
- `miniprogram/pages/shopping-list/shopping-list.wxml`：复选、删除和手动添加表单语义。
- `miniprogram/pages/shopping-list/shopping-list.wxss`：复选触控目标和弹层滚动。
- `miniprogram/pages/admin-review/admin-review.wxml`：列表项、拒绝原因和提交状态语义。
- `miniprogram/pages/admin-review/admin-review.wxss`：弹层与长文本适配。
- `miniprogram/pages/preference/preference.wxml`：筛选项和距离滑块名称。
- `miniprogram/pages/preference/preference.wxss`：筛选触控状态。
- `miniprogram/components/district-picker/district-picker.wxml`：弹层和行政区选项语义。
- `miniprogram/components/district-picker/district-picker.wxss`：弹层滚动隔离和选项状态。
- `miniprogram/pages/profile/profile.wxml`：导航卡片语义。
- `miniprogram/pages/profile/profile.wxss`：导航反馈、安全区和文本适配。
- `miniprogram/pages/history/history.wxml`：筛选项、历史项和空状态语义。
- `miniprogram/pages/history/history.wxss`：筛选触控目标和长文本适配。
- `miniprogram/pages/data-manage/data-manage.wxml`：数据操作与导航语义。
- `miniprogram/pages/data-manage/data-manage.wxss`：危险操作、触控反馈和提示文本。
- `miniprogram/pages/recipe-detail/recipe-detail.wxml`：加载状态和内容分组语义。
- `miniprogram/pages/recipe-detail/recipe-detail.wxss`：长文本和底部操作栏。
- `miniprogram/pages/delivery-detail/delivery-detail.wxml`：加载状态和动态数据语义。
- `miniprogram/pages/delivery-detail/delivery-detail.wxss`：长文本和动态字段排版。

---

### Task 1: 增加 UI 合规自动检查

**Files:**
- Create: `tests/ui-guidelines.test.ts`

- [ ] **Step 1: 写入会失败的静态审查测试**

```ts
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const miniProgramRoot = join(process.cwd(), 'miniprogram')

function collectFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name)
    return statSync(file).isDirectory()
      ? collectFiles(file, extensions)
      : extensions.includes(extname(file))
        ? [file]
        : []
  })
}

const wxmlFiles = collectFiles(miniProgramRoot, ['.wxml'])
const wxssFiles = collectFiles(miniProgramRoot, ['.wxss'])

describe('UI guideline guardrails', () => {
  it('does not use transition: all', () => {
    for (const file of wxssFiles) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/transition\s*:\s*all\b/i)
    }
  })

  it('does not attach tap handlers directly to text nodes', () => {
    for (const file of wxmlFiles) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/<text\b[^>]*(?:bindtap|catchtap)=/i)
    }
  })

  it('gives editable controls an accessible label', () => {
    for (const file of wxmlFiles) {
      const controls = readFileSync(file, 'utf8').match(/<(?:input|textarea|slider)\b[^>]*>/gi) ?? []
      for (const control of controls) {
        expect(control, `${file}: ${control}`).toMatch(/aria-label="[^"]+"/i)
      }
    }
  })

  it('uses the accessible minimum text token', () => {
    const appStyles = readFileSync(join(miniProgramRoot, 'app.wxss'), 'utf8')
    expect(appStyles).toContain('--font-size-xs: 24rpx;')
  })
})
```

- [ ] **Step 2: 运行测试并确认当前代码失败**

Run: `npm test -- tests/ui-guidelines.test.ts`

Expected: FAIL，至少报告 `transition: all`、可点击 `text`、表单缺少 `aria-label` 和 `--font-size-xs: 20rpx`。

- [ ] **Step 3: 记录当前基线**

Run: `git diff -- tests/ui-guidelines.test.ts`

Expected: 只显示新增测试文件，不包含页面实现修改。

---

### Task 2: 修复全局主题与通用交互样式

**Files:**
- Modify: `miniprogram/app.wxss`
- Test: `tests/ui-guidelines.test.ts`

- [ ] **Step 1: 提升颜色和字号对比度**

将主题变量改为：

```css
--color-primary: #087f45;
--color-primary-deep: #066b38;
--color-primary-light: #e8f8f0;
--color-text-secondary: #626b78;
--color-text-tertiary: #737b87;
--color-warning: #a45100;
--color-danger: #c51d34;
--color-info: #0969c3;
--font-size-xs: 24rpx;
```

- [ ] **Step 2: 增加通用按钮和按压状态**

在 `app.wxss` 追加：

```css
button::after {
  border: none;
}

.btn-primary,
.btn-ghost,
.ui-action {
  min-height: 88rpx;
  touch-action: manipulation;
}

.btn-primary:active,
.interactive-pressed {
  opacity: 0.82;
}

.btn-ghost:active {
  background: #eef0f2;
}

.ui-action {
  margin: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  color: inherit;
  font: inherit;
  line-height: inherit;
  text-align: inherit;
}

.ui-action[disabled] {
  opacity: 0.55;
}

.ui-action-text {
  min-width: 88rpx;
  min-height: 72rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-live {
  word-break: break-word;
}
```

- [ ] **Step 3: 为状态标签改用高对比文字色**

```css
.tag-success {
  background: var(--color-primary-light);
  color: var(--color-primary-deep);
}
```

- [ ] **Step 4: 运行静态审查测试**

Run: `npm test -- tests/ui-guidelines.test.ts`

Expected: 字号 token 测试 PASS；其余页面相关测试仍 FAIL。

- [ ] **Step 5: 检查差异**

Run: `git diff -- miniprogram/app.wxss tests/ui-guidelines.test.ts`

Expected: 只有全局主题和测试改动。

---

### Task 3: 修复推荐首页语义、触控和动画

**Files:**
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/index/index.wxss`
- Test: `tests/ui-guidelines.test.ts`

- [ ] **Step 1: 为状态区域增加可感知语义**

将加载、空状态和降级提示增加：

```xml
aria-live="polite"
aria-label="正在生成推荐"
```

定位提示、候选卡片和不足提示保留复杂 `view`，增加 `aria-role="button"`、具体 `aria-label` 和 `hover-class="interactive-pressed"`。候选标签使用候选名称、类型、耗时和花费拼成可读名称，不把装饰 emoji 作为唯一信息。

- [ ] **Step 2: 将评分、重置和筛选选项改成按钮语义**

使用以下模式替换 `rating-option`、`rating-skip`、`panel-reset`、`option-chip`：

```xml
<button
  class="ui-action option-chip {{isActive ? 'option-active' : ''}}"
  aria-label="{{label}}，{{isActive ? '已选中' : '未选中'}}"
  hover-class="interactive-pressed"
  bindtap="handler"
>{{label}}</button>
```

保留现有 `data-value`、`data-rating` 和事件处理函数。

- [ ] **Step 3: 为距离滑块增加名称**

```xml
<slider
  aria-label="最大距离，当前 {{conditions.maxDistanceKm}} 公里"
  min="1"
  max="{{distanceMax}}"
  step="1"
  value="{{conditions.maxDistanceKm}}"
  bindchange="onDistanceChange"
/>
```

- [ ] **Step 4: 修复首页 WXSS**

完成以下修改：

```css
.candidate-name,
.reason-text,
.banner-text,
.shortfall-text {
  min-width: 0;
  word-break: break-word;
}

.option-chip,
.rating-option,
.rating-skip,
.panel-reset {
  min-height: 72rpx;
  touch-action: manipulation;
}

.option-chip {
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}

.panel {
  overscroll-behavior: contain;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .panel {
    animation: none;
  }

  .candidate-card,
  .rating-option,
  .option-chip {
    transition: none;
  }
}
```

- [ ] **Step 5: 运行测试**

Run: `npm test -- tests/ui-guidelines.test.ts`

Expected: `transition: all` 不再从首页报错；其他页面缺少标签仍可能 FAIL。

---

### Task 4: 修复表单与弹层页面

**Files:**
- Modify: `miniprogram/pages/pantry/pantry.wxml`
- Modify: `miniprogram/pages/pantry/pantry.wxss`
- Modify: `miniprogram/pages/submission/submission.wxml`
- Modify: `miniprogram/pages/submission/submission.ts`
- Modify: `miniprogram/pages/submission/submission.wxss`
- Modify: `miniprogram/pages/shopping-list/shopping-list.wxml`
- Modify: `miniprogram/pages/shopping-list/shopping-list.wxss`
- Modify: `miniprogram/pages/admin-review/admin-review.wxml`
- Modify: `miniprogram/pages/admin-review/admin-review.wxss`
- Modify: `miniprogram/pages/preference/preference.wxml`
- Modify: `miniprogram/pages/preference/preference.wxss`
- Modify: `miniprogram/components/district-picker/district-picker.wxml`
- Modify: `miniprogram/components/district-picker/district-picker.wxss`
- Test: `tests/ui-guidelines.test.ts`

- [ ] **Step 1: 为所有编辑控件增加名称和输入属性**

每个 `input` / `textarea` 使用以下实际字段模式：

```xml
<input
  id="recipe-name"
  name="recipeName"
  aria-label="菜名，必填"
  class="form-input"
  placeholder="例如：番茄炒蛋…"
  value="{{form.name}}"
  bindinput="onNameInput"
  maxlength="30"
/>
```

数量、耗时使用 `type="digit"` 或 `type="number"`；食材和步骤 textarea 分别使用“食材清单，必填”“烹饪步骤，必填”。距离 slider 增加包含当前值的 `aria-label`。

- [ ] **Step 2: 将小文本操作改为按钮**

将编辑、删除、清理、切换自定义食材等可点击 `text/view` 改为：

```xml
<button
  class="ui-action ui-action-text action"
  data-id="{{item.id}}"
  hover-class="interactive-pressed"
  catchtap="onEditTap"
>编辑</button>
```

危险操作保留 `action-danger`，原有二次确认逻辑不变。

- [ ] **Step 3: 将选项 chip 改为按钮并暴露选中状态**

适用于食材目录、单位、餐次、口味和行政区：

```xml
<button
  class="ui-action chip {{selected ? 'chip-active' : ''}}"
  aria-label="{{item}}，{{selected ? '已选中' : '未选中'}}"
  data-value="{{item}}"
  hover-class="interactive-pressed"
  bindtap="onSelect"
>{{item}}</button>
```

- [ ] **Step 4: 防止投稿和审核重复提交**

投稿按钮与审核按钮增加：

```xml
disabled="{{submitting}}"
```

在 `submission.ts` 的 `onSubmit` 开头增加：

```ts
if (this.data.submitting) return
```

在管理员页面使用 `detail.submitting` 禁用通过和拒绝按钮；现有 loading 属性保留。

- [ ] **Step 5: 增加投稿内联错误状态**

在 `submission.ts` data 中增加：

```ts
formError: '',
```

每个校验失败分支使用：

```ts
this.setData({ formError: '请填写菜名' })
wx.showToast({ title: '请填写菜名', icon: 'none' })
return
```

表单顶部增加：

```xml
<view wx:if="{{formError}}" class="form-error status-live" aria-live="polite">
  {{formError}}
</view>
```

开始提交和提交成功时清空 `formError`。

- [ ] **Step 6: 修复弹层和触控样式**

所有 `.form-panel`、`.panel` 增加：

```css
overscroll-behavior: contain;
```

所有 chip 和文字按钮保证最小高度 `72rpx`；复选圆点保留 44rpx 视觉尺寸，但外层按钮触控尺寸不少于 `88rpx`。

- [ ] **Step 7: 运行测试**

Run: `npm test -- tests/ui-guidelines.test.ts`

Expected: 表单可访问名称和可点击 `text` 测试 PASS。

---

### Task 5: 修复导航、列表与详情页

**Files:**
- Modify: `miniprogram/pages/profile/profile.wxml`
- Modify: `miniprogram/pages/profile/profile.wxss`
- Modify: `miniprogram/pages/history/history.wxml`
- Modify: `miniprogram/pages/history/history.wxss`
- Modify: `miniprogram/pages/data-manage/data-manage.wxml`
- Modify: `miniprogram/pages/data-manage/data-manage.wxss`
- Modify: `miniprogram/pages/recipe-detail/recipe-detail.wxml`
- Modify: `miniprogram/pages/recipe-detail/recipe-detail.wxss`
- Modify: `miniprogram/pages/delivery-detail/delivery-detail.wxml`
- Modify: `miniprogram/pages/delivery-detail/delivery-detail.wxss`

- [ ] **Step 1: 为复杂导航卡片增加语义**

Profile、History 和 Admin Review 的复杂列表卡片保持 `view`，增加：

```xml
aria-role="button"
aria-label="打开 {{itemName}}"
hover-class="interactive-pressed"
```

纯文本管理行改成 `button.ui-action`，危险操作的 `aria-label` 明确包含“不可恢复”。装饰箭头增加 `aria-hidden="true"`。

- [ ] **Step 2: 将筛选 chip 改成按钮**

History 的类型和时间筛选使用 `button.ui-action.filter-chip`，在 `aria-label` 中包含“已选中/未选中”，保留原 `data-value` 和事件。

- [ ] **Step 3: 为加载、空状态和动态数据增加状态语义**

```xml
<view class="empty status-live" aria-live="polite">加载中…</view>
```

外卖动态字段区增加可读数据来源和更新时间，不把颜色作为营业状态的唯一提示。

- [ ] **Step 4: 增加长文本适配**

在相关 WXSS 中增加：

```css
.item-name,
.section-title,
.section-desc,
.recipe-name,
.recipe-desc,
.step-text,
.menu-name,
.source-note {
  min-width: 0;
  word-break: break-word;
}
```

需要单行展示的辅助字段使用 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`，不得挤压操作按钮。

- [ ] **Step 5: 增加安全区和按压反馈**

Profile scroll 内容增加底部安全区；导航卡片、历史项和管理行使用 `hover-class="interactive-pressed"`。

- [ ] **Step 6: 检查页面差异**

Run:

```powershell
git diff -- miniprogram/pages/profile miniprogram/pages/history miniprogram/pages/data-manage miniprogram/pages/recipe-detail miniprogram/pages/delivery-detail
```

Expected: 只包含语义、反馈、状态和文本适配，不包含业务服务修改。

---

### Task 6: 全量验证与复审输出

**Files:**
- Test: `tests/ui-guidelines.test.ts`
- Verify: `miniprogram/**/*.wxml`
- Verify: `miniprogram/**/*.wxss`
- Verify: `miniprogram/**/*.ts`

- [ ] **Step 1: 运行 UI 合规测试**

Run: `npm test -- tests/ui-guidelines.test.ts`

Expected: 4 tests PASS，0 failures。

- [ ] **Step 2: 运行全部自动化测试**

Run: `npm test`

Expected: 所有测试文件 PASS，0 failures。

- [ ] **Step 3: 运行 TypeScript 检查**

Run: `npm run typecheck`

Expected: exit code 0，无 TypeScript 错误。

- [ ] **Step 4: 执行残留模式扫描**

Run:

```powershell
rg -n "transition:\s*all|<text[^>]*(bindtap|catchtap)|\.\.\." miniprogram/pages miniprogram/components -g '*.wxml' -g '*.wxss'
```

Expected: 无命中；业务字符串中的合法英文句号不在扫描范围。

- [ ] **Step 5: 检查工作区差异**

Run: `git diff --check`

Expected: 无空白错误。

- [ ] **Step 6: 微信开发者工具冒烟测试**

按顺序验证：

1. 首页加载、候选点击、换一批、条件弹层和餐后评价。
2. 食材新增、编辑、删除、自定义食材和保质期选择。
3. 历史筛选、采购勾选、手动添加和删除。
4. 投稿校验、提交 loading 和管理员审核按钮禁用。
5. 数据清除确认、定位说明和行政区选择。
6. 窄屏、长菜名、长推荐理由、底部安全区和减少动态效果。

Expected: 导航和业务行为保持不变，所有触控目标可见反馈，长文本不横向溢出。

- [ ] **Step 7: 输出最终审查结果**

按 Web Interface Guidelines 的 `file:line` 格式列出仍无法在微信小程序中直接适用的规则；如果没有剩余可操作问题，逐文件或按模块标注通过。
