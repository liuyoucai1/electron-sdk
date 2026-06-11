<template>
  <el-dialog
    v-model="visible"
    width="900px"
    align-center
    :show-close="false"
    class="paragraph-selection-dialog"
  >
    <!-- 自定义头部 -->
    <template #header>
      <div class="dialog-header">
        <span class="title">按段落选择 - Section A 1b and 1c</span>
      </div>
    </template>

    <!-- 主体内容 -->
    <div class="dialog-body">
      <!-- 左侧预览 -->
      <div class="preview-panel">
        <div class="panel-title">
          <span class="icon-doc">📋</span> 选中段落预览
        </div>
        <div class="preview-content">
          <div v-if="selectedParagraphsText.length > 0">
            <p v-for="(text, index) in selectedParagraphsText" :key="index">
              {{ text }}
            </p>
          </div>
          <div v-else class="empty-tip">请在右侧选择需要背诵的段落</div>
        </div>
      </div>

      <!-- 右侧列表 -->
      <div class="list-panel">
        <div class="panel-title">段落列表</div>
        <div class="paragraph-list">
          <div
            v-for="item in paragraphs"
            :key="item.id"
            class="paragraph-item"
            :class="{ active: selectedIds.includes(item.id) }"
            @click="toggleSelect(item.id)"
          >
            <div class="checkbox-wrapper">
              <span
                class="custom-checkbox"
                :class="{ checked: selectedIds.includes(item.id) }"
              ></span>
            </div>
            <div class="paragraph-info">
              <div class="paragraph-num">{{ item.label }}</div>
              <div class="paragraph-text">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          已选: <span class="highlight-count">{{ selectedIds.length }}</span> 段
        </div>
        <div class="footer-right">
          <button class="btn btn-primary" @click="handleConfirm">
            确定选择并背诵
          </button>
          <button class="btn btn-outline" @click="handleBack">
            <span class="icon-back">↩</span> 返回
          </button>
          <button class="btn btn-close-icon" @click="handleClose">✕</button>
        </div>
      </div>
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

const emit = defineEmits(["update:modelValue", "confirm", "back"]);

// 弹窗可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 模拟数据
const paragraphs = ref([
  { id: 1, label: "第1段", content: "Conversation 1" },
  { id: 2, label: "第2段", content: "Hi, Yaming. How was your vacation?" },
  {
    id: 3,
    label: "第3段",
    content: "Hi, Emma. It was great, I went to Mount Huangshan.",
  },
]);

// 默认勾选第二段（对应截图）
const selectedIds = ref([2]);

// 切换选择
const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

// 实时预览选中内容
const selectedParagraphsText = computed(() => {
  return paragraphs.value
    .filter((p) => selectedIds.value.includes(p.id))
    .map((p) => p.content);
});

// 确定
const handleConfirm = () => {
  console.log("确定选择段落并背诵:", selectedIds.value);
  emit("confirm", selectedIds.value);
  visible.value = false;
};

// 返回
const handleBack = () => {
  console.log("点击返回");
  emit("back");
};

// 直接关闭
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
.paragraph-selection-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 24px 24px 12px;
    margin: 0;
    border-bottom: 1px solid #f1f5f9;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    background-color: #fbfcfd;
    border-top: 1px solid #f1f5f9;
  }
}

.dialog-header {
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #1e293b;
  }
}

.dialog-body {
  display: flex;
  gap: 24px;
  height: 480px;
}

.preview-panel {
  flex: 1;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: #fafbfb;

  .panel-title {
    font-size: 15px;
    color: #0d9488;
    font-weight: bold;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .preview-content {
    flex: 1;
    font-size: 16px;
    color: #334155;
    line-height: 1.6;
    overflow-y: auto;

    p {
      margin: 0 0 12px 0;
    }

    .empty-tip {
      color: #94a3b8;
      text-align: center;
      margin-top: 40px;
    }
  }
}

.list-panel {
  width: 380px;
  display: flex;
  flex-direction: column;

  .panel-title {
    font-size: 16px;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 12px;
  }

  .paragraph-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.paragraph-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  &.active {
    border-color: #529b85;
    background-color: #f0f7f5;
  }

  .checkbox-wrapper {
    margin-right: 12px;
    margin-top: 2px;
  }

  .custom-checkbox {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s;

    &.checked {
      border-color: #529b85;
      background-color: #529b85;

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

    .paragraph-num {
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .paragraph-text {
      color: #64748b;
      font-size: 13px;
      line-height: 1.4;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .footer-left {
    font-size: 14px;
    color: #64748b;

    .highlight-count {
      color: #529b85;
      font-weight: bold;
      font-size: 16px;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
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
  font-weight: bold;
  height: 44px;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.9;
  }

  &-primary {
    background-color: #529b85;
    color: white;
  }

  &-outline {
    background-color: white;
    border: 1px solid #e2e8f0;
    color: #64748b;
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
