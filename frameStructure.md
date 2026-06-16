# 小屏全屏流程架构

> 本文档描述当前 Electron 桌面端里启动页、胶囊、普通小屏、缩屏、最小化和全屏页面的实际架构。目录边界和协作规范以 `AGENTS.md` 为准，本文重点解释运行时流程。

## 1. 核心结论

当前项目采用一条业务流程线 + 多种显示形态的模型：

```text
App.vue
  -> ClassroomLauncher      课堂启动页
  -> FloatingBall           胶囊 / 悬浮球入口
  -> WidgetHost             普通小屏、缩屏、最小化统一宿主
  -> RouterView             全屏路由页面出口
```

关键原则：

- 普通小屏不是弹窗，也不是缩屏；它只是业务承载页。
- 缩屏才拥有窗口外壳能力，例如拖动、全屏、最小化、关闭。
- 全屏页面走 Vue Router。
- 流程判断集中在 `flowStore`，组件只发出业务意图。
- 尺寸适配集中在 `layoutStore` 和宿主层，业务组件不再单独处理 DPI。

## 2. 显示形态

当前显示形态由 `flowStore.viewMode` 统一表达：

| viewMode | 含义 | 渲染入口 |
| --- | --- | --- |
| `idle` | 无业务流程，显示胶囊 / 悬浮球 | `FloatingBall` |
| `small-page` | 普通小屏页面 | `WidgetHost` 直接渲染业务组件 |
| `fullscreen` | 全屏业务页面 | `RouterView` + Vue Router |
| `compact` | 缩屏 widget | `WidgetHost` + `WidgetShell` |
| `minimized` | 缩屏最小化 | `WidgetHost` 右侧最小化按钮 |

胶囊只在 `idle` 或被普通小屏显式允许共存时显示。全屏、缩屏、最小化状态不显示胶囊。

## 3. 运行时分层

```text
src/App.vue
  - 初始化 layoutStore.appScale
  - 控制课堂启动态 classStarted
  - 同步 Electron 透明窗口交互区域
  - 根据流程状态挂载 FloatingBall / WidgetHost / RouterView

src/components/ClassroomLauncher.vue
  - 课堂启动页
  - 使用 layoutStore.appScale 做外层缩放

src/components/FloatingBall.vue
  - 胶囊入口和快捷菜单
  - 使用全局缩放，但保留最小触控比例
  - 拖拽后把胶囊中心同步给 smallPageStore

src/components/widget/WidgetHost.vue
  - small-page：直接渲染普通小屏组件
  - compact：通过 WidgetShell 渲染缩屏组件
  - minimized：渲染右侧激活按钮

src/components/widget/WidgetShell.vue
  - 只服务 compact 缩屏
  - 负责缩屏的定位、拖拽、缩放画布、边界限制
```

## 4. Store 职责

### 4.1 `flowStore`

`flowStore` 是业务流程真相，负责决定下一步和显示形态。

主要职责：

- 当前业务线：`activeFlow`
- 当前步骤：`currentStep`
- 当前显示形态：`viewMode`
- 全屏路由目标：`fullscreenRoute`
- 全屏查询参数：`fullscreenQuery`
- 答题入口、批次、截图、语音等流程上下文
- 问业务动作分发：`ASK_ACTION_HANDLERS`

组件不要自己判断下一步跳哪个路由。新增问业务动作时，先在 `ASK_ACTION_HANDLERS` 注册 action，再写小型 store action。

### 4.2 `smallPageStore`

`smallPageStore` 只维护普通小屏承载状态。

主要职责：

- 当前普通小屏类型、标题、设计宽高、props
- 普通小屏是否允许胶囊共存
- 普通小屏初始锚点和拖拽位置
- 胶囊当前位置，用于 `follow-ball` 小屏贴边定位

普通小屏不进入 `widgetStore`，也不套 `WidgetShell`。

### 4.3 `widgetStore`

`widgetStore` 只维护缩屏窗口状态。

主要职责：

- 当前缩屏类型、标题、设计尺寸、props
- 缩屏视觉位置 `x / y`
- 缩屏 `scale`
- `zIndex`
- 最小化状态

缩屏预设尺寸按 1920x1080 设计基座填写。实际视觉大小由 `layoutStore.appScale` 决定。

### 4.4 `layoutStore`

`layoutStore` 是全局布局缩放状态。

启动时计算一次：

```text
appScale = min(viewportWidth / 1920, viewportHeight / 1080) / sqrt(devicePixelRatio)
```

并限制在 `0.75` 到 `2` 之间。

这个策略面向学校一体机：高分辨率大屏 + 系统推荐缩放比例。它会做半 DPI 补偿，避免 4K 高缩放下界面过大，也避免完整补偿后小屏过小。

## 5. 自适应缩放边界

当前统一缩放覆盖：

- `ClassroomLauncher`
- `FloatingBall`
- 普通小屏
- 缩屏
- 最小化按钮的交互区域同步

后续新增需求时，默认不需要在业务组件里处理 DPI。只要新增内容经过已有宿主即可：

- 普通小屏：走 `smallPageStore` + `WidgetHost`
- 缩屏：走 `widgetStore` + `WidgetShell`
- 全屏：走 Vue Router

不要在业务组件里新增独立的 `window.innerWidth`、`window.devicePixelRatio` 或 `transform: scale(...)` 适配逻辑。

## 6. 问业务主流程

```text
点击胶囊“问”
  -> flowStore.startAskFlow()
  -> viewMode = 'small-page'
  -> smallPageStore.openPage('ask-entry')
  -> WidgetHost 显示 AskEntryWidget

点击单题提问
  -> emit('flow-action', { action: 'open-answer-progress' })
  -> flowStore.openAnswerProgress()
  -> smallPageStore.openPage('answer-progress')
  -> WidgetHost 显示 AnswerProgressWidget

点击选题提问
  -> emit('flow-action', { action: 'open-select-question', initialTab })
  -> flowStore.openSelectQuestion()
  -> smallPageStore.openPage('select-question')
  -> WidgetHost 显示 SelectQuestionWidget

选题后开始答题
  -> 单题：open-answer-progress
  -> 多题 / 主观题批次：start-question-batch-progress
  -> 进入答题进行中

结束答题
  -> flowStore.finishAnswering() 或 finishAnswerProgress()
  -> viewMode = 'fullscreen'
  -> router.push('/ask/objective-detail' 或 '/ask/multi-batch-analysis')

全屏点击缩屏
  -> useAskFullscreenControls().shrinkToCompact()
  -> flowStore.shrinkFullscreenToCompact()
  -> widgetStore.openWidget(...)
  -> router.replace('/')
  -> WidgetHost + WidgetShell 显示缩屏

缩屏点击全屏
  -> flowStore.expandWidgetToFullscreen()
  -> router.push(flowStore.fullscreenRoute)

缩屏点击最小化
  -> flowStore.minimizeWidget()
  -> widgetStore.minimizeWidget()
  -> WidgetHost 显示右侧最小化按钮

关闭流程
  -> flowStore.resetFlow()
  -> smallPageStore.closePage()
  -> widgetStore.closeWidget()
  -> router.replace('/')
  -> 回到胶囊 / 悬浮球
```

## 7. 新增页面和流程的落点

### 7.1 新增普通小屏

落点：

- 业务组件放到 `src/views/<业务>/widgets/`
- 在 `smallPageStore` 的普通小屏预设里补类型、设计尺寸、定位方式
- 在 `src/components/widget/widgetRegistry.js` 注册组件
- 组件通过 `emit('flow-action', payload)` 提交业务意图

普通小屏不要自己处理缩放、拖拽外壳、Electron 交互区。

### 7.2 新增缩屏

落点：

- 内容组件放到 `src/views/<业务>/widgets/`
- 在 `widgetStore` 的缩屏预设里补类型和设计尺寸
- 在 `widgetRegistry.js` 注册组件
- 缩屏控制按钮使用已有布局或 emit 事件交给 `WidgetHost`

缩屏外壳能力只放在 `WidgetShell`。

### 7.3 新增全屏页面

落点：

- 页面组件放到 `src/views/<业务>/`
- 在 `src/router/index.js` 注册路由
- 设置 `meta.fullscreen: true`
- 通用缩屏、最小化、关闭优先使用 `useAskFullscreenControls()`

全屏页可以有自己的页面按钮，但不要直接改 `smallPageStore` 和 `widgetStore` 拼流程。

### 7.4 新增流程动作

落点：

- 在 `flowStore` 顶部常量表补路由 / 步骤映射
- 在 `ASK_ACTION_HANDLERS` 注册 action
- 写小型 action 方法
- 返回统一 target：`displayMode`、`pageType`、`widgetType`、`route`、`query`

## 8. Electron 交互区域

项目使用透明 Electron 覆盖窗口。可交互区域由前端收集并同步给主进程：

```text
App.vue
  -> collectInteractiveRegions()
  -> element.getBoundingClientRect()
  -> electronBridge.setInteractiveRegions()
  -> main.cjs 根据鼠标位置控制 setIgnoreMouseEvents
```

因为使用 `getBoundingClientRect()`，外层 `transform: scale(...)` 后的视觉尺寸会被正确同步给 Electron。

需要参与鼠标命中的元素必须标记：

```html
data-overlay-hitbox="true"
```

当 DOM 尺寸、位置、展开状态变化后，触发：

```js
document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
```

## 9. 缩放测试方法

开发环境启动后，终端会输出 renderer 日志：

```text
[layout] viewport=1536x912, devicePixelRatio=2, appScale=0.75
```

重点看：

- `viewport`
- `devicePixelRatio`
- `appScale`

常见预期：

```text
1920x1080 @ 100%      appScale ≈ 0.95
1920x1080 @ 150%      appScale ≈ 0.75
3072x1920 @ 200%      appScale ≈ 0.75
3840x2160 @ 200%      appScale ≈ 0.75
3840x2160 @ 150%      appScale ≈ 1.08
```

当前策略在启动时计算一次。若后续允许跨屏移动，再扩展为监听主屏变化或重新初始化 `layoutStore`。

## 10. 一句话总结

```text
App.vue 挂根级入口。
layoutStore 管全局缩放。
FloatingBall 管胶囊入口。
WidgetHost 管普通小屏、缩屏和最小化。
WidgetShell 只管缩屏外壳。
flowStore 决定流程下一步。
smallPageStore 管普通小屏承载状态。
widgetStore 管缩屏窗口状态。
RouterView 管全屏页面。
业务组件只负责内容和发出业务意图。
```
