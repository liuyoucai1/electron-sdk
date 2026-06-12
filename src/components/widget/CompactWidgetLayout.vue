<template>
  <section class="compact-widget-layout">
    <header
      v-if="showHeader"
      class="compact-header"
      @pointerdown="onHeaderPointerDown"
    >
      <slot name="header">
        <div class="header-default">
          <div v-if="showLogo" class="logo-badge">问</div>
          <div class="header-text">
            <h2 class="title">{{ title }}</h2>
            <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
          </div>
        </div>
      </slot>
    </header>

    <main class="compact-body">
      <slot />
    </main>

    <footer class="compact-footer">
      <div v-if="$slots.actions" class="footer-slot-actions">
        <slot name="actions" />
      </div>

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
        <button
          v-if="showBack"
          type="button"
          class="btn btn-outline"
          @click="$emit('back')"
        >
          <svg viewBox="0 0 1024 1024" width="14" height="14" aria-hidden="true">
            <path
              d="M494.933 243.2a32 32 0 0 1 45.245 45.245L356.565 469.333H800a32 32 0 0 1 0 64H356.565l183.616 180.885a32 32 0 1 1-45.245 45.245l-237.44-233.9a32 32 0 0 1 0-45.245l237.437-237.12z"
              fill="currentColor"
            />
          </svg>
          返回
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

defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  showBack: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["fullscreen", "minimize", "close", "back"]);

const widgetDragStart = inject("widgetDragStart", null);

// 将头部区域指针事件交给 WidgetShell 处理拖动。
function onHeaderPointerDown(event) {
  if (typeof widgetDragStart === "function") {
    widgetDragStart(event);
  }
}
</script>

<style scoped lang="scss">
.compact-widget-layout {
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

.header-default {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ez-p500);
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.header-text {
  min-width: 0;

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--ez-n900);
    line-height: 1.3;
  }

  .subtitle {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--ez-n100);
    color: var(--ez-n500);
    font-size: 11px;
    font-weight: 700;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 18px 18px;
  border-top: 1px solid var(--ez-n150);
  background: #ffffff;
}

.footer-slot-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  :deep(.btn-primary) {
    width: 100%;
    height: 48px;
    border-radius: 14px;
    background: var(--ez-p500);
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    transition: background-color 0.16s ease;

    &:hover {
      background: var(--ez-p600);
    }

    &:active {
      background: var(--ez-p700);
    }
  }
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
