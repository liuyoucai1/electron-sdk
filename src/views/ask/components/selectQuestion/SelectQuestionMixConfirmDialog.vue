<template>
  <el-dialog
    v-model="visible"
    width="420px"
    align-center
    :append-to-body="true"
    :close-on-click-modal="false"
    :show-close="false"
    class="select-question-mix-dialog"
    modal-class="select-question-mix-dialog-overlay"
    @opened="markOverlayHitbox"
    @closed="notifyOverlayChange"
  >
    <div class="dialog-body">
      <h3 class="title">无法同时选择</h3>
      <p class="message">
        主观题与客观题不可同时进行提问。若确定选中当前题目，已选的其他题目将被取消，且主观题只能单选。
      </p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-cancel" type="button" @click="handleCancel">取消</button>
        <button class="btn btn-confirm" type="button" @click="handleConfirm">确定</button>
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
      .querySelectorAll('.select-question-mix-dialog-overlay, .select-question-mix-dialog')
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

// 打开确认弹框并返回用户是否确认切换选题模式。
function handleOpen() {
  visible.value = true;

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

// 用户确认切换为主观/客观单类选题。
function handleConfirm() {
  visible.value = false;
  confirmResolver?.(true);
  confirmResolver = null;
}

// 用户取消切换，保持原选题不变。
function handleCancel() {
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
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 800;
    color: var(--ez-n900);
  }

  .message {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: var(--ez-n600);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  min-width: 88px;
  height: 40px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &-cancel {
    border: 1px solid var(--ez-n300);
    background: #ffffff;
    color: var(--ez-n600);
  }

  &-confirm {
    border: none;
    background: var(--ez-p500);
    color: #ffffff;

    &:hover {
      background: var(--ez-p600);
    }
  }
}
</style>

<style lang="scss">
.select-question-mix-dialog-overlay {
  z-index: 2147483648 !important;
  background-color: rgba(17, 20, 24, 0.32);
}

.select-question-mix-dialog {
  z-index: 2147483649 !important;
  border-radius: 16px;
  padding: 8px 8px 4px;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 20px 24px 8px;
  }

  .el-dialog__footer {
    padding: 8px 24px 20px;
  }
}
</style>
