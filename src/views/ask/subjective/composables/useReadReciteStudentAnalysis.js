/**
 * 背读学生答题详情 composable。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { STATUS_LABELS } from "../../../../mock/readReciteAnalysis.js";
import { MOCK_WAVEFORM_HEIGHTS } from "../../../../mock/readReciteStudentAnalysis.js";
import { useFlowStore } from "../../../../stores/flow";
import { buildReadReciteAnalysis } from "../utils/buildReadReciteAnalysis.js";

export function useReadReciteStudentAnalysis() {
  const route = useRoute();
  const router = useRouter();
  const flowStore = useFlowStore();

  const analysisState = computed(
    () =>
      flowStore.readReciteAnalysisState ||
      buildReadReciteAnalysis(flowStore.answerProgressState || {}),
  );

  const answeredStudents = computed(() =>
    (analysisState.value.students || []).filter(
      (item) => item.status !== "unanswered",
    ),
  );

  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  let playInterval = null;

  const reciteType = computed(() => analysisState.value.reciteType || "recite");
  const pageTitle = computed(() =>
    reciteType.value === "read" ? "朗读分析" : "背诵分析",
  );
  const modeBadge = computed(() => (reciteType.value === "read" ? "朗" : "背"));

  const totalCount = computed(() => answeredStudents.value.length);
  const currentStudent = computed(
    () => answeredStudents.value[currentIndex.value] || null,
  );

  const durationSeconds = computed(
    () => currentStudent.value?.durationSeconds || 57,
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

  const comparisonSegments = computed(
    () => currentStudent.value?.comparisonSegments || [],
  );

  const dimensions = computed(() => currentStudent.value?.dimensions || []);

  const statusLabel = computed(() => {
    if (!currentStudent.value) {
      return "";
    }

    return STATUS_LABELS[currentStudent.value.status] || "";
  });

  // 从路由 query 同步当前学生索引。
  function syncIndexFromRoute() {
    const queryIndex = Number(route.query.index);
    const queryName = typeof route.query.name === "string" ? route.query.name : "";
    let nextIndex = Number.isFinite(queryIndex) ? queryIndex : 0;

    if (queryName) {
      const nameIndex = answeredStudents.value.findIndex(
        (item) => item.name === queryName,
      );
      if (nameIndex >= 0) {
        nextIndex = nameIndex;
      }
    }

    const maxIndex = Math.max(answeredStudents.value.length - 1, 0);
    currentIndex.value = Math.min(Math.max(nextIndex, 0), maxIndex);
    flowStore.saveReadReciteStudentIndex(currentIndex.value);
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
    const maxIndex = Math.max(answeredStudents.value.length - 1, 0);
    const nextIndex = Math.min(Math.max(index, 0), maxIndex);
    const nextStudent = answeredStudents.value[nextIndex];

    currentIndex.value = nextIndex;
    currentTime.value = 0;
    stopPlayback();
    flowStore.saveReadReciteStudentIndex(nextIndex);

    await router.replace({
      path: "/ask/read-recite-student-analysis",
      query: {
        index: String(nextIndex),
        ...(nextStudent?.name ? { name: nextStudent.name } : {}),
      },
    });
  }

  // 切换上一位/下一位学生。
  function changeStudent(step) {
    goToStudent(currentIndex.value + step);
  }

  // 返回背读分析汇总页。
  async function handleBack() {
    stopPlayback();
    flowStore.setFullscreenContext({
      currentStep: "read-recite-analysis",
      fullscreenRoute: "/ask/read-recite-analysis",
    });
    await router.push({
      path: "/ask/read-recite-analysis",
      query: flowStore.fullscreenQuery || {},
    });
  }

  watch(
    () => [route.query.index, route.query.name, answeredStudents.value.length],
    () => {
      syncIndexFromRoute();
      currentTime.value = 0;
      stopPlayback();
    },
  );

  onMounted(() => {
    flowStore.setFullscreenContext({
      currentStep: "read-recite-student-analysis",
      viewMode: "fullscreen",
      fullscreenRoute: "/ask/read-recite-student-analysis",
    });
    syncIndexFromRoute();
  });

  onBeforeUnmount(() => {
    stopPlayback();
  });

  return {
    pageTitle,
    modeBadge,
    currentIndex,
    totalCount,
    currentStudent,
    comparisonSegments,
    dimensions,
    statusLabel,
    durationSeconds,
    formattedTime,
    formattedDuration,
    waveformHeights: MOCK_WAVEFORM_HEIGHTS,
    isPlaying,
    togglePlay,
    isBarActive,
    changeStudent,
    handleBack,
    goToStudent,
  };
}
