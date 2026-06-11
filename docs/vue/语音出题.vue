<template>
  <el-dialog
    v-model="visible"
    width="480px"
    align-center
    class="voice-question-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="title-with-icon">
          <span class="mic-badge">🎤</span>
          <span class="title">语音出题</span>
        </div>
        <div class="subtitle">
          识别后的文本可直接编辑，也可使用遥控器重新录入语音。
        </div>
      </div>
    </template>

    <!-- 录音输入区 -->
    <div class="dialog-body">
      <!-- 录入状态标志 -->
      <div class="recording-indicator">
        <span class="dot"></span>
        <span class="status-text">录入中...</span>
      </div>

      <!-- 输入框 -->
      <div class="textarea-wrapper">
        <textarea
          v-model="voiceText"
          class="custom-textarea"
          placeholder="请使用遥控器语音录入题目"
        ></textarea>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleCancel">取消</button>
        <button
          class="btn btn-confirm"
          :disabled="!voiceText.trim()"
          @click="handleStart"
        >
          开始答题
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "start"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 语音识别内容变量
const voiceText = ref("");

const handleCancel = () => {
  visible.value = false;
};

const handleStart = () => {
  console.log("开始答题，提交题目内容:", voiceText.value);
  emit("start", voiceText.value);
  visible.value = false;
};
</script>

<style scoped lang="scss">
.voice-question-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    padding: 24px;
  }
}

.dialog-header {
  text-align: left;
  margin-bottom: 12px;

  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .mic-badge {
      background-color: #e6f4f1;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    color: #1e293b;
  }

  .subtitle {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.4;
  }
}

.dialog-body {
  padding: 8px 0;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .dot {
    width: 8px;
    height: 8px;
    background-color: #ef4444;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  .status-text {
    font-size: 13px;
    color: #ef4444;
    font-weight: bold;
  }
}

.textarea-wrapper {
  background-color: #fafbfb;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 12px;
}

.custom-textarea {
  width: 100%;
  height: 180px;
  background: transparent;
  border: none;
  resize: none;
  font-size: 15px;
  color: #334155;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  border-radius: 12px;
  padding: 8px 24px;
  height: 44px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &-cancel {
    background-color: white;
    border: 1px solid #cbd5e1;
    color: #64748b;
  }

  &-confirm {
    background-color: #cbd5e1; // 禁用态置灰
    color: #f8fafc;
    cursor: not-allowed;

    &:not([disabled]) {
      background-color: #529b85;
      color: white;
      cursor: pointer;
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
