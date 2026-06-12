<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">问</div>
        <div class="header-text">
          <h1 class="title">多题答题分析</h1>
        </div>
      </div>
    </div>

    <!-- 2. 主体内容区域（左右留白居中，中间按百分比分配） -->
    <div class="page-content" :class="{ 'is-details-tab': currentTab === 'details' }">
      <!-- ==================== TAB 1: 题目分析 ==================== -->
      <template v-if="currentTab === 'analysis'">
        <!-- 左侧：作答基础面板 -->
        <div class="left-stats-panel">
          <!-- 参与人数卡片 -->
          <div class="stats-card participant-card">
            <div class="stats-card-title">参与人数</div>
            <div class="stats-num-row">
              <span class="ratio">26<span class="total">/30</span></span>
              <span class="percent">87%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: 87%"></div>
            </div>
          </div>

          <!-- 作答情况圆环图卡片 -->
          <div class="stats-card chart-card">
            <div class="stats-card-title">作答情况</div>
            <div ref="answerChartRef" class="answer-chart"></div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="dot dot-green"></span> 已作答 {{ answeredCount }}人
              </div>
              <div class="legend-item">
                <span class="dot dot-grey"></span> 未作答 {{ unansweredCount }}人
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：题目分析列表（与左侧作答情况同款 card） -->
        <div class="center-list-panel">
          <div class="stats-card center-card">
          <div class="panel-header">
            <div class="header-left-sub">
              <span class="panel-title">题目列表</span>
              <span class="badge-tag">{{ questionCount }} 题</span>
            </div>
            <div class="toggle-button-group">
              <button
                class="toggle-btn"
                :class="{ active: currentSort === 'index' }"
                @click="setSort('index')"
              >
                按题号
              </button>
              <button
                class="toggle-btn"
                :class="{ active: currentSort === 'rate' }"
                @click="setSort('rate')"
              >
                按低正确率
              </button>
            </div>
          </div>

          <!-- 题目选择列表 -->
          <div class="question-list">
            <div
              v-for="q in displayedQuestions"
              :key="q.id"
              class="question-item"
              @click="handleQuestionClick(q)"
            >
              <!-- 左侧状态指示色边 -->
              <div class="color-indicator" :class="q.colorClass"></div>

              <span class="q-index">{{ q.id }}</span>
              <span class="q-type-badge">{{ q.type }}</span>

              <!-- 作答分布徽章列表 -->
              <div class="options-distribution">
                <span
                  v-for="opt in q.options"
                  :key="opt.label"
                  class="dist-badge"
                  :class="getDistBadgeClass(q, opt)"
                >
                  {{ opt.label }} <span class="badge-val">{{ opt.value }}</span>
                </span>
              </div>

              <!-- 右侧跳转箭头 -->
              <span class="arrow-right">></span>
            </div>
          </div>

          <!-- 底部图例 -->
          <div class="panel-footer-legend">
            <span class="legend-item"
              ><span class="dot dot-red"></span> 正确率 &lt;60%</span
            >
            <span class="legend-item"
              ><span class="dot dot-orange"></span> 正确率 60-79%</span
            >
            <span class="legend-item"
              ><span class="dot dot-green"></span> 正确率 ≥80%</span
            >
          </div>
          </div>
        </div>
      </template>

      <!-- ==================== TAB 2: 学生明细 ==================== -->
      <template v-else-if="currentTab === 'details'">
        <div class="details-main-panel">
          <div class="stats-card details-card">
          <div class="table-scroll-container">
            <table class="students-detail-table">
              <thead>
                <tr>
                  <th style="width: 60px">#</th>
                  <th style="width: 140px">姓名</th>
                  <th>用时</th>
                  <th>答题数</th>
                  <th>答对数</th>
                  <th v-for="n in questionCount" :key="n">Q{{ n }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in sortedStudents" :key="index">
                  <td class="col-index">{{ index + 1 }}</td>
                  <td class="col-name">{{ student.name }}</td>
                  <td class="col-time">{{ student.time }}</td>
                  <td class="col-count">{{ student.progress }}</td>
                  <td class="col-correct">{{ student.correctCount }}</td>
                  <td v-for="n in questionCount" :key="n">
                    <span
                      class="ans-pill"
                      :class="{ 'font-bold': n === 3 }"
                    >{{ student[`q${n}`] || "—" }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </template>

      <!-- ==================== 右侧公共：Tab 导航栏 ==================== -->
      <div class="right-tab-panel">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-nav-item"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- 3. 底部固定控制栏 -->
    <div class="page-footer">
      <!-- 学生明细：排序控件靠左，与右侧操作同一栏 -->
      <div v-if="currentTab === 'details'" class="footer-sort">
        <span class="sort-label">排序:</span>
        <button
          class="sort-pill-btn"
          :class="{ active: studentSortMode === 'id' }"
          type="button"
          @click="studentSortMode = 'id'"
        >
          按学号
        </button>
        <button
          class="sort-pill-btn"
          :class="{ active: studentSortMode === 'correct' }"
          type="button"
          @click="studentSortMode = 'correct'"
        >
          按答对题数
        </button>
      </div>
      <div v-else class="footer-sort footer-sort--placeholder"></div>

      <div class="footer-actions">
        <button
          class="btn btn-primary"
          @click="handleSetAnswers(setAnswersDialogRef)"
        >
          设置答案
        </button>

        <div class="divider-line"></div>

        <button class="btn btn-outline" @click="handleShrink">
          <svg
            class="icon-shrink"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M380.16 380.16H160a32 32 0 0 1 0-64h156.16L128 128a32 32 0 0 1 45.248-45.248l188.16 188.16V160a32 32 0 0 1 64 0v220.16zM643.84 643.84H864a32 32 0 0 1 0 64H707.84L903.68 904a32 32 0 0 1-45.248 45.248l-195.84-195.84V864a32 32 0 0 1-64 0V643.84z"
              fill="currentColor"
            ></path>
          </svg>
          缩屏
        </button>
        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close" @click="handleClose">✕</button>
      </div>
    </div>

    <SetBatchAnswersDialog
      ref="setAnswersDialogRef"
      @confirm="handleAnswersConfirm"
    />
  </div>
</template>

<script setup>
import * as echarts from "echarts";
import SetBatchAnswersDialog from "./components/SetBatchAnswersDialog.vue";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMultiBatchAnalysis } from "./composables/useMultiBatchAnalysis";
import { useFlowStore } from "../../stores/flow";
import { useSmallPageStore } from "../../stores/smallPage";
import { useWidgetStore } from "../../stores/widget";

const setAnswersDialogRef = ref(null);
const router = useRouter();
const route = useRoute();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();

const {
  batchSize,
  questionCount,
  displayedQuestions,
  currentSort,
  setAnswerQuestions,
  batchCorrectAnswers,
  setSort,
  handleSetAnswers,
  handleAnswersConfirm,
  getDistBadgeClass,
  handleQuestionClick,
  persistBatchAnalysisState,
  querySource,
} = useMultiBatchAnalysis({ route });

// 侧边栏双 Tab 控制: 'analysis' | 'details'
const tabs = [
  { id: "analysis", label: "题目分析" },
  { id: "details", label: "学生明细" },
];
const currentTab = ref("analysis");

// 学生明细排序规则: 'id' (按学号) | 'correct' (按答对题数)
const studentSortMode = ref("id");

// 作答统计 mock（后续由 askStore 接入）。
const totalStudents = 30;
const answeredCount = 26;
const unansweredCount = totalStudents - answeredCount;

const answerChartRef = ref(null);
let answerChart;

// 初始化作答情况环形图。
function initAnswerChart() {
  if (!answerChartRef.value) {
    return;
  }

  answerChart?.dispose();
  answerChart = echarts.init(answerChartRef.value);
  answerChart.setOption({
    animation: false,
    tooltip: { show: false },
    series: [
      {
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        silent: true,
        data: [
          {
            value: answeredCount,
            name: "已作答",
            itemStyle: { color: "#529b85" },
          },
          {
            value: unansweredCount,
            name: "未作答",
            itemStyle: { color: "#cbd5e1" },
          },
        ],
      },
    ],
    graphic: [
      {
        type: "group",
        left: "center",
        top: "center",
        children: [
          {
            type: "text",
            top: -10,
            style: {
              text: String(answeredCount),
              fontSize: 20,
              fontWeight: 800,
              fill: "#1e293b",
              textAlign: "center",
            },
          },
          {
            type: "text",
            top: 16,
            style: {
              text: "已作答",
              fontSize: 10,
              fill: "#94a3b8",
              textAlign: "center",
            },
          },
        ],
      },
    ],
  });
}

// 切回题目分析 Tab 或窗口尺寸变化时重绘图表。
function refreshAnswerChart() {
  nextTick(() => {
    if (currentTab.value !== "analysis") {
      return;
    }
    if (!answerChart) {
      initAnswerChart();
      return;
    }
    answerChart.resize();
  });
}

function onWindowResize() {
  answerChart?.resize();
}

onMounted(() => {
  initAnswerChart();
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  answerChart?.dispose();
  answerChart = null;
});

watch(currentTab, (tab) => {
  if (tab === "analysis") {
    refreshAnswerChart();
    return;
  }
  answerChart?.dispose();
  answerChart = null;
});

// 学生答题明细列表（16位模拟数据）
const studentsDetails = ref([
  {
    id: 1,
    name: "牛雯置",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "A",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 2,
    name: "施宇",
    time: "8s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 3,
    name: "苏雨潇",
    time: "9s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 4,
    name: "孙雨鹊",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "B",
    q2: "ABC",
    q3: "✓",
    q4: "24",
  },
  {
    id: 5,
    name: "汪月",
    time: "12s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 6,
    name: "杨诗雨",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 7,
    name: "张冰沁",
    time: "10s",
    progress: "4/4",
    correctCount: "—",
    q1: "A",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 8,
    name: "周梦泽",
    time: "7s",
    progress: "3/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "—",
  },
  {
    id: 9,
    name: "朱肖霖",
    time: "15s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 10,
    name: "冯智文",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "D",
    q2: "AC",
    q3: "✕",
    q4: "12",
  },
  {
    id: 11,
    name: "贾彦哲",
    time: "7s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
  {
    id: 12,
    name: "李奕乐",
    time: "8s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✓",
    q4: "36",
  },
  {
    id: 13,
    name: "周雪",
    time: "10s",
    progress: "3/4",
    correctCount: "—",
    q1: "C",
    q2: "—",
    q3: "✓",
    q4: "36",
  },
  {
    id: 14,
    name: "花雨泽",
    time: "11s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "48",
  },
  {
    id: 15,
    name: "陈思宇",
    time: "9s",
    progress: "4/4",
    correctCount: "—",
    q1: "B",
    q2: "BD",
    q3: "✓",
    q4: "36",
  },
  {
    id: 16,
    name: "刘昊然",
    time: "6s",
    progress: "4/4",
    correctCount: "—",
    q1: "C",
    q2: "AC",
    q3: "✕",
    q4: "36",
  },
]);

// 学生列表排序计算属性
const sortedStudents = computed(() => {
  if (studentSortMode.value === "correct") {
    // 按答对数倒序（因无模拟计数值，这里仅作降序逻辑演示，真实开发可转为整型比较）
    return [...studentsDetails.value].sort((a, b) =>
      b.progress.localeCompare(a.progress),
    );
  }
  return studentsDetails.value;
});

// 全屏缩为 400x800 缩屏 widget。
async function handleShrink() {
  flowStore.currentStep = "batch-analysis";
  flowStore.fullscreenRoute = "/ask/multi-batch-analysis";
  persistBatchAnalysisState();

  const target = flowStore.shrinkFullscreenToCompact();
  smallPageStore.closePage();
  widgetStore.openWidget(target.widgetType, {
    ...target.props,
    routeQuery: { ...querySource.value },
  });
  await router.replace("/");
}

// 全屏最小化到右侧激活按钮。
async function handleMinimize() {
  const target = flowStore.minimizeFullscreen("多题答题分析");
  widgetStore.openWidget(target.widgetType, {
    sessionId: flowStore.sessionId,
    questionId: flowStore.questionId,
    step: flowStore.currentStep,
  });
  widgetStore.minimizeWidget();
  smallPageStore.closePage();
  await router.replace("/");
}

// 关闭整条问业务流程，回到胶囊。
async function handleClose() {
  const target = flowStore.resetFlow();
  smallPageStore.closePage();
  widgetStore.closeWidget();
  await router.replace(target.route);
}
</script>

<style scoped lang="scss">
.full-screen-container {
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 1. 顶部页头 */
.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 24px;
  display: flex;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-badge {
    background-color: #529b85;
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .header-text {
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }
  }
}

/* 2. 主体核心区：左 18% | 中 73% | 右 Tab 7%，列间距 1% */
.page-content {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  gap: 1%;

  /* 学生明细仅两列，去掉与右侧 Tab 之间的间隙并铺满剩余宽度 */
  &.is-details-tab {
    gap: 0;
  }
}

/* 与左侧「参与人数 / 作答情况」一致的白色卡片 */
.stats-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  box-sizing: border-box;

  .stats-card-title {
    font-size: 13px;
    font-weight: bold;
    color: #94a3b8;
    margin-bottom: 14px;
  }
}

/* ==================== TAB 1 题目分析样式 ==================== */
.left-stats-panel {
  flex: 0 0 18%;
  min-width: 0;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .stats-num-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 12px;

    .ratio {
      font-size: 28px;
      font-weight: 800;
      color: #529b85;
      line-height: 1;

      .total {
        font-size: 15px;
        color: #94a3b8;
      }
    }

    .percent {
      font-size: 14px;
      font-weight: bold;
      color: #64748b;
    }
  }

  .progress-track {
    background-color: #f1f5f9;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      background-color: #529b85;
    }
  }
}

/* ECharts 环形作答图 */
.answer-chart {
  width: 100%;
  height: 140px;
  margin: 4px 0 8px;
}

.chart-legend {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .legend-item {
    font-size: 12px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.dot-green {
        background-color: #529b85;
      }
      &.dot-grey {
        background-color: #cbd5e1;
      }
    }
  }
}

/* 中间题目列表看板 */
.center-list-panel {
  flex: 0 0 73%;
  min-width: 0;
  min-height: 0;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .center-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-right: 1.5%;

  .header-left-sub {
    display: flex;
    align-items: center;
    gap: 8px;

    .panel-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }

    .badge-tag {
      background-color: #eef8f5;
      color: #529b85;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
}

/* 列表顶部题号/率切换组 */
.toggle-button-group {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  border: 1px solid #f1f5f9;
}

.toggle-btn {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: #ffffff;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
}

/* 题目卡片列表样式 */
.question-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 1.5%;
}

.question-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #fbfcfd;
  }

  .color-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;

    &.danger {
      background-color: #f87171;
    }
    &.warning {
      background-color: #f97316;
    }
    &.success {
      background-color: #10b981;
    }
  }

  .q-index {
    font-size: 16px;
    font-weight: bold;
    color: #1e293b;
    width: 28px;
  }

  .q-type-badge {
    background-color: #f1f5f9;
    color: #94a3b8;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 6px;
    margin-right: 24px;
  }
}

/* 作答选择百分比徽章组 */
.options-distribution {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dist-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid transparent;

  .badge-val {
    margin-left: 4px;
  }

  &.badge-default {
    background-color: #eef3fa;
    border-color: #d5dfed;
    color: #8f7faa;

    .badge-val {
      color: #8f7faa;
    }
  }

  &.badge-correct {
    background-color: #f0f7f5;
    border-color: #d1eae2;
    color: #529b85;

    .badge-val {
      color: #1e293b;
    }
  }

  &.badge-wrong {
    background-color: #fdf3f2;
    border-color: #f0d4d2;
    color: #d9827b;

    .badge-val {
      color: #b85c55;
    }
  }

  &.badge-grey {
    background-color: #f8fafc;
    border-color: #f1f5f9;
    color: #94a3b8;

    .badge-val {
      color: #475569;
    }
  }
}

.arrow-right {
  margin-left: auto;
  font-size: 14px;
  color: #cbd5e1;
}

/* 底部图例 */
.panel-footer-legend {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: #94a3b8;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.dot-red {
        background-color: #f87171;
      }
      &.dot-orange {
        background-color: #f97316;
      }
      &.dot-green {
        background-color: #10b981;
      }
    }
  }
}

/* ==================== TAB 2 学生明细样式 ==================== */
.details-main-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .details-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.table-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 1%;
  border-radius: 12px;
}

.students-detail-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);

  thead {
    background-color: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 2;

    th {
      height: 48px;
      text-align: left;
      font-size: 13px;
      font-weight: bold;
      color: #94a3b8;
      padding: 0 16px;
      border-bottom: 1px solid #f1f5f9;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f8fafc;
      transition: background-color 0.15s;

      &:hover {
        background-color: #fafbfc;
      }

      td {
        height: 52px;
        padding: 0 16px;
        font-size: 13px;
        color: #475569;
      }
    }
  }

  .col-index {
    color: #94a3b8;
    font-weight: bold;
  }

  .col-name {
    font-weight: bold;
    color: #1e293b;
    font-size: 14px;
  }

  .ans-pill {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 6px 14px;
    font-size: 12px;
    color: #334155;
    display: inline-block;
    text-align: center;
    min-width: 44px;
    box-sizing: border-box;

    &.font-bold {
      font-weight: bold;
      font-size: 14px;
    }
  }
}

/* 底部栏左侧排序区（学生明细） */
.footer-sort {
  display: flex;
  align-items: center;
  gap: 12px;

  &--placeholder {
    flex: 1;
  }

  .sort-label {
    font-size: 12px;
    color: #94a3b8;
  }
}

.sort-pill-btn {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 12px;
  font-weight: bold;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  height: 32px;
  line-height: 18px;
  transition: all 0.15s;

  &:hover {
    border-color: #529b85;
    color: #529b85;
  }

  &.active {
    background-color: #eef8f5;
    border-color: #529b85;
    color: #529b85;
  }
}

/* ==================== 右侧：Tab 垂直栏样式 ==================== */
.right-tab-panel {
  flex: 0 0 7%;
  align-self: stretch;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0;
  background-color: #ffffff;
}

.tab-nav-item {
  padding: 18px 12px;
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    color: #1e293b;
  }

  &.active {
    color: #529b85;
    background-color: #f0f7f5;
    border-left: 3px solid #529b85;
  }
}

/* ==================== 3. 底部固定控制栏 ==================== */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

/* 统一按钮设计 */
.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-primary {
    background-color: #529b85;
    color: white;
  }

  &-outline {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    padding: 0 16px;
    gap: 6px;

    .icon-shrink {
      color: #64748b;
    }
  }

  &-icon {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    color: #475569;
    width: 38px;
    padding: 0;
  }

  &-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
