<template>
  <CompactWidgetLayout
    title="多题答题分析"
    @fullscreen="$emit('fullscreen')"
    @minimize="$emit('minimize')"
    @close="$emit('close')"
  >
    <section class="compact-batch">
      <div class="list-header">
        <div class="header-left-sub">
          <span class="panel-title">题目列表</span>
          <span class="badge-tag">{{ questionCount }} 题</span>
        </div>
        <div class="toggle-button-group">
          <button
            class="toggle-btn"
            :class="{ active: currentSort === 'index' }"
            type="button"
            @click="setSort('index')"
          >
            按题号
          </button>
          <button
            class="toggle-btn"
            :class="{ active: currentSort === 'rate' }"
            type="button"
            @click="setSort('rate')"
          >
            按低正确率
          </button>
        </div>
      </div>

      <div class="question-list">
        <div
          v-for="q in displayedQuestions"
          :key="q.id"
          class="question-item"
          @click="handleQuestionClick(q)"
        >
          <div class="color-indicator" :class="q.colorClass"></div>
          <span class="q-index">{{ q.id }}</span>
          <span class="q-type-badge">{{ q.type }}</span>

          <div class="options-distribution">
            <span
              v-for="opt in q.options"
              :key="opt.label"
              class="dist-badge"
              :class="getDistBadgeClass(q, opt)"
            >
              {{ opt.label }}
              <span class="badge-val">{{ opt.value }}</span>
            </span>
          </div>

          <span class="arrow-right">></span>
        </div>
      </div>

      <div class="panel-footer-legend">
        <span class="legend-item">
          <span class="dot dot-red"></span> 正确率 &lt;60%
        </span>
        <span class="legend-item">
          <span class="dot dot-orange"></span> 正确率 60-79%
        </span>
        <span class="legend-item">
          <span class="dot dot-green"></span> 正确率 ≥80%
        </span>
      </div>
    </section>

    <template #actions>
      <button class="btn-primary" type="button" @click="handleSetAnswers">
        设置答案
      </button>
    </template>
  </CompactWidgetLayout>

  <SetBatchAnswersDialog
    v-model="showSetAnswersDialog"
    compact
    :questions="setAnswerQuestions"
    :initial-answers="batchCorrectAnswers"
    @confirm="handleAnswersConfirm"
  />
</template>

<script setup>
import CompactWidgetLayout from "../../../components/widget/CompactWidgetLayout.vue";
import SetBatchAnswersDialog from "../components/SetBatchAnswersDialog.vue";
import { useMultiBatchAnalysis } from "../composables/useMultiBatchAnalysis";

const props = defineProps({
  sessionId: {
    type: String,
    default: "",
  },
  questionId: {
    type: String,
    default: "",
  },
  step: {
    type: String,
    default: "",
  },
  routeQuery: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(["fullscreen", "minimize", "close"]);

const {
  questionCount,
  displayedQuestions,
  currentSort,
  setAnswerQuestions,
  showSetAnswersDialog,
  batchCorrectAnswers,
  setSort,
  handleSetAnswers,
  handleAnswersConfirm,
  getDistBadgeClass,
  handleQuestionClick,
} = useMultiBatchAnalysis({
  widgetProps: props,
  isCompact: true,
});
</script>

<style scoped lang="scss">
.compact-batch {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0 4px;
  min-height: 0;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
}

.header-left-sub {
  display: flex;
  align-items: center;
  gap: 8px;

  .panel-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .badge-tag {
    font-size: 11px;
    font-weight: 700;
    color: var(--ez-n500);
    background: var(--ez-n100);
    padding: 2px 8px;
    border-radius: 6px;
  }
}

.toggle-button-group {
  display: flex;
  background: var(--ez-n100);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.toggle-btn {
  border: none;
  background: transparent;
  color: var(--ez-n500);
  font-size: 11px;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;

  &.active {
    background: #ffffff;
    color: var(--ez-n900);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
}

.question-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--ez-n150);
  cursor: pointer;

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
    font-size: 14px;
    font-weight: 800;
    color: var(--ez-n900);
    width: 20px;
    flex-shrink: 0;
  }

  .q-type-badge {
    background: var(--ez-n100);
    color: var(--ez-n500);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    flex-shrink: 0;
  }
}

.options-distribution {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.dist-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid transparent;

  .badge-val {
    margin-left: 3px;
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
  font-size: 12px;
  color: #cbd5e1;
  flex-shrink: 0;
}

.panel-footer-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
  padding-top: 4px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

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
</style>
