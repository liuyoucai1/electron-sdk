<template>
  <div class="full-screen-container">
    <!-- 1. 顶部页头 -->
    <div class="page-header">
      <div class="header-left">
        <div class="logo-badge">问</div>
        <div class="header-text">
          <h1 class="title">题目分析 • 第{{ currentPage }}题</h1>
        </div>
      </div>
    </div>

    <!-- 2. 主体内容区域 -->
    <div class="page-content">
      <!-- 左侧：题干与选项卡片 -->
      <div class="left-main-panel">
        <!-- 题型指示标记 -->
        <div class="question-type-bar">
          <span class="index-circle">{{ currentPage }}</span>
          <span class="type-text">{{ questionTypeLabel }}</span>
        </div>

        <!-- 题干 -->
        <h2 class="question-stem">
          {{ questionStem }}
        </h2>

        <!-- 选项列表 -->
        <div class="options-stack">
          <div
            v-for="opt in options"
            :key="opt.key"
            class="option-card"
            @click="handleOptionSelect(opt.key)"
          >
            <span class="option-badge">{{ opt.key }}</span>
            <span class="option-text">{{ opt.text }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：数据看板与作答分布 -->
      <div class="right-sidebar">
        <!-- 数据卡片行 -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="num">{{ answeredCount }}</span>
            <span class="label">已作答</span>
          </div>
          <div class="stat-card">
            <span class="num">{{ totalStudents }}</span>
            <span class="label">全班人数</span>
          </div>
        </div>

        <ObjectiveQuestionDistribution
          :distributions="distributions"
          :get-status="getDistributionStatus"
          :expanded-label="expandedLabel"
          :student-list-map="studentListMap"
          :has-answer-set="hasAnswerSet"
          @toggle-student-list="handleViewStudentList"
        />
      </div>
    </div>

    <!-- 3. 底部固定控制与翻页栏 -->
    <div class="page-footer">
      <!-- 翻页控制 (左侧)：仅多题模式显示 -->
      <div v-if="isMultiQuestion" class="pagination-wrapper">
        <button
          class="btn-pagination"
          :disabled="currentPage === 1"
          @click="changePage(-1)"
        >
          &lt; 上一题
        </button>
        <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="btn-pagination"
          :disabled="currentPage === totalPages"
          @click="changePage(1)"
        >
          下一题 &gt;
        </button>
      </div>

      <!-- 单题模式左侧占位，保持右侧按钮右对齐 -->
      <div v-else></div>

      <!-- 右侧动作按钮 -->
      <div class="footer-actions">
        <button class="btn btn-primary" @click="handleSetAnswers">
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

        <!-- 返回按钮：仅多题模式显示 -->
        <button
          v-if="isMultiQuestion"
          class="btn btn-outline"
          @click="handleBack"
        >
          <svg
            class="icon-reply"
            viewBox="0 0 1024 1024"
            width="14"
            height="14"
          >
            <path
              d="M494.933 243.2a32 32 0 0 1 45.245 45.245L356.565 469.333H800a32 32 0 0 1 0 64H356.565l183.616 180.885a32 32 0 1 1-45.245 45.245l-237.44-233.9a32 32 0 0 1 0-45.245l237.437-237.12z"
              fill="currentColor"
            ></path>
          </svg>
          返回
        </button>
        <button class="btn btn-icon" @click="handleMinimize">—</button>
        <button class="btn btn-close" @click="handleClose">✕</button>
      </div>
    </div>

    <SetSingleAnswerDialog
      v-model="showSetAnswerDialog"
      :question-index="currentPage"
      :question-type="currentQuestionMeta.type"
      :type-label="currentQuestionMeta.typeLabel"
      :option-count="currentOptionCount"
      :initial-answer="currentSavedAnswer"
      @confirm="handleAnswerConfirm"
    />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import ObjectiveQuestionDistribution from "./components/ObjectiveQuestionDistribution.vue";
import SetSingleAnswerDialog from "./components/SetSingleAnswerDialog.vue";
import { useObjectiveQuestionAnalysis } from "./composables/useObjectiveQuestionAnalysis";
import { useFlowStore } from "../../stores/flow";
import { useSmallPageStore } from "../../stores/smallPage";
import { useWidgetStore } from "../../stores/widget";

const router = useRouter();
const route = useRoute();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();

const {
  isMultiQuestion,
  currentPage,
  totalPages,
  questionTypeLabel,
  currentQuestionMeta,
  currentOptionCount,
  questionStem,
  options,
  answeredCount,
  totalStudents,
  distributions,
  showSetAnswerDialog,
  currentSavedAnswer,
  hasAnswerSet,
  expandedLabel,
  studentListMap,
  changePage,
  handleViewStudentList,
  handleSetAnswers,
  handleAnswerConfirm,
  getDistributionStatus,
  persistAnalysisState,
  querySource,
} = useObjectiveQuestionAnalysis({ route });

// 点击主面板选项（后续接入讲评交互）。
function handleOptionSelect(key) {
  console.log(`点击了主面板选项: ${key}`);
}

// 缩屏：保存分析状态并打开缩屏 widget。
async function handleShrink() {
  flowStore.fullscreenRoute = "/ask/objective-detail";
  persistAnalysisState();

  const target = flowStore.shrinkFullscreenToCompact();
  smallPageStore.closePage();
  widgetStore.openWidget(target.widgetType, {
    ...target.props,
    routeQuery: { ...querySource.value },
  });
  await router.replace("/");
}

// 返回：回到进入单题分析前的全屏页（如多题批次分析），不中断问业务流程。
async function handleBack() {
  const returnTo = route.query.returnTo;
  if (typeof returnTo === "string" && returnTo) {
    flowStore.viewMode = "fullscreen";
    flowStore.fullscreenRoute = returnTo;
    flowStore.currentStep =
      returnTo === "/ask/multi-batch-analysis"
        ? "batch-analysis"
        : "single-analysis";

    const query = {};
    if (route.query.entrySource) {
      query.entrySource = route.query.entrySource;
    }
    if (route.query.batchSize || flowStore.batchSize) {
      query.batchSize = String(route.query.batchSize || flowStore.batchSize);
    }

    await router.push({ path: returnTo, query });
    return;
  }

  await router.back();
}

// 最小化：从全屏路由缩小到右侧 taskbar 触发按钮。
async function handleMinimize() {
  const target = flowStore.minimizeFullscreen("答题分析");
  // 创建一个最小化的 widget 入口，供 taskbar 按钮展示和恢复使用。
  widgetStore.openWidget(target.widgetType, {
    sessionId: flowStore.sessionId,
    questionId: flowStore.questionId,
    step: flowStore.currentStep
  });
  widgetStore.minimizeWidget();
  smallPageStore.closePage();
  await router.replace("/");
}

// 关闭整条业务线。
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

/* ========== 1. 顶部页头 ========== */
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

/* ========== 2. 主体核心区 ========== */
.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧主要区域 */
.left-main-panel {
  flex: 1;
  background-color: #fafaf8;
  padding: 32px 48px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 题型标记条 */
.question-type-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  .index-circle {
    background-color: #529b85;
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }

  .type-text {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
  }
}

/* 题干 */
.question-stem {
  margin: 0 0 32px;
  font-size: 22px;
  font-weight: bold;
  color: #1e293b;
  line-height: 1.5;
}

/* 选项列表 */
.options-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
}

.option-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .option-badge {
    background-color: #f1f5f9;
    color: #64748b;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 13px;
  }

  .option-text {
    font-size: 15px;
    color: #334155;
    font-weight: bold;
  }
}

/* 右侧侧边栏 */
.right-sidebar {
  width: 25%;
  background-color: #ffffff;
  border-left: 1px solid #f1f5f9;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 统计简版小卡片 */
.stats-row {
  display: flex;
  gap: 12px;

  .stat-card {
    flex: 1;
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 24px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 4px;
    }

    .label {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

/* ========== 3. 底部固定控制与翻页栏 ========== */
.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

/* 翻页器控制 (左侧) */
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;

  .btn-pagination {
    background-color: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    height: 38px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: bold;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not([disabled]) {
      border-color: #529b85;
      color: #529b85;
    }

    &[disabled] {
      background-color: #f8fafc;
      color: #cbd5e1;
      border-color: #f1f5f9;
      cursor: not-allowed;
    }
  }

  .page-indicator {
    font-size: 13px;
    color: #94a3b8;
    font-weight: bold;
  }
}

/* 右侧通用行为按钮 */
.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: #cbd5e1;
  margin: 0 6px;
}

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

    .icon-shrink,
    .icon-reply {
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
