<template>
  <el-dialog
    v-model="visible"
    width="45%"
    align-center
    :append-to-body="true"
    :show-close="false"
    :close-on-click-modal="false"
    class="paragraph-selection-dialog"
    modal-class="paragraph-selection-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="title">按段落选择 - {{ contentTitle }}</h2>
      </div>
    </template>

    <div class="dialog-body">
      <section class="preview-panel">
        <h3 class="panel-title">
          <span class="icon-doc" aria-hidden="true">📋</span>
          选中段落预览
        </h3>
        <div class="preview-content">
          <template v-if="selectedParagraphsText.length > 0">
            <p
              v-for="(text, index) in selectedParagraphsText"
              :key="index"
            >
              {{ text }}
            </p>
          </template>
          <p v-else class="empty-tip">请在右侧选择需要{{ modeLabel }}的段落</p>
        </div>
      </section>

      <section class="list-panel">
        <h3 class="panel-title">段落列表</h3>
        <el-scrollbar class="paragraph-scroll">
          <div class="paragraph-list">
            <button
              v-for="item in paragraphs"
              :key="item.id"
              type="button"
              class="paragraph-item"
              :class="{ active: selectedIds.includes(item.id) }"
              @click="toggleSelect(item.id)"
            >
              <span
                class="custom-checkbox"
                :class="{ checked: selectedIds.includes(item.id) }"
                aria-hidden="true"
              ></span>
              <div class="paragraph-info">
                <div class="paragraph-num">{{ item.label }}</div>
                <div class="paragraph-text">{{ item.content }}</div>
              </div>
            </button>
          </div>
        </el-scrollbar>
      </section>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          已选:
          <span class="highlight-count">{{ selectedIds.length }}</span>
          段
        </div>
        <div class="footer-right">
          <button class="btn btn-primary" type="button" @click="handleConfirm">
            确定选择并{{ modeLabel }}
          </button>
          <button class="btn btn-outline" type="button" @click="handleBack">
            <span class="icon-back" aria-hidden="true">↩</span>
            返回
          </button>
          <button class="btn btn-close-icon" type="button" @click="handleClose">
            ✕
          </button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";

const emit = defineEmits(["confirm", "back"]);

const visible = ref(false);
const contentTitle = ref("");
const modeLabel = ref("背诵");
const paragraphs = ref([]);
const selectedIds = ref([]);

const selectedParagraphsText = computed(() =>
  paragraphs.value
    .filter((item) => selectedIds.value.includes(item.id))
    .map((item) => item.content),
);

// 为 Electron 透明窗口标记弹层热区。
function markOverlayHitbox() {
  nextTick(() => {
    document
      .querySelectorAll(
        ".paragraph-selection-dialog-overlay, .paragraph-selection-dialog",
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

// 切换段落选中态（多选）。
function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id);
  if (index >= 0) {
    selectedIds.value.splice(index, 1);
    return;
  }
  selectedIds.value.push(id);
}

// 打开弹框并载入分段数据；由父级通过 ref 调用。
function handleOpen(params = {}) {
  contentTitle.value = params.title || "";
  modeLabel.value = params.modeLabel || "背诵";
  paragraphs.value = Array.isArray(params.paragraphs)
    ? params.paragraphs.map((item) => ({ ...item }))
    : [];
  selectedIds.value = Array.isArray(params.selectedIds)
    ? [...params.selectedIds]
    : [];
  visible.value = true;
}

// 确认所选段落并回传父组件。
function handleConfirm() {
  const selectedParagraphs = paragraphs.value.filter((item) =>
    selectedIds.value.includes(item.id),
  );

  emit("confirm", {
    contentTitle: contentTitle.value,
    selectedIds: [...selectedIds.value],
    selectedParagraphs,
  });
  visible.value = false;
}

// 返回上一层（关闭弹框）。
function handleBack() {
  emit("back");
  visible.value = false;
}

// 关闭弹框。
function handleClose() {
  visible.value = false;
}

defineExpose({
  handleOpen,
});
</script>

<style scoped lang="scss">
.dialog-header {
  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--ez-n900);
  }
}

.dialog-body {
  display: flex;
  gap: 24px;
  height: 480px;
}

.preview-panel {
  flex: 1;
  border: 1.5px dashed var(--ez-n300);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: var(--ez-n50);
  min-width: 0;

  .panel-title {
    margin: 0 0 16px;
    font-size: 15px;
    color: var(--ez-p600);
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .preview-content {
    flex: 1;
    font-size: 16px;
    color: var(--ez-n800);
    line-height: 1.6;
    overflow-y: auto;

    p {
      margin: 0 0 12px;
    }

    .empty-tip {
      color: var(--ez-n400);
      text-align: center;
      margin-top: 40px;
    }
  }
}

.list-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .panel-title {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 700;
    color: var(--ez-n900);
  }
}

.paragraph-scroll {
  flex: 1;
  min-height: 0;
}

.paragraph-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.paragraph-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--ez-n200);
  border-radius: 12px;
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

  .custom-checkbox {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--ez-n300);
    border-radius: 4px;
    margin-right: 12px;
    margin-top: 2px;
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;

    &.checked {
      border-color: var(--ez-p500);
      background-color: var(--ez-p500);

      &::after {
        content: "";
        position: absolute;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .paragraph-info {
    flex: 1;
    min-width: 0;

    .paragraph-num {
      font-weight: 700;
      color: var(--ez-n900);
      margin-bottom: 4px;
      font-size: 14px;
    }

    .paragraph-text {
      color: var(--ez-n600);
      font-size: 13px;
      line-height: 1.4;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  .footer-left {
    font-size: 14px;
    color: var(--ez-n600);

    .highlight-count {
      color: var(--ez-p600);
      font-weight: 700;
      font-size: 16px;
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
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  height: 44px;

  &-primary {
    background-color: var(--ez-p500);
    color: #ffffff;

    &:hover {
      background-color: var(--ez-p600);
    }
  }

  &-outline {
    background-color: #ffffff;
    border: 1px solid var(--ez-n200);
    color: var(--ez-n600);
  }

  &-close-icon {
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
    color: #ef4444;
    width: 44px;
    padding: 0;
  }
}
</style>
