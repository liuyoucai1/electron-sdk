<template>
  <el-dialog
    v-model="visible"
    width="480px"
    align-center
    class="question-method-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="title-with-icon">
          <span class="mic-badge">🎤</span>
          <span class="title">请选择出题方式</span>
        </div>
        <div class="subtitle">选择适合当前课堂场景的出题方式</div>
      </div>
    </template>

    <!-- 选择项 -->
    <div class="dialog-body">
      <!-- 语音出题 -->
      <button class="method-card card-green" @click="handleSelect('voice')">
        <div class="card-icon">🎤</div>
        <div class="card-info">
          <div class="card-title">语音出题</div>
          <div class="card-desc">使用遥控器语音录入题目内容</div>
        </div>
      </button>

      <!-- 截屏出题 -->
      <button
        class="method-card card-green"
        @click="handleSelect('screenshot')"
      >
        <div class="card-icon">🔲</div>
        <div class="card-info">
          <div class="card-title">截屏出题</div>
          <div class="card-desc">截取屏幕内容作为题目</div>
        </div>
      </button>

      <!-- 后设置题目 -->
      <button class="method-card outline-style" @click="handleSelect('later')">
        <span class="clock-icon">🕒</span> 先答题后设置题目
      </button>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "select"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleSelect = (method) => {
  console.log("选择出题方式:", method);
  emit("select", method);
};
</script>

<style scoped lang="scss">
.question-method-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    padding: 24px;
  }
}

.dialog-header {
  text-align: left;
  margin-bottom: 8px;

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
  }
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0;
}

.method-card {
  width: 100%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &.card-green {
    background-color: #529b85;
    color: white;
    border-radius: 16px;
    padding: 16px 20px;

    .card-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      width: 44px;
      height: 44px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .card-info {
      text-align: left;
      .card-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 2px;
      }
      .card-desc {
        font-size: 12px;
        opacity: 0.85;
      }
    }

    &:hover {
      opacity: 0.95;
    }
  }

  &.outline-style {
    background-color: white;
    border: 1.5px solid #cbd5e1;
    border-radius: 16px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-weight: bold;
    font-size: 15px;

    .clock-icon {
      font-size: 16px;
    }

    &:hover {
      border-color: #529b85;
      color: #529b85;
    }
  }
}
</style>
