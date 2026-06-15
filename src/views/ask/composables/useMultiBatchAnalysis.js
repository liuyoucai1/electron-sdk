/**
 * 多题批次答题分析 composable。
 * 供 MultiBatchAnalysisView（全屏）与 MultiBatchCompactWidget（缩屏）共用：
 * 题目列表、排序、批次设置答案、作答分布徽章正误、全屏/缩屏状态同步。
 */
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getDistributionOptionStatus } from "../../../shared/utils/answerDistribution.js";
import { useFlowStore } from "../../../stores/flow";
import { useWidgetStore } from "../../../stores/widget";

const QUESTION_TYPE_MAP = {
  单选: { type: "single", typeLabel: "单选" },
  多选: { type: "multiple", typeLabel: "多选" },
  判断: { type: "judge", typeLabel: "判断" },
  数字: { type: "numerical", typeLabel: "数字" },
};

const QUESTION_TYPE_CODE = {
  单选: "2",
  多选: "3",
  判断: "4",
  数字: "20",
};

const mockQuestions = [
  {
    id: 1,
    type: "单选",
    colorClass: "danger",
    correctRate: 27,
    options: [
      { label: "A", value: "27%" },
      { label: "B", value: "17%" },
      { label: "C", value: "37%" },
      { label: "D", value: "7%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 2,
    type: "多选",
    colorClass: "success",
    correctRate: 85,
    options: [
      { label: "AC", value: "70%" },
      { label: "ABC", value: "7%" },
      { label: "BD", value: "3%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 3,
    type: "判断",
    colorClass: "warning",
    correctRate: 63,
    options: [
      { label: "✓", value: "33%" },
      { label: "✕", value: "53%" },
      { label: "未答", value: "13%", isNoAnswer: true },
    ],
  },
  {
    id: 4,
    type: "数字",
    colorClass: "success",
    correctRate: 80,
    options: [
      { label: "36", value: "70%" },
      { label: "24", value: "7%" },
      { label: "12", value: "3%" },
      { label: "48", value: "3%" },
      { label: "未答", value: "17%", isNoAnswer: true },
    ],
  },
];

/**
 * 创建多题批次分析页的响应式状态与交互方法。
 * @param {{ route?: import('vue-router').RouteLocationNormalizedLoaded, widgetProps?: Record<string, unknown>, isCompact?: boolean }} [context]
 */
export function useMultiBatchAnalysis(context = {}) {
  const route = context.route || useRoute();
  const router = useRouter();
  const flowStore = useFlowStore();
  const widgetStore = useWidgetStore();
  const widgetProps = context.widgetProps || null;
  const isCompact = Boolean(context.isCompact);

  const querySource = computed(() => {
    if (widgetProps?.routeQuery) {
      return widgetProps.routeQuery;
    }
    // 全屏页以路由 query 为准，避免 persist 回写 flowStore 后 querySource 变化触发 restore 死循环。
    if (context.route) {
      return context.route.query;
    }
    if (flowStore.batchAnalysisState?.routeQuery) {
      return flowStore.batchAnalysisState.routeQuery;
    }
    return route.query;
  });

  const batchSize = computed(
    () => Number(querySource.value.batchSize) || flowStore.batchSize || 4,
  );

  const questions = ref(mockQuestions.map((item) => ({ ...item })));
  const currentSort = ref("index");
  const batchCorrectAnswers = ref([]);

  // 从 flowStore 恢复批次分析上下文。
  function restoreBatchAnalysisState() {
    const saved = flowStore.batchAnalysisState;
    if (saved?.currentSort) {
      currentSort.value = saved.currentSort;
    }
    if (saved?.batchCorrectAnswers) {
      batchCorrectAnswers.value = [...saved.batchCorrectAnswers];
    }
  }

  // 持久化批次分析状态，供全屏与缩屏切换共享。
  function persistBatchAnalysisState() {
    flowStore.saveBatchAnalysisState({
      currentSort: currentSort.value,
      batchCorrectAnswers: [...batchCorrectAnswers.value],
      routeQuery: { ...querySource.value },
    });
    flowStore.setFullscreenContext({
      fullscreenQuery: { ...querySource.value },
    });
  }

  onMounted(() => {
    flowStore.setFullscreenContext({
      currentStep: "batch-analysis",
      fullscreenRoute: "/ask/multi-batch-analysis",
    });
    restoreBatchAnalysisState();
    persistBatchAnalysisState();
  });

  watch(querySource, () => {
    restoreBatchAnalysisState();
  });

  watch(
    [currentSort, batchCorrectAnswers],
    () => {
      persistBatchAnalysisState();
    },
    { deep: true },
  );

  const questionCount = computed(() => questions.value.length);

  // 题目列表：展示全部题目，排序只改变顺序。
  const displayedQuestions = computed(() => {
    const list = [...questions.value];

    if (currentSort.value === "rate") {
      return list.sort((a, b) => a.correctRate - b.correctRate);
    }

    return list.sort((a, b) => a.id - b.id);
  });

  const setAnswerQuestions = computed(() =>
    displayedQuestions.value.map((q) => {
      const mapped = QUESTION_TYPE_MAP[q.type] || QUESTION_TYPE_MAP["单选"];
      return {
        id: q.id,
        type: mapped.type,
        typeLabel: mapped.typeLabel,
        optionCount: 4,
      };
    }),
  );

  const correctAnswerByQuestionId = computed(() => {
    const map = new Map();
    batchCorrectAnswers.value.forEach((item) => {
      map.set(item.questionId, item);
    });
    return map;
  });

  // 切换题目列表排序方式。
  function setSort(mode) {
    currentSort.value = mode;
  }

  // 打开批次设置正确答案弹框；由父级传入弹框组件 ref。
  function handleSetAnswers(dialogRef) {
    dialogRef?.handleOpen({
      questions: setAnswerQuestions.value,
      initialAnswers: batchCorrectAnswers.value,
    });
  }

  // 保存批次正确答案配置。
  function handleAnswersConfirm(answers) {
    batchCorrectAnswers.value = answers;
    persistBatchAnalysisState();
    nextTick(() => {
      document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
    });
  }

  // 获取作答分布徽章样式：未设置答案为默认色，设置后区分正误。
  function getDistBadgeClass(question, option) {
    const savedAnswer = correctAnswerByQuestionId.value.get(question.id);
    const status = getDistributionOptionStatus(savedAnswer, option.label);

    if (status === "unanswered") {
      return "badge-grey";
    }
    if (status === "correct") {
      return "badge-correct";
    }
    if (status === "wrong") {
      return "badge-wrong";
    }
    return "badge-default";
  }

  // 点击题目行：缩屏内进入单题分析缩屏；全屏内进入单题客观题分析全屏页。
  async function handleQuestionClick(question) {
    persistBatchAnalysisState();

    const query = {
      entrySource: "multi-question",
      questionIndex: String(question.id - 1),
      questionType: QUESTION_TYPE_CODE[question.type] || "2",
      batchSize: String(batchSize.value),
      returnTo: "/ask/multi-batch-analysis",
    };

    if (isCompact) {
      const activeWidget = widgetStore.activeWidget;

      flowStore.saveCompactParent({
        widgetType: "multi-batch-compact",
        props: {
          sessionId: flowStore.sessionId,
          questionId: flowStore.questionId,
          step: "batch-analysis",
          routeQuery: { ...querySource.value },
        },
        position: activeWidget
          ? { x: activeWidget.x, y: activeWidget.y, scale: activeWidget.scale }
          : null,
      });

      flowStore.currentQuestionIndex = question.id - 1;
      flowStore.setFullscreenContext({
        currentStep: "single-analysis",
        fullscreenRoute: "/ask/objective-detail",
        fullscreenQuery: {
          ...query,
          compactParent: "multi-batch-compact",
        },
      });

      flowStore.saveObjectiveAnalysisState({
        currentPage: question.id,
        correctAnswersMap: flowStore.objectiveAnalysisState?.correctAnswersMap || {},
        routeQuery: {
          ...query,
          compactParent: "multi-batch-compact",
        },
      });

      widgetStore.openWidget(
        "analysis-compact",
        {
          sessionId: flowStore.sessionId,
          questionId: String(question.id),
          step: "single-analysis",
          routeQuery: {
            ...query,
            compactParent: "multi-batch-compact",
          },
        },
        { preservePosition: true },
      );

      await nextTick();
      document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
      return;
    }

    flowStore.currentQuestionIndex = question.id - 1;
    flowStore.setFullscreenContext({
      currentStep: "single-analysis",
      fullscreenRoute: "/ask/objective-detail",
    });

    await router.push({
      path: "/ask/objective-detail",
      query,
    });
  }

  return {
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
  };
}
