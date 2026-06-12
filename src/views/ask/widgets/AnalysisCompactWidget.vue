<template>
  <CompactWidgetLayout
    :title="compactTitle"
    :subtitle="currentQuestionMeta.typeLabel"
    :show-back="showCompactBack"
    @fullscreen="$emit('fullscreen')"
    @back="handleCompactBack"
    @minimize="$emit('minimize')"
    @close="$emit('close')"
  >
    <section class="compact-analysis">
      <div class="question-card">
        <div class="question-type-bar">
          <span class="index-circle">{{ currentPage }}</span>
          <span class="type-text">{{ currentQuestionMeta.typeLabel }}</span>
        </div>

        <h2 class="question-stem">{{ questionStem }}</h2>

        <div class="option-chips">
          <span
            v-for="opt in options"
            :key="opt.key"
            class="option-chip"
          >{{ opt.key }}</span>
        </div>
      </div>

      <ObjectiveQuestionDistribution
        compact
        :distributions="distributions"
        :get-status="getDistributionStatus"
        :expanded-label="expandedLabel"
        :student-list-map="studentListMap"
        :has-answer-set="hasAnswerSet"
        @toggle-student-list="handleViewStudentList"
      />

      <div v-if="isMultiQuestion" class="pagination-bar">
        <button
          type="button"
          class="btn-pagination"
          :disabled="currentPage === 1"
          @click="changePage(-1)"
        >
          &lt; 上一题
        </button>
        <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="btn-pagination"
          :disabled="currentPage === totalPages"
          @click="changePage(1)"
        >
          下一题 &gt;
        </button>
      </div>
    </section>

    <template #actions>
      <button class="btn-primary" type="button" @click="handleSetAnswers">
        设置答案
      </button>
    </template>
  </CompactWidgetLayout>

  <SetSingleAnswerDialog
    v-model="showSetAnswerDialog"
    compact
    :question-index="currentPage"
    :question-type="currentQuestionMeta.type"
    :type-label="currentQuestionMeta.typeLabel"
    :option-count="currentOptionCount"
    :initial-answer="currentSavedAnswer"
    @confirm="handleAnswerConfirm"
  />
</template>

<script setup>
import CompactWidgetLayout from "../../../components/widget/CompactWidgetLayout.vue";
import ObjectiveQuestionDistribution from "../components/ObjectiveQuestionDistribution.vue";
import SetSingleAnswerDialog from "../components/SetSingleAnswerDialog.vue";
import { useObjectiveQuestionAnalysis } from "../composables/useObjectiveQuestionAnalysis";

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
  isMultiQuestion,
  showCompactBack,
  currentPage,
  totalPages,
  currentQuestionMeta,
  currentOptionCount,
  questionStem,
  options,
  distributions,
  showSetAnswerDialog,
  currentSavedAnswer,
  hasAnswerSet,
  expandedLabel,
  studentListMap,
  compactTitle,
  changePage,
  handleViewStudentList,
  handleSetAnswers,
  handleAnswerConfirm,
  getDistributionStatus,
  handleCompactBack,
} = useObjectiveQuestionAnalysis({
  widgetProps: props,
});
</script>

<style scoped lang="scss">
.compact-analysis {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px 0 8px;
}

.question-card {
  background: var(--ez-n100);
  border-radius: 14px;
  padding: 14px;
}

.question-type-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  .index-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--ez-p500);
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    display: grid;
    place-items: center;
  }

  .type-text {
    font-size: 12px;
    font-weight: 700;
    color: var(--ez-n600);
  }
}

.question-stem {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ez-n900);
  line-height: 1.45;
}

.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-chip {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--ez-n200);
  background: #ffffff;
  color: var(--ez-n700);
  font-size: 14px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 4px;
}

.btn-pagination {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--ez-n200);
  background: #ffffff;
  color: var(--ez-n700);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.page-indicator {
  font-size: 13px;
  font-weight: 700;
  color: var(--ez-n600);
  min-width: 48px;
  text-align: center;
}
</style>
