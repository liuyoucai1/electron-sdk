# 项目协作规范

## 技术栈介绍

- 运行形态：Electron 桌面端应用，前端由 Vite 提供开发服务，Electron 主进程加载本地页面。
- 前端框架：Vue 3，使用 `<script setup>` 和单文件组件组织页面与组件。
- 构建工具：Vite 6，配置文件为 `vite.config.mjs`。
- 路由：Vue Router 4，路由入口在 `src/router/index.js`。
- 状态管理：Pinia，业务 store 放在 `src/stores`。
- UI 组件库：Element Plus。已在 `src/main.js` 全局注册，Element 默认样式覆盖集中放在 `src/style/element.scss`。
- 样式方案：Sass / SCSS。全局样式入口为 `src/style/index.scss`，组件自身样式优先写在组件内 `<style scoped lang="scss">`。
- Electron 主进程：`electron/main.cjs`，预加载脚本为 `electron/preload.cjs`。
- 本地后端：`server/backend.cjs`，通过 Electron IPC 或本地逻辑提供后端能力。
- 常用命令：
  - `npm run dev`：同时启动 Vite 和 Electron。
  - `npm run dev:vite`：只启动 Vite。
  - `npm run dev:electron`：只启动 Electron。
  - `npm run build`：构建前端产物。
  - `npm run lint`：检查 Electron / backend 的 CommonJS 语法。

## 目录规范

- `src/main.js`：前端应用入口，只做应用创建、插件注册、全局样式引入。
- `src/App.vue`：应用根组件，负责全局壳层、路由出口、全局悬浮层等根级逻辑。
- `src/router/`：路由配置目录。新增页面路由时只在这里集中注册，避免组件内散落硬编码跳转。
- `src/views/`：页面级 Vue 文件。只有能被路由直接访问的页面放在这里。
- `src/components/`：可复用组件目录。组件自己的结构、交互和局部样式尽量收敛在组件文件内。
- `src/style/`：全局 SCSS 目录。
  - `index.scss`：全局样式统一入口，只负责转发/引入其他样式文件。
  - `common.scss`：系统级通用样式、CSS 变量、设计 token、基础 reset。
  - `element.scss`：Element Plus 默认样式覆盖，只放和 Element Plus 相关的变量或选择器。
- `src/stores/`：Pinia store。跨组件共享状态放这里，组件私有状态留在组件内。
- `src/api/`：前端访问 Electron IPC、本地服务或后端能力的封装。
- `src/mock/`：mock 数据和临时演示数据。正式业务逻辑接入后应逐步清理无用 mock。
- `electron/`：Electron 主进程和 preload 相关代码。
- `server/`：本地 Node 后端代码。
- `dist/`：构建产物，不手写修改。
- 根目录文档：
  - `AGENTS.md`：给协作智能体和开发者看的项目约定。
  - `EZquizUI规范.md`：EzQuiz UI 设计规范源文档。
  - `README.md`：项目启动、构建和背景说明。

新增文件时遵循这些边界：页面进 `views`，复用 UI 进 `components`，全局样式进 `src/style`，组件样式进组件内部，Element Plus 覆盖只进 `element.scss`。

## EzQuiz UI 规范

以 `EZquizUI规范.md` 作为设计源文档。构建或修改 UI 时遵循以下项目级规则：

- 产品场景：教室一体机，优先按 1920x1080 设计；教师通常站在屏幕右侧，交互以触控优先。
- 优先使用右侧或底部交互区。重要触控热区尽量落在下半屏舒适触控范围内。
- 主色为 Green Sage：
  - `p700 #3D7A68`
  - `p600 #4A8A78`
  - `p500 #5B9F8A`
  - `p300 #A8C8C0`
  - `p200 #C8DDD6`
  - `p100 #E0EDE4`
  - `p50 #F0F7F4`
- 中性色：
  - `n950 #111418`, `n900 #1A1F24`, `n800 #2D3436`, `n700 #4A5568`
  - `n600 #636E72`, `n500 #7F8C8D`, `n400 #95A5A6`, `n300 #B2BEC3`
  - `n200 #DFE6E9`, `n150 #EEF1F3`, `n100 #F5F6F7`, `n50 #FAFBFC`
- 语义色：
  - 警告 `#E8924F`
  - 错误/危险 `#D9827B`
  - 成功 `#27AE60`
- 阴影：
  - `sh1: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)`
  - `sh2: 0 2px 12px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)`
  - `sh3: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)`
  - `sh4: 0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)`
- 功能分区必须通过背景色明确区分，避免大面积同色平铺导致内容混乱。
- 主卡片/面板使用白色；页面/画布背景使用 `n100`；次级区域使用 `n50`；选中/激活区域使用 `p50`。
- 主按钮使用 `p500` 背景、白色文字，hover 使用 `p600`，active 使用 `p700`。
- 次按钮使用白色背景、`p500` 描边、`p600` 文字，hover 背景使用 `p50`。
- 触控目标一般不小于 48px 高。完整操作按钮通常为 56px 高、16px 圆角。
- 控制图标风格：`strokeWidth 1.75`，圆角端点/连接，图标尺寸 16-20px。
- 只有真正需要视图导航时才使用 Tab。小弹窗、Mini 弹窗、侧边弹窗不使用 Tab。

## 样式结构

- 全局 Sass 入口：`src/style/index.scss`。
- 系统公共样式和设计 token：`src/style/common.scss`。
- Element Plus 覆盖样式：`src/style/element.scss`。
- 组件自己的视觉样式默认写在 Vue 组件内部，使用 `<style scoped lang="scss">`。
- 只有真正的全局工具类、设计 token、基础 reset 或 Element Plus 覆盖才放进 `src/style`。
- 修改 Element Plus 默认样式时，必须放到 `src/style/element.scss`，优先使用 CSS 变量或窄作用域选择器。

## 开发规范

- Vue 单文件组件必须按固定顺序书写：`<template>`、`<script setup>`、`<style scoped lang="scss">`。
- Vue 组件脚本统一使用 Composition API 的 `script setup` 写法，不使用 Options API。
- 组件内方法必须写注释，说明方法用途；复杂方法还需要说明关键参数、边界条件或副作用。
- 方法注释写在方法声明上方，保持简洁，不写空泛描述。
- 示例：

```vue
<template>
  <section class="example-panel"></section>
</template>

<script setup>
// 处理面板展开状态切换。
function togglePanel() {
  // ...
}
</script>

<style scoped lang="scss">
.example-panel {
  display: block;
}
</style>
```
