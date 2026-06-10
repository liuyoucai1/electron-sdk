<template>
  <section class="launcher-stage">
    <div class="launcher-panel" data-overlay-hitbox="true" :style="panelStyle">
      <header class="launcher-header">
        <div class="brand-mark">
          <strong>EZ</strong>
          <span>Quiz</span>
        </div>

        <div class="title-block">
          <h1>开始今日课堂</h1>
          <p>请选择班级和科目并开始使用</p>
        </div>

        <div class="server-status">
          <i></i>
          <span>基站未连接</span>
        </div>
      </header>

      <main class="launcher-body">
        <section class="field-group">
          <h2>班级</h2>
          <div class="select-row">
            <el-select
              v-model="selectedGradeId"
              class="classroom-select"
              :teleported="false"
              @change="handleGradeChange"
            >
              <el-option
                v-for="grade in gradeOptions"
                :key="grade.id"
                :label="grade.name"
                :value="grade.id"
              />
            </el-select>

            <el-select
              v-model="selectedClassId"
              class="classroom-select"
              :teleported="false"
              @change="handleClassChange"
            >
              <el-option
                v-for="classItem in classOptions"
                :key="classItem.id"
                :label="classItem.name"
                :value="classItem.id"
              />
            </el-select>
          </div>
        </section>

        <section class="field-group subject-group">
          <h2>科目</h2>
          <div class="subject-grid">
            <button
              v-for="subject in subjectOptions"
              :key="subject.id"
              class="subject-button"
              :class="{ active: selectedSubjectId === subject.id }"
              type="button"
              @click="selectSubject(subject.id)"
            >
              <span>{{ subject.name }}</span>
              <i v-if="selectedSubjectId === subject.id">✓</i>
            </button>
          </div>
        </section>

        <button class="start-button" type="button" @click="startClass">
          开始上课
        </button>
      </main>

      <footer class="launcher-footer">
        <span>中天易教 V3.5.0</span>
        <span>班级科目最近同步时间：2016/5/20 11:20</span>
        <div class="footer-actions">
          <button class="sync-button" type="button" @click="syncClassroomData">
            <span>↻</span>
            同步
          </button>
          <button
            class="close-button"
            type="button"
            aria-label="关闭"
            @click="closeLauncher"
          >
            ×
          </button>
        </div>
      </footer>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const emit = defineEmits(["start"]);
const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 852;
const VIEWPORT_PADDING = 24;

const scale = ref(1);
const selectedGradeId = ref("grade-2");
const selectedClassId = ref("grade-2-class-1");
const selectedSubjectId = ref("chemistry");

const gradeOptions = [
  {
    id: "grade-1",
    name: "一年级",
    classes: [
      { id: "grade-1-class-1", name: "1班" },
      { id: "grade-1-class-2", name: "2班" },
    ],
    subjects: [
      { id: "math", name: "数学" },
      { id: "chinese", name: "语文" },
      { id: "english", name: "英语" },
      { id: "art", name: "美术" },
    ],
  },
  {
    id: "grade-2",
    name: "二年级",
    classes: [
      { id: "grade-2-class-1", name: "1班" },
      { id: "grade-2-class-2", name: "2班" },
      { id: "grade-2-class-3", name: "3班" },
    ],
    subjects: [
      { id: "chemistry", name: "化学" },
      { id: "history", name: "历史" },
      { id: "geography", name: "地理" },
      { id: "politics", name: "政治" },
      { id: "math", name: "数学" },
      { id: "physics", name: "物理" },
      { id: "biology", name: "生物" },
      { id: "art", name: "美术" },
      { id: "english", name: "英语" },
      { id: "chinese", name: "语文" },
      { id: "self-study", name: "自习课" },
    ],
  },
  {
    id: "grade-3",
    name: "三年级",
    classes: [
      { id: "grade-3-class-1", name: "1班" },
      { id: "grade-3-class-2", name: "2班" },
    ],
    subjects: [
      { id: "physics", name: "物理" },
      { id: "chemistry", name: "化学" },
      { id: "biology", name: "生物" },
      { id: "history", name: "历史" },
      { id: "geography", name: "地理" },
      { id: "politics", name: "政治" },
    ],
  },
];

const selectedGrade = computed(
  () =>
    gradeOptions.find((grade) => grade.id === selectedGradeId.value) ||
    gradeOptions[0],
);
const classOptions = computed(() => selectedGrade.value.classes);
const subjectOptions = computed(() => selectedGrade.value.subjects);
const panelStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}));

// 根据窗口尺寸按设计稿比例缩放启动面板。
function updatePanelScale() {
  const widthScale = (window.innerWidth - VIEWPORT_PADDING * 2) / DESIGN_WIDTH;
  const heightScale =
    (window.innerHeight - VIEWPORT_PADDING * 2) / DESIGN_HEIGHT;
  scale.value = Math.min(1, widthScale, heightScale);
}

// 切换年级后同步重置班级和科目选项。
function handleGradeChange() {
  selectedClassId.value = classOptions.value[0]?.id;
  selectedSubjectId.value = subjectOptions.value[0]?.id;
}

// 记录班级切换，保留后续接入真实课堂逻辑的扩展点。
function handleClassChange() {
  nextTick(() => {
    document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
  });
}

// 选择当前课堂科目。
function selectSubject(subjectId) {
  selectedSubjectId.value = subjectId;
}

// 发出开始上课事件，进入悬浮球主界面。
function startClass() {
  emit("start", {
    gradeId: selectedGradeId.value,
    classId: selectedClassId.value,
    subjectId: selectedSubjectId.value,
  });
}

// 预留同步入口，当前只刷新交互区域。
function syncClassroomData() {
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

// 关闭按钮当前不退出应用，只保留视觉入口并刷新交互区域。
function closeLauncher() {
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

onMounted(() => {
  updatePanelScale();
  window.addEventListener("resize", updatePanelScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePanelScale);
});
</script>

<style scoped lang="scss">
.launcher-stage {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  // background: rgba(245, 246, 247, 0.7);
  pointer-events: auto;
}

.launcher-panel {
  display: grid;
  width: 800px;
  height: 852px;
  grid-template-rows: 120px 1fr 100px;
  overflow: hidden;
  border-radius: 36px;
  background: #ffffff;
  box-shadow: var(--ez-shadow-4);
  transform-origin: center center;
  transition: transform 220ms ease;
}

.launcher-header {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 48px 60px 40px;
  border-bottom: 1px solid var(--ez-n150);
}

.brand-mark {
  display: grid;
  align-content: center;
  justify-items: center;
  width: 70px;
  height: 70px;
  border-radius: 999px;
  background: var(--ez-p500);
  color: #ffffff;
  line-height: 1;

  strong {
    font-size: 18px;
  }

  span {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 800;
  }
}

.title-block {
  h1 {
    margin: 0;
    color: var(--ez-n900);
    font-size: 30px;
    line-height: 1.2;
    letter-spacing: 0;
  }

  p {
    margin: 12px 0 0;
    color: var(--ez-n400);
    font-size: 16px;
  }
}

.server-status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ez-n500);
  font-size: 14px;

  i {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--ez-error);
  }
}

.launcher-body {
  display: flex;
  flex-direction: column;
  padding: 44px 60px 40px;
  overflow: hidden;
}

.field-group {
  h2 {
    margin: 0 0 16px;
    color: var(--ez-n400);
    font-size: 18px;
    line-height: 1;
  }
}

.select-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.classroom-select {
  width: 100%;

  :deep(.el-select__wrapper) {
    height: 64px;
    border-radius: 16px;
    box-shadow: 0 0 0 1.5px var(--ez-n200) inset;
    padding: 0 24px;
  }

  :deep(.el-select__selected-item) {
    color: var(--ez-n800);
    font-size: 20px;
  }
}

.subject-group {
  flex: 1;
  min-height: 0;
  margin-top: 34px;
  padding-bottom: 34px;
  overflow-y: auto;
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 16px;
}

.subject-button {
  position: relative;
  display: grid;
  place-items: center;
  height: 64px;
  border: 1.5px solid var(--ez-n200);
  border-radius: 16px;
  background: #ffffff;
  color: var(--ez-n700);
  font-size: 20px;
  font-weight: 800;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: var(--ez-p300);
    background: var(--ez-p50);
    color: var(--ez-p600);
  }

  &.active {
    background: var(--ez-p500);
    color: #ffffff;
  }

  i {
    position: absolute;
    left: 50%;
    bottom: -10px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: 2px solid #ffffff;
    border-radius: 999px;
    background: var(--ez-p500);
    color: #ffffff;
    font-size: 14px;
    font-style: normal;
    transform: translateX(-50%);
  }
}

.subject-button {
  grid-column: span 3;
}

.start-button {
  width: 100%;
  height: 70px;
  margin-top: 40px;
  border-radius: 16px;
  background: var(--ez-p500);
  color: #ffffff;
  font-size: 24px;
  font-weight: 900;
  box-shadow: 0 16px 32px rgba(91, 159, 138, 0.2);
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    background: var(--ez-p600);
    transform: translateY(-1px);
  }

  &:active {
    background: var(--ez-p700);
    transform: translateY(0);
  }
}

.launcher-footer {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 28px;
  align-items: center;
  padding: 20px 50px;
  background: var(--ez-n50);
  color: var(--ez-n500);
  font-size: 15px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sync-button,
.close-button {
  height: 48px;
  border-radius: 12px;
  font-weight: 800;
}

.sync-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--ez-p500);
  background: #ffffff;
  color: var(--ez-p600);
  padding: 0 18px;
  font-size: 18px;

  span {
    font-size: 24px;
    line-height: 1;
  }
}

.close-button {
  width: 52px;
  border: 1.5px solid var(--ez-error);
  background: #fdf2f1;
  color: var(--ez-error);
  font-size: 30px;
  line-height: 1;
}
</style>
