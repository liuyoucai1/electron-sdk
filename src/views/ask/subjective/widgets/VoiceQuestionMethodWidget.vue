<template>
  <section class="voice-question-method">
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
          <h2 class="title">请选择出题方式</h2>
          <p class="subtitle">选择适合当前课堂场景的出题方式</p>
        </div>
      </div>
      <button class="close-btn" type="button" aria-label="关闭" @click.stop="handleClose">
        ✕
      </button>
    </header>

    <div class="panel-body">
      <button class="method-card card-primary" type="button" @click="handleSelect('voice')">
        <span class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 1024 1024" width="20" height="20">
            <path
              d="M512 640a128 128 0 0 0 128-128V320a128 128 0 0 0-256 0v192a128 128 0 0 0 128 128z m256-128a64 64 0 0 1-128 0 192 192 0 0 1-384 0 64 64 0 0 1-128 0 320 320 0 0 0 640 0zM448 832h128v96H448z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="card-info">
          <span class="card-title">语音出题</span>
          <span class="card-desc">使用遥控器语音录入题目内容</span>
        </span>
      </button>

      <button
        class="method-card card-primary"
        type="button"
        :disabled="isCapturing"
        @click="handleSelect('screenshot')"
      >
        <span class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 1024 1024" width="20" height="20">
            <path
              d="M192 256h640a64 64 0 0 1 64 64v384a64 64 0 0 1-64 64H192a64 64 0 0 1-64-64V320a64 64 0 0 1 64-64z m32 64v384h576V320H224z m288 64a96 96 0 1 0 0 192 96 96 0 0 0 0-192z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="card-info">
          <span class="card-title">截屏出题</span>
          <span class="card-desc">截取屏幕内容作为题目</span>
        </span>
      </button>

      <button class="method-card card-outline" type="button" @click="handleSelect('later')">
        <span class="clock-icon" aria-hidden="true">🕒</span>
        先答题后设置题目
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { startRegionScreenshot } from "../../../../api/screenshot.js";

const emit = defineEmits(["flow-action"]);
const isCapturing = ref(false);

// 关闭语音出题方式小屏，回到胶囊。
function handleClose() {
  emit("flow-action", { action: "close-flow" });
}

// 选择出题方式，截屏出题走主进程区域截图插件。
async function handleSelect(method) {
  if (method === "screenshot") {
    if (isCapturing.value) {
      return;
    }

    isCapturing.value = true;

    try {
      const result = await startRegionScreenshot();
      if (!result?.ok || result.cancelled || !result.imageBase64) {
        return;
      }

      emit("flow-action", {
        action: "confirm-screenshot-question",
        imageBase64: result.imageBase64,
        mimeType: result.mimeType || "image/png",
        bounds: result.bounds,
      });
    } catch (error) {
      console.error("截屏出题失败:", error);
    } finally {
      isCapturing.value = false;
    }

    return;
  }

  emit("flow-action", {
    action: "select-voice-method",
    method,
  });
}
</script>

<style scoped lang="scss">
.voice-question-method {
  display: flex;
  flex-direction: column;
  width: 385px;
  height: 325px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--ez-shadow-3);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 10px;
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
    line-height: 1.4;
  }
}

.close-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ez-n400);
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: var(--ez-n100);
    color: var(--ez-n600);
  }
}

.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 16px;
  overflow-y: auto;
}

.method-card {
  border: none;
  cursor: pointer;
  text-align: left;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.card-primary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--ez-p500);
  color: #ffffff;

  &:hover {
    background: var(--ez-p600);
  }

  .card-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    display: grid;
    place-items: center;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .card-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .card-desc {
    font-size: 11px;
    opacity: 0.9;
  }
}

.card-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border-radius: 14px;
  background: #ffffff;
  border: 1.5px solid var(--ez-n200);
  color: var(--ez-n800);
  font-size: 13px;
  font-weight: 700;

  &:hover {
    border-color: var(--ez-p300);
    color: var(--ez-p600);
    background: var(--ez-p50);
  }

  .clock-icon {
    font-size: 14px;
  }
}
</style>
