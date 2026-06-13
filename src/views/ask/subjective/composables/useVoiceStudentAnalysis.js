/**
 * 语音学生答题详情 composable。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { STATUS_LABELS } from "../../../../mock/voiceAnalysis.js";
import { MOCK_WAVEFORM_HEIGHTS } from "../../../../mock/voiceStudentAnalysis.js";
import { useFlowStore } from "../../../../stores/flow";
import { buildVoiceAnalysis } from "../utils/buildVoiceAnalysis.js";

// 将 HTML 题目转为纯文本展示。
function htmlToPlainText(html = "") {
  if (!html) {
    return "";
  }

  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n+/g, "\n")
    .trim();
}

export function useVoiceStudentAnalysis() {
  const route = useRoute();
  const router = useRouter();
  const flowStore = useFlowStore();

  const students = computed(() => {
    const list = flowStore.voiceAnalysisState?.students || [];
    if (list.length) {
      return list;
    }

    return buildVoiceAnalysis(flowStore.answerProgressState || {}).students || [];
  });

  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  let playInterval = null;

  const totalCount = computed(() => students.value.length);
  const currentStudent = computed(
    () => students.value[currentIndex.value] || students.value[0] || null,
  );
  const hasQuestion = computed(() => Boolean(flowStore.voiceAnalysisState?.hasQuestion));
  const questionContent = computed(() => {
    const state = flowStore.voiceAnalysisState || {};
    return (
      htmlToPlainText(state.contentHtml) ||
      state.questionText ||
      "暂无题目内容"
    );
  });

  const durationSeconds = computed(
    () => currentStudent.value?.durationSeconds || 47,
  );

  const formattedTime = computed(() => {
    const minutes = Math.floor(currentTime.value / 60);
    const seconds = String(currentTime.value % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  });

  const formattedDuration = computed(() => {
    const total = durationSeconds.value;
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  });

  const statusLabel = computed(() => {
    if (!currentStudent.value) {
      return "";
    }

    if (!hasQuestion.value || currentStudent.value.status === "pending") {
      return STATUS_LABELS.pending;
    }

    return STATUS_LABELS[currentStudent.value.status] || STATUS_LABELS.pending;
  });

  const showScorePanel = computed(
    () =>
      hasQuestion.value &&
      currentStudent.value?.score != null &&
      currentStudent.value?.status !== "pending",
  );

  // 从路由或 flowStore 同步当前学生索引。
  function syncIndexFromRoute() {
    const queryIndex = Number(route.query.index);
    const storeIndex = flowStore.voiceStudentIndex;
    const nextIndex = Number.isFinite(queryIndex)
      ? queryIndex
      : Number.isFinite(storeIndex)
        ? storeIndex
        : 0;

    const maxIndex = Math.max(students.value.length - 1, 0);
    currentIndex.value = Math.min(Math.max(nextIndex, 0), maxIndex);
    flowStore.saveVoiceStudentIndex(currentIndex.value);
  }

  // 停止音频播放计时。
  function stopPlayback() {
    if (playInterval) {
      window.clearInterval(playInterval);
      playInterval = null;
    }

    isPlaying.value = false;
  }

  // 切换播放/暂停。
  function togglePlay() {
    if (isPlaying.value) {
      stopPlayback();
      return;
    }

    isPlaying.value = true;
    playInterval = window.setInterval(() => {
      if (currentTime.value < durationSeconds.value) {
        currentTime.value += 1;
        return;
      }

      stopPlayback();
      currentTime.value = 0;
    }, 1000);
  }

  // 判断波形条是否处于已播放区间。
  function isBarActive(index) {
    const progressRatio = currentTime.value / (durationSeconds.value || 1);
    const barRatio = index / MOCK_WAVEFORM_HEIGHTS.length;
    return barRatio <= progressRatio;
  }

  // 更新当前学生索引并同步路由。
  async function goToStudent(index) {
    const maxIndex = Math.max(students.value.length - 1, 0);
    const nextIndex = Math.min(Math.max(index, 0), maxIndex);

    currentIndex.value = nextIndex;
    currentTime.value = 0;
    stopPlayback();
    flowStore.saveVoiceStudentIndex(nextIndex);

    await router.replace({
      path: "/ask/voice-student-analysis",
      query: { index: String(nextIndex) },
    });
  }

  // 切换上一位/下一位学生。
  function changeStudent(step) {
    goToStudent(currentIndex.value + step);
  }

  // 返回语音分析汇总页。
  async function handleBack() {
    stopPlayback();
    flowStore.currentStep = "voice-analysis";
    flowStore.fullscreenRoute = "/ask/voice-analysis";
    await router.push({
      path: "/ask/voice-analysis",
      query: flowStore.fullscreenQuery || {},
    });
  }

  watch(
    () => route.query.index,
    () => {
      syncIndexFromRoute();
      currentTime.value = 0;
      stopPlayback();
    },
  );

  onMounted(() => {
    flowStore.currentStep = "voice-student-analysis";
    flowStore.viewMode = "fullscreen";
    flowStore.fullscreenRoute = "/ask/voice-student-analysis";
    syncIndexFromRoute();
  });

  onBeforeUnmount(() => {
    stopPlayback();
  });

  return {
    students,
    currentIndex,
    totalCount,
    currentStudent,
    hasQuestion,
    questionContent,
    durationSeconds,
    formattedTime,
    formattedDuration,
    statusLabel,
    showScorePanel,
    waveformHeights: MOCK_WAVEFORM_HEIGHTS,
    isPlaying,
    togglePlay,
    isBarActive,
    changeStudent,
    handleBack,
    goToStudent,
  };
}
