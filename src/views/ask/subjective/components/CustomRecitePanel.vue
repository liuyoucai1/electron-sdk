<template>
  <section class="center-content-panel is-full">
    <div class="custom-input-header">
      <span class="content-header-title">自定义{{ modeLabel }}内容</span>
      <button class="btn-voice-input" type="button" @click="handleVoiceInput">
        <span class="icon-mic">🎤</span>
        语音录入
      </button>
    </div>
    <div class="textarea-container">
      <textarea
        v-model="customText"
        class="custom-textarea"
        :placeholder="`请输入内容或者点击语音录入按钮使用语音输入`"
      ></textarea>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modeLabel: {
    type: String,
    default: "背诵",
  },
});

const customText = ref("");

// 触发语音录入（后续接入语音识别）。
function handleVoiceInput() {
  console.log("启动自定义内容的语音录入功能");
}

// 返回当前临时自编 Tab 的提交载荷。
function getSubmitPayload() {
  return {
    tab: "custom",
    content: customText.value,
    contentTitle: "自定义内容",
  };
}

defineExpose({
  getSubmitPayload,
});
</script>

<style scoped lang="scss">
.center-content-panel.is-full {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .content-header-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ez-n400);
  }
}

.custom-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-voice-input {
  background-color: var(--ez-p50);
  border: 1.5px solid var(--ez-p200);
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ez-p600);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: var(--ez-p100);
  }
}

.textarea-container {
  flex: 1;
  min-height: 320px;
  border: 1.5px solid var(--ez-n200);
  border-radius: 16px;
  padding: 16px;
  background-color: var(--ez-n50);
  display: flex;
}

.custom-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 15px;
  color: var(--ez-n800);
  outline: none;
  line-height: 1.6;
  font-family: inherit;

  &::placeholder {
    color: var(--ez-n400);
  }
}
</style>
