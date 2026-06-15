/**
 * 语音分析页数据 composable。
 * 当前使用 flowStore 中的 mock 数据；后续通过 IPC / postMessage 调用 applyAnalysisUpdate 实时刷新。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";import { STATUS_LABELS } from "../../../../mock/voiceAnalysis.js";
import { useFlowStore } from "../../../../stores/flow";
import { buildVoiceAnalysis } from "../utils/buildVoiceAnalysis.js";

export function useVoiceAnalysis(options = {}) {
  const { setupFullscreen = true } = options;
  const flowStore = useFlowStore();
  const analysis = ref(
    flowStore.voiceAnalysisState ||
      buildVoiceAnalysis(flowStore.answerProgressState || {}),
  );
  const expandedLabel = ref(null);

  const hasQuestion = computed(() => Boolean(analysis.value.hasQuestion));
  const pageTitle = computed(() => analysis.value.pageTitle || "语音分析");
  const subtitle = computed(() => analysis.value.subtitle || "语音题答题结果");
  const questionText = computed(() => analysis.value.questionText || "");
  const contentHtml = computed(() => analysis.value.contentHtml || "");
  const contentType = computed(() => analysis.value.contentType || "html");
  const imageSrc = computed(() => analysis.value.imageSrc || "");
  const wordCloud = computed(() => analysis.value.wordCloud || []);
  const students = computed(() => analysis.value.students || []);
  const excellentAnswers = computed(() => analysis.value.excellentAnswers || []);
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
    () => analysis.value.aiGradingComplete === true,
  );

  // 映射学生状态为展示文案。
  function getStatusLabel(status) {
    if (!hasQuestion.value) {
      return STATUS_LABELS.pending;
    }

    return STATUS_LABELS[status] || STATUS_LABELS.pending;
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
      students: payload.students || analysis.value.students,
      distributions: payload.distributions || analysis.value.distributions,
      studentListMap: payload.studentListMap || analysis.value.studentListMap,
      excellentAnswers: payload.excellentAnswers || analysis.value.excellentAnswers,
    };
    flowStore.saveVoiceAnalysisState(analysis.value);
  }

  // 预留 postMessage 监听入口，正式 IPC 接入时在此注册。
  function handleRealtimeMessage(event) {
    const data = event?.data;
    if (!data || data.channel !== "voice-analysis") {
      return;
    }

    applyAnalysisUpdate(data.payload);
  }

  onMounted(() => {
    if (setupFullscreen) {
      flowStore.setFullscreenContext({
        currentStep: "voice-analysis",
        viewMode: "fullscreen",
        fullscreenRoute: "/ask/voice-analysis",
      });
    }

    if (flowStore.voiceAnalysisState) {
      analysis.value = { ...flowStore.voiceAnalysisState };
    }

    flowStore.saveVoiceAnalysisState(analysis.value);
    window.addEventListener("message", handleRealtimeMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("message", handleRealtimeMessage);
  });

  return {
    analysis,
    hasQuestion,
    pageTitle,
    subtitle,
    questionText,
    contentHtml,
    contentType,
    imageSrc,
    wordCloud,
    students,
    excellentAnswers,
    distributions,
    studentListMap,
    stats,
    aiGradingComplete,
    expandedLabel,
    getStatusLabel,
    handleViewStudentList,
    applyAnalysisUpdate,
  };
}
