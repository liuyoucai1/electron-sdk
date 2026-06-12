<template>
  <section
    ref="frameRef"
    class="widget-frame"
    :style="frameStyle"
    data-overlay-hitbox="true"
  >
    <div class="widget-design-canvas" :style="canvasStyle">
      <header class="widget-header" @pointerdown="onPointerDown">
        <strong>{{ widget.title }}</strong>
        <div class="widget-actions" @pointerdown.stop>
          <button
            v-if="variant === 'side-panel'"
            type="button"
            title="全屏"
            @click.stop="$emit('fullscreen')"
          >
            全屏
          </button>
          <button
            v-if="variant === 'side-panel'"
            type="button"
            title="最小化"
            @click.stop="$emit('minimize')"
          >
            最小化
          </button>
          <button type="button" title="关闭" class="is-danger" @click.stop="$emit('close')">
            关闭
          </button>
        </div>
      </header>

      <main class="widget-body">
        <slot />
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useWidgetStore } from '../../stores/widget';

const props = defineProps({
  widget: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'widget'
  }
});

defineEmits(['close', 'minimize', 'fullscreen']);

const widgetStore = useWidgetStore();
const frameRef = ref();
const dragging = ref(false);
let dragStart = {
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0
};

const frameStyle = computed(() => {
  const scale = props.widget.scale || 1;

  return {
    width: `${props.widget.width * scale}px`,
    height: `${props.widget.height * scale}px`,
    transform: `translate3d(${props.widget.x}px, ${props.widget.y}px, 0)`,
    zIndex: props.widget.zIndex
  };
});

const canvasStyle = computed(() => {
  const scale = props.widget.scale || 1;

  return {
    width: `${props.widget.width}px`,
    height: `${props.widget.height}px`,
    transform: `scale(${scale})`
  };
});

// 将小屏位置限制在当前窗口内。
function clampPosition(x, y) {
  const scale = props.widget.scale || 1;
  const width = props.widget.width * scale;
  const height = props.widget.height * scale;
  const maxX = Math.max(12, window.innerWidth - width - 12);
  const maxY = Math.max(12, window.innerHeight - height - 12);

  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY)
  };
}

// 开始拖动小屏。
function onPointerDown(event) {
  dragging.value = true;
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x: props.widget.x,
    y: props.widget.y
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

// 拖动时更新小屏坐标。
function onPointerMove(event) {
  if (!dragging.value) {
    return;
  }

  const nextPosition = clampPosition(
    dragStart.x + event.clientX - dragStart.pointerX,
    dragStart.y + event.clientY - dragStart.pointerY
  );
  widgetStore.moveWidget(nextPosition);
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}

// 结束拖动并释放事件监听。
function onPointerUp() {
  dragging.value = false;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
});
</script>

<style scoped lang="scss">
.widget-frame {
  position: fixed;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: auto;
}

.widget-design-canvas {
  position: relative;
  display: grid;
  grid-template-rows: 64px 1fr;
  overflow: hidden;
  border: 1px solid var(--ez-n200);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: var(--ez-shadow-4);
  transform-origin: top left;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid var(--ez-n150);
  background: var(--ez-n50);
  cursor: grab;

  strong {
    color: var(--ez-n900);
    font-size: 18px;
  }
}

.widget-actions {
  display: flex;
  gap: 8px;

  button {
    height: 38px;
    padding: 0 12px;
    border-radius: 10px;
    background: #ffffff;
    color: var(--ez-p600);
    border: 1px solid var(--ez-p200);
    font-size: 14px;

    &.is-danger {
      color: var(--ez-error);
      border-color: #efc4be;
      background: #fdf2f1;
    }
  }
}

.widget-body {
  min-height: 0;
  background: #ffffff;
}
</style>
