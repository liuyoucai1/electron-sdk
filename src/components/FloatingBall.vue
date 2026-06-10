<template>
  <div
    ref="layerRef"
    class="floating-layer"
    :class="{ expanded }"
    :style="ballStyle"
  >
    <div
      ref="actionStackRef"
      class="action-stack"
      :class="{ expanded }"
      :aria-hidden="!expanded"
    >
      <button class="subject-card" data-overlay-hitbox="true" type="button">
        <strong>学科</strong>
        <span>*** ♧</span>
      </button>

      <button
        class="dismiss-card"
        data-overlay-hitbox="true"
        type="button"
        @click="dismissClass"
      >
        <span class="power-icon">⏻</span>
        <strong>下课</strong>
        <small>已连接服务器</small>
      </button>

      <button
        v-for="action in quickActions"
        :key="action.key"
        class="menu-ball"
        :class="`is-${action.tone}`"
        data-overlay-hitbox="true"
        type="button"
      >
        {{ action.label }}
      </button>
    </div>

    <button
      class="main-ball"
      :class="{ dragging }"
      data-overlay-hitbox="true"
      type="button"
      aria-label="打开悬浮菜单"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <strong>EZ</strong>
      <span>Quiz</span>
    </button>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

const VIEWPORT_MARGIN = 12;
const emit = defineEmits(["dismiss"]);

const layerRef = ref();
const actionStackRef = ref();
const expanded = ref(false);
const dragging = ref(false);
const position = reactive({
  x: window.innerWidth - 112,
  y: window.innerHeight - 130,
});

const quickActions = [
  { key: "ask", label: "问", tone: "soft" },
  { key: "test", label: "测", tone: "soft" },
  { key: "analysis", label: "析", tone: "soft" },
];

let dragStart = {
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0,
  moved: false,
};

const ballStyle = computed(() => ({
  transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
}));

// 计算悬浮球在当前展开状态下需要保持可见的完整边界。
function getVisibleBounds() {
  const layerWidth = layerRef.value?.offsetWidth || 96;
  const layerHeight = layerRef.value?.offsetHeight || 96;
  const bounds = {
    left: 0,
    top: 0,
    right: layerWidth,
    bottom: layerHeight,
  };

  if (!expanded.value || !actionStackRef.value) {
    return bounds;
  }

  const stackRect = actionStackRef.value.getBoundingClientRect();
  const stackStyle = window.getComputedStyle(actionStackRef.value);
  const stackBottom = Number.parseFloat(stackStyle.bottom) || 0;
  const stackLeft = layerWidth / 2 - stackRect.width / 2;
  const stackTop = layerHeight - stackBottom - stackRect.height;

  bounds.left = Math.min(bounds.left, stackLeft);
  bounds.top = Math.min(bounds.top, stackTop);
  bounds.right = Math.max(bounds.right, stackLeft + stackRect.width);
  bounds.bottom = Math.max(bounds.bottom, stackTop + stackRect.height);

  return bounds;
}

// 将悬浮球位置限制在窗口内，展开时同时限制上方菜单不越界。
function clampPosition() {
  const bounds = getVisibleBounds();
  const minX = VIEWPORT_MARGIN - bounds.left;
  const maxX = window.innerWidth - VIEWPORT_MARGIN - bounds.right;
  const minY = VIEWPORT_MARGIN - bounds.top;
  const maxY = window.innerHeight - VIEWPORT_MARGIN - bounds.bottom;

  position.x = Math.min(Math.max(position.x, minX), Math.max(minX, maxX));
  position.y = Math.min(Math.max(position.y, minY), Math.max(minY, maxY));
}

// 通知根组件刷新 Electron 透明窗口的可交互区域。
function notifyHitboxChanged() {
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

// 同步位置边界和可交互区域。
function syncPositionAndHitbox() {
  clampPosition();
  notifyHitboxChanged();
}

// 触发下课事件，交给根组件回到课堂启动页。
function dismissClass() {
  expanded.value = false;
  emit("dismiss");
  nextTick(notifyHitboxChanged);
}

// 记录拖拽起点并捕获当前指针。
function onPointerDown(event) {
  dragging.value = true;
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x: position.x,
    y: position.y,
    moved: false,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
}

// 根据指针偏移更新悬浮球位置，移动超过阈值后不触发点击展开。
function onPointerMove(event) {
  if (!dragging.value) {
    return;
  }

  const deltaX = event.clientX - dragStart.pointerX;
  const deltaY = event.clientY - dragStart.pointerY;
  dragStart.moved =
    dragStart.moved || Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;
  position.x = dragStart.x + deltaX;
  position.y = dragStart.y + deltaY;
  syncPositionAndHitbox();
}

// 结束拖拽；如果没有发生有效移动，则切换展开状态。
function onPointerUp(event) {
  if (!dragging.value) {
    return;
  }

  dragging.value = false;
  event.currentTarget.releasePointerCapture(event.pointerId);

  if (!dragStart.moved) {
    expanded.value = !expanded.value;
  }
}

// 窗口尺寸变化时重新限制悬浮球位置。
function onResize() {
  syncPositionAndHitbox();
}

watch(expanded, () => nextTick(syncPositionAndHitbox));

onMounted(() => {
  window.addEventListener("resize", onResize);
  syncPositionAndHitbox();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped lang="scss">
.floating-layer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483647;
  width: 96px;
  height: 96px;
  pointer-events: auto;
  user-select: none;
}

.main-ball {
  position: absolute;
  left: 0;
  bottom: 0;
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  place-items: center;
  width: 90px;
  height: 90px;
  border-radius: 999px;
  background: var(--ez-p500);
  color: #ffffff;
  font-weight: 800;
  line-height: 1;
  box-shadow: var(--ez-shadow-3);
  transition:
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    background: var(--ez-p600);
    transform: translateY(-1px);
  }

  &.dragging {
    cursor: grabbing;
    transform: scale(0.98);
  }

  strong {
    font-size: 20px;
    letter-spacing: 0;
  }

  span {
    margin-top: 4px;
    font-size: 15px;
    letter-spacing: 0;
  }
}

.action-stack {
  position: absolute;
  left: 50%;
  bottom: 108px;
  display: grid;
  justify-items: center;
  gap: 16px;
  width: 116px;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 18px) scale(0.96);
  transform-origin: bottom center;
  transition:
    opacity 160ms ease,
    transform 180ms ease;

  &.expanded {
    pointer-events: auto;
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

.subject-card,
.dismiss-card {
  width: 112px;
  min-height: 62px;
  border-radius: 14px;
  box-shadow: var(--ez-shadow-2);
}

.subject-card {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 5px;
  background: var(--ez-p100);
  color: #ffffff;

  strong {
    font-size: 19px;
    letter-spacing: 0;
  }

  span {
    color: rgba(255, 255, 255, 0.86);
    font-size: 13px;
    letter-spacing: 2px;
  }
}

.dismiss-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  border: 2px solid var(--ez-error);
  background: #ffffff;
  color: var(--ez-error);
  padding: 9px 12px 8px;
  text-align: left;

  strong {
    font-size: 22px;
    line-height: 1.05;
  }

  small {
    grid-column: 1 / -1;
    justify-self: center;
    margin-top: 6px;
    color: var(--ez-p600);
    font-size: 12px;
  }
}

.power-icon {
  grid-row: span 2;
  width: 24px;
  color: var(--ez-error);
  font-size: 25px;
  line-height: 1;
}

.menu-ball {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  color: var(--ez-p500);
  font-size: 32px;
  font-weight: 900;
  box-shadow: var(--ez-shadow-2);

  &.is-primary {
    background: var(--ez-p500);
    color: #ffffff;
  }

  &.is-soft {
    background: var(--ez-p50);
  }
}

.floating-layer:not(.expanded) .action-stack {
  pointer-events: none;
}

@media (max-height: 760px) {
  .action-stack {
    bottom: 96px;
    gap: 10px;
    transform: translate(-50%, 18px) scale(0.82);

    &.expanded {
      transform: translate(-50%, 0) scale(0.82);
    }
  }
}
</style>
