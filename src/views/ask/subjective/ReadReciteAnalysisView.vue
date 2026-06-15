<template>
  <div class="full-screen-container">
    <header class="page-header">
      <div class="header-left">
        <div class="logo-badge">{{ modeBadge }}</div>
        <div class="header-text">
          <h1 class="title">{{ pageTitle }}</h1>
          <span class="subtitle">{{ subtitle }}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      <section class="left-main-panel">
        <div class="text-preview-card" :class="{ expanded: isTextExpanded }">
          <div
            class="preview-html"
            v-html="contentHtml"
          ></div>
          <button
            class="btn-toggle-expand"
            type="button"
            @click="isTextExpanded = !isTextExpanded"
          >
            {{ isTextExpanded ? "收起内容" : "展开内容" }}
            <span class="arrow-icon" :class="{ up: isTextExpanded }">▼</span>
          </button>
        </div>

        <div class="students-grid-container">
          <div class="grid-layout">
            <div
              v-for="(student, index) in students"
              :key="`${student.name}-${index}`"
              class="student-card"
              :class="{
                'is-clickable': student.status !== 'unanswered',
                'is-disabled': student.status === 'unanswered',
              }"
              :role="student.status !== 'unanswered' ? 'button' : undefined"
              :tabindex="student.status !== 'unanswered' ? 0 : undefined"
              @click="handleOpenStudent(student)"
              @keydown.enter="handleOpenStudent(student)"
            >
              <div class="student-name">{{ student.name }}</div>
              <span class="status-badge" :class="student.status">
                {{ getStatusLabel(student.status) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <aside class="right-sidebar">
        <div class="stats-row">
          <div class="stat-card">
            <span class="num">{{ stats.answeredCount }}</span>
            <span class="label">已作答</span>
          </div>
          <div class="stat-card">
            <span class="num">{{ stats.totalStudents }}</span>
            <span class="label">全班人数</span>
          </div>
          <div class="stat-card rate-card">
            <span class="num highlight">{{ stats.passRate }}%</span>
            <span class="label">通过率</span>
          </div>
        </div>

        <div class="collapse-item">
          <button
            class="collapse-header"
            type="button"
            @click="showGradingSettings = !showGradingSettings"
          >
            <span class="label-title">评分设置</span>
            <span class="action-link">
              {{ showGradingSettings ? "收起" : "展开查看" }}
              <span class="arrow" :class="{ up: showGradingSettings }">▼</span>
            </span>
          </button>
          <p v-if="showGradingSettings" class="grading-settings-tip">
            评分标准：{{ analysis.standard === "standard" ? "标准背诵" : analysis.standard }}
          </p>
        </div>

        <div class="distribution-panel">
          <ReadReciteScoreDistribution
            :distributions="distributions"
            :expanded-label="expandedLabel"
            :student-list-map="studentListMap"
            @toggle-student-list="handleViewStudentList"
          />
        </div>

        <div v-if="aiGradingComplete" class="ai-status-panel">
          <div class="status-icon-box" aria-hidden="true">
            <svg class="check-svg" viewBox="0 0 1024 1024" width="16" height="16">
              <path
                d="M380.16 746.432l-233.92-233.952a32 32 0 1 1 45.248-45.248l188.672 188.704L832.512 205.6a32 32 0 1 1 45.248 45.248l-497.6 495.584z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <div class="ai-info">
            <div class="ai-title">AI评分完成</div>
            <div class="ai-desc">所有学生已完成自动评分</div>
          </div>
        </div>
      </aside>
    </div>

    <footer class="page-footer">
      <div class="footer-actions">
        <button class="btn-ctrl btn-outline" type="button" @click="handleShrink">
          <svg class="icon-shrink" viewBox="0 0 1024 1024" width="14" height="14">
            <path
              d="M380.16 380.16H160a32 32 0 0 1 0-64h156.16L128 128a32 32 0 0 1 45.248-45.248l188.16 188.16V160a32 32 0 0 1 64 0v220.16zM643.84 643.84H864a32 32 0 0 1 0 64H707.84L903.68 904a32 32 0 0 1-45.248 45.248l-195.84-195.84V864a32 32 0 0 1-64 0V643.84z"
              fill="currentColor"
            ></path>
          </svg>
          缩屏
        </button>
        <button class="btn-ctrl btn-icon" type="button" @click="handleMinimize">—</button>
        <button class="btn-ctrl btn-close" type="button" @click="handleClose">✕</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ReadReciteScoreDistribution from "./components/ReadReciteScoreDistribution.vue";
import { useAskFullscreenControls } from "../composables/useAskFullscreenControls";
import { useReadReciteAnalysis } from "./composables/useReadReciteAnalysis.js";
import { useFlowStore } from "../../../stores/flow";

const router = useRouter();
const flowStore = useFlowStore();
const {
  closeAskFlow,
  minimizeToTaskbar,
  setFullscreenContext,
  shrinkToCompact,
} = useAskFullscreenControls();

const {
  analysis,
  pageTitle,
  subtitle,
  contentHtml,
  students,
  distributions,
  studentListMap,
  stats,
  aiGradingComplete,
  modeBadge,
  expandedLabel,
  getStatusLabel,
  handleViewStudentList,
} = useReadReciteAnalysis();

const isTextExpanded = ref(false);
const showGradingSettings = ref(false);

// 打开已作答学生的背读详情页。
async function handleOpenStudent(student) {
  if (!student || student.status === "unanswered") {
    return;
  }

  const answeredStudents = students.value.filter(
    (item) => item.status !== "unanswered",
  );
  const answeredIndex = answeredStudents.findIndex(
    (item) => item.name === student.name,
  );

  if (answeredIndex < 0) {
    return;
  }

  flowStore.saveReadReciteAnalysisState(analysis.value);
  flowStore.saveReadReciteStudentIndex(answeredIndex);
  setFullscreenContext({
    currentStep: "read-recite-student-analysis",
    fullscreenRoute: "/ask/read-recite-student-analysis",
  });

  await router.push({
    path: "/ask/read-recite-student-analysis",
    query: {
      index: String(answeredIndex),
      name: student.name,
    },
  });
}

// 缩屏：打开背读判分专用缩屏，不复用客观题 analysis-compact。
async function handleShrink() {
  flowStore.saveReadReciteAnalysisState(analysis.value);
  setFullscreenContext({
    currentStep: "read-recite-analysis",
    fullscreenRoute: "/ask/read-recite-analysis",
  });
  await shrinkToCompact({
    widgetType: "read-recite-analysis-compact",
    props: {
      step: "read-recite-analysis",
      reciteType: analysis.value.reciteType,
    },
  });
}

// 全屏最小化：恢复时使用背读判分专用缩屏。
async function handleMinimize() {
  setFullscreenContext({
    currentStep: "read-recite-analysis",
    fullscreenRoute: "/ask/read-recite-analysis",
  });

  await minimizeToTaskbar(pageTitle.value, {
    widgetType: "read-recite-analysis-compact",
    props: {
      step: "read-recite-analysis",
      reciteType: analysis.value.reciteType,
    },
  });
}

// 关闭背读流程。
async function handleClose() {
  await closeAskFlow();
}
</script>

<style scoped lang="scss">
.full-screen-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--ez-n100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--ez-n150);
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-badge {
    background-color: var(--ez-p500);
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
  }

  .header-text {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ez-n900);
    }

    .subtitle {
      font-size: 12px;
      color: var(--ez-n400);
    }
  }
}

.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.left-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow: hidden;
  min-width: 0;
}

.text-preview-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--ez-shadow-1);
  flex-shrink: 0;

  &:not(.expanded) .preview-html {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .preview-html {
    flex: 1;
    font-size: 14px;
    color: var(--ez-n700);
    line-height: 1.6;
    min-width: 0;

    :deep(p) {
      margin: 0 0 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .btn-toggle-expand {
    background: #ffffff;
    border: 1px solid var(--ez-n200);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--ez-n600);
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    flex-shrink: 0;

    .arrow-icon {
      font-size: 8px;
      transition: transform 0.2s;

      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

.students-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.student-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--ez-n150);
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: var(--ez-shadow-1);

  &.is-clickable {
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      border-color: var(--ez-p300);
      box-shadow: var(--ez-shadow-2);
    }
  }

  &.is-disabled {
    opacity: 0.72;
    cursor: default;
  }

  .student-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n900);
  }
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;

  &.excellent {
    background-color: #e6fcf1;
    color: #10b981;
  }

  &.good {
    background-color: var(--ez-p50);
    color: var(--ez-p600);
  }

  &.pass {
    background-color: #eef8f6;
    color: #84baa8;
  }

  &.needs-improvement {
    background-color: #fef2f2;
    color: var(--ez-error);
  }

  &.unanswered {
    background-color: var(--ez-n150);
    color: var(--ez-n400);
  }
}

.right-sidebar {
  width: 27%;
  background-color: #ffffff;
  border-left: 1px solid var(--ez-n150);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.stats-row {
  display: flex;
  gap: 10px;

  .stat-card {
    flex: 1;
    background-color: var(--ez-n50);
    border-radius: 12px;
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 20px;
      font-weight: 800;
      color: var(--ez-n800);
      margin-bottom: 4px;
    }

    .label {
      font-size: 11px;
      color: var(--ez-n400);
    }

    &.rate-card {
      background-color: var(--ez-p50);

      .num.highlight {
        color: var(--ez-p600);
      }
    }
  }
}

.collapse-item {
  border-top: 1px solid var(--ez-n150);
  border-bottom: 1px solid var(--ez-n150);
  padding: 14px 0;
  flex-shrink: 0;

  .collapse-header {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0;

    .label-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ez-n800);
    }

    .action-link {
      font-size: 12px;
      color: var(--ez-p600);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;

      .arrow {
        font-size: 8px;
        color: var(--ez-n400);
        transition: transform 0.2s;

        &.up {
          transform: rotate(180deg);
        }
      }
    }
  }

  .grading-settings-tip {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--ez-n500);
  }
}

.distribution-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ai-status-panel {
  margin-top: auto;
  background-color: var(--ez-p50);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .status-icon-box {
    background-color: var(--ez-p100);
    color: var(--ez-p600);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ai-info {
    .ai-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--ez-n900);
      margin-bottom: 2px;
    }

    .ai-desc {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }
}

.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid var(--ez-n150);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ctrl {
  border: none;
  border-radius: 10px;
  height: 38px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.btn-outline {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n300);
    color: var(--ez-n700);
    padding: 0 16px;
    gap: 6px;
  }

  &.btn-icon {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n300);
    color: var(--ez-n700);
    width: 38px;
    padding: 0;
  }

  &.btn-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
