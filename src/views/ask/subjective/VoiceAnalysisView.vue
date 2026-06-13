<template>
  <div class="full-screen-container">
    <header class="page-header">
      <div class="header-left">
        <div class="logo-badge" aria-hidden="true">语</div>
        <div class="header-text">
          <h1 class="title">{{ pageTitle }}</h1>
          <span class="subtitle">{{ subtitle }}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      <aside class="left-sidebar">
        <div class="widget-card word-cloud-card">
          <h3 class="widget-title">
            高频词云
            <span class="tag">Top 10</span>
          </h3>
          <div class="word-cloud-container">
            <span
              v-for="(word, index) in wordCloud"
              :key="`${word.text}-${index}`"
              class="word"
              :class="[`w-${word.size}`, `col-${word.color}`, `p${index + 1}`]"
            >
              {{ word.text }}
            </span>
          </div>
        </div>

        <div class="widget-card share-card">
          <h3 class="widget-title">优秀作答分享</h3>

          <div v-if="!hasQuestion" class="placeholder-wrapper">
            <div class="warn-icon-circle" aria-hidden="true">!</div>
            <div class="place-title">评分后可生成优秀作答</div>
            <div class="place-desc">请先设置题目并评分</div>
          </div>

          <div v-else class="outstanding-answers-list">
            <div
              v-for="ans in excellentAnswers"
              :key="ans.name"
              class="excellent-card"
            >
              <div class="card-title-row">
                <span class="avatar-circle" :class="ans.level">
                  {{ ans.name.charAt(0) }}
                </span>
                <span class="name">{{ ans.name }}</span>
              </div>
              <p class="answer-text">{{ ans.text }}</p>
            </div>
          </div>
        </div>
      </aside>

      <section class="center-main-panel">
        <div v-if="!hasQuestion" class="question-generator-card">
          <h2 class="prompt-title">暂无题目内容</h2>
          <p class="prompt-subtitle">请选择出题方式</p>
          <div class="method-buttons">
            <button
              class="btn btn-outline"
              type="button"
              @click="handleSetQuestionVoice"
            >
              <span class="btn-icon" aria-hidden="true">🎤</span>
              语音出题
            </button>
            <button
              class="btn btn-outline"
              type="button"
              :disabled="isCapturing"
              @click="handleSetQuestionScreenshot"
            >
              <span class="btn-icon" aria-hidden="true">🔲</span>
              截屏出题
            </button>
          </div>
        </div>

        <div
          v-else
          class="question-display-card"
          :class="{ expanded: isQuestionExpanded }"
        >
          <img
            v-if="contentType === 'image' && imageSrc"
            class="question-image"
            :src="imageSrc"
            alt="题目截图"
          />
          <div
            v-else
            class="question-stem"
            v-html="contentHtml || questionText"
          ></div>
          <button
            class="btn-toggle-expand"
            type="button"
            @click="isQuestionExpanded = !isQuestionExpanded"
          >
            {{ isQuestionExpanded ? "收起题目" : "展开题目" }}
            <span class="arrow" :class="{ up: isQuestionExpanded }">▼</span>
          </button>
        </div>

        <div class="student-answers-section">
          <div class="section-header">
            <span class="section-title">学生作答</span>
            <span class="section-subtitle">(语音转文本)</span>
          </div>

          <div class="answers-scroll-list">
            <div
              v-for="(student, index) in students"
              :key="student.name"
              class="student-answer-card"
              role="button"
              tabindex="0"
              @click="handleOpenStudent(index)"
              @keydown.enter="handleOpenStudent(index)"
            >
              <div class="card-left-info">
                <span class="student-name">{{ student.name }}</span>
                <span
                  class="status-badge"
                  :class="hasQuestion ? student.status : 'pending'"
                >
                  {{ getStatusLabel(student.status) }}
                </span>
              </div>
              <p class="transcribed-text">{{ student.text }}</p>
              <button
                class="btn-play-audio"
                type="button"
                @click.stop="handlePlayAudio(student.name)"
              >
                <span class="play-arrow" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="right-sidebar">
        <div class="stats-row">
          <div class="stat-card">
            <span class="num">{{ stats.answeredCount }}</span>
            <span class="label">已作答</span>
          </div>
          <div class="stat-card">
            <span class="num">{{ stats.totalStudents }}</span>
            <span class="label">全班人数</span>
          </div>
          <div class="stat-card rate-card">
            <span class="num highlight">{{ stats.passRate }}%</span>
            <span class="label">通过率</span>
          </div>
        </div>

        <div v-if="hasQuestion" class="collapse-item">
          <button
            class="collapse-header"
            type="button"
            @click="showGradingSettings = !showGradingSettings"
          >
            <span class="label-title">评分设置</span>
            <span class="action-link">
              {{ showGradingSettings ? "收起" : "展开查看" }}
              <span class="arrow" :class="{ up: showGradingSettings }">▼</span>
            </span>
          </button>
        </div>

        <div class="sidebar-card">
          <div class="distribution-panel">
            <div v-if="!hasQuestion" class="chart-placeholder">
              <h3 class="card-section-title">作答分布</h3>
              <div class="placeholder-body">
                <div class="bar-chart-mini" aria-hidden="true">
                  <span class="bar b1"></span>
                  <span class="bar b2"></span>
                  <span class="bar b3"></span>
                </div>
                <p class="placeholder-text">设置题目后显示评分分布</p>
              </div>
            </div>

            <ReadReciteScoreDistribution
              v-else
              :distributions="distributions"
              :expanded-label="expandedLabel"
              :student-list-map="studentListMap"
              @toggle-student-list="handleViewStudentList"
            />
          </div>
        </div>

        <div
          v-if="!hasQuestion"
          class="ai-status-panel warning-mode"
        >
          <div class="status-icon-box" aria-hidden="true">!</div>
          <div class="ai-info">
            <div class="ai-title">AI评分</div>
            <div class="ai-desc">请先设置题目再进行AI评分</div>
          </div>
        </div>

        <div v-else class="ai-status-panel success-mode">
          <div class="status-icon-box" aria-hidden="true">✓</div>
          <div class="ai-info">
            <div class="ai-title">AI评分完成</div>
            <div class="ai-desc">所有学生已完成自动评分</div>
          </div>
        </div>
      </aside>
    </div>

    <footer class="page-footer">
      <div class="footer-left">
        <button class="btn btn-outline" type="button" @click="handleAiSimilar">
          <span class="icon-sparkle" aria-hidden="true">✦</span>
          AI相似题
        </button>
      </div>
      <div class="footer-actions">
        <button class="btn btn-outline" type="button" @click="handleShrink">
          <svg class="icon-shrink" viewBox="0 0 1024 1024" width="14" height="14">
            <path
              d="M380.16 380.16H160a32 32 0 0 1 0-64h156.16L128 128a32 32 0 0 1 45.248-45.248l188.16 188.16V160a32 32 0 0 1 64 0v220.16zM643.84 643.84H864a32 32 0 0 1 0 64H707.84L903.68 904a32 32 0 0 1-45.248 45.248l-195.84-195.84V864a32 32 0 0 1-64 0V643.84z"
              fill="currentColor"
            ></path>
          </svg>
          缩屏
        </button>
        <button class="btn btn-icon" type="button" @click="handleMinimize">—</button>
        <button class="btn btn-close" type="button" @click="handleClose">✕</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { startRegionScreenshot } from "../../../api/screenshot.js";
import ReadReciteScoreDistribution from "./components/ReadReciteScoreDistribution.vue";
import { useVoiceAnalysis } from "./composables/useVoiceAnalysis.js";
import { mapVoiceAnalysisToReadReciteState } from "./utils/buildVoiceAnalysis.js";
import { useFlowStore } from "../../../stores/flow";
import { useSmallPageStore } from "../../../stores/smallPage";
import { useWidgetStore } from "../../../stores/widget";

const router = useRouter();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();

const {
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
  expandedLabel,
  getStatusLabel,
  handleViewStudentList,
  applyAnalysisUpdate,
} = useVoiceAnalysis();

const isQuestionExpanded = ref(false);
const showGradingSettings = ref(false);
const isCapturing = ref(false);

// 在分析页打开语音录入小屏补设题目。
function handleSetQuestionVoice() {
  const target = flowStore.handleAskWidgetAction({
    action: "open-voice-question-from-analysis",
  });

  if (target?.displayMode === "small-page" && target.pageType) {
    widgetStore.closeWidget();
    smallPageStore.openPage(target.pageType, target.props);
  }
}

// 在分析页通过截屏补设题目。
async function handleSetQuestionScreenshot() {
  if (isCapturing.value) {
    return;
  }

  isCapturing.value = true;

  try {
    const result = await startRegionScreenshot();
    if (!result?.ok || result.cancelled || !result.imageBase64) {
      return;
    }

    const target = flowStore.handleAskWidgetAction({
      action: "set-voice-analysis-question",
      questionMode: "screenshot",
      imageBase64: result.imageBase64,
      mimeType: result.mimeType || "image/png",
      bounds: result.bounds || null,
    });

    if (target?.displayMode === "fullscreen" && target.analysis) {
      applyAnalysisUpdate(target.analysis);
    }
  } catch (error) {
    console.error("分析页截屏出题失败:", error);
  } finally {
    isCapturing.value = false;
  }
}

// 打开学生答题详情全屏页。
async function handleOpenStudent(index) {
  flowStore.saveVoiceAnalysisState(analysis.value);
  flowStore.saveVoiceStudentIndex(index);
  flowStore.currentStep = "voice-student-analysis";
  flowStore.fullscreenRoute = "/ask/voice-student-analysis";

  await router.push({
    path: "/ask/voice-student-analysis",
    query: { index: String(index) },
  });
}

// 播放学生录音（后续接入 IPC）。
function handlePlayAudio(name) {
  console.log(`播放学生录音 -> 姓名: ${name}`);
}

// AI 相似题（后续接入）。
function handleAiSimilar() {
  console.log("匹配 AI 语音相似题库");
}

// 缩屏：复用背读判分缩屏，映射语音分析数据后打开。
async function handleShrink() {
  flowStore.saveVoiceAnalysisState(analysis.value);
  flowStore.saveReadReciteAnalysisState(
    mapVoiceAnalysisToReadReciteState(analysis.value),
  );
  flowStore.currentStep = "voice-analysis";
  flowStore.fullscreenRoute = "/ask/voice-analysis";
  flowStore.viewMode = "compact";

  smallPageStore.closePage();
  widgetStore.openWidget("read-recite-analysis-compact", {
    sessionId: flowStore.sessionId,
    step: "voice-analysis",
  });
  await router.replace("/");
}

// 最小化：恢复时使用背读判分专用缩屏。
async function handleMinimize() {
  flowStore.saveVoiceAnalysisState(analysis.value);
  flowStore.saveReadReciteAnalysisState(
    mapVoiceAnalysisToReadReciteState(analysis.value),
  );
  flowStore.currentStep = "voice-analysis";
  flowStore.fullscreenRoute = "/ask/voice-analysis";

  flowStore.minimizeFullscreen(pageTitle.value);
  widgetStore.openWidget("read-recite-analysis-compact", {
    sessionId: flowStore.sessionId,
    step: "voice-analysis",
  });
  widgetStore.minimizeWidget();
  smallPageStore.closePage();
  await router.replace("/");
}

// 关闭语音分析流程。
async function handleClose() {
  const target = flowStore.resetFlow();
  smallPageStore.closePage();
  widgetStore.closeWidget();
  await router.replace(target.route);
}
</script>

<style scoped lang="scss">
.full-screen-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--ez-n100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.page-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--ez-n150);
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-badge {
    background-color: var(--ez-p500);
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
  }

  .header-text {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ez-n900);
    }

    .subtitle {
      font-size: 12px;
      color: var(--ez-n400);
    }
  }
}

.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px 24px;
  gap: 20px;
  min-height: 0;
}

.left-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.widget-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--ez-n150);
  padding: 16px;
  box-shadow: var(--ez-shadow-1);
  display: flex;
  flex-direction: column;

  .widget-title {
    margin: 0 0 14px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n700);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tag {
      background-color: var(--ez-n150);
      color: var(--ez-n400);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  &.word-cloud-card {
    height: 220px;
  }

  &.share-card {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.word-cloud-container {
  flex: 1;
  position: relative;
  overflow: hidden;

  .word {
    position: absolute;
    font-weight: 700;
    white-space: nowrap;

    &.w-xl {
      font-size: 24px;
    }
    &.w-lg {
      font-size: 18px;
    }
    &.w-md {
      font-size: 14px;
    }
    &.w-sm {
      font-size: 12px;
    }

    &.col-black {
      color: var(--ez-n900);
    }
    &.col-green {
      color: var(--ez-p500);
    }
    &.col-teal {
      color: var(--ez-p300);
    }

    &.p1 {
      left: 8px;
      top: 12px;
    }
    &.p2 {
      left: 64px;
      top: 8px;
    }
    &.p3 {
      left: 106px;
      top: 22px;
    }
    &.p4 {
      left: 124px;
      top: 5px;
    }
    &.p5 {
      left: 5px;
      top: 58px;
    }
    &.p6 {
      left: 100px;
      top: 50px;
    }
    &.p7 {
      left: 154px;
      top: 64px;
    }
    &.p8 {
      left: 32px;
      top: 96px;
    }
    &.p9 {
      left: 74px;
      top: 88px;
    }
    &.p10 {
      left: 124px;
      top: 104px;
    }
  }
}

.placeholder-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ez-n400);
  text-align: center;

  .warn-icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--ez-n300);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 12px;
  }

  .place-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n700);
    margin-bottom: 4px;
  }

  .place-desc {
    font-size: 11px;
    color: var(--ez-n400);
  }
}

.outstanding-answers-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.excellent-card {
  background-color: var(--ez-p50);
  border: 1px solid var(--ez-p200);
  border-radius: 12px;
  padding: 12px;

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .avatar-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;

      &.excellent {
        background-color: var(--ez-success);
      }
      &.good {
        background-color: var(--ez-p500);
      }
      &.pass {
        background-color: var(--ez-p300);
      }
    }

    .name {
      font-size: 13px;
      font-weight: 700;
      color: var(--ez-n900);
    }
  }

  .answer-text {
    margin: 0;
    font-size: 12px;
    color: var(--ez-n700);
    line-height: 1.5;
    text-align: justify;
  }
}

.center-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  min-width: 0;
}

.question-generator-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--ez-n150);
  padding: 20px;
  text-align: center;
  box-shadow: var(--ez-shadow-1);
  flex-shrink: 0;

  .prompt-title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ez-n900);
  }

  .prompt-subtitle {
    margin: 0 0 16px;
    font-size: 12px;
    color: var(--ez-n400);
  }

  .method-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

.question-display-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--ez-n150);
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--ez-shadow-1);
  flex-shrink: 0;

  &:not(.expanded) .question-stem {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .question-stem {
    margin: 0;
    font-size: 14px;
    color: var(--ez-n700);
    line-height: 1.6;
    flex: 1;
    min-width: 0;

    :deep(p) {
      margin: 0 0 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .question-image {
    flex: 1;
    max-height: 120px;
    object-fit: contain;
    border-radius: 8px;
  }

  .btn-toggle-expand {
    background: #ffffff;
    border: 1px solid var(--ez-n200);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--ez-n600);
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    flex-shrink: 0;

    .arrow {
      font-size: 8px;
      transition: transform 0.2s;

      &.up {
        transform: rotate(180deg);
      }
    }
  }
}

.student-answers-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
    flex-shrink: 0;

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ez-n800);
    }

    .section-subtitle {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }
}

.answers-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.student-answer-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--ez-n150);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--ez-shadow-1);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: var(--ez-p300);
    box-shadow: var(--ez-shadow-2);
  }

  .card-left-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 60px;
    flex-shrink: 0;

    .student-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--ez-n900);
    }

    .status-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 0;
      border-radius: 6px;
      text-align: center;

      &.pending {
        background-color: var(--ez-n150);
        color: var(--ez-n400);
      }
      &.excellent {
        background-color: #e6fcf1;
        color: var(--ez-success);
      }
      &.good {
        background-color: var(--ez-p50);
        color: var(--ez-p500);
      }
      &.pass {
        background-color: var(--ez-p100);
        color: var(--ez-p600);
      }
    }
  }

  .transcribed-text {
    flex: 1;
    margin: 0;
    font-size: 13px;
    color: var(--ez-n700);
    line-height: 1.6;
    text-align: justify;
    min-width: 0;
  }

  .btn-play-audio {
    background-color: var(--ez-p50);
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    .play-arrow {
      display: inline-block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent var(--ez-p500);
      margin-left: 2px;
    }
  }
}

.right-sidebar {
  width: 22%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
  min-height: 0;
}

.sidebar-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--ez-n150);
  padding: 16px;
  box-shadow: var(--ez-shadow-1);
}

.card-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ez-n800);
  border-left: 3px solid var(--ez-p500);
  padding-left: 8px;
  align-self: flex-start;
}

.stats-row {
  display: flex;
  gap: 8px;

  .stat-card {
    flex: 1;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid var(--ez-n150);
    padding: 14px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 20px;
      font-weight: 800;
      color: var(--ez-n800);
      margin-bottom: 4px;
    }

    .label {
      font-size: 11px;
      color: var(--ez-n400);
    }

    &.rate-card {
      background-color: var(--ez-p50);
      border-color: var(--ez-p200);

      .num.highlight {
        color: var(--ez-p500);
      }
    }
  }
}

.collapse-item {
  border-top: 1px solid var(--ez-n150);
  border-bottom: 1px solid var(--ez-n150);
  padding: 12px 0;

  .collapse-header {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0;

    .label-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--ez-n800);
    }

    .action-link {
      font-size: 11px;
      color: var(--ez-p500);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;

      .arrow {
        font-size: 8px;
        color: var(--ez-n300);
        transition: transform 0.2s;

        &.up {
          transform: rotate(180deg);
        }
      }
    }
  }
}

.distribution-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-placeholder {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .placeholder-body {
    flex: 1;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--ez-n400);
    gap: 12px;
  }

  .bar-chart-mini {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 24px;

    .bar {
      width: 4px;
      border-radius: 2px;
      background-color: var(--ez-n300);

      &.b1 {
        height: 12px;
      }
      &.b2 {
        height: 22px;
      }
      &.b3 {
        height: 16px;
      }
    }
  }

  .placeholder-text {
    margin: 0;
    font-size: 11px;
  }
}

.ai-status-panel {
  margin-top: auto;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .status-icon-box {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  &.warning-mode {
    background-color: var(--ez-n100);

    .status-icon-box {
      background-color: var(--ez-n200);
      color: var(--ez-n600);
    }
  }

  &.success-mode {
    background-color: var(--ez-p50);

    .status-icon-box {
      background-color: var(--ez-p100);
      color: var(--ez-p500);
    }
  }

  .ai-info {
    .ai-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--ez-n800);
      margin-bottom: 2px;
    }

    .ai-desc {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }
}

.page-footer {
  height: 56px;
  background-color: #ffffff;
  border-top: 1px solid var(--ez-n150);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-outline {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n200);
    color: var(--ez-n700);
    padding: 0 16px;
    gap: 6px;
  }

  &-icon {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n200);
    color: var(--ez-n700);
    width: 38px;
    padding: 0;
  }

  &-close {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: var(--ez-error);
    width: 38px;
    padding: 0;
  }
}
</style>
