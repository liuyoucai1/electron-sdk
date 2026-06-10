<template>
  <main
    class="overlay-root"
    :class="{
      'is-fullscreen-page': isFullscreenRoute,
    }"
  >
    <ClassroomLauncher v-if="!classStarted" @start="handleStartClass" />

    <template v-else>
      <FloatingBall v-if="!isFullscreenRoute" @dismiss="handleDismissClass" />
      <RouterView />
    </template>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ClassroomLauncher from './components/ClassroomLauncher.vue';
import FloatingBall from './components/FloatingBall.vue';

const route = useRoute();
const classStarted = ref(false);
const classSession = ref();
const isFullscreenRoute = computed(() => Boolean(route.meta.fullscreen));
let updateTimer;
let updateFrame;

// 收集当前可交互区域，交给 Electron 透明窗口命中测试使用。
function collectInteractiveRegions() {
  if (isFullscreenRoute.value && classStarted.value) {
    return [];
  }

  return Array.from(document.querySelectorAll('[data-overlay-hitbox="true"]'))
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
  updateTimer = window.setInterval(scheduleInteractiveRegionUpdate, 120);
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
