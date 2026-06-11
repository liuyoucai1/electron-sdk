<template>
  <el-dialog
    v-model="visible"
    width="520px"
    align-center
    class="multi-question-config-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="title">多题提问</div>
        <div class="subtitle">配置题目组合，向全班发起</div>
      </div>
    </template>

    <!-- 表单区 -->
    <div class="dialog-body">
      <!-- 计数配置 -->
      <div class="config-row">
        <span class="label-name">共几题</span>
        <div class="custom-counter">
          <button class="counter-btn" @click="changeCount('total', -1)">
            —
          </button>
          <span class="counter-val">{{ totalQuestions }}</span>
          <button class="counter-btn" @click="changeCount('total', 1)">
            +
          </button>
        </div>
      </div>

      <div class="config-row">
        <span class="label-name">单/多选选项个数</span>
        <div class="custom-counter">
          <button class="counter-btn" @click="changeCount('options', -1)">
            —
          </button>
          <span class="counter-val">{{ optionCount }}</span>
          <button class="counter-btn" @click="changeCount('options', 1)">
            +
          </button>
        </div>
      </div>

      <!-- 题目列表配置 -->
      <div class="question-list">
        <div v-for="(q, idx) in questions" :key="idx" class="question-row">
          <div class="q-index">{{ idx + 1 }}</div>
          <div class="q-types">
            <button
              v-for="type in qTypes"
              :key="type.value"
              class="type-btn"
              :class="{ active: q.type === type.value }"
              @click="q.type = type.value"
            >
              {{ type.label }}
            </button>
          </div>
          <div class="q-opt-desc">{{ optionCount }} 个选项</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <button class="btn-primary-large" @click="handleLaunch">发起提问</button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "launch"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 默认基础变量
const totalQuestions = ref(3);
const optionCount = ref(4);

const qTypes = [
  { label: "单选", value: "single" },
  { label: "多选", value: "multi" },
  { label: "判断", value: "judge" },
  { label: "数字", value: "number" },
];

// 动态构建题型数据
const questions = ref([
  { type: "single" },
  { type: "single" },
  { type: "single" },
]);

// 监听题量变化并补全/截断
watch(totalQuestions, (newVal) => {
  if (newVal > questions.value.length) {
    const diff = newVal - questions.value.length;
    for (let i = 0; i < diff; i++) {
      questions.value.push({ type: "single" });
    }
  } else if (newVal < questions.value.length) {
    questions.value = questions.value.slice(0, newVal);
  }
});

// 改变数值方法
const changeCount = (target, step) => {
  if (target === "total") {
    const nextVal = totalQuestions.value + step;
    if (nextVal >= 1 && nextVal <= 10) totalQuestions.value = nextVal;
  } else if (target === "options") {
    const nextVal = optionCount.value + step;
    if (nextVal >= 2 && nextVal <= 10) optionCount.value = nextVal;
  }
};

// 发起提问
const handleLaunch = () => {
  const payload = {
    total: totalQuestions.value,
    optionCount: optionCount.value,
    details: questions.value,
  };
  console.log("发起提问:", payload);
  emit("launch", payload);
  visible.value = false;
};
</script>

<style scoped lang="scss">
.multi-question-config-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    padding: 24px;
  }
  :deep(.el-dialog__footer) {
    padding: 0 0 8px;
  }
}

.dialog-header {
  text-align: left;
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: #94a3b8;
  }
}

.dialog-body {
  padding: 16px 0;
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .label-name {
    font-size: 15px;
    font-weight: bold;
    color: #334155;
  }
}

.custom-counter {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;

  .counter-btn {
    background-color: white;
    border: none;
    width: 44px;
    height: 40px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8fafc;
    }
  }

  .counter-val {
    width: 44px;
    text-align: center;
    font-weight: bold;
    font-size: 15px;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    height: 40px;
    line-height: 40px;
  }
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.question-row {
  display: flex;
  align-items: center;

  .q-index {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: #f1f5f9;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    margin-right: 16px;
  }

  .q-types {
    display: flex;
    background-color: #f8fafc;
    border-radius: 10px;
    padding: 3px;
    gap: 4px;
    border: 1px solid #f1f5f9;
  }

  .type-btn {
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: bold;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background-color: #529b85;
      color: white;
    }
  }

  .q-opt-desc {
    margin-left: auto;
    font-size: 13px;
    color: #94a3b8;
  }
}

.btn-primary-large {
  background-color: #529b85;
  color: white;
  border: none;
  width: 100%;
  border-radius: 14px;
  height: 48px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.9;
  }
}
</style>
