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

        <!-- 作答分布看板 -->
        <div class="distribution-section">
          <div class="section-header">
            <span class="section-title">作答分布</span>
            <span class="section-subtitle">设置答案后显示正误</span>
          </div>

          <div class="distribution-list">
            <div
              v-for="dist in distributions"
              :key="dist.label"
              class="dist-item"
            >
              <div
                class="dist-row"
                @click="handleViewStudentList(dist.label)"
              >
                <span class="dist-badge">{{ dist.label }}</span>
                <div class="progress-track">
                  <div
                    class="progress-bar"
                    :style="{ width: dist.percent + '%' }"
                  ></div>
                </div>
                <div class="dist-meta">
                  <span class="count">{{ dist.count }}人</span>
                  <span class="percent">{{ dist.percent }}%</span>
                </div>
                <span class="arrow-down" :class="{ expanded: expandedLabel === dist.label }">▼</span>
              </div>

              <!-- 展开的学生名单 -->
              <transition name="student-list-fade">
                <div
                  v-if="expandedLabel === dist.label"
                  class="student-list-panel"
                >
                  <span
                    v-for="name in studentListMap[dist.label]"
                    :key="name"
                    class="student-tag"
                  >
                    {{ name }}
                  </span>
                </div>
              </transition>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="info-tip">
            <span class="info-icon">ⓘ</span>
            点击选项可以查看作答学生名单
          </div>
        </div>
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
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFlowStore } from "../../stores/flow";
import { useSmallPageStore } from "../../stores/smallPage";
import { useWidgetStore } from "../../stores/widget";

const router = useRouter();
const route = useRoute();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();

// ---------- 入口判定 ----------
// 'ask-entry' → 从客观题即兴提问进入，单道题，无翻页无返回
// 'multi-question' → 从多题提问进入，多道题，有翻页有返回
const isMultiQuestion = computed(
  () => route.query.entrySource === "multi-question",
);

// ---------- 题目数据（两套 mock） ----------
const currentPage = ref(Number(route.query.questionIndex || 0) + 1);
const totalPages = ref(isMultiQuestion.value ? 4 : 1);

const questionTypeLabel = computed(() => {
  const typeMap = { 2: "单选", 3: "多选", 4: "判断", 20: "数值" };
  return typeMap[route.query.questionType] || "单选";
});

// 单题 mock
const singleQuestion = {
  stem: "Which sentence uses the present perfect tense correctly?",
  options: [
    { key: "A", text: "She has went to the store." },
    { key: "B", text: "They have finished their homework." },
    { key: "C", text: "He have seen that movie already." },
    { key: "D", text: "We has been to Paris twice." },
  ],
  answered: 26,
  total: 30,
  distributions: [
    { label: "A", count: 8, percent: 27 },
    { label: "B", count: 5, percent: 17 },
    { label: "C", count: 11, percent: 37 },
    { label: "D", count: 2, percent: 7 },
    { label: "未答", count: 4, percent: 13 },
  ],
};

// 多题 mock（4 道题）
const multiQuestions = [
  {
    stem: "Which sentence uses the present perfect tense correctly?",
    options: [
      { key: "A", text: "She has went to the store." },
      { key: "B", text: "They have finished their homework." },
      { key: "C", text: "He have seen that movie already." },
      { key: "D", text: "We has been to Paris twice." },
    ],
    answered: 26,
    total: 30,
    distributions: [
      { label: "A", count: 8, percent: 27 },
      { label: "B", count: 5, percent: 17 },
      { label: "C", count: 11, percent: 37 },
      { label: "D", count: 2, percent: 7 },
      { label: "未答", count: 4, percent: 13 },
    ],
  },
  {
    stem: "What is the capital of France?",
    options: [
      { key: "A", text: "London" },
      { key: "B", text: "Berlin" },
      { key: "C", text: "Paris" },
      { key: "D", text: "Madrid" },
    ],
    answered: 28,
    total: 30,
    distributions: [
      { label: "A", count: 2, percent: 7 },
      { label: "B", count: 1, percent: 3 },
      { label: "C", count: 22, percent: 73 },
      { label: "D", count: 3, percent: 10 },
      { label: "未答", count: 2, percent: 7 },
    ],
  },
  {
    stem: 'Who wrote "Romeo and Juliet"?',
    options: [
      { key: "A", text: "Charles Dickens" },
      { key: "B", text: "William Shakespeare" },
      { key: "C", text: "Jane Austen" },
      { key: "D", text: "Mark Twain" },
    ],
    answered: 30,
    total: 30,
    distributions: [
      { label: "A", count: 3, percent: 10 },
      { label: "B", count: 24, percent: 80 },
      { label: "C", count: 2, percent: 7 },
      { label: "D", count: 1, percent: 3 },
      { label: "未答", count: 0, percent: 0 },
    ],
  },
  {
    stem: "What is the chemical symbol for water?",
    options: [
      { key: "A", text: "CO2" },
      { key: "B", text: "H2O" },
      { key: "C", text: "NaCl" },
      { key: "D", text: "O2" },
    ],
    answered: 25,
    total: 30,
    distributions: [
      { label: "A", count: 3, percent: 10 },
      { label: "B", count: 17, percent: 57 },
      { label: "C", count: 3, percent: 10 },
      { label: "D", count: 2, percent: 7 },
      { label: "未答", count: 5, percent: 16 },
    ],
  },
];

// 当前题目数据
const currentQuestion = computed(() => {
  if (isMultiQuestion.value) {
    const idx = Math.min(currentPage.value - 1, multiQuestions.length - 1);
    return multiQuestions[idx];
  }
  return singleQuestion;
});

const questionStem = computed(() => currentQuestion.value.stem);
const options = computed(() => currentQuestion.value.options);
const answeredCount = computed(() => currentQuestion.value.answered);
const totalStudents = computed(() => currentQuestion.value.total);
const distributions = computed(() => currentQuestion.value.distributions);

// ---------- 交互方法 ----------
function changePage(step) {
  const target = currentPage.value + step;
  if (target >= 1 && target <= totalPages.value) {
    currentPage.value = target;
  }
}

function handleOptionSelect(key) {
  console.log(`点击了主面板选项: ${key}`);
}

// 展开的学生名单：记录当前展开的选项 label，null 表示全部收起。
const expandedLabel = ref(null);

// mock：每个选项对应的学生名单。
const studentListMap = {
  A: ["张伟", "李娜", "王芳", "陈静", "赵鑫", "刘洋", "周婷", "吴磊"],
  B: ["孙明", "马丽", "郑爽", "高峰"],
  C: ["黄晓", "林黛", "何炅", "谢娜", "邓超", "杨幂", "胡歌", "刘涛", "赵薇", "周迅", "陈坤"],
  D: ["吴京", "徐峥"],
  未答: ["沈腾", "贾玲", "黄渤", "王宝强"],
};

// 点击选项 → 展开/收起学生名单。
// 同一选项再点一次收起；点击不同选项则切换展开目标。
function handleViewStudentList(label) {
  if (expandedLabel.value === label) {
    expandedLabel.value = null;
  } else {
    expandedLabel.value = label;
  }
}

function handleSetAnswers() {
  console.log("触发设置本题正确答案面板");
}

// 缩屏：回到 overlay 层并打开 compact widget。
async function handleShrink() {
  const target = flowStore.shrinkFullscreenToCompact();
  smallPageStore.closePage();
  widgetStore.openWidget(target.widgetType, target.props);
  await router.replace("/");
}

// 返回：回到 answer-progress 小屏。
async function handleBack() {
  const target = flowStore.handleAskWidgetAction({ action: "close-flow" });
  smallPageStore.closePage();
  widgetStore.closeWidget();
  await router.replace(target.route);
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

/* 作答分布区块 */
.distribution-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    border-left: 3px solid #529b85;
    padding-left: 8px;

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #334155;
    }

    .section-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dist-item {
  display: flex;
  flex-direction: column;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 6px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f8fafc;
  }

  .dist-badge {
    background-color: #f1f5f9;
    color: #64748b;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .progress-track {
    flex: 1;
    background-color: #f1f5f9;
    border-radius: 6px;
    height: 18px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background-color: #b7dbd1;
    border-radius: 6px;
    transition: width 0.3s;
  }

  .dist-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 44px;

    .count {
      font-size: 12px;
      font-weight: bold;
      color: #334155;
    }

    .percent {
      font-size: 10px;
      color: #94a3b8;
    }
  }

  .arrow-down {
    font-size: 8px;
    color: #cbd5e1;
    transition: transform 0.2s;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

/* 展开的学生名单面板 */
.student-list-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0 8px 34px;
}

.student-tag {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  background-color: #ffffff;
}

/* 名单展开/收起过渡 */
.student-list-fade-enter-active,
.student-list-fade-leave-active {
  transition: all 0.2s ease;
}

.student-list-fade-enter-from,
.student-list-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 提示条 */
.info-tip {
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;

  .info-icon {
    font-size: 12px;
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
