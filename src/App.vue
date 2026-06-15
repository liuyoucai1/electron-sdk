<template>
  <main
    class="overlay-root"
    :class="{
      'is-fullscreen-page': isFullscreenRoute,
    }"
  >
    <ClassroomLauncher v-if="!classStarted" @start="handleStartClass" />

    <template v-else>
      <FloatingBall
        v-if="showFloatingBall"
        @dismiss="handleDismissClass"
        @quick-action="handleQuickAction"
      />
      <WidgetHost />
      <RouterView />
    </template>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ClassroomLauncher from './components/ClassroomLauncher.vue';
import FloatingBall from './components/FloatingBall.vue';
import WidgetHost from './components/widget/WidgetHost.vue';
import { useFlowStore } from './stores/flow';
import { useSmallPageStore } from './stores/smallPage';
import { useWidgetStore } from './stores/widget';

const route = useRoute();
const flowStore = useFlowStore();
const smallPageStore = useSmallPageStore();
const widgetStore = useWidgetStore();
const classStarted = ref(false);
const classSession = ref();
const isFullscreenRoute = computed(() => Boolean(route.meta.fullscreen));
const showFloatingBall = computed(
  () =>
    flowStore.viewMode === 'idle' &&
    !isFullscreenRoute.value &&
    !flowStore.shouldHideFloatingBall &&
    !smallPageStore.shouldHideFloatingBall
);
let updateTimer;
let updateFrame;

// 收集当前可交互区域，交给 Electron 透明窗口命中测试使用。
function collectInteractiveRegionElements() {
  const hitboxNodes = document.querySelectorAll('[data-overlay-hitbox="true"]');
  const popperNodes = document.querySelectorAll(".el-popper");

  return [...hitboxNodes, ...popperNodes];
}

function collectInteractiveRegions() {
  if (isFullscreenRoute.value && classStarted.value) {
    return [];
  }

  return collectInteractiveRegionElements()
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.pointerEvents !== 'none' &&
        Number(style.opacity) > 0.01
      );
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    })
    .filter((rect) => rect.width > 0 && rect.height > 0);
}

// 将最新可交互区域同步给 Electron preload 暴露的桥接方法。
function updateInteractiveRegions() {
  window.electronBridge?.setInteractiveRegions(collectInteractiveRegions());
}

// 合并高频 DOM 变化，下一帧再同步交互区域。
function scheduleInteractiveRegionUpdate() {
  if (updateFrame) {
    cancelAnimationFrame(updateFrame);
  }

  updateFrame = requestAnimationFrame(() => {
    updateFrame = undefined;
    updateInteractiveRegions();
  });
}

// 保存课堂选择结果并进入悬浮球主界面。
function handleStartClass(payload) {
  classSession.value = payload;
  classStarted.value = true;
  nextTick(scheduleInteractiveRegionUpdate);
}

// 结束当前课堂并回到课堂启动页。
function handleDismissClass() {
  classSession.value = undefined;
  classStarted.value = false;
  flowStore.resetFlow();
  smallPageStore.closePage();
  widgetStore.closeWidget();
  nextTick(scheduleInteractiveRegionUpdate);
}

// 处理悬浮球快捷入口，启动对应业务流程；已打开时再次点击则关闭。
function handleQuickAction(actionKey) {
  if (actionKey !== 'ask') {
    return;
  }

  const target = flowStore.startAskFlow();

  // 再次点击"问"时关闭当前普通小屏，回到 idle。
  if (target.viewMode === 'idle') {
    smallPageStore.closePage();
    widgetStore.closeWidget();
    nextTick(scheduleInteractiveRegionUpdate);
    return;
  }

  smallPageStore.openPage(target.pageType, target.props);
  widgetStore.closeWidget();
  nextTick(scheduleInteractiveRegionUpdate);
}

watch(
  isFullscreenRoute,
  (enabled) => {
    window.electronBridge?.setFullscreenPage(enabled);
    window.electronBridge?.setMousePassthrough(!enabled);
    nextTick(scheduleInteractiveRegionUpdate);
  },
  { immediate: true }
);

watch(
  () => route.fullPath,
  () => nextTick(scheduleInteractiveRegionUpdate)
);

watch(classStarted, () => nextTick(scheduleInteractiveRegionUpdate));

onMounted(() => {
  window.addEventListener('resize', scheduleInteractiveRegionUpdate);
  document.addEventListener('overlay-hitboxes-changed', scheduleInteractiveRegionUpdate);
  updateTimer = window.setInterval(scheduleInteractiveRegionUpdate, 500);
  nextTick(scheduleInteractiveRegionUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleInteractiveRegionUpdate);
  document.removeEventListener('overlay-hitboxes-changed', scheduleInteractiveRegionUpdate);
  window.clearInterval(updateTimer);

  if (updateFrame) {
    cancelAnimationFrame(updateFrame);
  }
});
</script>

<style scoped lang="scss"></style>
