<template>
  <el-dialog
    v-model="visible"
    width="480px"
    align-center
    class="single-answer-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <span class="title">设置正确答案</span>
      </div>
    </template>

    <!-- 选项面板 -->
    <div class="dialog-body">
      <div class="options-grid">
        <button
          v-for="opt in ['A', 'B', 'C', 'D']"
          :key="opt"
          class="option-btn"
          @click="selectAnswer(opt)"
        >
          {{ opt }}
        </button>
      </div>
      <div class="tip-text">选择后自动关闭并显示正误分布</div>
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

// 选择答案后的逻辑
const selectAnswer = (option) => {
  console.log("选择正确答案并自动保存:", option);
  emit("select", option);
  // 模拟自动关闭
  visible.value = false;
};
</script>

<style scoped lang="scss">
.single-answer-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    padding: 24px;
  }
}

.dialog-header {
  text-align: left;
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #1e293b;
  }
}

.dialog-body {
  padding: 16px 0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.option-btn {
  background-color: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  height: 80px;
  font-size: 28px;
  font-weight: bold;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #529b85;
    color: #529b85;
    background-color: #f0f7f5;
  }

  &:active {
    transform: scale(0.98);
  }
}

.tip-text {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
