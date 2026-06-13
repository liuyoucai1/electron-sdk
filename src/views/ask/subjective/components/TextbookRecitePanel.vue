<template>
  <aside class="left-filter-panel">
    <div class="select-wrapper">
      <span class="filter-label">选科目</span>
      <el-select
        v-model="selectedSubject"
        placeholder="请选择科目"
        size="large"
        @visible-change="handleSelectVisibleChange"
      >
        <el-option label="英语" value="english" />
        <el-option label="数学" value="math" />
        <el-option label="语文" value="chinese" />
      </el-select>
    </div>

    <div class="select-wrapper">
      <span class="filter-label">选教材</span>
      <button
        type="button"
        class="fake-select"
        @click="openTextbookDialog"
      >
        <span class="fake-select-label">{{ textbookLabel }}</span>
        <span class="fake-select-arrow" aria-hidden="true"></span>
      </button>
    </div>

    <SelectTextbookDialog
      ref="selectTextbookDialogRef"
      @confirm="handleTextbookConfirm"
    />

    <el-tree
      class="unit-tree"
      :data="unitTreeData"
      node-key="id"
      :props="treeProps"
      :current-node-key="currentNodeKey"
      :default-expanded-keys="defaultExpandedKeys"
      highlight-current
      @node-click="handleTreeNodeClick"
    />
  </aside>

  <section class="center-content-panel">
    <div class="content-header-title">{{ contentHeaderTitle }}</div>
    <div class="recitation-list">
      <button
        v-for="item in textbookItems"
        :key="item.id"
        type="button"
        class="recitation-item"
        :class="{ active: selectedItemId === item.id }"
        @click="selectedItemId = item.id"
      >
        <span
          class="radio-indicator"
          :class="{ checked: selectedItemId === item.id }"
        ></span>
        <div class="item-body">
          <div class="item-title">{{ item.title }}</div>
          <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { getTextbookParagraphs } from "../../../../mock/reciteParagraphs.js";
import SelectTextbookDialog from "./SelectTextbookDialog.vue";

const treeProps = {
  label: "label",
  children: "children",
};

const unitTreeData = [
  { id: "all", label: "全部", nodeType: "all" },
  {
    id: "unit1",
    label: "Unit 1 Happy Holiday",
    nodeType: "unit",
    children: [
      {
        id: "unit1-secA",
        label: "Section A",
        nodeType: "section",
        unitId: "unit1",
        sectionId: "secA",
      },
      {
        id: "unit1-secB",
        label: "Section B",
        nodeType: "section",
        unitId: "unit1",
        sectionId: "secB",
      },
    ],
  },
  { id: "unit2", label: "Unit 2 Home Sweet Home", nodeType: "unit" },
  { id: "unit3", label: "Unit 3 Same or Different", nodeType: "unit" },
];

const selectedSubject = ref("english");
const selectedGrade = ref("初二");
const selectedSemester = ref("上册");
const selectedEdition = ref("人教部编版");
const selectTextbookDialogRef = ref(null);
const currentNodeKey = ref("unit1-secA");
const defaultExpandedKeys = ["unit1"];
const activeUnit = ref("unit1");
const activeSection = ref("secA");

const textbookItems = ref([
  {
    id: "word",
    title: "单词",
    desc: "Ancient/camp/strange/vacation/fantastic/town/take sb's breath away...",
  },
  {
    id: "secA_1b",
    title: "Section A 1b and 1c",
    desc: "Conversation 1Hi, Yaming. How was your vacation?",
  },
  {
    id: "secA_2a",
    title: "Section A 2a and 2d",
    desc: "Hi, Peter. How are you?Hi, Adam. I'm fine...",
  },
  { id: "secA_3a", title: "Section A 3a", desc: "" },
]);

const selectedItemId = ref("word");
const selectedParagraphIds = ref([]);
const selectedParagraphs = ref([]);

// 拼接展示已选教材文案。
const textbookLabel = computed(
  () => `${selectedGrade.value}${selectedSemester.value}${selectedEdition.value}`,
);

const unitTitleMap = {
  all: "全部",
  unit1: "Unit 1 Happy Holiday",
  unit2: "Unit 2 Home Sweet Home",
  unit3: "Unit 3 Same or Different",
};

// 根据树节点选中态生成右侧内容区标题。
const contentHeaderTitle = computed(() => {
  if (activeUnit.value === "all") {
    return unitTitleMap.all;
  }

  const unitTitle = unitTitleMap[activeUnit.value] || unitTitleMap.unit1;
  if (!activeSection.value) {
    return unitTitle;
  }

  const sectionLabel =
    activeSection.value === "secA" ? "Section A" : "Section B";
  return `${unitTitle} · ${sectionLabel}`;
});

// 打开教材选择弹框。
function openTextbookDialog() {
  selectTextbookDialogRef.value?.handleOpen({
    grade: selectedGrade.value,
    semester: selectedSemester.value,
    edition: selectedEdition.value,
  });
}

// 确认教材选择后更新展示文案。
function handleTextbookConfirm(payload) {
  selectedGrade.value = payload.grade;
  selectedSemester.value = payload.semester;
  selectedEdition.value = payload.edition;
}

// 下拉展开/收起时刷新 Electron 可点击热区。
function handleSelectVisibleChange() {
  requestAnimationFrame(() => {
    document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
  });
}

// 处理教材单元树节点点击，同步当前单元与章节。
function handleTreeNodeClick(node) {
  currentNodeKey.value = node.id;

  if (node.nodeType === "all") {
    activeUnit.value = "all";
    activeSection.value = "";
    return;
  }

  if (node.nodeType === "unit") {
    activeUnit.value = node.id;
    activeSection.value = "";
    return;
  }

  if (node.nodeType === "section") {
    activeUnit.value = node.unitId;
    activeSection.value = node.sectionId;
  }
}

// 返回按段落选择弹框所需的上下文。
function getParagraphSelectContext() {
  const item = textbookItems.value.find(
    (entry) => entry.id === selectedItemId.value,
  );

  return {
    contentId: selectedItemId.value,
    title: item?.title || "",
    paragraphs: getTextbookParagraphs(selectedItemId.value),
    selectedIds: [...selectedParagraphIds.value],
  };
}

// 保存按段落选择结果。
function setSelectedParagraphs(payload) {
  selectedParagraphIds.value = [...(payload.selectedIds || [])];
  selectedParagraphs.value = [...(payload.selectedParagraphs || [])];
}

// 返回当前教材 Tab 的提交载荷。
function getSubmitPayload() {
  const item = textbookItems.value.find(
    (entry) => entry.id === selectedItemId.value,
  );

  return {
    tab: "textbook",
    contentId: selectedItemId.value,
    contentTitle: item?.title || "",
    subject: selectedSubject.value,
    textbook: {
      grade: selectedGrade.value,
      semester: selectedSemester.value,
      edition: selectedEdition.value,
      label: textbookLabel.value,
    },
    unit: activeUnit.value,
    section: activeSection.value,
    treeNodeKey: currentNodeKey.value,
    selectedParagraphIds: [...selectedParagraphIds.value],
    selectedParagraphs: [...selectedParagraphs.value],
  };
}

defineExpose({
  getSubmitPayload,
  getParagraphSelectContext,
  setSelectedParagraphs,
});
</script>

<style scoped lang="scss">
.left-filter-panel {
  width: 260px;
  border-right: 1.5px solid var(--ez-n150);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex-shrink: 0;

  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .filter-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--ez-n400);
    }
  }
}

.fake-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--ez-n200);
  border-radius: var(--el-border-radius-base);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--ez-p300);
  }

  .fake-select-label {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    color: var(--ez-n800);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fake-select-arrow {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--ez-n400);
    flex-shrink: 0;
  }
}

.unit-tree {
  margin-top: 4px;
  background: transparent;

  :deep(.el-tree-node__content) {
    height: 40px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ez-n700);
  }

  :deep(.el-tree-node__content:hover) {
    background-color: var(--ez-n50);
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: var(--ez-p50);
    color: var(--ez-p600);
  }

  :deep(.el-tree-node__children .el-tree-node__content) {
    height: 36px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ez-n600);
  }

  :deep(.el-tree-node__children .el-tree-node.is-current > .el-tree-node__content) {
    color: var(--ez-p600);
    font-weight: 700;
  }

  :deep(.el-tree-node__expand-icon) {
    color: var(--ez-n400);
    font-size: 12px;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__expand-icon) {
    color: var(--ez-p600);
  }
}

.center-content-panel {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .content-header-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--ez-n400);
    margin-bottom: 16px;
  }
}

.recitation-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recitation-item {
  display: flex;
  align-items: flex-start;
  padding: 18px 24px;
  border: 1.5px solid var(--ez-n200);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  text-align: left;
  width: 100%;

  &:hover {
    background-color: var(--ez-n50);
  }

  &.active {
    border-color: var(--ez-p500);
    background-color: var(--ez-p50);
  }

  .radio-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ez-n300);
    border-radius: 50%;
    margin-right: 16px;
    margin-top: 2px;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;

    &.checked {
      border-color: var(--ez-p500);
      background-color: var(--ez-p500);

      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .item-body {
    flex: 1;
    min-width: 0;

    .item-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ez-n900);
      margin-bottom: 6px;
    }

    .item-desc {
      font-size: 13px;
      color: var(--ez-n400);
      line-height: 1.4;
    }
  }
}
</style>
