<template>
  <section class="select-question-widget">
    <div class="select-question-shell">
      <header class="page-header">
        <div class="header-left">
          <h2 class="title">选题提问</h2>
          <span class="sync-time">数据最后同步时间: 2026/05/06 20:00</span>
        </div>
      </header>

      <div class="page-content">
        <aside class="left-sidebar-panel">
          <SelectQuestionSelfPanel v-if="currentTab === 'self'" />
          <SelectQuestionSharedPanel v-else-if="currentTab === 'shared'" />
          <SelectQuestionTextbookPanel v-else-if="currentTab === 'textbook'" />
          <SelectQuestionBankPanel v-else-if="currentTab === 'bank'" />
        </aside>

        <SelectQuestionCenterPanel
          :questions="currentQuestions"
          :checked-question-ids="checkedQuestionIds"
          @toggle-check="toggleCheck"
        />

        <nav class="right-tab-panel">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="tab-nav-item"
            :class="{ active: currentTab === tab.id }"
            @click="currentTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <footer class="page-footer">
        <div class="footer-left">
          <button class="btn btn-outline" type="button" @click="handleSync">
            <span class="icon-sync">🔄</span>
            同步
          </button>
        </div>
        <div class="footer-actions">
          <span v-if="checkedQuestionIds.length > 0" class="selection-indicator">
            已选择
            <span class="highlight-count">{{ checkedQuestionIds.length }}</span>
            道题
          </span>

          <template v-if="hasSubjectiveSelected">
            <button
              class="btn btn-subjective-outline"
              type="button"
              @click="handleVoiceAnswer"
            >
              语音答题
            </button>
            <button
              class="btn btn-subjective-primary"
              type="button"
              @click="handlePhotoAnswer"
            >
              拍照答题
            </button>
          </template>
          <button
            v-else
            class="btn btn-primary"
            :class="{ active: checkedQuestionIds.length > 0 }"
            type="button"
            :disabled="checkedQuestionIds.length === 0"
            @click="handleLaunchQuestions"
          >
            开始提问
          </button>

          <button class="btn btn-close-icon" type="button" @click="handleClose">
            ✕
          </button>
        </div>
      </footer>
    </div>

    <SelectQuestionMixConfirmDialog ref="mixConfirmDialogRef" />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  findQuestionById,
  isSubjectiveQuestion,
  resolveObjectiveQuestionTypeCode,
  splitSelectedQuestionIds,
} from '../../../shared/utils/selectQuestion.js';
import {
  questionsByTab,
  SELECT_QUESTION_TABS,
} from '../../../mock/selectQuestion.js';
import SelectQuestionBankPanel from '../components/selectQuestion/SelectQuestionBankPanel.vue';
import SelectQuestionCenterPanel from '../components/selectQuestion/SelectQuestionCenterPanel.vue';
import SelectQuestionMixConfirmDialog from '../components/selectQuestion/SelectQuestionMixConfirmDialog.vue';
import SelectQuestionSelfPanel from '../components/selectQuestion/SelectQuestionSelfPanel.vue';
import SelectQuestionSharedPanel from '../components/selectQuestion/SelectQuestionSharedPanel.vue';
import SelectQuestionTextbookPanel from '../components/selectQuestion/SelectQuestionTextbookPanel.vue';

const props = defineProps({
  sessionId: {
    type: String,
    default: '',
  },
  initialTab: {
    type: String,
    default: 'self',
  },
  source: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['flow-action']);

const mixConfirmDialogRef = ref(null);
const tabs = SELECT_QUESTION_TABS;
const currentTab = ref(props.initialTab || props.source || 'self');
const checkedQuestionIds = ref([]);

const currentQuestions = computed(() => questionsByTab[currentTab.value] || []);

const hasSubjectiveSelected = computed(() => {
  const { subjectiveIds } = splitSelectedQuestionIds(
    checkedQuestionIds.value,
    questionsByTab,
  );
  return subjectiveIds.length > 0;
});

// 弹出主观/客观互斥确认框。
async function confirmMixSelection() {
  return Boolean(await mixConfirmDialogRef.value?.handleOpen());
}

// 切换题目勾选：客观题多选，主观题单选，两类不可混选。
async function toggleCheck(questionId) {
  const question = findQuestionById(questionId, questionsByTab);
  if (!question) {
    return;
  }

  const checkedIndex = checkedQuestionIds.value.indexOf(questionId);
  if (checkedIndex > -1) {
    checkedQuestionIds.value.splice(checkedIndex, 1);
    return;
  }

  const selectingSubjective = isSubjectiveQuestion(question);
  const { subjectiveIds, objectiveIds } = splitSelectedQuestionIds(
    checkedQuestionIds.value,
    questionsByTab,
  );

  if (selectingSubjective) {
    if (objectiveIds.length > 0) {
      const confirmed = await confirmMixSelection();
      if (!confirmed) {
        return;
      }
    }

    checkedQuestionIds.value = [questionId];
    return;
  }

  if (subjectiveIds.length > 0) {
    const confirmed = await confirmMixSelection();
    if (!confirmed) {
      return;
    }
    checkedQuestionIds.value = [questionId];
    return;
  }

  checkedQuestionIds.value.push(questionId);
}

// 同步云端题目数据（mock 占位）。
function handleSync() {
  console.log('同步云端最新试题数据');
}

// 客观题开始提问：单题走即兴同款小屏，多题走全屏批次答题。
function handleLaunchQuestions() {
  if (checkedQuestionIds.value.length === 0 || hasSubjectiveSelected.value) {
    return;
  }

  const questionIds = [...checkedQuestionIds.value];

  if (questionIds.length === 1) {
    const question = findQuestionById(questionIds[0], questionsByTab);

    emit('flow-action', {
      action: 'open-answer-progress',
      entrySource: 'select-question',
      questionId: question?.id || questionIds[0],
      questionType: resolveObjectiveQuestionTypeCode(question),
      optionCount: 4,
    });
    return;
  }

  emit('flow-action', {
    action: 'start-question-batch-progress',
    questionIds,
    tab: currentTab.value,
    entrySource: 'select-question',
  });
}

// 主观题语音答题入口。
function handleVoiceAnswer() {
  if (!hasSubjectiveSelected.value) {
    return;
  }

  emit('flow-action', {
    action: 'start-question-batch-progress',
    mode: 'voice',
    questionIds: [...checkedQuestionIds.value],
    tab: currentTab.value,
    entrySource: 'select-question',
  });
}

// 主观题拍照答题入口。
function handlePhotoAnswer() {
  if (!hasSubjectiveSelected.value) {
    return;
  }

  emit('flow-action', {
    action: 'start-question-batch-progress',
    mode: 'photo',
    questionIds: [...checkedQuestionIds.value],
    tab: currentTab.value,
    entrySource: 'select-question',
  });
}

// 关闭选题小屏，结束整个问业务流程。
function handleClose() {
  emit('flow-action', { action: 'close-flow' });
}
</script>

<style scoped lang="scss">
.select-question-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: var(--ez-n100);
}

.select-question-shell {
  display: flex;
  flex-direction: column;
  width: 1260px;
  height: 920px;
  background: var(--ez-n100);
  overflow: hidden;
}

.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--ez-n150);
  padding: 0 24px;
  display: flex;
  align-items: center;

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .sync-time {
    font-size: 12px;
    color: var(--ez-n400);
  }
}

.page-content {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.left-sidebar-panel {
  width: 260px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-right: 1px solid var(--ez-n150);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  min-height: 0;
}

.right-tab-panel {
  width: 100px;
  flex-shrink: 0;
  border-left: 1.5px solid var(--ez-n150);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  padding: 16px 0;
  background-color: #ffffff;
}

.tab-nav-item {
  border: none;
  background: transparent;
  padding: 18px 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ez-n600);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--ez-n900);
  }

  &.active {
    color: var(--ez-p600);
    background-color: var(--ez-p50);
    box-shadow: inset 3px 0 0 var(--ez-p500);
  }
}

.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid var(--ez-n150);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selection-indicator {
  font-size: 13px;
  color: var(--ez-n600);

  .highlight-count {
    color: var(--ez-p600);
    font-weight: 800;
    font-size: 15px;
  }
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
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-primary {
    background-color: var(--ez-n300);
    color: #ffffff;
    cursor: not-allowed;

    &.active {
      background-color: var(--ez-p500);
      cursor: pointer;

      &:hover {
        background-color: var(--ez-p600);
      }
    }
  }

  &-outline {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n300);
    color: var(--ez-n700);
    padding: 0 16px;
    gap: 6px;
  }

  &-subjective-outline {
    min-width: 120px;
    background-color: #ffffff;
    border: 1.5px solid var(--ez-p500);
    color: var(--ez-p600);
    padding: 0 24px;
  }

  &-subjective-primary {
    min-width: 120px;
    background-color: var(--ez-p500);
    color: #ffffff;
    padding: 0 24px;
    box-shadow: 0 4px 12px rgba(91, 159, 138, 0.24);

    &:hover {
      background-color: var(--ez-p600);
    }
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 44px;
    padding: 0;
  }
}
</style>

<style lang="scss">
.select-question-widget {
  .select-question-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sidebar-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--ez-n400);
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n700);
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--ez-n50);
    }

    &.active {
      background-color: var(--ez-p50);
      color: var(--ez-p600);
    }
  }
}
</style>
