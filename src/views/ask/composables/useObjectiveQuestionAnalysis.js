/**
 * 单题客观题分析 composable。
 * 供 ObjectiveQuestionDetail（全屏）与 AnalysisCompactWidget（缩屏）共用：
 * 题目 mock 数据、翻页、设置答案、作答分布正误、全屏/缩屏状态同步。
 */
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  getDistributionOptionStatus,
  hasDistributionAnswer,
} from "../../../utils/answerDistribution.js";
import { useFlowStore } from "../../../stores/flow";
import { useWidgetStore } from "../../../stores/widget";

const ROUTE_TYPE_MAP = {
  2: { type: "single", typeLabel: "单选" },
  3: { type: "multiple", typeLabel: "多选" },
  4: { type: "judge", typeLabel: "判断" },
  20: { type: "numerical", typeLabel: "数字" },
};

const QUESTION_TYPE_MAP = {
  单选: { type: "single", typeLabel: "单选" },
  多选: { type: "multiple", typeLabel: "多选" },
  判断: { type: "judge", typeLabel: "判断" },
  数字: { type: "numerical", typeLabel: "数字" },
  数值: { type: "numerical", typeLabel: "数字" },
};

const singleQuestion = {
  type: "单选",
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

const multiQuestions = [
  {
    type: "单选",
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
    type: "多选",
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
    type: "判断",
    stem: "光合作用只在白天进行，夜晚完全停止。",
    options: [
      { key: "对", text: "对" },
      { key: "错", text: "错" },
    ],
    answered: 26,
    total: 30,
    distributions: [
      { label: "✓", count: 10, percent: 33 },
      { label: "✕", count: 16, percent: 53 },
      { label: "未答", count: 4, percent: 13 },
    ],
  },
  {
    type: "数字",
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

const studentListMap = {
  A: ["张伟", "李娜", "王芳", "陈静", "赵鑫", "刘洋", "周婷", "吴磊"],
  B: ["孙明", "马丽", "郑爽", "高峰"],
  C: ["黄晓", "林黛", "何炅", "谢娜", "邓超", "杨幂", "胡歌", "刘涛", "赵薇", "周迅", "陈坤"],
  D: ["吴京", "徐峥"],
  未答: ["沈腾", "贾玲", "黄渤", "王宝强"],
};

/**
 * 创建单题客观题分析页的响应式状态与交互方法。
 * @param {{ route?: import('vue-router').RouteLocationNormalizedLoaded, widgetProps?: Record<string, unknown> }} [context]
 *   - route：全屏页传入当前路由；缩屏页可省略，改从 widgetProps / flowStore 读取。
 *   - widgetProps.routeQuery：缩屏 widget 透传的路由 query。
 */
export function useObjectiveQuestionAnalysis(context = {}) {
  const route = context.route || useRoute();
  const flowStore = useFlowStore();
  const widgetStore = useWidgetStore();
  const widgetProps = context.widgetProps || null;

  const querySource = computed(() => {
    if (widgetProps?.routeQuery) {
      return widgetProps.routeQuery;
    }
    if (flowStore.objectiveAnalysisState?.routeQuery) {
      return flowStore.objectiveAnalysisState.routeQuery;
    }
    return route.query;
  });

  const isMultiQuestion = computed(
    () => querySource.value.entrySource === "multi-question",
  );

  const currentPage = ref(1);
  const totalPages = ref(1);
  const showSetAnswerDialog = ref(false);
  const correctAnswersMap = ref({});
  const expandedLabel = ref(null);

  // 从 flowStore / 路由恢复分析上下文。
  function restoreAnalysisState() {
    const saved = flowStore.objectiveAnalysisState;
    const pageFromQuery = Number(querySource.value.questionIndex || 0) + 1;

    currentPage.value = saved?.currentPage || pageFromQuery || 1;
    totalPages.value = isMultiQuestion.value
      ? Number(querySource.value.batchSize) || 4
      : 1;

    if (saved?.correctAnswersMap) {
      correctAnswersMap.value = { ...saved.correctAnswersMap };
    }
  }

  onMounted(() => {
    if (querySource.value.compactParent === "multi-batch-compact") {
      flowStore.fullscreenRoute = "/ask/multi-batch-analysis";
      const batchQuery = flowStore.batchAnalysisState?.routeQuery;
      if (batchQuery) {
        flowStore.fullscreenQuery = { ...batchQuery };
      }
    } else {
      flowStore.fullscreenRoute = "/ask/objective-detail";
    }
    restoreAnalysisState();
    persistAnalysisState();
  });

  watch(querySource, () => {
    restoreAnalysisState();
  });

  const questionTypeLabel = computed(() => {
    const typeMap = { 2: "单选", 3: "多选", 4: "判断", 20: "数字" };
    return typeMap[querySource.value.questionType] || "单选";
  });

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

  const currentQuestionMeta = computed(() => {
    const questionType = currentQuestion.value.type;
    if (questionType && QUESTION_TYPE_MAP[questionType]) {
      return QUESTION_TYPE_MAP[questionType];
    }

    const routeType = ROUTE_TYPE_MAP[Number(querySource.value.questionType)];
    if (routeType) {
      return routeType;
    }

    return QUESTION_TYPE_MAP[questionTypeLabel.value] || QUESTION_TYPE_MAP["单选"];
  });

  const currentOptionCount = computed(() => {
    if (
      currentQuestionMeta.value.type === "single" ||
      currentQuestionMeta.value.type === "multiple"
    ) {
      return options.value.length || 4;
    }
    return 4;
  });

  const currentSavedAnswerMeta = computed(() => {
    const saved = correctAnswersMap.value[currentPage.value];
    if (!saved) {
      return null;
    }

    if (typeof saved === "object" && saved !== null && "value" in saved) {
      return saved;
    }

    return {
      type: currentQuestionMeta.value.type,
      value: saved,
    };
  });

  const currentSavedAnswer = computed(
    () => currentSavedAnswerMeta.value?.value ?? "",
  );

  const hasAnswerSet = computed(() =>
    hasDistributionAnswer(currentSavedAnswerMeta.value),
  );

  const compactTitle = computed(
    () => `题目分析 第 ${currentPage.value} 题`,
  );

  const showCompactBack = computed(
    () => querySource.value.compactParent === "multi-batch-compact",
  );

  watch(showSetAnswerDialog, () => {
    nextTick(() => {
      document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
    });
  });

  // 持久化分析状态，供全屏与缩屏切换共享。
  function persistAnalysisState() {
    flowStore.saveObjectiveAnalysisState({
      correctAnswersMap: { ...correctAnswersMap.value },
      currentPage: currentPage.value,
      routeQuery: { ...querySource.value },
    });
    flowStore.fullscreenQuery = { ...querySource.value };
  }

  watch(
    correctAnswersMap,
    () => {
      persistAnalysisState();
    },
    { deep: true },
  );

  watch(currentPage, () => {
    persistAnalysisState();
  });

  // 多题模式下翻页，step 为 -1 上一题 / 1 下一题，越界时不改变页码。
  function changePage(step) {
    const target = currentPage.value + step;
    if (target >= 1 && target <= totalPages.value) {
      currentPage.value = target;
    }
  }

  // 点击作答分布行时展开/收起对应选项的学生名单。
  function handleViewStudentList(label) {
    expandedLabel.value = expandedLabel.value === label ? null : label;
  }

  // 打开设置正确答案弹框，并通知 overlay 刷新可点击热区。
  function handleSetAnswers() {
    showSetAnswerDialog.value = true;
    nextTick(() => {
      document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
    });
  }

  // 确认保存当前题正确答案，并同步 flowStore 供全屏/缩屏共享。
  function handleAnswerConfirm(payload) {
    correctAnswersMap.value[currentPage.value] = {
      type: payload.type,
      typeLabel: payload.typeLabel,
      value: payload.value,
    };
    persistAnalysisState();
    nextTick(() => {
      document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
    });
  }

  // 获取作答分布某一选项的正误展示状态（default / correct / wrong / unanswered）。
  function getDistributionStatus(label) {
    return getDistributionOptionStatus(currentSavedAnswerMeta.value, label);
  }

  // 从单题分析缩屏返回到父级多题答题分析缩屏。
  async function handleCompactBack() {
    const target = flowStore.returnToCompactParent();
    if (!target) {
      return;
    }

    widgetStore.openWidget(target.widgetType, target.props, {
      preservePosition: true,
    });

    await nextTick();
    document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
  }

  return {
    isMultiQuestion,
    showCompactBack,
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
    compactTitle,
    changePage,
    handleViewStudentList,
    handleSetAnswers,
    handleAnswerConfirm,
    getDistributionStatus,
    handleCompactBack,
    persistAnalysisState,
    querySource,
  };
}
