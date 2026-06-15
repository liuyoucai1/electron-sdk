<template>
  <div class="full-screen-container">
    <header class="page-header">
      <div class="header-left">
        <div class="logo-badge" aria-hidden="true">语</div>
        <div class="header-text">
          <h1 class="title">学生答题详情</h1>
        </div>
      </div>
    </header>

    <div class="page-content">
      <section class="left-main-panel">
        <div class="panel-header-sub">题目内容</div>
        <p class="question-content">{{ questionContent }}</p>

        <div class="transcribe-container">
          <h3 class="section-title">
            | {{ currentStudent?.name || "" }} 的语音作答 (转文本)
          </h3>
          <p class="transcribe-text">{{ currentStudent?.text || "" }}</p>
        </div>

        <div class="audio-player-bar">
          <span class="player-time">
            {{ formattedTime }} / {{ formattedDuration }}
          </span>

          <div class="waveform-container" aria-hidden="true">
            <span
              v-for="(height, index) in waveformHeights"
              :key="index"
              class="wave-bar"
              :class="{ active: isBarActive(index) }"
              :style="{ height: `${height}px` }"
            ></span>
          </div>

          <button class="btn-player-control" type="button" @click="togglePlay">
            <span v-if="!isPlaying" class="play-icon" aria-hidden="true"></span>
            <span v-else class="pause-icon" aria-hidden="true"></span>
          </button>
        </div>
      </section>

      <aside class="right-sidebar">
        <div class="profile-header">
          <h2 class="student-name">{{ currentStudent?.name || "" }}</h2>
          <div class="eval-badge">
            <span class="label">综合评价</span>
            <span class="ai-tag">AI 生成</span>
          </div>
        </div>

        <div v-if="showScorePanel" class="grade-card">
          <div class="score-box">
            <span class="score-num">{{ currentStudent?.score }}</span>
            <span class="score-label">综合得分 / 100</span>
          </div>
          <div class="level-box">
            <span class="level-label">综合等级</span>
            <span class="level-badge">{{ currentStudent?.levelLabel }}</span>
          </div>
        </div>

        <div v-else class="pending-card">
          <span class="pending-badge">{{ statusLabel }}</span>
          <p class="pending-text">设置题目并完成 AI 评分后，将显示综合得分与评语。</p>
        </div>

        <div v-if="showScorePanel && currentStudent?.suggestion" class="suggestions-card">
          <p class="suggestions-text">{{ currentStudent.suggestion }}</p>
        </div>
      </aside>
    </div>

    <footer class="page-footer">
      <div class="footer-left"></div>
      <div class="footer-actions">
        <div class="pagination-wrapper">
          <button
            class="btn-pagination"
            type="button"
            :disabled="currentIndex <= 0"
            @click="changeStudent(-1)"
          >
            &lt; 上一位
          </button>
          <span class="page-indicator">
            {{ currentIndex + 1 }} / {{ totalCount }}
          </span>
          <button
            class="btn-pagination btn-next-active"
            type="button"
            :disabled="currentIndex >= totalCount - 1"
            @click="changeStudent(1)"
          >
            下一位 &gt;
          </button>
        </div>

        <div class="divider-line"></div>

        <button class="btn btn-outline" type="button" @click="handleBack">
          <svg class="icon-reply" viewBox="0 0 1024 1024" width="14" height="14">
            <path
              d="M494.933 243.2a32 32 0 0 1 45.245 45.245L356.565 469.333H800a32 32 0 0 1 0 64H356.565l183.616 180.885a32 32 0 1 1-45.245 45.245l-237.44-233.9a32 32 0 0 1 0-45.245l237.437-237.12z"
              fill="currentColor"
            ></path>
          </svg>
          返回
        </button>
        <button class="btn btn-icon" type="button" @click="handleMinimize">—</button>
        <button class="btn btn-close" type="button" @click="handleClose">✕</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAskFullscreenControls } from "../composables/useAskFullscreenControls";
import { useVoiceStudentAnalysis } from "./composables/useVoiceStudentAnalysis.js";

const { closeAskFlow, minimizeToTaskbar } = useAskFullscreenControls();

const {
  currentIndex,
  totalCount,
  currentStudent,
  questionContent,
  formattedTime,
  formattedDuration,
  statusLabel,
  showScorePanel,
  waveformHeights,
  isPlaying,
  togglePlay,
  isBarActive,
  changeStudent,
  handleBack,
} = useVoiceStudentAnalysis();

// 最小化学生详情面板。
async function handleMinimize() {
  await minimizeToTaskbar("学生答题详情", {
    props: {
    step: "voice-student-analysis",
    },
  });
}

// 关闭整条语音业务流程。
async function handleClose() {
  await closeAskFlow();
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

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--ez-n900);
  }
}

.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.left-main-panel {
  flex: 1;
  background-color: #fafaf8;
  padding: 24px 48px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  .panel-header-sub {
    font-size: 13px;
    color: var(--ez-n400);
    border-bottom: 1px solid var(--ez-n150);
    padding-bottom: 12px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .question-content {
    margin: 0 0 20px;
    font-size: 14px;
    color: var(--ez-n600);
    line-height: 1.6;
    flex-shrink: 0;
  }
}

.transcribe-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  .section-title {
    font-size: 15px;
    color: var(--ez-p500);
    font-weight: 700;
    margin: 0 0 24px;
  }

  .transcribe-text {
    margin: 0;
    font-size: 22px;
    color: var(--ez-n800);
    line-height: 1.6;
    font-weight: 700;
  }
}

.audio-player-bar {
  height: 64px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--ez-shadow-1);
  border: 1px solid var(--ez-n150);
  flex-shrink: 0;
  margin-top: 16px;

  .player-time {
    font-size: 13px;
    color: var(--ez-n400);
    font-weight: 700;
    white-space: nowrap;
    width: 80px;
    flex-shrink: 0;
  }
}

.waveform-container {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 0;
}

.wave-bar {
  flex: 1;
  background-color: var(--ez-n200);
  border-radius: 2px;
  transition: background-color 0.15s ease;

  &.active {
    background-color: var(--ez-p500);
  }
}

.btn-player-control {
  background-color: var(--ez-p500);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  .play-icon {
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 0 6px 10px;
    border-color: transparent transparent transparent #ffffff;
    margin-left: 2px;
  }

  .pause-icon {
    display: inline-block;
    width: 10px;
    height: 12px;
    border-left: 3px solid #ffffff;
    border-right: 3px solid #ffffff;
    box-sizing: border-box;
  }
}

.right-sidebar {
  width: 350px;
  background-color: #ffffff;
  border-left: 1px solid var(--ez-n150);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.profile-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  .student-name {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .eval-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .label {
      font-size: 12px;
      color: var(--ez-n400);
    }

    .ai-tag {
      background-color: var(--ez-n150);
      color: var(--ez-n400);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.grade-card {
  background-color: var(--ez-p50);
  border: 1px solid var(--ez-p200);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .score-box {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .score-num {
      font-size: 32px;
      font-weight: 800;
      color: var(--ez-p500);
      line-height: 1;
    }

    .score-label {
      font-size: 11px;
      color: var(--ez-n400);
    }
  }

  .level-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    .level-label {
      font-size: 11px;
      color: var(--ez-n400);
    }

    .level-badge {
      background-color: var(--ez-p500);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      padding: 4px 16px;
      border-radius: 10px;
    }
  }
}

.pending-card {
  background-color: var(--ez-n50);
  border: 1px solid var(--ez-n150);
  border-radius: 16px;
  padding: 20px;

  .pending-badge {
    display: inline-block;
    margin-bottom: 10px;
    padding: 4px 12px;
    border-radius: 8px;
    background-color: var(--ez-n150);
    color: var(--ez-n500);
    font-size: 12px;
    font-weight: 700;
  }

  .pending-text {
    margin: 0;
    font-size: 13px;
    color: var(--ez-n500);
    line-height: 1.6;
  }
}

.suggestions-card {
  background-color: #ffffff;
  border: 1.5px solid var(--ez-n150);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: var(--ez-shadow-1);

  .suggestions-text {
    margin: 0;
    font-size: 13px;
    color: var(--ez-n700);
    line-height: 1.6;
    text-align: justify;
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

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;

  .btn-pagination {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-n200);
    border-radius: 10px;
    height: 38px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ez-n700);
    cursor: pointer;

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &.btn-next-active:not(:disabled) {
      background-color: #eff6ff;
      border-color: #bfdbfe;
      color: #3b82f6;
    }
  }

  .page-indicator {
    font-size: 13px;
    color: var(--ez-n400);
    font-weight: 700;
  }
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider-line {
  width: 1px;
  height: 24px;
  background-color: var(--ez-n200);
  margin: 0 6px;
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
