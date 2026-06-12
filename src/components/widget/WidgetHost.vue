<template>
  <section
    v-if="flowStore.viewMode === 'small-page' && currentSmallPage"
    class="small-page-host"
    data-overlay-hitbox="true"
    :style="smallPageStyle"
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
import { computed, nextTick } from 'vue';
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

  return {
    width: `${page.width}px`,
    minHeight: `${page.height}px`
  };
});

// 接收业务页面事件，并交给流程 store 决定下一步。
function handleFlowAction(payload) {
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
    router.push(target.route);
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

// 从最小化按钮恢复缩屏。
function handleRestore() {
  flowStore.restoreWidget();
  widgetStore.restoreWidget();
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}
</script>

<style scoped lang="scss">
.small-page-host {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2147483646;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: var(--ez-shadow-4);
  transform: translate(-50%, -50%);
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
