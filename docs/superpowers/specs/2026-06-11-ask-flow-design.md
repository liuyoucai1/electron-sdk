# “问”线路全流程 Demo 版设计

日期：2026-06-11  
项目：EZ Quiz 课堂 SDK Electron 桌面端  
设计来源：`docs/业务流程.md` 第 4 章与 `docs/images/` 对应截图

## 目标

实现“问”线路的可点击 Demo 版。教师从悬浮球点击“问”后，可以进入出题面板，并沿文档中的主要分支完成提问、答题进程、结果分析、设置答案、读背、语音、拍照分析和选题提问流程。

本次目标重在 UI 还原、路由连通和状态演示。真实学生端同步、语音识别、拍照采集、截屏采集、硬件设备调用先不接入，统一保留入口并用本地 mock 数据模拟结果。

## 范围

包含以下页面和弹窗：

- 点击问面板：参考 `点击问.png`，470×650 居中浮层。
- 多提提问：参考 `多提提问.png`，在点击问面板内部切换展示。
- 缩小答题进程：参考 `缩小答题进程.png`，用于单题和批量题的答题中状态。
- 客观题详情：参考 `客观题详情.png`，展示题目、选项、作答分布和单选设置答案弹窗。
- 多题详情：参考 `多题详情.png` 与 `多题详情-学生明细.png`，支持题目分析和学生明细两个视图。
- 多选设置答案：参考 `多选题设置答案.png`。
- 读背页面：参考 `读背.png`、`临时自编.png`、`满分作文.png`，支持 Tab 和内容选择入口。
- 按段落选择：参考 `按段落选择.png`，作为读背页面内弹窗。
- 朗背答题进行中：参考 `朗背答题进行中.png`，复用读背、语音、拍照分支的答题中页面。
- 读背判分：参考 `读背判分.png`。
- 语音题选择与语音出题：参考 `语音题选择.png`、`语音出题.png`。
- 语音分析与学生答题分析：参考 `语音分析.png`、`未设置题目语音分析.png`、`语音学生答题分析.png`。
- 选题提问：参考 `选题提问自编.png`、`选题提问共享.png`、`选题提问教材.png`、`选题提问题库.png`。
- 多题答题中：参考 `多题答题中.png`。
- 拍照分析：参考 `拍照分析.png`。

不包含“测”“析”线路，不接真实后端业务存储，不做真实学生端联动。

## 用户流程

悬浮球展开后点击“问”，显示点击问面板。面板内四类入口分别进入不同分支：

- 单选、多选、判断、数值进入 `/ask/progress`，结束后进入客观题详情。
- 多提提问在面板内配置题目数量、选项数量和每题题型，发起提问后进入 `/ask/progress?mode=batch`，结束后进入多题详情。
- 背诵、朗读进入 `/ask/recite`，选择内容后进入 `/ask/live?type=recite`，结束后进入读背判分。
- 语音打开语音题选择弹窗，可进入语音出题、截屏出题或先答题后设置题目，统一跳到朗背答题进行中，结束后进入语音分析。
- 自编、共享、教材、题库进入 `/ask/select?source=self|shared|textbook|bank`，在选题页面根据选择题目数量和题型跳转到单题进程、多题答题中、语音答题或拍照答题。

结果页底部控制栏提供设置答案、缩屏、返回、最小化和关闭等视觉入口。缩屏和最小化在 Demo 版中只改变页面或返回主页，不调用 Electron 窗口能力。

## 架构

路由集中在 `src/router/index.js` 注册。所有“问”线路页面放在 `src/views/ask/`，可复用组件放在 `src/views/ask/components/`，本地演示数据放在 `src/mock/askFlow.js`。

建议页面结构：

- `src/views/ask/AskEntryView.vue`：承载点击问面板，作为 `/ask` 页面。
- `src/views/ask/AskProgressView.vue`：缩小答题进程。
- `src/views/ask/ObjectiveDetailView.vue`：客观题详情。
- `src/views/ask/BatchDetailView.vue`：多题详情和学生明细。
- `src/views/ask/ReciteSelectView.vue`：读背页面。
- `src/views/ask/LiveAnswerView.vue`：朗背/语音/拍照答题进行中。
- `src/views/ask/ReciteScoreView.vue`：读背判分。
- `src/views/ask/VoiceAnalysisView.vue`：语音分析。
- `src/views/ask/VoiceStudentView.vue`：语音学生答题分析。
- `src/views/ask/QuestionSelectView.vue`：选题提问四 Tab。
- `src/views/ask/BatchAnswerView.vue`：多题答题中。
- `src/views/ask/PhotoAnalysisView.vue`：拍照分析。

复用组件：

- `AskPanel.vue`：点击问面板主 UI。
- `BatchAskPanel.vue`：多提提问子组件。
- `AnswerProgressCard.vue`：缩小答题进程卡片。
- `AskTopBar.vue`：全屏页面顶部栏。
- `AskBottomBar.vue`：全屏页面底部控制栏。
- `QuestionContent.vue`：题干和选项展示。
- `AnswerDistribution.vue`：作答分布图。
- `SetAnswerDialog.vue`：单题和多题设置答案弹窗。
- `StudentAnswerTable.vue`：多题学生明细表。
- `VoiceQuestionDialog.vue`：语音题选择和语音出题弹窗。
- `SegmentSelectDialog.vue`：按段落选择弹窗。

## 路由设计

- `/ask`：点击问面板，非全屏，保留悬浮球。
- `/ask/progress`：缩小答题进程，非全屏。
- `/ask/detail/:questionId`：客观题详情，全屏。
- `/ask/batch-detail`：多题详情，全屏。
- `/ask/recite`：读背页面，全屏。
- `/ask/live`：朗背、语音或拍照答题进行中，全屏。
- `/ask/recite-score`：读背判分，全屏。
- `/ask/voice-analysis`：语音分析，全屏。
- `/ask/voice-student/:studentId`：语音学生答题分析，全屏。
- `/ask/select`：选题提问，全屏。
- `/ask/batch-answer`：多题答题中，全屏。
- `/ask/photo-analysis`：拍照分析，全屏。

全屏页面设置 `meta: { fullscreen: true }`，由 `App.vue` 隐藏悬浮球并关闭鼠标穿透。

## 数据模型

`src/mock/askFlow.js` 提供静态数据：

- 课堂统计：已作答、全班人数、正确率、未答人数。
- 客观题列表：题号、题型、题干、选项、正确答案、分布。
- 学生列表：姓名、用时、答题数、每题答案。
- 读背内容：教材目录、临时自编文本、满分作文。
- 语音/拍照分析：学生状态、识别文本、评分和问题点。
- 选题数据：题集、教材树、知识点树、题目类型、难度和主观题答题方式。

页面从 mock 中读取数据并用路由 query 或 params 决定展示状态。发起提问、设置答案、Tab 切换、下一题等交互使用组件内状态即可，不写入持久化存储。

## UI 还原原则

以 `docs/images/` 截图为主，使用项目既有 EzQuiz 设计 token：

- 主色使用 Green Sage 系列，按钮和选中态遵循 `AGENTS.md`。
- 页面背景使用 `n100`，主面板为白色，次级区域使用 `n50` 或 `p50`。
- 触控按钮高度尽量不低于 48px，主操作按钮约 56px。
- 弹窗和浮层尺寸尽量贴近截图原尺寸，并在小屏时按比例缩放。
- 图标优先用文字或 CSS 简化图形；若新增图标库会扩大范围，因此本次不引入新依赖。

## 错误处理

由于本次是 Demo 版，错误处理主要覆盖交互边界：

- 路由参数缺失时使用默认题型、默认题号或默认来源。
- 多提提问题目数量限制在 1 到 9，选项数量限制在 2 到 6。
- 未选择题目点击开始提问时，保留在当前页并显示 Element Plus 提示。
- 关闭答题进程时显示确认弹窗，确认后回到 `/`。
- 语音、拍照、截屏入口不调用硬件 API，只进入对应模拟流程。

## 测试与验证

实现阶段优先增加轻量测试或可运行验证：

- 路由表导出纯数据或 helper 后，测试关键路由路径存在且全屏 meta 正确。
- 分支跳转 helper 测试：单题、多题、主观语音、主观拍照的目标路由。
- 执行 `npm run lint` 和 `npm run build`。
- 启动 `npm run dev:vite` 后，用浏览器检查关键截图页面：点击问、多提提问、缩小答题进程、客观题详情、多题详情、读背、语音分析、选题提问。

## 验收标准

- 从悬浮球点击“问”可以进入点击问面板。
- 文档第 4 章所有主要截图都有对应页面或弹窗。
- 主要按钮可以按文档描述跳转或切换状态。
- 全屏页面隐藏悬浮球，非全屏浮层保留悬浮球。
- 构建通过，无 Vue 模板语法错误，无现有 CommonJS lint 错误。
- UI 在 1920×1080 下接近截图比例，普通浏览器尺寸下不出现明显文本重叠。
