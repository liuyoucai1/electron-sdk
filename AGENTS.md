# 项目协作规范

## 技术栈介绍

- 运行形态：Electron 桌面端应用，前端由 Vite 提供开发服务，Electron 主进程加载本地页面。
- 前端框架：Vue 3，使用 `<script setup>` 和单文件组件组织页面与组件。
- 构建工具：Vite 6，配置文件为 `vite.config.mjs`。
- 路由：Vue Router 4，路由入口在 `src/router/index.js`。
- 状态管理：Pinia，业务 store 放在 `src/stores`。
- UI 组件库：Element Plus。通过 `src/plugins/elementPlus.js` 按需注册项目实际使用的组件和样式，Element 默认样式覆盖集中放在 `src/style/element.scss`。
- 样式方案：Sass / SCSS。全局样式入口为 `src/style/index.scss`，组件自身样式优先写在组件内 `<style scoped lang="scss">`。
- Electron 主进程：`electron/main.cjs`，预加载脚本为 `electron/preload.cjs`。
- 本地后端：`server/backend.cjs`，通过 Electron IPC 或本地逻辑提供后端能力。
- 常用命令：
  - `npm run dev`：同时启动 Vite 和 Electron。
  - `npm run dev:vite`：只启动 Vite。
  - `npm run dev:electron`：只启动 Electron。
  - `npm run build`：构建前端产物。
  - `npm run preview`：预览前端构建产物。
  - `npm run lint`：检查 Electron / backend 的 CommonJS 语法。
  - `npm test`：运行项目已有 Node 测试。

## 目录规范

- `src/main.js`：前端应用入口，只做应用创建、Pinia / Router / 插件注册、全局样式引入。
- `src/App.vue`：应用根组件，负责全局壳层、路由出口、全局悬浮层等根级逻辑。
- `src/router/`：路由配置目录。新增页面路由时只在这里集中注册，避免组件内散落硬编码跳转。
- `src/views/`：页面级 Vue 文件。只有能被路由直接访问的页面放在这里。
  - `src/views/ask/AskFullscreenView.vue`：问业务全屏承载页，负责全屏态自己的按钮和页面内交互。
  - `src/views/ask/widgets/`：问业务普通小屏和缩屏内容组件（客观题为主）。组件只负责内容和发出业务事件，窗口外壳能力不要写在这里。
    - `SelectQuestionWidget.vue`：选题提问普通小屏，负责自编 / 共享 / 教材 / 题库 Tab、选题勾选、主客观混选确认和发出流程事件。
  - `src/views/ask/components/selectQuestion/`：选题提问小屏内部业务组件，如左侧来源面板、中心题目列表、混选确认弹框等。
  - `src/views/ask/utils/buildAnswerProgressBatch.js`：选题提问进入多题答题进行中时的业务会话组装工具，属于问业务内部工具，不放 `src/shared`。
  - `src/views/ask/subjective/`：主观题（背诵 / 朗读等）小屏与内容组件。
    - `subjective/widgets/`：主观题普通小屏承载页，如 `ReadReciteWidget.vue`。
    - `subjective/components/`：主观题小屏内的 Tab 面板等业务子组件。
- `src/components/`：可复用组件目录。组件自己的结构、交互和局部样式尽量收敛在组件文件内。
  - `src/components/distribution/AnswerDistributionList.vue`：作答分布列表公共组件，统一处理进度条、学生名单展开、状态样式和图例展示。
  - `src/components/widget/WidgetHost.vue`：小屏和缩屏的统一宿主，负责根据流程状态渲染普通小屏、缩屏或最小化按钮。
  - `src/components/widget/WidgetShell.vue`：只服务缩屏形态，负责拖动、缩放、关闭、最小化、全屏等窗口外壳能力。
  - `src/components/widget/widgetRegistry.js`：普通小屏和缩屏内容组件注册表。注册表使用异步组件，避免应用启动时一次性加载所有业务 widget。
- `src/plugins/`：应用启动级插件注册目录。新增全局插件或按需组件注册时放这里，`src/main.js` 只负责安装。
  - `src/plugins/elementPlus.js`：Element Plus 按需注册入口，只注册项目实际使用到的组件和对应样式。
- `src/shared/`：跨业务、跨页面、无业务流程依赖的公共能力目录。这里的代码不能直接依赖 `views`、`stores` 或路由。
  - `src/shared/assets/`：通用资源处理，如图片 base64、Blob URL、资源释放。
  - `src/shared/html/`：通用 HTML 文本转义和净化。
  - `src/shared/layout/`：通用布局计算纯函数，如基于 1920x1080 设计稿计算应用缩放比例。
  - `src/shared/utils/`：纯函数工具，如答案分布判断、数字答案清洗、选题题型判断与 id 查找。
- `src/style/`：全局 SCSS 目录。
  - `index.scss`：全局样式统一入口，只负责转发/引入其他样式文件。
  - `common.scss`：系统级通用样式、CSS 变量、设计 token、基础 reset。
  - `element.scss`：Element Plus 默认样式覆盖，只放和 Element Plus 相关的变量或选择器。
- `src/stores/`：Pinia store。跨组件共享状态放这里，组件私有状态留在组件内。
  - `flow.js`：业务流程真相，维护 `activeFlow`、`currentStep`、`viewMode`、下一步和路由目标。问业务动作通过 `ASK_ACTION_HANDLERS` 分发表进入小型 action 方法，不再把新分支塞进一个巨大的 `handleAskWidgetAction()`。
  - `layout.js`：全局布局状态，启动时按 1920x1080 设计基座和当前主屏 CSS 视口计算 `appScale`，供普通小屏和缩屏统一缩放。
  - `smallPage.js`：普通小屏页面状态，只维护当前普通小屏的类型、尺寸和 props。
  - `widget.js`：缩屏窗口状态，只维护缩屏的位置、尺寸、缩放、zIndex 和最小化状态。
- `src/api/`：前端访问 Electron IPC、本地服务或后端能力的封装。可以依赖 `src/shared`，不要依赖 `src/views` 内部工具。
- `src/mock/`：mock 数据和临时演示数据。页面未画完前可以继续服务 UI 调试；正式业务逻辑接入后应逐步清理无用 mock。
  - `src/mock/selectQuestion.js`：选题提问自编 / 共享 / 教材 / 题库 Tab 的临时题目数据，后续接真实题库服务时替换数据来源。
- `src/utils/`：旧公共工具目录已迁移到 `src/shared`，不要再新增公共工具到这里。
- `tests/`：Node 测试目录。公共工具、服务端安全边界、流程 store 关键链路等行为应补测试。
- `electron/`：Electron 主进程和 preload 相关代码。
- `server/`：本地 Node 后端代码。
- `dist/`：构建产物，不手写修改。
- 根目录文档：
  - `AGENTS.md`：给协作智能体和开发者看的项目约定。
  - `frameStructure.md`：当前小屏、缩屏、全屏、胶囊和自适应缩放的运行时架构说明。
  - `渲染流程Demo.md`：从页面初始化到开始上课、问、小屏、全屏、缩屏、最小化、恢复的逐步渲染链路。
  - `EZquizUI规范.md`：EzQuiz UI 设计规范源文档。
  - `README.md`：项目启动、构建和背景说明。
  - `docs/项目巡检问题分析.md`：本轮项目扫描、问题分级和优化记录。
  - `docs/目录结构整理说明.md`：当前目录边界、公共抽离和后续目录建议。
  - `docs/vue/`、`docs/images/`：历史 UI 参考稿和截图资源，作为界面还原参考，不直接作为运行时代码依赖。

新增文件时遵循这些边界：页面进 `views`，复用 UI 进 `components`，跨业务纯工具进 `src/shared`，应用启动级插件进 `src/plugins`，全局样式进 `src/style`，组件样式进组件内部，Element Plus 覆盖只进 `element.scss`，不要再往 `src/utils` 增加公共工具。

## 构建与依赖约定

- 路由页面和 widget 内容组件优先懒加载，避免首屏一次性加载所有业务页面。
- `vite.config.mjs` 已按 `vendor-vue`、`vendor-element`、`vendor-echarts`、`vendor` 手动分包。新增大型依赖时先评估是否需要补 `manualChunks`，避免主入口 chunk 膨胀。
- Element Plus 新增组件时，在 `src/plugins/elementPlus.js` 里补组件和对应样式，不要在 `src/main.js` 中恢复全量 `use(ElementPlus)`。
- ECharts 按需从 `echarts/core` 注册图表、组件和 renderer，不要在业务页面全量引入 `echarts`。

## 当前流程架构

### 显示形态

当前业务流程统一通过 `flowStore.viewMode` 判断显示形态：

- `idle`：无业务流程，显示胶囊 / 悬浮球。
- `small-page`：普通小屏页面。普通小屏只是业务承载页，不默认拥有缩放、最小化、全屏、拖动等窗口能力；按钮由页面组件自己控制。
- `fullscreen`：全屏路由页面。全屏页走 Vue Router，问业务有多个全屏路由，如 `/ask/objective-detail`、`/ask/multi-batch-analysis`、`/ask/answer-progress`、`/ask/read-recite-analysis`、`/ask/voice-analysis` 等；`/ask/fullscreen` 只是保留的问业务全屏承载页之一。
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

点击选题提问入口（自编 / 共享 / 教材 / 题库）
  -> AskEntryWidget emit('flow-action', { action: 'open-select-question', initialTab })
  -> flowStore.openSelectQuestion()
  -> viewMode = 'small-page'
  -> smallPageStore.openPage('select-question')
  -> 显示 SelectQuestionWidget 普通小屏

选题提问选择 1 道客观题后点击开始提问
  -> action = 'open-answer-progress'
  -> entrySource = 'select-question'
  -> smallPageStore.openPage('answer-progress')
  -> 显示 AnswerProgressWidget 普通小屏
  -> 结束答题后进入 /ask/objective-detail

选题提问选择多道客观题或主观题答题入口
  -> action = 'start-question-batch-progress'
  -> flowStore.startQuestionBatchProgress()
  -> sourceType = 'question-batch'
  -> router.push('/ask/answer-progress')
  -> AnswerProgressView 按 currentQuestionIndex 展示当前题
  -> 点击下一题时 action = 'next-answer-progress-question'
  -> 最后一题点击结束答题时 action = 'finish-answer-progress'
  -> router.push('/ask/multi-batch-analysis')

点击结束答题
  -> action = 'finish-answering'
  -> viewMode = 'fullscreen'
  -> flowStore 根据 answerProgressEntry 决定目标
  -> 单题入口 router.push('/ask/objective-detail')
  -> 多题入口 router.push('/ask/multi-batch-analysis')

全屏页点击缩放
  -> useAskFullscreenControls().shrinkToCompact()
  -> flowStore.shrinkFullscreenToCompact()
  -> viewMode = 'compact'
  -> widgetStore.openWidget('analysis-compact')
  -> router.replace('/')
  -> 显示 400 x 800 的 AnalysisCompactWidget 缩屏

缩屏点击全屏
  -> flowStore.expandWidgetToFullscreen()
  -> router.push(flowStore.fullscreenRoute)

缩屏点击最小化
  -> viewMode = 'minimized'
  -> 只显示右侧最小化按钮

缩屏或全屏点击关闭
  -> useAskFullscreenControls().closeAskFlow()
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
- 全屏页面的缩屏、最小化、关闭、消费流程 target 等通用窗口控制优先使用 `src/views/ask/composables/useAskFullscreenControls.js`，避免各页面重复操作 `smallPageStore`、`widgetStore` 和 router。
- 胶囊 / 悬浮球在 `idle` 时显示；`small-page` 只有当前普通小屏显式 `showFloatingBall: true` 时才共存，例如 `ask-entry` 和普通语音出题入口。`fullscreen`、`compact`、`minimized` 不显示胶囊。
- 选题提问小屏是普通小屏，类型为 `select-question`，尺寸由 `smallPageStore` 的 `SMALL_PAGE_PRESETS` 管理；内部 Tab 初始值通过 `initialTab` 传入。
- 选题提问的主客观混选规则留在 `SelectQuestionWidget.vue` 和 `src/shared/utils/selectQuestion.js`，流程跳转仍由 `flowStore` 决定。

### `flowStore` 动作结构

- `handleAskWidgetAction(payload)` 只做动作分发，不继续堆业务分支。
- 新增问业务动作时，先在 `ASK_ACTION_HANDLERS` 注册 `payload.action` 到具体 store action。
- 具体流程写成小型 action 方法，例如 `openAnswerProgress()`、`finishAnswering()`、`startVoiceQuestion()`、`finishAnswerProgress()`。
- 路由和步骤映射优先补顶部常量表，例如 `ANSWER_PROGRESS_ENTRY_TARGETS`、`FINISH_ANSWERING_TARGETS`、`FULLSCREEN_ROUTE_STEPS`、`READ_RECITE_COMPACT_ROUTES`。
- 返回普通小屏目标优先使用 `createSmallPageTarget()` / `openSmallPage()`；返回全屏目标优先使用 `openFullscreen()`。
- 选题提问多题流程使用 `startQuestionBatchProgress()`、`nextAnswerProgressQuestion()` 和 `finishAnswerProgress()`；`answerProgressState.sourceType === 'question-batch'` 时结束后进入多题批次分析。

### 新增流程时的落点

- 新增普通小屏：在 `src/views/<业务>/widgets/` 新建组件，在对应 store 的普通小屏预设中补尺寸，并注册到 `widgetRegistry.js`。
- 新增缩屏：在 `src/views/<业务>/widgets/` 新建内容组件，在 `widgetStore` 里补缩屏预设，并注册到 `widgetRegistry.js`。缩屏尺寸和位置只在 `widgetStore` 管。
- 新增全屏页面：在 `src/views/<业务>/` 新建页面 Vue 文件，在 `src/router/index.js` 注册路由，并设置 `meta.fullscreen: true`。
- 新增流程动作：优先在 `flowStore` 中通过 `ASK_ACTION_HANDLERS` + 小型 action 方法注册，组件只通过 `emit('flow-action', payload)` 或调用已有 composable 提交业务意图。

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

## 自适应缩放约定

- 当前项目以 `1920x1080`、系统缩放 `100%` 作为设计基座，启动时由 `src/stores/layout.js` 调用 `calculateAppScale()` 计算一次 `appScale`。
- `appScale = min(当前视口宽度 / 1920, 当前视口高度 / 1080) / sqrt(devicePixelRatio)`，并限制在 `0.75` 到 `2` 之间。这里采用半 DPI 补偿，避免高 DPI 屏过大，同时保证主流屏幕和系统推荐缩放下的小屏不会过小。
- 启动页、普通小屏和缩屏只做外层 `transform: scale(appScale)`；业务组件内部继续按设计尺寸写宽高、间距和字号，不要在组件内部重复计算屏幕比例。
- 胶囊 / 悬浮球也跟随全局缩放，但保留独立最小触控比例，避免高 DPI 场景下按钮过小影响触控。
- 普通小屏的初始锚点、居中、跟随胶囊、拖拽边界都按缩放后的视觉尺寸计算；缩屏的默认位置和拖拽边界同样按 `widget.scale` 的视觉尺寸计算。
- 后续新增普通小屏或缩屏时，只在 `smallPageStore` / `widgetStore` 预设中填写 1920x1080 设计尺寸，不要在业务组件里自行读取 `window.innerWidth` 做局部缩放。
- 当前策略不处理跨屏移动后的实时重算。若后续允许窗口移动到其他屏幕，再统一扩展 `layoutStore.initializeScale()` 的触发时机和 Electron 主屏信息来源。

## 开发规范

- Vue 单文件组件必须按固定顺序书写：`<template>`、`<script setup>`、`<style scoped lang="scss">`。
- Vue 组件脚本统一使用 Composition API 的 `script setup` 写法，不使用 Options API。
- 组件内方法必须写注释，说明方法用途；复杂方法还需要说明关键参数、边界条件或副作用。
- 方法注释写在方法声明上方，保持简洁，不写空泛描述。

### 弹窗 / 抽屉组件约定

业务弹窗、设置面板、抽屉等**临时编辑态**组件，优先采用「自己的数据自己控制」模式，不要用 `v-model` 管显隐、也不要用一堆 props + watch 和父级双向同步草稿。

**核心原则**

- **子组件**：只管弹层显隐、内部草稿、按题型渲染表单；打开时一次性接收参数并初始化。
- **父组件**：只管业务真相数据（如 `correctAnswersMap`）；打开时组装参数并调用子组件方法；确认时接收 `emit('confirm')` 后更新自己的数据。
- **不要用 watch 串联父子弹窗状态**。父改 props → 子 watch 重建草稿 → 子改值 → 父 watch 持久化，这类链路容易形成递归更新，也难维护。

**推荐打开方式：`defineExpose` + 父级 `ref`**

子组件暴露 `handleOpen(params)`，父级通过 `ref` 命令式打开并传入本次所需上下文（题目 id、题型、已保存答案等）：

```vue
<!-- 父级 -->
<SetSingleAnswerDialog ref="setAnswerDialogRef" @confirm="handleAnswerConfirm" />
<button @click="handleSetAnswers(setAnswerDialogRef)">设置答案</button>
```

```js
// 子组件
const visible = ref(false);
const localValue = ref("");

function handleOpen(params = {}) {
  // 按 params 初始化内部草稿；已设置过答案则回显，否则给默认值
  initLocalValue(params.initialAnswer);
  visible.value = true;
}

function handleConfirm() {
  emit("confirm", { type: params.type, value: localValue.value });
  visible.value = false;
}

defineExpose({ handleOpen });
```

```js
// 父级或 composable：只负责拼打开参数，不维护 showDialog
function handleSetAnswers(dialogRef) {
  dialogRef?.handleOpen({
    questionIndex: currentPage.value,
    questionType: currentQuestionMeta.value.type,
    initialAnswer: currentSavedAnswer.value,
  });
}

function handleAnswerConfirm(payload) {
  correctAnswersMap.value[currentPage.value] = payload;
}
```

**props 边界**

- 子组件 props 只保留**与布局/环境相关**的配置，例如 `compact`（全屏 40% / 缩屏 70% 宽度）。
- 本次打开所需的业务上下文（题目 id、题型、选项数、初始答案、题目列表等）一律通过 `handleOpen(params)` 传入，不作为长期 props 绑定。

**持久化与全屏 / 缩屏同步**

- 设置答案、翻页等交互本身不需要 watch 自动持久化。
- 需要跨全屏与缩屏共享状态时，在**显式时机**调用持久化（如 `handleAnswerConfirm`、缩屏/全屏切换前），不要把 `persist` 和 `restore` 绑在同一组 reactive 依赖上。
- 全屏页的 `querySource` 以路由 `route.query` 为准，不要用会被 `persist` 回写的 store 字段作为 computed 依赖，避免 `persist → querySource 变 → restore → 再 persist` 死循环。

**参考实现**

- 单题设置答案：`src/views/ask/components/SetSingleAnswerDialog.vue`
- 批次设置答案：`src/views/ask/components/SetBatchAnswersDialog.vue`

**单文件组件结构示例**

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
