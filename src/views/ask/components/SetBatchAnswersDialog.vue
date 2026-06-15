<template>
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    align-center
    :append-to-body="false"
    :close-on-click-modal="true"
    class="set-batch-answers-dialog"
    modal-class="set-answer-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="title">设置正确答案</h2>
        <p class="subtitle">为每道题指定正确答案</p>
      </div>
    </template>

    <el-scrollbar class="question-scroll">
      <div
        v-for="(item, index) in localAnswers"
        :key="item.questionId"
        class="question-row"
      >
        <span class="row-index">{{ index + 1 }}</span>
        <span class="type-tag">{{ item.typeLabel }}</span>

        <!-- 单选 / 多选 -->
        <div
          v-if="item.type === 'single' || item.type === 'multiple'"
          class="option-group"
        >
          <button
            v-for="opt in getOptionKeys(item.optionCount)"
            :key="opt"
            type="button"
            class="option-btn"
            :class="{ active: isOptionActive(item, opt) }"
            @click="toggleOption(index, opt)"
          >
            {{ opt }}
          </button>
        </div>

        <!-- 判断 -->
        <div v-else-if="item.type === 'judge'" class="option-group">
          <button
            type="button"
            class="option-btn"
            :class="{ active: item.value === 'true' }"
            @click="setJudge(index, 'true')"
          >
            ✓
          </button>
          <button
            type="button"
            class="option-btn"
            :class="{ active: item.value === 'false' }"
            @click="setJudge(index, 'false')"
          >
            ✕
          </button>
        </div>

        <!-- 数字 -->
        <el-input
          v-else
          :model-value="item.value"
          class="numeric-input"
          placeholder="输入正确答案"
          :maxlength="NUMERIC_ANSWER_MAX_LENGTH"
          @input="(value) => handleNumericInput(index, value)"
        />
      </div>
    </el-scrollbar>

    <template #footer>
      <button class="confirm-btn" type="button" @click="handleConfirm">
        确认答案
      </button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import {
  NUMERIC_ANSWER_MAX_LENGTH,
  sanitizeNumericAnswerInput,
} from "../../../shared/utils/numericAnswer.js";

const props = defineProps({
  // 缩屏为 true（70%），全屏为 false（40%）。
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm"]);

const visible = ref(false);
const localAnswers = ref([]);

const dialogWidth = computed(() => (props.compact ? "70%" : "40%"));

// 为 Electron 透明窗口标记弹层与面板热区，并强制关闭鼠标穿透。
function markOverlayHitbox() {
  nextTick(() => {
    document
      .querySelectorAll(
        ".set-answer-dialog-overlay, .set-batch-answers-dialog",
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

// 根据打开参数构建本地草稿。
function buildLocalAnswers(questions, initialAnswers) {
  const savedMap = new Map(
    initialAnswers.map((item) => [item.questionId, item]),
  );

  localAnswers.value = questions.map((q) => {
    const saved = savedMap.get(q.id);
    const type = q.type || "single";

    if (type === "multiple") {
      return {
        questionId: q.id,
        type,
        typeLabel: q.typeLabel || "多选",
        optionCount: q.optionCount || 4,
        value: Array.isArray(saved?.value) ? [...saved.value] : [],
      };
    }

    return {
      questionId: q.id,
      type,
      typeLabel: q.typeLabel || "单选",
      optionCount: q.optionCount || 4,
      value: saved?.value ?? "",
    };
  });
}

// 打开弹框并载入题目列表；由父级通过 ref 调用。
function handleOpen(params = {}) {
  buildLocalAnswers(params.questions || [], params.initialAnswers || []);
  visible.value = true;
}

// 生成单/多选选项字母列表。
function getOptionKeys(count = 4) {
  const letters = "ABCDEFGHIJ".split("");
  return letters.slice(0, Math.max(2, Math.min(count, 10)));
}

// 判断选项是否处于选中态。
function isOptionActive(item, opt) {
  if (item.type === "multiple") {
    return Array.isArray(item.value) && item.value.includes(opt);
  }
  return item.value === opt;
}

// 单选选中唯一项；多选切换选中集合。
function toggleOption(index, opt) {
  const item = localAnswers.value[index];
  if (!item) {
    return;
  }

  if (item.type === "multiple") {
    const selected = Array.isArray(item.value) ? [...item.value] : [];
    const pos = selected.indexOf(opt);
    if (pos >= 0) {
      selected.splice(pos, 1);
    } else {
      selected.push(opt);
      selected.sort();
    }
    item.value = selected;
    return;
  }

  item.value = opt;
}

// 设置判断题答案。
function setJudge(index, value) {
  const item = localAnswers.value[index];
  if (item) {
    item.value = value;
  }
}

// 处理数字题输入并回写校验后的值。
function handleNumericInput(index, value) {
  const item = localAnswers.value[index];
  if (item) {
    item.value = sanitizeNumericAnswerInput(value);
  }
}

// 确认答案并回传父组件。
function handleConfirm() {
  const payload = localAnswers.value.map((item) => ({
    questionId: item.questionId,
    type: item.type,
    typeLabel: item.typeLabel,
    value:
      item.type === "multiple"
        ? [...(item.value || [])]
        : item.value ?? "",
  }));

  emit("confirm", payload);
  visible.value = false;
}

defineExpose({
  handleOpen,
});
</script>

<style scoped lang="scss">
.dialog-header {
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
}

.question-scroll {
  max-height: 50vh;

  :deep(.el-scrollbar__view) {
    padding-right: 4px;
  }
}

.question-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  border-bottom: 0.5px solid var(--ez-n100);

  &:last-child {
    border-bottom: none;
  }

  .row-index {
    width: 20px;
    font-size: 15px;
    font-weight: 700;
    color: var(--ez-n400);
    font-family: "Consolas", monospace;
    flex-shrink: 0;
  }

  .type-tag {
    flex-shrink: 0;
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

.option-group {
  flex: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.option-btn {
  min-width: 44px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--ez-n200);
  border-radius: 10px;
  background: #ffffff;
  color: var(--ez-n700);
  font-size: 15px;
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
  flex: 1;
  max-width: 280px;

  :deep(.el-input__wrapper) {
    height: 40px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--ez-n200) inset;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
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
