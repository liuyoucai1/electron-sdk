<template>
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    align-center
    :append-to-body="false"
    :close-on-click-modal="true"
    class="set-single-answer-dialog"
    modal-class="set-answer-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="title">设置正确答案</h2>
      </div>
    </template>

    <div class="question-meta">
      <span class="question-index">{{ questionIndex }}</span>
      <span class="type-tag">{{ typeLabel }}</span>
    </div>

    <!-- 单选 / 多选 -->
    <div
      v-if="questionType === 'single' || questionType === 'multiple'"
      class="option-grid"
    >
      <button
        v-for="opt in optionKeys"
        :key="opt"
        type="button"
        class="option-btn"
        :class="{ active: isOptionActive(opt) }"
        @click="toggleOption(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <!-- 判断 -->
    <div v-else-if="questionType === 'judge'" class="option-grid is-judge">
      <button
        type="button"
        class="option-btn"
        :class="{ active: localValue === 'true' }"
        @click="localValue = 'true'"
      >
        ✓
      </button>
      <button
        type="button"
        class="option-btn"
        :class="{ active: localValue === 'false' }"
        @click="localValue = 'false'"
      >
        ✕
      </button>
    </div>

    <!-- 数字 -->
    <el-input
      v-else
      :model-value="localValue"
      class="numeric-input"
      placeholder="输入正确答案"
      :maxlength="NUMERIC_ANSWER_MAX_LENGTH"
      @input="handleNumericInput"
    />

    <template #footer>
      <button class="confirm-btn" type="button" @click="handleConfirm">
        确定
      </button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import {
  NUMERIC_ANSWER_MAX_LENGTH,
  sanitizeNumericAnswerInput,
} from "../../../utils/numericAnswer.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  questionIndex: {
    type: Number,
    default: 1,
  },
  questionType: {
    type: String,
    default: "single",
  },
  typeLabel: {
    type: String,
    default: "单选",
  },
  optionCount: {
    type: Number,
    default: 4,
  },
  initialAnswer: {
    type: [String, Array],
    default: "",
  },
  // 缩屏为 true（70%），全屏为 false（40%）。
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const localValue = ref("");

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const dialogWidth = computed(() => (props.compact ? "70%" : "40%"));

// 生成单/多选选项字母列表。
const optionKeys = computed(() => {
  const letters = "ABCDEFGHIJ".split("");
  return letters.slice(0, Math.max(2, Math.min(props.optionCount, 10)));
});

// 为 Electron 透明窗口标记弹层与面板热区，并强制关闭鼠标穿透。
function markOverlayHitbox() {
  nextTick(() => {
    document
      .querySelectorAll(
        ".set-answer-dialog-overlay, .set-single-answer-dialog",
      )
      .forEach((element) => {
        element.setAttribute("data-overlay-hitbox", "true");
      });
    window.electronBridge?.setMousePassthrough(false);
    notifyOverlayChange();
  });
}

// 通知 overlay 宿主刷新可点击热区。
function notifyOverlayChange() {
  nextTick(() => {
    document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
  });
}

// 根据初始答案构建弹框草稿。
function buildLocalValue() {
  if (props.questionType === "multiple") {
    localValue.value = Array.isArray(props.initialAnswer)
      ? [...props.initialAnswer]
      : [];
    return;
  }

  localValue.value =
    typeof props.initialAnswer === "string" ? props.initialAnswer : "";
}

// 判断选项是否选中。
function isOptionActive(opt) {
  if (props.questionType === "multiple") {
    return Array.isArray(localValue.value) && localValue.value.includes(opt);
  }
  return localValue.value === opt;
}

// 单选选中唯一项；多选切换选中集合。
function toggleOption(opt) {
  if (props.questionType === "multiple") {
    const selected = Array.isArray(localValue.value) ? [...localValue.value] : [];
    const pos = selected.indexOf(opt);
    if (pos >= 0) {
      selected.splice(pos, 1);
    } else {
      selected.push(opt);
      selected.sort();
    }
    localValue.value = selected;
    return;
  }

  localValue.value = opt;
}

// 处理数字题输入并回写校验后的值。
function handleNumericInput(value) {
  localValue.value = sanitizeNumericAnswerInput(value);
}

// 确认答案并回传父组件。
function handleConfirm() {
  const value =
    props.questionType === "multiple"
      ? [...(localValue.value || [])]
      : (localValue.value ?? "");

  emit("confirm", {
    type: props.questionType,
    typeLabel: props.typeLabel,
    value,
  });
  visible.value = false;
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      buildLocalValue();
    }
  },
);

watch(
  () => [props.initialAnswer, props.questionType],
  () => {
    if (props.modelValue) {
      buildLocalValue();
    }
  },
);
</script>

<style scoped lang="scss">
.dialog-header {
  .title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: var(--ez-n900);
  }
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .question-index {
    font-size: 18px;
    font-weight: 700;
    color: var(--ez-n400);
    font-family: "Consolas", monospace;
  }

  .type-tag {
    min-width: 44px;
    height: 32px;
    padding: 0 12px;
    border-radius: 8px;
    background: var(--ez-n100);
    color: var(--ez-n500);
    font-size: 13px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  &.is-judge {
    grid-template-columns: repeat(2, 1fr);
  }
}

.option-btn {
  min-height: 72px;
  border: 1px solid var(--ez-n200);
  border-radius: 14px;
  background: #ffffff;
  color: var(--ez-n700);
  font-size: 22px;
  font-weight: 700;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--ez-p300);
  }

  &.active {
    background: var(--ez-p500);
    border-color: var(--ez-p500);
    color: #ffffff;
    box-shadow: 0 4px 8px rgba(91, 159, 138, 0.24);
  }
}

.numeric-input {
  :deep(.el-input__wrapper) {
    height: 56px;
    border-radius: 14px;
    box-shadow: 0 0 0 1px var(--ez-n200) inset;
  }

  :deep(.el-input__inner) {
    font-size: 18px;
    font-weight: 600;
    color: var(--ez-n800);
  }
}

.confirm-btn {
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
