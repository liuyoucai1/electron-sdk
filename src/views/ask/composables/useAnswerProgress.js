/**
 * 通用答题进行中页数据 composable。
 * 支持背读、语音、截屏与选题多题批次等多种来源。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useFlowStore } from '../../../stores/flow';
import { resolveBatchQuestionView } from '../utils/buildAnswerProgressBatch.js';
import {
  buildAnswerProgressFromScreenshot,
  buildAnswerProgressFromVoice,
  normalizeAnswerProgressSession,
  revokeImageSrc,
} from '../subjective/utils/buildAnswerProgressSession.js';
import { registerSessionImageBlob } from '../../../api/sessionAsset.js';

// 从 flowStore 恢复答题进行中会话，截屏场景回退读取 screenshotQuestionState。
function loadSessionFromStore(flowStore) {
  if (flowStore.answerProgressState) {
    return normalizeAnswerProgressSession(flowStore.answerProgressState);
  }

  if (flowStore.screenshotQuestionState?.imageBase64) {
    return buildAnswerProgressFromScreenshot({
      ...flowStore.screenshotQuestionState,
      sourceType: 'screenshot',
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
  const timerStr = ref('00:00');
  let intervalId = null;

  const totalStudents = 30;
  const completedCount = 18;
  const modifyingStudents = ref(['张三', '李四', '王五', '赵六', '孙七', '小明']);
  const unsubmittedStudents = ref(['小红', '小刚', '小颖', '小华', '小美', '周伟']);

  const sourceType = computed(() => session.value.sourceType || 'read-recite');
  const isBatchMode = computed(() => sourceType.value === 'question-batch');

  const batchQuestionView = computed(() =>
    isBatchMode.value ? resolveBatchQuestionView(session.value) : null,
  );

  const contentType = computed(() => {
    if (isBatchMode.value) {
      return batchQuestionView.value?.contentType || 'objective';
    }

    return session.value.contentType || 'html';
  });

  const title = computed(() => {
    if (isBatchMode.value) {
      return batchQuestionView.value?.title || '';
    }

    return session.value.title || '答题内容';
  });

  const contentHtml = computed(() => session.value.contentHtml || '');
  const objectiveStem = computed(() => batchQuestionView.value?.objectiveStem || '');
  const imageSrc = computed(() => session.value.imageSrc || session.value.imageDataUrl || '');
  const allowHideContent = computed(() => Boolean(session.value.allowHideContent));
  const deferQuestionSetup = computed(() => Boolean(session.value.deferQuestionSetup));

  const modeLabel = computed(() => {
    if (sourceType.value === 'screenshot' || sourceType.value === 'voice') {
      return '答题';
    }

    return session.value.reciteType === 'read' ? '朗读' : '背诵';
  });

  const progressTitle = computed(() => {
    if (sourceType.value === 'screenshot') {
      return '截屏答题进行中';
    }

    if (sourceType.value === 'voice') {
      return '语音答题进行中';
    }

    if (isBatchMode.value) {
      return '多题答题进行中';
    }

    return `${modeLabel.value}进行中`;
  });

  const headerStatusText = computed(() => {
    if (isBatchMode.value && batchQuestionView.value) {
      return `答题中 第${batchQuestionView.value.questionIndex}题 ${batchQuestionView.value.questionTypeLabel}`;
    }

    if (sourceType.value === 'read-recite') {
      return `${modeLabel.value}中`;
    }

    return '答题中';
  });

  const showNextQuestion = computed(() => {
    if (!isBatchMode.value) {
      return false;
    }

    const questions = session.value.questions || [];
    const currentIndex = Number(session.value.currentQuestionIndex) || 0;
    return currentIndex < questions.length - 1;
  });

  const primaryActionLabel = computed(() =>
    showNextQuestion.value ? '下一题' : '结束答题',
  );

  const completedPercent = computed(() =>
    Math.round((completedCount / totalStudents) * 100),
  );

  const modifyingPercent = computed(() =>
    Math.round((modifyingStudents.value.length / totalStudents) * 100),
  );

  const unsubmittedPercent = computed(() =>
    Math.max(0, 100 - completedPercent.value - modifyingPercent.value),
  );

  // 从 flowStore 重新加载会话，供切题后刷新左侧内容。
  function reloadSessionFromStore() {
    session.value = loadSessionFromStore(flowStore);
    registerSessionImageBlob(session.value.imageSrc);
  }

  // 启动答题计时器。
  function startTimer() {
    intervalId = window.setInterval(() => {
      elapsedSeconds.value += 1;
      const minutes = Math.floor(elapsedSeconds.value / 60);
      const seconds = elapsedSeconds.value % 60;
      timerStr.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
    const { imageSrc: _imageSrc, imageDataUrl, ...rest } = session.value;
    flowStore.saveAnswerProgressState({
      ...rest,
      imageDataUrl: '',
      imageSrc: '',
    });
  }

  watch(
    () => flowStore.answerProgressState,
    () => {
      reloadSessionFromStore();
    },
    { deep: true },
  );

  onMounted(() => {
    flowStore.setFullscreenContext({
      currentStep: 'answer-progress',
      viewMode: 'fullscreen',
      fullscreenRoute: '/ask/answer-progress',
    });

    if (
      flowStore.answerProgressState ||
      flowStore.screenshotQuestionState ||
      flowStore.voiceQuestionState
    ) {
      reloadSessionFromStore();
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
    isBatchMode,
    contentType,
    title,
    contentHtml,
    objectiveStem,
    imageSrc,
    allowHideContent,
    deferQuestionSetup,
    isContentVisible,
    modeLabel,
    progressTitle,
    headerStatusText,
    showNextQuestion,
    primaryActionLabel,
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
    reloadSessionFromStore,
  };
}
