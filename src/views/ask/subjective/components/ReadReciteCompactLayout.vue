<template>
  <section class="read-recite-compact-layout">
    <header class="compact-header" @pointerdown="onHeaderPointerDown">
      <slot name="header" />
    </header>

    <main class="compact-body">
      <slot />
    </main>

    <footer class="compact-footer">
      <div class="footer-window-actions">
        <button
          type="button"
          class="btn btn-outline"
          @click="$emit('fullscreen')"
        >
          <svg viewBox="0 0 1024 1024" width="14" height="14" aria-hidden="true">
            <path
              d="M256 256h192v64H320v128h-64V256zm512 0v192h-64V320H576v-64h192zM256 768v-192h64v128h128v64H256zm512 0H576v-64h128V576h64v192z"
              fill="currentColor"
            />
          </svg>
          全屏
        </button>
        <button type="button" class="btn btn-icon" @click="$emit('minimize')">
          —
        </button>
        <button type="button" class="btn btn-close" @click="$emit('close')">
          ✕
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { inject } from "vue";

defineEmits(["fullscreen", "minimize", "close"]);

const widgetDragStart = inject("widgetDragStart", null);

// 将头部区域指针事件交给 WidgetShell 处理拖动。
function onHeaderPointerDown(event) {
  if (typeof widgetDragStart === "function") {
    widgetDragStart(event);
  }
}
</script>

<style scoped lang="scss">
.read-recite-compact-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ffffff;
}

.compact-header {
  flex-shrink: 0;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--ez-n150);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.compact-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 18px;
}

.compact-footer {
  flex-shrink: 0;
  padding: 14px 18px 18px;
  border-top: 1px solid var(--ez-n150);
  background: #ffffff;
}

.footer-window-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-outline {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid var(--ez-n200);
  color: var(--ez-n700);
  font-size: 13px;
  font-weight: 600;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid var(--ez-n200);
  color: var(--ez-n600);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
}
</style>
