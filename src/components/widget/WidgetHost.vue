<template>
  <section
    v-if="flowStore.viewMode === 'small-page' && currentSmallPage"
    class="small-page-host"
    :class="{ 'is-draggable': isDraggablePage }"
    data-overlay-hitbox="true"
    :style="smallPageStyle"
    @pointerdown="onSmallPagePointerDown"
  >
    <component
      :is="currentSmallPage"
      v-bind="smallPageStore.activePage.props"
      @flow-action="handleFlowAction"
    />
  </section>

  <button
    v-else-if="flowStore.viewMode === 'minimized' && widgetStore.activeWidget"
    class="minimized-trigger"
    data-overlay-hitbox="true"
    type="button"
    @click="handleRestore"
  >
    {{ widgetStore.activeWidget.title }}
  </button>

  <WidgetShell
    v-else-if="flowStore.viewMode === 'compact' && currentWidget"
    :widget="widgetStore.activeWidget"
    variant="compact"
    @close="handleClose"
    @minimize="handleMinimize"
    @fullscreen="handleFullscreen"
  >
    <component
      :is="currentWidget"
      v-bind="widgetStore.activeWidget.props"
      @flow-action="handleFlowAction"
    />
  </WidgetShell>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFlowStore } from '../../stores/flow';
import { useSmallPageStore } from '../../stores/smallPage';
import { useWidgetStore } from '../../stores/widget';
import WidgetShell from './WidgetShell.vue';
import { widgetRegistry } from './widgetRegistry';

const router = useRouter();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();

// 窗口尺寸变化时触发小屏位置重新计算（window.innerWidth 非响应式）。
const resizeTick = ref(0);

function onWindowResize() {
  resizeTick.value += 1;
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
});

// 当前小屏是否可拖拽。
const isDraggablePage = computed(() => {
  return smallPageStore.activePage?.position === 'draggable';
});

// 拖拽状态。
const dragging = ref(false);
let dragStart = { pointerX: 0, pointerY: 0, pageX: 0, pageY: 0 };

// 仅当指针落在 data-drag-handle 区域内时允许拖拽。
function onSmallPagePointerDown(event) {
  if (!isDraggablePage.value) return;

  const handle = event.target.closest('[data-drag-handle]');
  if (!handle) return;

  const page = smallPageStore.activePage;
  if (!page) return;

  dragging.value = true;
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    pageX: page.dragX,
    pageY: page.dragY
  };
  event.currentTarget.setPointerCapture(event.pointerId);
}

// 拖拽移动，更新小屏位置并限制在视口内。
function onDragMove(event) {
  if (!dragging.value) return;

  const page = smallPageStore.activePage;
  if (!page) return;

  const deltaX = event.clientX - dragStart.pointerX;
  const deltaY = event.clientY - dragStart.pointerY;

  let newX = dragStart.pageX + deltaX;
  let newY = dragStart.pageY + deltaY;

  // 限制在视口内，保留 12px 边距。
  const MARGIN = 12;
  newX = Math.max(MARGIN, Math.min(newX, window.innerWidth - page.width - MARGIN));
  newY = Math.max(MARGIN, Math.min(newY, window.innerHeight - page.height - MARGIN));

  smallPageStore.updateDragPosition(newX, newY);
}

// 结束拖拽。
function onDragEnd(event) {
  if (!dragging.value) return;
  dragging.value = false;
  event.currentTarget?.releasePointerCapture?.(event.pointerId);
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}

const currentSmallPage = computed(() => {
  const type = smallPageStore.activePage?.type;
  return type ? widgetRegistry[type] : undefined;
});

const currentWidget = computed(() => {
  const type = widgetStore.activeWidget?.type;
  return type ? widgetRegistry[type] : undefined;
});

const smallPageStyle = computed(() => {
  const page = smallPageStore.activePage;

  if (!page) {
    return {};
  }

  // 消费 resizeTick 使 computed 在窗口尺寸变化时重新求值。
  void resizeTick.value;

  const pageWidth = page.width;
  const pageHeight = page.height;

  // draggable：使用 store 中记录的拖拽位置。
  if (page.position === 'draggable') {
    return {
      width: `${pageWidth}px`,
      height: `${pageHeight}px`,
      left: `${page.dragX}px`,
      top: `${page.dragY}px`
    };
  }

  // 默认（center 或未指定）：屏幕居中。
  if (page.position !== 'follow-ball') {
    return {
      width: `${pageWidth}px`,
      minHeight: `${pageHeight}px`,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  // follow-ball：紧贴胶囊左侧或右侧。
  const ball = smallPageStore.ballPosition;
  const BALL_RADIUS = 45;
  const GAP = 16;
  const VIEWPORT_MARGIN = 12;

  const rightEdge = ball.x + BALL_RADIUS + GAP;
  const fitsRight = rightEdge + pageWidth + VIEWPORT_MARGIN <= window.innerWidth;

  const leftEdge = ball.x - BALL_RADIUS - GAP;
  const fitsLeft = leftEdge - pageWidth - VIEWPORT_MARGIN >= 0;

  let left;
  if (fitsRight || !fitsLeft) {
    left = rightEdge;
  } else {
    left = leftEdge - pageWidth;
  }

  let top = ball.y - pageHeight / 2;
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, window.innerHeight - pageHeight - VIEWPORT_MARGIN));

  return {
    width: `${pageWidth}px`,
    minHeight: `${pageHeight}px`,
    left: `${left}px`,
    top: `${top}px`
  };
});

// 接收业务页面事件，并交给流程 store 决定下一步。
function handleFlowAction(payload) {
  // 小屏内部收起/展开 → 调整小屏高度，不改变业务状态。
  if (payload.action === 'collapse-small-page') {
    smallPageStore.updateHeight(payload.collapsedHeight || 80);
    return;
  }

  if (payload.action === 'expand-small-page') {
    smallPageStore.updateHeight(payload.expandedHeight || 300);
    return;
  }

  const target = flowStore.handleAskWidgetAction(payload);
  if (!target) {
    return;
  }

  if (target.viewMode === 'idle') {
    smallPageStore.closePage();
    widgetStore.closeWidget();
    router.replace(target.route);
    nextTick(() => {
      document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
    });
    return;
  }

  if (target.displayMode === 'fullscreen' && target.route) {
    smallPageStore.closePage();
    widgetStore.closeWidget();
    router.push({ path: target.route, query: target.query || {} });
    nextTick(() => {
      document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
    });
    return;
  }

  if (target.displayMode === 'small-page' && target.pageType) {
    widgetStore.closeWidget();
    smallPageStore.openPage(target.pageType, target.props);
  }

  if (target.displayMode === 'compact' && target.widgetType) {
    smallPageStore.closePage();
    widgetStore.openWidget(target.widgetType, target.props);
  }

  nextTick(() => {
    document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
  });
}

// 缩屏关闭会断开整条业务链路。
async function handleClose() {
  const target = flowStore.resetFlow();
  smallPageStore.closePage();
  widgetStore.closeWidget();
  await router.replace(target.route);
  await nextTick();
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}

// 缩屏最小化，只保留屏幕右侧激活按钮。
function handleMinimize() {
  flowStore.minimizeWidget();
  widgetStore.minimizeWidget();
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}

// 缩屏重新进入全屏路由。
async function handleFullscreen() {
  const target = flowStore.expandWidgetToFullscreen();

  if (!target?.route) {
    return;
  }

  widgetStore.closeWidget();
  await router.push(target.route);
}

// 从最小化按钮恢复。
async function handleRestore() {
  const target = flowStore.restoreWidget();

  // 如果是从全屏最小化恢复 → 导航回全屏路由。
  if (target.route) {
    widgetStore.closeWidget();
    await router.push(target.route);
    return;
  }

  // 默认：从缩屏最小化恢复 → 回到 compact。
  widgetStore.restoreWidget();
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}
</script>

<style scoped lang="scss">
.small-page-host {
  position: fixed;
  z-index: 2147483646;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: var(--ez-shadow-4);
  pointer-events: auto;
}

.minimized-trigger {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 2147483646;
  width: 56px;
  min-height: 176px;
  padding: 16px 10px;
  border-radius: 18px 0 0 18px;
  background: var(--ez-p500);
  color: #ffffff;
  box-shadow: var(--ez-shadow-3);
  writing-mode: vertical-rl;
  letter-spacing: 0;
  transform: translateY(-50%);
}
</style>
