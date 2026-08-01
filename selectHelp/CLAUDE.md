# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供在本仓库中工作的指导。

## 项目概述

**selectHelp** — 原生 TypeScript 微信小程序，帮助用户决定每餐吃什么。它将自做菜品和外卖选项统一到一个推荐池中。

- App ID: `wxd2743eb937c8d3b6`
- 首发城市：深圳，后续可扩展
- 当前阶段：早期开发（需求文档已完成，模板脚手架已搭建）

## 开发方式

本项目是微信小程序，使用**微信开发者工具**进行构建、预览和调试。没有 CLI 构建/lint/测试命令——所有开发均在微信开发者工具内完成。

- 在微信开发者工具中打开项目根目录即可开始开发。
- `miniprogram/` 目录是小程序根目录（由 `project.config.json` → `miniprogramRoot` 配置）。
- TypeScript 由微信开发者工具内置的编译器插件编译（无需单独的 tsc 步骤）。
- Skyline 渲染引擎已启用（`project.config.json` 中 `skylineRenderEnable: true`）。

## 架构

```
selectHelp/
├── miniprogram/           # 小程序源码（应用根目录）
│   ├── app.ts             # 应用入口 — onLaunch 处理登录和本地存储初始化
│   ├── app.json           # 页面注册、窗口配置、全局样式
│   ├── app.wxss           # 全局样式
│   ├── pages/             # 页面目录（每个页面是独立单元）
│   │   ├── index/         # 主页（模板脚手架，后续替换）
│   │   └── logs/          # 日志页（模板脚手架）
│   └── utils/             # 公共工具函数
├── typings/               # TypeScript 类型定义（微信 API 类型）
├── docs/superpowers/specs/# 设计文档和需求
├── project.config.json    # 微信开发者工具项目配置
├── tsconfig.json          # TypeScript 配置（strict 模式, ES2020, CommonJS）
└── package.json           # 最小化 — 仅 devDependency: miniprogram-api-typings
```

### 关键模式

- **页面使用 `Component()` 而非 `Page()`**。这是现代 Glass-Easel 组件模式。页面生命周期放在 `lifetimes` 中（如 `lifetimes.attached()`），事件处理函数放在 `methods` 中。
- **Glass-Easel 组件框架**（`app.json` 中 `"componentFramework": "glass-easel"`）— 较新的 WXML 组件模型。
- **页面没有 `.js` 文件** — 所有逻辑在 `.ts` 文件中，由微信开发者工具编译。
- 当前仓库中尚**无云端/后端代码**。云端服务将根据需求文档另行添加。

### 关键需求参考

完整产品需求文档位于 `docs/superpowers/specs/2026-07-27-selecthelp-meal-decision-design.md`。核心设计决策：

- **推荐算法**：规则评分 + 加权随机，不依赖大模型。
- **每批 3 个候选**，自做和外卖混合，由匹配度动态决定比例。
- **数据本地优先**：偏好、食材、历史、评价通过 `wx.getStorageSync`/`wx.setStorageSync` 本地存储。
- **云端数据**：匿名用户标识、公共菜谱、用户投稿、审核记录。
- **外部服务**（定位、天气、外卖）必须通过统一适配接口接入，以便更换服务商。
- **优雅降级**：每个外部依赖失败时不能阻断核心推荐流程。
