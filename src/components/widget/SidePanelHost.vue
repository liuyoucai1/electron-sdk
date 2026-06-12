<template>
  <button
    v-if="flowStore.viewMode === 'minimized' && widgetStore.activeWidget"
    class="minimized-trigger"
    data-overlay-hitbox="true"
    type="button"
    @click="handleRestore"
  >
    {{ widgetStore.activeWidget.title }}
  </button>

  <WidgetShell
    v-else-if="flowStore.viewMode === 'sidePanel' && currentWidget"
    :widget="widgetStore.activeWidget"
    variant="side-panel"
    @close="handleClose"
    @minimize="handleMinimize"
    @fullscreen="handleFullscreen"
  >
    <component :is="currentWidget" v-bind="widgetStore.activeWidget.props" />
  </WidgetShell>
</template>

<script setup>
import { computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useFlowStore } from "../../stores/flow";
import { useWidgetStore } from "../../stores/widget";
import WidgetShell from "./WidgetShell.vue";
import { widgetRegistry } from "./widgetRegistry";

const router = useRouter();
const flowStore = useFlowStore();
const widgetStore = useWidgetStore();

const currentWidget = computed(() => {
  const type = widgetStore.activeWidget?.type;
  return type ? widgetRegistry[type] : undefined;
});

// 侧屏关闭会断开整条业务链路。
async function handleClose() {
  const target = flowStore.resetFlow();
  widgetStore.closeWidget();
  await router.replace(target.route);
  await nextTick();
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

// 侧屏最小化，只保留屏幕右侧激活按钮。
function handleMinimize() {
  flowStore.minimizeWidget();
  widgetStore.minimizeWidget();
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

// 侧屏重新进入全屏路由。
async function handleFullscreen() {
  const target = flowStore.expandWidgetToFullscreen();
  if (!target?.route) {
    return;
  }

  widgetStore.closeWidget();
  await router.push(target.route);
}

// 从最小化按钮恢复侧屏。
function handleRestore() {
  flowStore.restoreWidget();
  widgetStore.restoreWidget();
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}
</script>

<style scoped lang="scss">
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
