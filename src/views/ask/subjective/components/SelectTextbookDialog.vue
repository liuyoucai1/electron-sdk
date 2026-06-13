<template>
  <el-dialog
    v-model="visible"
    width="40%"
    align-center
    :append-to-body="true"
    :close-on-click-modal="true"
    class="select-textbook-dialog"
    modal-class="select-textbook-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="title">选择教材</h2>
        <p class="subtitle">请选择年级、学期和教材版本</p>
      </div>
    </template>

    <div class="dialog-body">
      <section class="section">
        <h3 class="section-title">年级</h3>
        <div class="grid-buttons grade-grid">
          <button
            v-for="grade in grades"
            :key="grade"
            type="button"
            class="tag-btn"
            :class="{ active: currentGrade === grade }"
            @click="currentGrade = grade"
          >
            {{ grade }}
          </button>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">学期</h3>
        <div class="grid-buttons semester-grid">
          <button
            v-for="semester in semesters"
            :key="semester"
            type="button"
            class="tag-btn"
            :class="{ active: currentSemester === semester }"
            @click="currentSemester = semester"
          >
            {{ semester }}
          </button>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">教材版本</h3>
        <div class="grid-buttons edition-grid">
          <button
            v-for="edition in editions"
            :key="edition"
            type="button"
            class="tag-btn"
            :class="{ active: currentEdition === edition }"
            @click="currentEdition = edition"
          >
            {{ edition }}
          </button>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-cancel" type="button" @click="handleCancel">
          取消
        </button>
        <button class="btn btn-confirm" type="button" @click="handleConfirm">
          确定
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, ref } from "vue";

const emit = defineEmits(["confirm"]);

const grades = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
];
const semesters = ["上册", "下册"];
const editions = ["人教部编版", "沪教版", "苏教版", "北师大版", "外研版"];

const visible = ref(false);
const currentGrade = ref("初二");
const currentSemester = ref("上册");
const currentEdition = ref("人教部编版");

// 为 Electron 透明窗口标记弹层热区。
function markOverlayHitbox() {
  nextTick(() => {
    document
      .querySelectorAll(
        ".select-textbook-dialog-overlay, .select-textbook-dialog",
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

// 拼接教材展示文案。
function buildTextbookLabel(grade, semester, edition) {
  return `${grade}${semester}${edition}`;
}

// 打开弹框并回显已选教材；由父级通过 ref 调用。
function handleOpen(params = {}) {
  currentGrade.value = params.grade || "初二";
  currentSemester.value = params.semester || "上册";
  currentEdition.value = params.edition || "人教部编版";
  visible.value = true;
}

// 取消选择并关闭弹框。
function handleCancel() {
  visible.value = false;
}

// 确认选择并回传父组件。
function handleConfirm() {
  const payload = {
    grade: currentGrade.value,
    semester: currentSemester.value,
    edition: currentEdition.value,
    label: buildTextbookLabel(
      currentGrade.value,
      currentSemester.value,
      currentEdition.value,
    ),
  };

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
    font-size: 20px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--ez-n400);
  }
}

.dialog-body {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ez-n700);
}

.grid-buttons {
  display: grid;
  gap: 10px;

  &.grade-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  &.semester-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  &.edition-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tag-btn {
  background-color: #ffffff;
  border: 1px solid var(--ez-n300);
  border-radius: 10px;
  height: 40px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ez-n800);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ez-n50);
  }

  &.active {
    border-color: var(--ez-p500);
    background-color: var(--ez-p50);
    color: var(--ez-p600);
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
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &-cancel {
    background-color: #ffffff;
    border: 1px solid var(--ez-n300);
    color: var(--ez-n600);
  }

  &-confirm {
    border: none;
    background-color: var(--ez-p500);
    color: #ffffff;

    &:hover {
      background-color: var(--ez-p600);
    }
  }
}
</style>
