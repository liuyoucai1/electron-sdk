# 渲染流程 Demo

> 本文档用“用户点击了什么 -> 哪个函数触发 -> 哪个 store 改状态 -> 哪个组件渲染”的方式，串起当前项目从启动页到小屏、全屏、缩屏、最小化的主流程。

## 1. 总入口

项目启动后，Vue 首先渲染 `src/App.vue`。

核心结构：

代码位置：[src/App.vue:8](src/App.vue#L8)

```vue
<ClassroomLauncher v-if="!classStarted" @start="handleStartClass" />

<template v-else>
  <FloatingBall v-if="showFloatingBall" />
  <WidgetHost />
  <RouterView />
</template>
```

可以理解成：

```text
classStarted = false
  -> 显示 ClassroomLauncher 启动页

classStarted = true
  -> 显示 FloatingBall 胶囊
  -> 挂载 WidgetHost
  -> 挂载 RouterView
```

初始化时还会执行：

代码位置：[src/App.vue:40](src/App.vue#L40)，[src/stores/layout.js:12](src/stores/layout.js#L12)

```js
layoutStore.initializeScale();
```

它负责按当前屏幕、DPI 和 1920x1080 设计基座计算全局 `appScale`。

## 2. 点击“开始上课”

入口组件：

```text
src/components/ClassroomLauncher.vue
```

点击“开始上课”后，启动页发出事件：

代码位置：[src/components/ClassroomLauncher.vue:195](src/components/ClassroomLauncher.vue#L195)

```js
emit("start", {
  gradeId,
  classId,
  subjectId,
});
```

`App.vue` 接收：

代码位置：[src/App.vue:108](src/App.vue#L108)

```js
function handleStartClass(payload) {
  classSession.value = payload;
  classStarted.value = true;
}
```

状态变化：

```text
classStarted: false -> true
```

页面变化：

```text
ClassroomLauncher
  -> FloatingBall + WidgetHost + RouterView
```

此时还没有业务流程，`flowStore.viewMode = 'idle'`，所以用户主要看到胶囊。

## 3. 点击胶囊“问”

入口组件：

```text
src/components/FloatingBall.vue
```

胶囊点击“问”后，发出：

代码位置：[src/components/FloatingBall.vue:177](src/components/FloatingBall.vue#L177)

```js
emit("quick-action", "ask");
```

`App.vue` 接收：

代码位置：[src/App.vue:125](src/App.vue#L125)

```js
function handleQuickAction(actionKey) {
  if (actionKey !== 'ask') return;

  const target = flowStore.startAskFlow();
  smallPageStore.openPage(target.pageType, target.props);
  widgetStore.closeWidget();
}
```

`flowStore.startAskFlow()` 做的事：

代码位置：[src/stores/flow.js:130](src/stores/flow.js#L130)

```js
activeFlow = 'ask';
currentStep = 'ask-entry';
viewMode = 'small-page';
sessionId = `ask-${Date.now()}`;
fullscreenRoute = '/ask/fullscreen';
```

并返回：

```js
createSmallPageTarget('ask-entry', {
  sessionId,
});
```

随后：

代码位置：[src/stores/smallPage.js:112](src/stores/smallPage.js#L112)

```js
smallPageStore.openPage('ask-entry');
```

`smallPageStore` 中 `ask-entry` 的预设：

代码位置：[src/stores/smallPage.js:16](src/stores/smallPage.js#L16)

```js
"ask-entry": {
  title: "发起提问",
  width: 470,
  height: 640,
  position: "follow-ball",
  showFloatingBall: true,
}
```

状态变化：

```text
flowStore.viewMode = 'small-page'
smallPageStore.activePage.type = 'ask-entry'
```

页面变化：

```text
FloatingBall
  + WidgetHost 渲染 AskEntryWidget
```

## 4. 普通小屏如何显示

负责组件：

```text
src/components/widget/WidgetHost.vue
```

普通小屏渲染条件：

代码位置：[src/components/widget/WidgetHost.vue:1](src/components/widget/WidgetHost.vue#L1)

```vue
<section v-if="flowStore.viewMode === 'small-page' && currentSmallPage">
  <component
    :is="currentSmallPage"
    v-bind="smallPageStore.activePage.props"
    @flow-action="handleFlowAction"
  />
</section>
```

也就是：

```text
flowStore.viewMode === 'small-page'
smallPageStore.activePage.type 有值
  -> WidgetHost 从 widgetRegistry 找组件并渲染
```

例如：

```text
activePage.type = 'ask-entry'
  -> 渲染 AskEntryWidget
```

普通小屏不套 `WidgetShell`。

## 5. 点击单选题 / 单题提问

入口组件：

```text
AskEntryWidget
```

业务组件不直接跳路由，而是发出流程事件：

代码位置：[src/views/ask/widgets/AskEntryWidget.vue:197](src/views/ask/widgets/AskEntryWidget.vue#L197)

```js
emit('flow-action', {
  action: 'open-answer-progress',
  questionType,
  optionCount,
  entrySource,
});
```

`WidgetHost` 接收：

代码位置：[src/components/widget/WidgetHost.vue:303](src/components/widget/WidgetHost.vue#L303)

```js
function handleFlowAction(payload) {
  const target = flowStore.handleAskWidgetAction(payload);
}
```

`flowStore.handleAskWidgetAction()` 根据 `ASK_ACTION_HANDLERS` 分发：

代码位置：[src/stores/flow.js:16](src/stores/flow.js#L16)，[src/stores/flow.js:151](src/stores/flow.js#L151)

```js
const ASK_ACTION_HANDLERS = {
  'open-answer-progress': 'openAnswerProgress',
  'finish-answering': 'finishAnswering',
  'open-select-question': 'openSelectQuestion',
  // ...
};
```

所以这里会执行：

代码位置：[src/stores/flow.js:197](src/stores/flow.js#L197)

```js
flowStore.openAnswerProgress(payload);
```

`openAnswerProgress()` 做的事：

代码位置：[src/stores/flow.js:197](src/stores/flow.js#L197)

```js
currentStep = 'answer-progress';
viewMode = 'small-page';
answerProgressEntry = payload.entrySource || 'ask-entry';

nextStep = 'single-analysis';
nextViewMode = 'fullscreen';
fullscreenRoute = '/ask/objective-detail';
```

并返回：

```js
createSmallPageTarget('answer-progress', {
  sessionId,
  questionType,
  optionCount,
  entrySource,
});
```

`WidgetHost` 收到 `displayMode === 'small-page'`：

代码位置：[src/components/widget/WidgetHost.vue:336](src/components/widget/WidgetHost.vue#L336)

```js
smallPageStore.openPage(target.pageType, target.props);
```

状态变化：

```text
smallPageStore.activePage.type:
  ask-entry -> answer-progress
```

页面变化：

```text
AskEntryWidget
  -> AnswerProgressWidget
```

## 6. 点击“结束答题”

入口组件：

```text
AnswerProgressWidget
```

点击结束答题后发出：

代码位置：[src/views/ask/widgets/AnswerProgressWidget.vue:166](src/views/ask/widgets/AnswerProgressWidget.vue#L166)

```js
emit('flow-action', {
  action: 'finish-answering',
});
```

`WidgetHost` 继续交给：

代码位置：[src/components/widget/WidgetHost.vue:303](src/components/widget/WidgetHost.vue#L303)

```js
flowStore.handleAskWidgetAction(payload);
```

`finish-answering` 对应：

代码位置：[src/stores/flow.js:221](src/stores/flow.js#L221)

```js
flowStore.finishAnswering();
```

`finishAnswering()` 做的事：

代码位置：[src/stores/flow.js:221](src/stores/flow.js#L221)

```js
currentStep = 'single-analysis';
viewMode = 'fullscreen';
fullscreenRoute = '/ask/objective-detail';
nextStep = null;
nextViewMode = null;
```

并返回：

```js
{
  displayMode: 'fullscreen',
  route: '/ask/objective-detail',
  query,
}
```

`WidgetHost` 收到 `displayMode === 'fullscreen'`：

代码位置：[src/components/widget/WidgetHost.vue:323](src/components/widget/WidgetHost.vue#L323)

```js
smallPageStore.closePage();
widgetStore.closeWidget();
router.push({
  path: target.route,
  query: target.query,
});
```

状态变化：

```text
flowStore.viewMode = 'fullscreen'
smallPageStore.activePage = null
```

页面变化：

```text
AnswerProgressWidget 普通小屏
  -> RouterView 渲染 /ask/objective-detail 全屏页
```

## 7. 全屏页点击“缩屏”

全屏页面通常使用：

```text
src/views/ask/composables/useAskFullscreenControls.js
```

点击缩屏后，最终会调用：

代码位置：[src/views/ask/composables/useAskFullscreenControls.js](src/views/ask/composables/useAskFullscreenControls.js)，[src/stores/flow.js:528](src/stores/flow.js#L528)

```js
flowStore.shrinkFullscreenToCompact();
```

`shrinkFullscreenToCompact()` 做的事：

代码位置：[src/stores/flow.js:528](src/stores/flow.js#L528)

```js
viewMode = 'compact';
```

并根据当前页面决定缩屏类型：

```js
widgetType =
  batch-analysis -> 'multi-batch-compact'
  read-recite / voice -> 'read-recite-analysis-compact'
  default -> 'analysis-compact'
```

返回：

```js
{
  displayMode: 'compact',
  widgetType,
  props,
}
```

随后打开缩屏：

代码位置：[src/stores/widget.js:37](src/stores/widget.js#L37)

```js
widgetStore.openWidget(widgetType, props);
router.replace('/');
```

状态变化：

```text
flowStore.viewMode = 'compact'
widgetStore.activeWidget.type = 'analysis-compact'
```

页面变化：

```text
全屏路由页面
  -> 回到 /
  -> WidgetHost + WidgetShell 渲染缩屏
```

## 8. 缩屏如何显示

负责组件：

```text
src/components/widget/WidgetHost.vue
src/components/widget/WidgetShell.vue
```

`WidgetHost` 缩屏渲染条件：

代码位置：[src/components/widget/WidgetHost.vue:29](src/components/widget/WidgetHost.vue#L29)

```vue
<WidgetShell
  v-else-if="flowStore.viewMode === 'compact' && currentWidget"
  :widget="widgetStore.activeWidget"
>
  <component :is="currentWidget" />
</WidgetShell>
```

也就是：

```text
flowStore.viewMode === 'compact'
widgetStore.activeWidget.type 有值
  -> WidgetHost 渲染 WidgetShell
  -> WidgetShell 内部渲染缩屏业务组件
```

`WidgetShell` 负责：

- 缩屏定位
- 缩屏拖拽
- 外层视觉缩放
- 边界限制

缩屏业务组件只负责内容。

## 9. 缩屏点击“最小化”

缩屏组件发出：

代码位置：[src/views/ask/widgets/AnalysisCompactWidget.vue](src/views/ask/widgets/AnalysisCompactWidget.vue)

```js
emit('minimize');
```

`WidgetHost` 接收：

代码位置：[src/components/widget/WidgetHost.vue:368](src/components/widget/WidgetHost.vue#L368)

```js
function handleMinimize() {
  flowStore.minimizeWidget();
  widgetStore.minimizeWidget();
}
```

`flowStore.minimizeWidget()`：

代码位置：[src/stores/flow.js:576](src/stores/flow.js#L576)

```js
minimizedFrom = 'compact';
viewMode = 'minimized';
```

`widgetStore.minimizeWidget()`：

代码位置：[src/stores/widget.js:94](src/stores/widget.js#L94)

```js
activeWidget.mode = 'minimized';
```

`WidgetHost` 进入最小化渲染：

代码位置：[src/components/widget/WidgetHost.vue:19](src/components/widget/WidgetHost.vue#L19)

```vue
<button
  v-else-if="flowStore.viewMode === 'minimized' && widgetStore.activeWidget"
  class="minimized-trigger"
>
  {{ widgetStore.activeWidget.title }}
</button>
```

页面变化：

```text
WidgetShell 缩屏
  -> 右侧最小化激活按钮
```

## 10. 点击最小化按钮恢复

点击右侧最小化按钮：

代码位置：[src/components/widget/WidgetHost.vue:390](src/components/widget/WidgetHost.vue#L390)

```js
handleRestore();
```

核心逻辑：

代码位置：[src/components/widget/WidgetHost.vue:390](src/components/widget/WidgetHost.vue#L390)，[src/stores/flow.js:602](src/stores/flow.js#L602)

```js
const target = flowStore.restoreWidget();

if (target.route) {
  widgetStore.closeWidget();
  router.push(target.route);
  return;
}

widgetStore.restoreWidget();
```

普通缩屏最小化恢复时：

代码位置：[src/stores/flow.js:602](src/stores/flow.js#L602)

```js
viewMode = 'compact';
```

页面变化：

```text
右侧最小化激活按钮
  -> WidgetHost + WidgetShell 缩屏
```

如果是从全屏直接最小化，恢复时会回到全屏路由。

## 11. 缩屏点击“全屏”

缩屏组件发出：

代码位置：[src/views/ask/widgets/AnalysisCompactWidget.vue](src/views/ask/widgets/AnalysisCompactWidget.vue)

```js
emit('fullscreen');
```

`WidgetHost` 接收：

代码位置：[src/components/widget/WidgetHost.vue:375](src/components/widget/WidgetHost.vue#L375)

```js
async function handleFullscreen() {
  const target = flowStore.expandWidgetToFullscreen();

  widgetStore.closeWidget();
  await router.push({
    path: target.route,
    query: target.query,
  });
}
```

`flowStore.expandWidgetToFullscreen()`：

代码位置：[src/stores/flow.js:622](src/stores/flow.js#L622)

```js
viewMode = 'fullscreen';
currentStep = FULLSCREEN_ROUTE_STEPS[fullscreenRoute] || currentStep;
```

返回：

```js
{
  viewMode: 'fullscreen',
  route: fullscreenRoute,
  query: fullscreenQuery || {},
}
```

页面变化：

```text
WidgetShell 缩屏
  -> RouterView 渲染 fullscreenRoute 对应全屏页
```

## 12. 缩屏或全屏点击“关闭”

缩屏关闭走：

代码位置：[src/components/widget/WidgetHost.vue:358](src/components/widget/WidgetHost.vue#L358)

```js
handleClose();
```

核心逻辑：

代码位置：[src/components/widget/WidgetHost.vue:358](src/components/widget/WidgetHost.vue#L358)，[src/stores/flow.js:709](src/stores/flow.js#L709)

```js
const target = flowStore.resetFlow();
smallPageStore.closePage();
widgetStore.closeWidget();
router.replace(target.route);
```

状态变化：

```text
flowStore 回到初始状态
smallPageStore.activePage = null
widgetStore.activeWidget = null
```

页面变化：

```text
当前业务页面 / 小屏 / 缩屏
  -> 回到胶囊 / 悬浮球
```

注意：关闭业务流程不等于下课，课堂状态 `classStarted` 仍然是 `true`。

## 13. 一条完整链路

```text
项目启动
  -> App.vue
  -> classStarted = false
  -> 显示 ClassroomLauncher

点击开始上课
  -> handleStartClass()
  -> classStarted = true
  -> 显示 FloatingBall + WidgetHost + RouterView

点击问
  -> handleQuickAction('ask')
  -> flowStore.startAskFlow()
  -> smallPageStore.openPage('ask-entry')
  -> WidgetHost 显示 AskEntryWidget

点击单题 / 单选题
  -> emit flow-action open-answer-progress
  -> flowStore.openAnswerProgress()
  -> smallPageStore.openPage('answer-progress')
  -> WidgetHost 显示 AnswerProgressWidget

点击结束答题
  -> emit flow-action finish-answering
  -> flowStore.finishAnswering()
  -> router.push('/ask/objective-detail')
  -> RouterView 显示全屏分析页

点击缩屏
  -> flowStore.shrinkFullscreenToCompact()
  -> widgetStore.openWidget('analysis-compact')
  -> router.replace('/')
  -> WidgetHost + WidgetShell 显示缩屏

点击最小化
  -> flowStore.minimizeWidget()
  -> widgetStore.minimizeWidget()
  -> WidgetHost 显示右侧最小化按钮

点击恢复
  -> flowStore.restoreWidget()
  -> widgetStore.restoreWidget()
  -> 回到缩屏

点击全屏
  -> flowStore.expandWidgetToFullscreen()
  -> router.push(fullscreenRoute)
  -> 回到全屏页
```

## 14. 以后自己看代码的顺序

建议按这个顺序看：

```text
1. src/App.vue
2. src/stores/flow.js
3. src/stores/smallPage.js
4. src/stores/widget.js
5. src/components/widget/WidgetHost.vue
6. src/components/widget/WidgetShell.vue
7. src/components/widget/widgetRegistry.js
8. 具体业务组件，例如 AskEntryWidget / AnswerProgressWidget
9. src/router/index.js
```

如果你不知道某个按钮点了以后去哪，优先搜：

```text
emit('flow-action'
payload.action
ASK_ACTION_HANDLERS
```

这三处基本能顺到完整链路。
