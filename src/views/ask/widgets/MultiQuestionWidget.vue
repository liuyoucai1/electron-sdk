<template>
  <section class="multi-question">
    <header class="dialog-header">
      <!-- 仅标题区可拖拽，关闭按钮不参与拖拽。 -->
      <div class="header-left" data-drag-handle>
        <h2 class="title">多题提问</h2>
        <p class="subtitle">配置题目组合，向全班发起</p>
      </div>
      <el-button class="close-btn" circle @click.stop="closeFlow">
        <el-icon><Close /></el-icon>
      </el-button>
    </header>

    <!-- 全局配置区 -->
    <div class="dialog-controls">
      <div class="control-row">
        <span class="control-label">共几题</span>
        <div class="stepper">
          <button
            class="stepper-btn"
            type="button"
            :disabled="totalQuestions <= 1"
            @click="changeTotalQuestions(-1)"
          >
            −
          </button>
          <div class="stepper-value">{{ totalQuestions }}</div>
          <button
            class="stepper-btn"
            type="button"
            :disabled="totalQuestions >= 10"
            @click="changeTotalQuestions(1)"
          >
            +
          </button>
        </div>
      </div>

      <div class="control-row">
        <span class="control-label">单/多选选项个数</span>
        <div class="stepper">
          <button
            class="stepper-btn"
            type="button"
            :disabled="globalOptions <= 2"
            @click="changeGlobalOptions(-1)"
          >
            −
          </button>
          <div class="stepper-value">{{ globalOptions }}</div>
          <button
            class="stepper-btn"
            type="button"
            :disabled="globalOptions >= 10"
            @click="changeGlobalOptions(1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- 题目配置列表 -->
    <div class="question-list">
      <el-scrollbar>
        <div
          v-for="(q, index) in questions"
          :key="index"
          class="question-item"
        >
          <div class="index-badge">{{ index + 1 }}</div>

          <div class="type-selectors">
            <button
              v-for="type in questionTypes"
              :key="type.value"
              class="selector-btn"
              :class="{ active: q.type === type.value }"
              type="button"
              @click="selectQuestionType(index, type.value)"
            >
              {{ type.label }}
            </button>
          </div>

          <div class="option-desc">
            {{ needsOptions(q.type) ? `${globalOptions} 个选项` : "—" }}
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 底部操作区 -->
    <footer class="dialog-footer">
      <button class="submit-btn" type="button" @click="submitMultiQuiz">
        发起提问
      </button>
    </footer>
  </section>
</template>

<script setup>
import { ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";

defineProps({
  sessionId: { type: String, default: "" },
});

const emit = defineEmits(["flow-action"]);

// 题型与后端 questionType 编码映射，与 AskEntryWidget 保持一致。
const questionTypes = [
  { label: "单选", value: "single", code: 2 },
  { label: "多选", value: "multiple", code: 3 },
  { label: "判断", value: "judge", code: 4 },
  { label: "数字", value: "numerical", code: 20 },
];

// 共几题，范围 1-10。
const totalQuestions = ref(3);
// 单/多选选项个数，范围 2-10。
const globalOptions = ref(4);
// 每道题的配置，初始 3 道单选。
const questions = ref([
  { type: "single" },
  { type: "single" },
  { type: "single" },
]);

// 题数变化时同步增减题目配置数组，保留已有选择。
watch(totalQuestions, (next) => {
  const diff = next - questions.value.length;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      questions.value.push({ type: "single" });
    }
  } else if (diff < 0) {
    questions.value.splice(next);
  }
});

// 判断该题型是否需要展示选项个数。
function needsOptions(type) {
  return type === "single" || type === "multiple";
}

// 调整总题数，受 1-10 边界约束。
function changeTotalQuestions(step) {
  const next = totalQuestions.value + step;
  if (next >= 1 && next <= 10) {
    totalQuestions.value = next;
  }
}

// 调整单/多选选项个数，受 2-10 边界约束。
function changeGlobalOptions(step) {
  const next = globalOptions.value + step;
  if (next >= 2 && next <= 10) {
    globalOptions.value = next;
  }
}

// 选择某道题的题型。
function selectQuestionType(index, type) {
  questions.value[index].type = type;
}

// 发起提问，进入答题进行中小屏，并标记多题入口供结束后跳批量分析。
function submitMultiQuiz() {
  const typeCodeMap = Object.fromEntries(
    questionTypes.map((t) => [t.value, t.code]),
  );

  emit("flow-action", {
    action: "open-answer-progress",
    entrySource: "multi-question",
    questionId: `multi-${Date.now()}`,
    questionType: typeCodeMap[questions.value[0]?.type] || 2,
    optionCount: globalOptions.value,
    questionCount: totalQuestions.value,
    questions: questions.value.map((q) => ({
      type: q.type,
      code: typeCodeMap[q.type],
    })),
  });
}

// 关闭整条问业务流程，回到胶囊 / 悬浮球（idle）。
function closeFlow() {
  emit("flow-action", { action: "close-flow" });
}
</script>

<style scoped lang="scss">
.multi-question {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
}

/* ========== 头部 ========== */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28px 32px 20px;
  border-bottom: 0.5px solid var(--ez-n100);
  flex-shrink: 0;

  .header-left {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  .title {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--ez-n400);
  }

  .close-btn {
    width: 36px;
    height: 36px;
    background: var(--ez-n50);
    border: 0.5px solid var(--ez-n200);
    color: var(--ez-n500);

    &:hover {
      background: var(--ez-n200);
      color: var(--ez-n900);
    }
  }
}

/* ========== 全局配置区 ========== */
.dialog-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 32px;
  border-bottom: 0.5px solid var(--ez-n100);
  flex-shrink: 0;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .control-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n700);
  }
}

.stepper {
  display: flex;
  width: 126px;
  height: 42px;
  border: 1px solid var(--ez-n200);
  border-radius: 12px;
  overflow: hidden;

  .stepper-btn {
    flex: 1;
    background: transparent;
    font-size: 22px;
    color: var(--ez-n500);
    display: grid;
    place-items: center;

    &:disabled {
      color: var(--ez-n200);
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--ez-n50);
    }
  }

  .stepper-value {
    width: 44px;
    display: grid;
    place-items: center;
    border-left: 0.5px solid var(--ez-n200);
    border-right: 0.5px solid var(--ez-n200);
    font-size: 18px;
    font-weight: 700;
    font-family: "Consolas", monospace;
    color: var(--ez-n900);
  }
}

/* ========== 题目配置列表 ========== */
.question-list {
  flex: 1;
  min-height: 0;
  padding: 8px 32px;

  :deep(.el-scrollbar) {
    height: 100%;
  }
}

.question-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 0.5px solid var(--ez-n100);

  &:last-child {
    border-bottom: none;
  }

  .index-badge {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 0.5px solid var(--ez-p100);
    border-radius: 10px;
    background: var(--ez-p50);
    color: var(--ez-p600);
    font-size: 15px;
    font-weight: 700;
    font-family: "Consolas", monospace;
    flex-shrink: 0;
  }

  .type-selectors {
    display: flex;
    gap: 8px;
  }

  .selector-btn {
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--ez-n200);
    border-radius: 10px;
    background: #ffffff;
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n600);
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      border-color: var(--ez-p500);
    }

    &.active {
      background: var(--ez-p500);
      border-color: var(--ez-p500);
      color: #ffffff;
      box-shadow: 0 4px 6px rgba(91, 159, 138, 0.25);
    }
  }

  .option-desc {
    flex: 1;
    text-align: right;
    font-size: 13px;
    color: var(--ez-n400);
  }
}

/* ========== 底部操作区 ========== */
.dialog-footer {
  padding: 20px 32px 28px;
  border-top: 0.5px solid var(--ez-n100);
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 56px;
  border-radius: 16px;
  background: var(--ez-p500);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 8px 10px rgba(91, 159, 138, 0.32);
  transition: background-color 0.16s ease;

  &:hover {
    background: var(--ez-p600);
  }

  &:active {
    background: var(--ez-p700);
  }
}
</style>
