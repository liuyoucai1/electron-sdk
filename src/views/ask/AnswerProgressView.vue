<template>
  <div class="full-screen-container">
    <div class="page-content">
      <section class="left-content-panel">
        <AnswerProgressPageHeader :status-text="headerStatusText" />

        <AnswerProgressContentPanel
          :content-type="contentType"
          :title="title"
          :content-html="contentHtml"
          :objective-stem="objectiveStem"
          :image-src="imageSrc"
          :is-content-visible="isContentVisible"
          :defer-question-setup="deferQuestionSetup"
          :mode-label="modeLabel"
        />
      </section>

      <aside class="right-sidebar">
        <div class="monitor-header">
          <div class="time-box">
            <div class="timer-desc">
              <span class="icon-clock" aria-hidden="true"></span>
              已用时间
            </div>
            <div class="timer-display">{{ timerStr }}</div>
          </div>
          <div class="progress-ratio">
            <span class="ratio-num">
              <span class="current">{{ completedCount }}</span>
              <span class="total">/{{ totalStudents }}</span>
            </span>
            <span class="ratio-label">已完成人数</span>
          </div>
        </div>

        <div class="split-progress-bar">
          <div
            class="segment segment-completed"
            :style="{ width: `${completedPercent}%` }"
          ></div>
          <div
            class="segment segment-modifying"
            :style="{ width: `${modifyingPercent}%` }"
          ></div>
          <div
            class="segment segment-unsubmitted"
            :style="{ width: `${unsubmittedPercent}%` }"
          ></div>
        </div>

        <div class="legend-row">
          <span class="legend-item text-orange">
            <span class="dot dot-orange"></span>
            修改中 {{ modifyingStudents.length }}
          </span>
          <span class="legend-item text-grey">
            <span class="dot dot-grey"></span>
            未提交 {{ unsubmittedStudents.length }}
          </span>
        </div>

        <div class="students-status-grid">
          <div
            v-for="name in modifyingStudents"
            :key="`mod-${name}`"
            class="student-badge badge-modifying"
          >
            {{ name }}
          </div>
          <div
            v-for="name in unsubmittedStudents"
            :key="`unsub-${name}`"
            class="student-badge badge-unsubmitted"
          >
            {{ name }}
          </div>
        </div>
      </aside>
    </div>

    <footer class="page-footer">
      <div class="footer-actions">
        <button
          v-if="allowHideContent"
          class="btn btn-outline-green"
          type="button"
          @click="toggleContentVisibility"
        >
          {{ isContentVisible ? '隐藏原文' : '显示原文' }}
        </button>

        <button
          class="btn"
          :class="showNextQuestion ? 'btn-primary-green' : 'btn-coral'"
          type="button"
          @click="handlePrimaryAction"
        >
          {{ primaryActionLabel }}
        </button>

        <div class="divider-line"></div>

        <button class="btn btn-icon" type="button" @click="handleMinimize">—</button>
        <button class="btn btn-close-icon" type="button" @click="handleClose">✕</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AnswerProgressContentPanel from './subjective/components/AnswerProgressContentPanel.vue';
import AnswerProgressPageHeader from './components/AnswerProgressPageHeader.vue';
import { useAnswerProgress } from './composables/useAnswerProgress.js';
import { useAskFullscreenControls } from './composables/useAskFullscreenControls.js';
import { useFlowStore } from '../../stores/flow';

const flowStore = useFlowStore();
const {
  closeAskFlow,
  minimizeToTaskbar,
  navigateFlowTarget,
  setFullscreenContext,
} = useAskFullscreenControls();

const {
  contentType,
  title,
  contentHtml,
  objectiveStem,
  imageSrc,
  allowHideContent,
  deferQuestionSetup,
  isContentVisible,
  modeLabel,
  progressTitle,
  headerStatusText,
  showNextQuestion,
  primaryActionLabel,
  timerStr,
  totalStudents,
  completedCount,
  modifyingStudents,
  unsubmittedStudents,
  completedPercent,
  modifyingPercent,
  unsubmittedPercent,
  toggleContentVisibility,
  stopTimer,
} = useAnswerProgress();

// 下一题或结束答题，按来源类型交给 flowStore 分发。
async function handlePrimaryAction() {
  if (showNextQuestion.value) {
    flowStore.handleAskWidgetAction({ action: 'next-answer-progress-question' });
    return;
  }

  stopTimer();

  const target = flowStore.handleAskWidgetAction({ action: 'finish-answer-progress' });
  if (!target) {
    return;
  }

  await navigateFlowTarget(target);
}

// 全屏最小化到右侧触发按钮。
async function handleMinimize() {
  setFullscreenContext({ fullscreenRoute: '/ask/answer-progress' });
  await minimizeToTaskbar(progressTitle.value, {
    widgetType: 'analysis-compact',
  });
}

// 关闭答题流程并回到首页。
async function handleClose() {
  stopTimer();
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

.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.left-content-panel {
  flex: 1;
  background-color: #fafaf8;
  padding: 32px 64px 56px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-sidebar {
  width: 27%;
  background-color: #ffffff;
  border-left: 1px solid var(--ez-n150);
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;

  .time-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .timer-desc {
      font-size: 12px;
      color: var(--ez-n400);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-clock {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 1.5px solid var(--ez-n400);
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 1px;
        height: 4px;
        background-color: var(--ez-n400);
      }

      &::before {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        width: 3px;
        height: 1px;
        background-color: var(--ez-n400);
      }
    }

    .timer-display {
      font-size: 26px;
      font-weight: 700;
      color: var(--ez-n900);
      line-height: 1;
    }
  }

  .progress-ratio {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    .ratio-num {
      line-height: 1;

      .current {
        font-size: 24px;
        font-weight: 700;
        color: var(--ez-p600);
      }

      .total {
        font-size: 14px;
        color: var(--ez-n400);
      }
    }

    .ratio-label {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }
}

.split-progress-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--ez-n150);
  margin-bottom: 16px;

  .segment {
    height: 100%;
    transition: width 0.3s ease;

    &-completed {
      background-color: var(--ez-p500);
    }

    &-modifying {
      background-color: var(--ez-warn);
    }

    &-unsubmitted {
      background-color: var(--ez-n300);
    }
  }
}

.legend-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;

  .legend-item {
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.text-orange {
      color: var(--ez-warn);

      .dot-orange {
        background-color: var(--ez-warn);
      }
    }

    &.text-grey {
      color: var(--ez-n400);

      .dot-grey {
        background-color: var(--ez-n300);
      }
    }
  }
}

.students-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.student-badge {
  height: 36px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &.badge-modifying {
    background-color: #fffaf7;
    border: 1px solid #fed7aa;
    color: var(--ez-warn);
  }

  &.badge-unsubmitted {
    background-color: var(--ez-n50);
    border: 1px solid var(--ez-n150);
    color: var(--ez-n600);
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
  gap: 12px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: var(--ez-n300);
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
  font-weight: 700;
  height: 44px;

  &-outline-green {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-p500);
    color: var(--ez-p600);
  }

  &-primary-green {
    background-color: var(--ez-p500);
    color: #ffffff;
    min-width: 112px;
    box-shadow: 0 4px 12px rgba(91, 159, 138, 0.24);

    &:hover {
      background-color: var(--ez-p600);
    }
  }

  &-coral {
    background-color: var(--ez-error);
    color: #ffffff;
    min-width: 112px;
  }

  &-icon {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n300);
    color: var(--ez-n700);
    width: 38px;
    padding: 0;
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 38px;
    padding: 0;
  }
}
</style>
