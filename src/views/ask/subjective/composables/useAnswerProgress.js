/**
 * 通用答题进行中页数据 composable。
 * 支持背读（HTML + 隐藏原文）与截屏（图片）等多种来源。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useFlowStore } from "../../../../stores/flow";
import {
  buildAnswerProgressFromScreenshot,
  buildAnswerProgressFromVoice,
  normalizeAnswerProgressSession,
  revokeImageSrc,
} from "../utils/buildAnswerProgressSession.js";
import { registerSessionImageBlob } from "../../../../api/sessionAsset.js";

// 从 flowStore 恢复答题进行中会话，截屏场景回退读取 screenshotQuestionState。
function loadSessionFromStore(flowStore) {
  if (flowStore.answerProgressState) {
    return normalizeAnswerProgressSession(flowStore.answerProgressState);
  }

  if (flowStore.screenshotQuestionState?.imageBase64) {
    return buildAnswerProgressFromScreenshot({
      ...flowStore.screenshotQuestionState,
      sourceType: "screenshot",
    });
  }

  if (flowStore.voiceQuestionState?.questionText) {
    return buildAnswerProgressFromVoice(flowStore.voiceQuestionState);
  }

  return normalizeAnswerProgressSession({});
}

export function useAnswerProgress() {
  const flowStore = useFlowStore();
  const session = ref(loadSessionFromStore(flowStore));
  registerSessionImageBlob(session.value.imageSrc);
  const isContentVisible = ref(true);
  const elapsedSeconds = ref(0);
  const timerStr = ref("00:00");
  let intervalId = null;

  const totalStudents = 30;
  const completedCount = 18;
  const modifyingStudents = ref(["张三", "李四", "王五", "赵六", "孙七", "小明"]);
  const unsubmittedStudents = ref([
    "小红",
    "小刚",
    "小颖",
    "小华",
    "小美",
    "周伟",
  ]);

  const sourceType = computed(() => session.value.sourceType || "read-recite");
  const contentType = computed(() => session.value.contentType || "html");
  const title = computed(() => session.value.title || "答题内容");
  const contentHtml = computed(() => session.value.contentHtml || "");
  const imageSrc = computed(
    () => session.value.imageSrc || session.value.imageDataUrl || "",
  );
  const allowHideContent = computed(() => Boolean(session.value.allowHideContent));
  const deferQuestionSetup = computed(() => Boolean(session.value.deferQuestionSetup));

  const modeLabel = computed(() => {
    if (sourceType.value === "screenshot" || sourceType.value === "voice") {
      return "答题";
    }

    return session.value.reciteType === "read" ? "朗读" : "背诵";
  });

  const progressTitle = computed(() => {
    if (sourceType.value === "screenshot") {
      return "截屏答题进行中";
    }

    if (sourceType.value === "voice") {
      return "语音答题进行中";
    }

    return `${modeLabel.value}进行中`;
  });

  const completedPercent = computed(() =>
    Math.round((completedCount / totalStudents) * 100),
  );

  const modifyingPercent = computed(() =>
    Math.round((modifyingStudents.value.length / totalStudents) * 100),
  );

  const unsubmittedPercent = computed(() =>
    Math.max(0, 100 - completedPercent.value - modifyingPercent.value),
  );

  // 启动答题计时器。
  function startTimer() {
    intervalId = window.setInterval(() => {
      elapsedSeconds.value += 1;
      const minutes = Math.floor(elapsedSeconds.value / 60);
      const seconds = elapsedSeconds.value % 60;
      timerStr.value = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
  }

  // 停止计时器。
  function stopTimer() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  // 切换原文显示/隐藏，仅背读类会话可用。
  function toggleContentVisibility() {
    if (!allowHideContent.value) {
      return;
    }

    isContentVisible.value = !isContentVisible.value;
  }

  // 持久化当前会话到 flowStore，仅存 base64 等可重建数据，不存 blob URL。
  function persistSession() {
    const { imageSrc, imageDataUrl, ...rest } = session.value;
    flowStore.saveAnswerProgressState({
      ...rest,
      imageDataUrl: "",
      imageSrc: "",
    });
  }

  onMounted(() => {
    flowStore.currentStep = "answer-progress";
    flowStore.viewMode = "fullscreen";
    flowStore.fullscreenRoute = "/ask/answer-progress";

    if (
      flowStore.answerProgressState ||
      flowStore.screenshotQuestionState ||
      flowStore.voiceQuestionState
    ) {
      session.value = loadSessionFromStore(flowStore);
      registerSessionImageBlob(session.value.imageSrc);
    }

    persistSession();
    startTimer();
  });

  onBeforeUnmount(() => {
    stopTimer();
    revokeImageSrc(session.value.imageSrc);
  });

  return {
    session,
    sourceType,
    contentType,
    title,
    contentHtml,
    imageSrc,
    allowHideContent,
    deferQuestionSetup,
    isContentVisible,
    modeLabel,
    progressTitle,
    timerStr,
    totalStudents,
    completedCount,
    modifyingStudents,
    unsubmittedStudents,
    completedPercent,
    modifyingPercent,
    unsubmittedPercent,
    toggleContentVisibility,
    stopTimer,
    persistSession,
  };
}
