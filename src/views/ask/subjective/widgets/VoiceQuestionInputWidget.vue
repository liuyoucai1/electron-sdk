<template>
  <section class="voice-question-input">
    <header class="panel-header">
      <div class="header-main" data-drag-handle>
        <div class="mic-badge" aria-hidden="true">
          <svg viewBox="0 0 1024 1024" width="18" height="18">
            <path
              d="M512 640a128 128 0 0 0 128-128V320a128 128 0 0 0-256 0v192a128 128 0 0 0 128 128z m256-128a64 64 0 0 1-128 0 192 192 0 0 1-384 0 64 64 0 0 1-128 0 320 320 0 0 0 640 0zM448 832h128v96H448z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div class="header-text">
          <h2 class="title">语音出题</h2>
          <p class="subtitle">识别后的文本可直接编辑，也可使用遥控器重新录入语音。</p>
        </div>
      </div>
    </header>

    <div class="panel-body">
      <div class="recording-indicator">
        <span class="dot" aria-hidden="true"></span>
        <span class="status-text">录入中...</span>
      </div>

      <div class="textarea-wrapper">
        <textarea
          v-model="voiceText"
          class="custom-textarea"
          placeholder="请使用遥控器语音录入题目"
        ></textarea>
      </div>
    </div>

    <footer class="panel-footer">
      <button class="btn btn-cancel" type="button" @click="handleCancel">取消</button>
      <button
        class="btn btn-confirm"
        type="button"
        :disabled="!canStart"
        @click="handleStart"
      >
        开始答题
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useFlowStore } from "../../../../stores/flow";

const emit = defineEmits(["flow-action"]);
const flowStore = useFlowStore();

const voiceText = ref("");

const canStart = computed(() => Boolean(voiceText.value.trim()));

// 返回出题方式选择小屏，或从分析页补题场景返回全屏分析。
function handleCancel() {
  if (flowStore.voiceQuestionInputContext === "analysis") {
    emit("flow-action", { action: "cancel-voice-question-from-analysis" });
    return;
  }

  emit("flow-action", { action: "back-voice-question-method" });
}

// 提交语音题目并进入通用答题进行中全屏页。
function handleStart() {
  const questionText = voiceText.value.trim();
  if (!questionText) {
    return;
  }

  emit("flow-action", {
    action: "start-voice-question",
    questionText,
  });
}
</script>

<style scoped lang="scss">
.voice-question-input {
  display: flex;
  flex-direction: column;
  width: 420px;
  height: 380px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--ez-shadow-3);
}

.panel-header {
  flex-shrink: 0;
  padding: 16px 18px 10px;
  border-bottom: 1px solid var(--ez-n150);
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.mic-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--ez-p50);
  color: var(--ez-p600);
  display: grid;
  place-items: center;
}

.header-text {
  min-width: 0;

  .title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 800;
    color: var(--ez-n900);
    line-height: 1.3;
  }

  .subtitle {
    margin: 0;
    font-size: 11px;
    color: var(--ez-n400);
    line-height: 1.45;
  }
}

.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 18px 10px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-shrink: 0;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ef4444;
    animation: pulse 1.5s infinite;
  }

  .status-text {
    font-size: 12px;
    font-weight: 700;
    color: #ef4444;
  }
}

.textarea-wrapper {
  flex: 1;
  min-height: 0;
  background-color: var(--ez-n50);
  border: 1px solid var(--ez-n200);
  border-radius: 14px;
  padding: 12px;
}

.custom-textarea {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.55;
  color: var(--ez-n800);
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: var(--ez-n400);
  }
}

.panel-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px 16px;
  border-top: 1px solid var(--ez-n150);
}

.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid var(--ez-n200);
  color: var(--ez-n600);
}

.btn-confirm {
  border: none;
  background: var(--ez-n200);
  color: #ffffff;
  cursor: not-allowed;

  &:not(:disabled) {
    background: var(--ez-p500);
    cursor: pointer;

    &:hover {
      background: var(--ez-p600);
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}
</style>
