<template>
  <el-dialog
    v-model="visible"
    width="28%"
    align-center
    :append-to-body="true"
    :close-on-click-modal="false"
    :show-close="false"
    class="answer-progress-cancel-dialog"
    modal-class="answer-progress-cancel-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <div class="dialog-body">
      <h3 class="title">是否取消答题？</h3>
      <p class="message">
        取消后不会生成答题报表，本次答题数据将不会保存。
      </p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-continue" type="button" @click="handleContinue">
          否，继续答题
        </button>
        <button class="btn btn-cancel" type="button" @click="handleCancel">
          是，取消答题
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, ref } from 'vue';

const visible = ref(false);
let confirmResolver = null;

// 为 Electron 透明窗口标记弹层热区。
function markOverlayHitbox() {
  nextTick(() => {
    document
      .querySelectorAll(
        '.answer-progress-cancel-dialog-overlay, .answer-progress-cancel-dialog',
      )
      .forEach((element) => {
        element.setAttribute('data-overlay-hitbox', 'true');
      });
    window.electronBridge?.setMousePassthrough(false);
    notifyOverlayChange();
  });
}

// 通知 overlay 宿主刷新可点击热区。
function notifyOverlayChange() {
  nextTick(() => {
    document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
  });
}

// 打开取消答题确认弹框，返回用户是否确认取消。
function handleOpen() {
  visible.value = true;

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

// 用户确认取消答题。
function handleCancel() {
  visible.value = false;
  confirmResolver?.(true);
  confirmResolver = null;
}

// 用户选择继续答题。
function handleContinue() {
  visible.value = false;
  confirmResolver?.(false);
  confirmResolver = null;
}

defineExpose({
  handleOpen,
});
</script>

<style scoped lang="scss">
.dialog-body {
  padding: 8px 4px 4px;

  .title {
    margin: 0 0 16px;
    font-size: 28px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .message {
    margin: 0;
    font-size: 18px;
    line-height: 1.7;
    color: var(--ez-n600);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn {
  min-width: 140px;
  height: 56px;
  padding: 0 24px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.88;
  }

  &-continue {
    border: 1px solid var(--ez-n300);
    background: #ffffff;
    color: var(--ez-n700);
  }

  &-cancel {
    border: none;
    background: #db7373;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(219, 115, 115, 0.2);

    &:hover {
      background: #cf6666;
    }
  }
}
</style>

<style lang="scss">
.answer-progress-cancel-dialog-overlay {
  z-index: 2147483648 !important;
  background-color: rgba(17, 20, 24, 0.32);
}

.answer-progress-cancel-dialog {
  z-index: 2147483649 !important;
  border-radius: 20px;
  padding: 8px 8px 4px;
  box-shadow: var(--ez-shadow-4);

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 32px 40px 12px;
  }

  .el-dialog__footer {
    padding: 12px 40px 32px;
  }
}
</style>
