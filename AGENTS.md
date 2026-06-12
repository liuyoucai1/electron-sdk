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
  - `src/views/ask/AskFullscreenView.vue`：问业务全屏承载页，负责全屏态自己的按钮和页面内交互。
  - `src/views/ask/widgets/`：问业务普通小屏和缩屏内容组件。组件只负责内容和发出业务事件，窗口外壳能力不要写在这里。
- `src/components/`：可复用组件目录。组件自己的结构、交互和局部样式尽量收敛在组件文件内。
  - `src/components/widget/WidgetHost.vue`：小屏和缩屏的统一宿主，负责根据流程状态渲染普通小屏、缩屏或最小化按钮。
  - `src/components/widget/WidgetShell.vue`：只服务缩屏形态，负责拖动、缩放、关闭、最小化、全屏等窗口外壳能力。
  - `src/components/widget/widgetRegistry.js`：普通小屏和缩屏内容组件注册表。
- `src/style/`：全局 SCSS 目录。
  - `index.scss`：全局样式统一入口，只负责转发/引入其他样式文件。
  - `common.scss`：系统级通用样式、CSS 变量、设计 token、基础 reset。
  - `element.scss`：Element Plus 默认样式覆盖，只放和 Element Plus 相关的变量或选择器。
- `src/stores/`：Pinia store。跨组件共享状态放这里，组件私有状态留在组件内。
  - `flow.js`：业务流程真相，维护 `activeFlow`、`currentStep`、`viewMode`、下一步和路由目标。
  - `smallPage.js`：普通小屏页面状态，只维护当前普通小屏的类型、尺寸和 props。
  - `widget.js`：缩屏窗口状态，只维护缩屏的位置、尺寸、缩放、zIndex 和最小化状态。
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

## 当前流程架构

### 显示形态

当前业务流程统一通过 `flowStore.viewMode` 判断显示形态：

- `idle`：无业务流程，显示胶囊 / 悬浮球。
- `small-page`：普通小屏页面。普通小屏只是业务承载页，不默认拥有缩放、最小化、全屏、拖动等窗口能力；按钮由页面组件自己控制。
- `fullscreen`：全屏路由页面。全屏页走 Vue Router，当前问业务路由为 `/ask/fullscreen`。
- `compact`：缩屏组件。缩屏才套 `WidgetShell`，拥有全屏、最小化、关闭、拖动、缩放等窗口外壳能力。
- `minimized`：缩屏最小化状态。只显示右侧最小化激活按钮，不显示胶囊 / 悬浮球。

### 问业务主流程

当前问业务按以下链路运行：

```text
点击胶囊“问”
  -> flowStore.startAskFlow()
  -> viewMode = 'small-page'
  -> smallPageStore.openPage('ask-entry')
  -> 显示 AskEntryWidget 普通小屏

点击单题提问
  -> flowStore.handleAskWidgetAction({ action: 'open-answer-progress' })
  -> viewMode = 'small-page'
  -> smallPageStore.openPage('answer-progress')
  -> 显示 AnswerProgressWidget 普通小屏

点击结束答题
  -> action = 'finish-answering'
  -> viewMode = 'fullscreen'
  -> router.push('/ask/fullscreen')
  -> 显示 AskFullscreenView

全屏页点击缩放
  -> flowStore.shrinkFullscreenToCompact()
  -> viewMode = 'compact'
  -> widgetStore.openWidget('analysis-compact')
  -> router.replace('/')
  -> 显示 400 x 800 的 AnalysisCompactWidget 缩屏

缩屏点击全屏
  -> flowStore.expandWidgetToFullscreen()
  -> router.push('/ask/fullscreen')

缩屏点击最小化
  -> viewMode = 'minimized'
  -> 只显示右侧最小化按钮

缩屏或全屏点击关闭
  -> flowStore.resetFlow()
  -> smallPageStore.closePage()
  -> widgetStore.closeWidget()
  -> router.replace('/')
  -> 回到胶囊 / 悬浮球
```

### 职责边界

- `flowStore` 负责决定“下一步是什么”和“以什么形态显示”，组件不要自己判断业务跳转目标。
- `smallPageStore` 只负责普通小屏承载状态，不处理窗口外壳能力。
- `widgetStore` 只负责缩屏窗口状态，不管理普通小屏。
- `WidgetHost` 是统一宿主，但普通小屏和缩屏的渲染方式不同：普通小屏直接渲染组件；缩屏通过 `WidgetShell` 渲染。
- `WidgetShell` 只用于 `compact` 缩屏，不能拿来包普通小屏页面。
- 全屏页面自己的按钮由全屏页面组件控制，不由 `WidgetShell` 控制。
- 胶囊 / 悬浮球只在 `viewMode === 'idle'` 时显示；`small-page`、`fullscreen`、`compact`、`minimized` 都不显示胶囊。

### 新增流程时的落点

- 新增普通小屏：在 `src/views/<业务>/widgets/` 新建组件，在对应 store 的普通小屏预设中补尺寸，并注册到 `widgetRegistry.js`。
- 新增缩屏：在 `src/views/<业务>/widgets/` 新建内容组件，在 `widgetStore` 里补缩屏预设，并注册到 `widgetRegistry.js`。缩屏尺寸和位置只在 `widgetStore` 管。
- 新增全屏页面：在 `src/views/<业务>/` 新建页面 Vue 文件，在 `src/router/index.js` 注册路由，并设置 `meta.fullscreen: true`。
- 新增流程动作：优先在 `flowStore` 中增加 action 或扩展 `handleAskWidgetAction()`，组件只通过 `emit('flow-action', payload)` 触发。

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
