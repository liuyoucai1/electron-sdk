<template>
  <el-dialog
    v-model="visible"
    width="540px"
    align-center
    class="multi-answers-setting-dialog"
  >
    <!-- 头部 -->
    <template #header>
      <div class="dialog-header">
        <div class="title">设置正确答案</div>
        <div class="subtitle">为每道题指定正确答案</div>
      </div>
    </template>

    <!-- 问答形式 -->
    <div class="dialog-body">
      <div class="answers-list">
        <div v-for="q in questionsData" :key="q.id" class="answer-item">
          <!-- 题号 -->
          <span class="index-badge">{{ q.id }}</span>

          <!-- 类型标识 -->
          <span class="type-badge">{{ getTypeName(q.type) }}</span>

          <!-- 交互操作项 -->
          <div class="answer-action-area">
            <!-- 单选题 A B C D -->
            <template v-if="q.type === 'single'">
              <div class="btn-group">
                <button
                  v-for="opt in ['A', 'B', 'C', 'D']"
                  :key="opt"
                  class="circle-btn"
                  :class="{ active: q.answer === opt }"
                  @click="q.answer = opt"
                >
                  {{ opt }}
                </button>
              </div>
            </template>

            <!-- 多选题 A B C D -->
            <template v-else-if="q.type === 'multi'">
              <div class="btn-group">
                <button
                  v-for="opt in ['A', 'B', 'C', 'D']"
                  :key="opt"
                  class="circle-btn"
                  :class="{
                    active: Array.isArray(q.answer) && q.answer.includes(opt),
                  }"
                  @click="toggleMulti(q, opt)"
                >
                  {{ opt }}
                </button>
              </div>
            </template>

            <!-- 判断题 对 错 -->
            <template v-else-if="q.type === 'judge'">
              <div class="btn-group">
                <button
                  class="circle-btn text-btn"
                  :class="{ active: q.answer === true }"
                  @click="q.answer = true"
                >
                  ✓
                </button>
                <button
                  class="circle-btn text-btn"
                  :class="{ active: q.answer === false }"
                  @click="q.answer = false"
                >
                  ✕
                </button>
              </div>
            </template>

            <!-- 数字题 -->
            <template v-else-if="q.type === 'number'">
              <input
                v-model="q.answer"
                type="text"
                class="custom-input"
                placeholder="输入正确答案"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部确认 -->
    <template #footer>
      <button class="btn-primary-large" @click="handleSave">确认答案</button>
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

const emit = defineEmits(["update:modelValue", "save"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 依据截图配置的4道题的不同类型
const questionsData = ref([
  { id: 1, type: "single", answer: "" },
  { id: 2, type: "multi", answer: [] },
  { id: 3, type: "judge", answer: null },
  { id: 4, type: "number", answer: "" },
]);

// 格式转换器
const getTypeName = (type) => {
  const map = {
    single: "单选",
    multi: "多选",
    judge: "判断",
    number: "数字",
  };
  return map[type] || "";
};

// 切换多选选项
const toggleMulti = (question, opt) => {
  if (!Array.isArray(question.answer)) {
    question.answer = [];
  }
  const idx = question.answer.indexOf(opt);
  if (idx > -1) {
    question.answer.splice(idx, 1);
  } else {
    question.answer.push(opt);
  }
};

// 保存逻辑
const handleSave = () => {
  console.log("提交多题答案:", questionsData.value);
  emit("save", questionsData.value);
  visible.value = false;
};
</script>

<style scoped lang="scss">
.multi-answers-setting-dialog {
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

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-item {
  display: flex;
  align-items: center;
  height: 52px;

  .index-badge {
    font-size: 16px;
    font-weight: bold;
    color: #475569;
    width: 24px;
  }

  .type-badge {
    background-color: #f1f5f9;
    color: #64748b;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    margin-right: 16px;
  }
}

.answer-action-area {
  flex: 1;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.circle-btn {
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  width: 48px;
  height: 38px;
  font-size: 15px;
  font-weight: bold;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: #529b85;
    background-color: #f0f7f5;
    color: #529b85;
  }

  &.text-btn {
    font-size: 18px;
  }
}

.custom-input {
  width: 140px;
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #529b85;
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
