<template>
  <section class="read-recite-widget">
    <header class="card-header">
      <h2 class="title">请选择{{ modeLabel }}内容</h2>
    </header>

    <div class="card-body">
      <TextbookRecitePanel
        v-if="currentTab === 'textbook'"
        ref="textbookPanelRef"
      />
      <CustomRecitePanel
        v-else-if="currentTab === 'custom'"
        ref="customPanelRef"
        :mode-label="modeLabel"
      />
      <EssayRecitePanel
        v-else-if="currentTab === 'essay'"
        ref="essayPanelRef"
      />

      <nav class="right-tab-panel">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="tab-nav-item"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <footer class="card-footer">
      <div class="footer-left">
        <span class="standard-label">评分标准</span>
        <el-select
          v-model="scoreStandard"
          size="large"
          style="width: 140px"
          @visible-change="handleSelectVisibleChange"
        >
          <el-option label="标准背诵" value="standard" />
        </el-select>
        <span class="standard-desc">
          通用型英语{{ modeLabel }}检查，背对背全是核心，兼顾发音和流利度，适用所有年级。
        </span>
      </div>
      <div class="footer-right">
        <button
          v-if="currentTab === 'textbook' || currentTab === 'essay'"
          class="btn btn-outline"
          type="button"
          @click="handleParagraphSelect"
        >
          按段落选择
        </button>
        <button class="btn btn-primary" type="button" @click="handleStart">
          开始{{ modeLabel }}
        </button>
        <button class="btn btn-close-icon" type="button" @click="handleCancel">
          ✕
        </button>
      </div>
    </footer>

    <SelectParagraphDialog
      ref="selectParagraphDialogRef"
      @confirm="handleParagraphConfirm"
    />
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import CustomRecitePanel from "../components/CustomRecitePanel.vue";
import EssayRecitePanel from "../components/EssayRecitePanel.vue";
import SelectParagraphDialog from "../components/SelectParagraphDialog.vue";
import TextbookRecitePanel from "../components/TextbookRecitePanel.vue";

const props = defineProps({
  reciteType: {
    type: String,
    default: "recite",
  },
});

const emit = defineEmits(["flow-action"]);

const tabs = [
  { id: "textbook", label: "教材" },
  { id: "custom", label: "临时自编" },
  { id: "essay", label: "满分作文" },
];

const currentTab = ref("textbook");
const scoreStandard = ref("standard");
const textbookPanelRef = ref(null);
const customPanelRef = ref(null);
const essayPanelRef = ref(null);
const selectParagraphDialogRef = ref(null);

const modeLabel = computed(() => (props.reciteType === "read" ? "朗读" : "背诵"));

// 下拉展开/收起时刷新 Electron 可点击热区。
function handleSelectVisibleChange() {
  requestAnimationFrame(() => {
    document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
  });
}

// 获取当前 Tab 对应面板的提交载荷。
function getActivePanelPayload() {
  if (currentTab.value === "textbook") {
    return textbookPanelRef.value?.getSubmitPayload?.();
  }
  if (currentTab.value === "custom") {
    return customPanelRef.value?.getSubmitPayload?.();
  }
  return essayPanelRef.value?.getSubmitPayload?.();
}

// 获取当前 Tab 面板用于按段落选择的上下文。
function getParagraphSelectContext() {
  if (currentTab.value === "textbook") {
    return textbookPanelRef.value?.getParagraphSelectContext?.();
  }
  if (currentTab.value === "essay") {
    return essayPanelRef.value?.getParagraphSelectContext?.();
  }
  return null;
}

// 打开按段落选择弹框。
function handleParagraphSelect() {
  const context = getParagraphSelectContext();
  if (!context?.paragraphs?.length) {
    return;
  }

  selectParagraphDialogRef.value?.handleOpen({
    title: context.title,
    paragraphs: context.paragraphs,
    selectedIds: context.selectedIds,
    modeLabel: modeLabel.value,
  });
}

// 确认段落选择后写回面板并启动背读。
function handleParagraphConfirm(payload) {
  if (currentTab.value === "textbook") {
    textbookPanelRef.value?.setSelectedParagraphs?.(payload);
  } else if (currentTab.value === "essay") {
    essayPanelRef.value?.setSelectedParagraphs?.(payload);
  }

  handleStart();
}

// 收集当前选择并启动背读流程（后续接入检测页）。
function handleStart() {
  const panelPayload = getActivePanelPayload() || {};
  emit("flow-action", {
    action: "start-read-recite",
    reciteType: props.reciteType,
    standard: scoreStandard.value,
    ...panelPayload,
  });
}

// 关闭背读选择小屏。
function handleCancel() {
  emit("flow-action", { action: "close-flow" });
}
</script>

<style scoped lang="scss">
.read-recite-widget {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 710px;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
}

.card-header {
  padding: 20px 32px;
  border-bottom: 1.5px solid var(--ez-n150);
  flex-shrink: 0;

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--ez-n900);
  }
}

.card-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.right-tab-panel {
  width: 100px;
  border-left: 1.5px solid var(--ez-n150);
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-shrink: 0;
}

.tab-nav-item {
  padding: 18px 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ez-n600);
  text-align: center;
  cursor: pointer;
  border: none;
  background: transparent;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: var(--ez-n900);
  }

  &.active {
    color: var(--ez-p600);
    background-color: var(--ez-p50);
    border-left-color: var(--ez-p500);
  }
}

.card-footer {
  padding: 20px 32px;
  background-color: #ffffff;
  border-top: 1.5px solid var(--ez-n150);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .standard-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--ez-n600);
      flex-shrink: 0;
    }

    .standard-desc {
      font-size: 13px;
      color: var(--ez-n400);
      border-left: 1.5px solid var(--ez-n200);
      padding-left: 12px;
      margin-left: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  height: 44px;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }

  &-primary {
    background-color: var(--ez-p500);
    color: #ffffff;

    &:hover {
      background-color: var(--ez-p600);
    }
  }

  &-outline {
    background-color: #ffffff;
    border: 1.5px solid var(--ez-p500);
    color: var(--ez-p600);

    &:hover {
      background-color: var(--ez-p50);
    }
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1.5px solid #fee2e2;
    color: #f87171;
    width: 44px;
    padding: 0;
  }
}
</style>
