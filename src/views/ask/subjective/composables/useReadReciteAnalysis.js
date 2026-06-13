/**
 * 背读判分页数据 composable。
 * 当前使用 flowStore 中的 mock 数据；后续通过 IPC / postMessage 调用 applyAnalysisUpdate 实时刷新。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { STATUS_LABELS } from "../../../../mock/readReciteAnalysis.js";
import { useFlowStore } from "../../../../stores/flow";
import { buildReadReciteAnalysis } from "../utils/buildReadReciteAnalysis.js";

export function useReadReciteAnalysis(options = {}) {
  const { setupFullscreen = true } = options;
  const flowStore = useFlowStore();
  const analysis = ref(
    flowStore.readReciteAnalysisState ||
      buildReadReciteAnalysis(flowStore.answerProgressState || {}),
  );
  const expandedLabel = ref(null);

  const pageTitle = computed(() => analysis.value.pageTitle || "背诵分析");
  const subtitle = computed(() => analysis.value.subtitle || "");
  const contentHtml = computed(() => analysis.value.contentHtml || "");
  const students = computed(() => analysis.value.students || []);
  const distributions = computed(() => analysis.value.distributions || []);
  const studentListMap = computed(() => analysis.value.studentListMap || {});
  const stats = computed(
    () =>
      analysis.value.stats || {
        answeredCount: 0,
        totalStudents: 0,
        passRate: 0,
      },
  );
  const aiGradingComplete = computed(
    () => analysis.value.aiGradingComplete !== false,
  );

  const modeBadge = computed(() => {
    if (analysis.value.sourceType === "voice") {
      return "语";
    }

    return analysis.value.reciteType === "read" ? "朗" : "背";
  });

  // 映射学生状态为展示文案。
  function getStatusLabel(status) {
    return STATUS_LABELS[status] || "";
  }

  // 点击作答分布行时展开/收起对应学生名单。
  function handleViewStudentList(label) {
    expandedLabel.value = expandedLabel.value === label ? null : label;
  }

  // 应用 IPC / postMessage 推送的实时分析数据。
  function applyAnalysisUpdate(payload) {
    if (!payload || typeof payload !== "object") {
      return;
    }

    analysis.value = {
      ...analysis.value,
      ...payload,
      stats: {
        ...analysis.value.stats,
        ...(payload.stats || {}),
      },
      studentListMap: payload.studentListMap || analysis.value.studentListMap,
      distributions: payload.distributions || analysis.value.distributions,
      students: payload.students || analysis.value.students,
    };
    flowStore.saveReadReciteAnalysisState(analysis.value);
  }

  // 预留 postMessage 监听入口，正式 IPC 接入时在此注册。
  function handleRealtimeMessage(event) {
    const data = event?.data;
    if (!data || data.channel !== "read-recite-analysis") {
      return;
    }

    applyAnalysisUpdate(data.payload);
  }

  onMounted(() => {
    if (setupFullscreen) {
      flowStore.currentStep = "read-recite-analysis";
      flowStore.viewMode = "fullscreen";
      flowStore.fullscreenRoute = "/ask/read-recite-analysis";
    }

    if (flowStore.readReciteAnalysisState) {
      analysis.value = { ...flowStore.readReciteAnalysisState };
    }

    window.addEventListener("message", handleRealtimeMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("message", handleRealtimeMessage);
  });

  return {
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
    applyAnalysisUpdate,
  };
}
