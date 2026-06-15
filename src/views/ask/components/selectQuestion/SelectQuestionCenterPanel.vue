<template>
  <div class="select-question-center">
    <div class="filter-header-row">
      <div class="filter-item">
        <span class="filter-text-label">题型</span>
        <el-select v-model="filterType" style="width: 110px">
          <el-option label="全部" value="all" />
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multi" />
          <el-option label="主观题" value="subjective" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-text-label">难度</span>
        <el-select v-model="filterDifficulty" style="width: 110px">
          <el-option label="全部" value="all" />
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </div>
    </div>

    <div class="questions-scroll-list">
      <div
        v-for="question in filteredQuestions"
        :key="question.id"
        class="question-card"
        :class="{ checked: checkedQuestionIds.includes(question.id) }"
      >
        <div class="card-meta-row">
          <span class="q-index">{{ question.index }}.</span>
          <span class="q-type-badge">{{ question.type }}</span>
          <span class="q-difficulty-badge" :class="question.difficultyClass">
            {{ question.difficulty }}
          </span>
          <button
            type="button"
            class="checkbox-wrapper"
            aria-label="选择题目"
            @click="toggleCheck(question.id)"
          >
            <span
              class="custom-checkbox"
              :class="{ checked: checkedQuestionIds.includes(question.id) }"
            ></span>
          </button>
        </div>

        <div class="q-content-body">
          <p class="stem-text">{{ question.stem }}</p>
          <div v-if="question.subText?.length" class="sub-rich-text">
            <p v-for="(paragraph, index) in question.subText" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { isSubjectiveQuestion } from '../../../../shared/utils/selectQuestion.js';

const props = defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  checkedQuestionIds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['toggle-check']);

const filterType = ref('all');
const filterDifficulty = ref('all');

const typeFilterMap = {
  single: '单选题',
  multi: '多选题',
  subjective: '主观题',
};

const difficultyFilterMap = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

// 按题型与难度筛选当前 Tab 下的题目列表。
const filteredQuestions = computed(() =>
  props.questions.filter((question) => {
    const typeMatched =
      filterType.value === 'all' ||
      (filterType.value === 'subjective'
        ? isSubjectiveQuestion(question)
        : question.type === typeFilterMap[filterType.value]);
    const difficultyMatched =
      filterDifficulty.value === 'all' ||
      question.difficulty === difficultyFilterMap[filterDifficulty.value];

    return typeMatched && difficultyMatched;
  }),
);

// 切换题目勾选状态并通知父级。
function toggleCheck(questionId) {
  emit('toggle-check', questionId);
}
</script>

<style scoped lang="scss">
.select-question-center {
  flex: 1;
  min-width: 0;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-header-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-text-label {
    font-size: 12px;
    color: var(--ez-n400);
  }
}

.questions-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.question-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1.5px solid var(--ez-n150);
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 160ms ease, background-color 160ms ease;

  &.checked {
    border-color: var(--ez-p500);
    background-color: var(--ez-p50);
  }
}

.card-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .q-index {
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n400);
  }

  .q-type-badge {
    background-color: var(--ez-n100);
    color: var(--ez-n400);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .q-difficulty-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;

    &.easy {
      background-color: #e6fcf1;
      color: #10b981;
    }

    &.medium {
      background-color: #fff7ed;
      color: #f97316;
    }

    &.hard {
      background-color: #fef2f2;
      color: #ef4444;
    }
  }

  .checkbox-wrapper {
    margin-left: auto;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  .custom-checkbox {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--ez-n300);
    border-radius: 6px;
    position: relative;
    box-sizing: border-box;
    transition: all 0.15s;

    &.checked {
      border-color: var(--ez-p500);
      background-color: var(--ez-p500);

      &::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 4px;
        height: 9px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
}

.q-content-body {
  .stem-text {
    margin: 0;
    font-size: 14px;
    color: var(--ez-n800);
    line-height: 1.6;
    font-weight: 700;
    white-space: pre-line;
  }

  .sub-rich-text {
    margin-top: 10px;
    background-color: var(--ez-n50);
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    color: var(--ez-n600);
    line-height: 1.6;

    p {
      margin: 0;
    }
  }
}
</style>
