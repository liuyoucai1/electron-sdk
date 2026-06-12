<template>
  <WidgetShell
    v-if="flowStore.viewMode === 'widget' && currentWidget"
    :widget="widgetStore.activeWidget"
    variant="widget"
    @close="handleClose"
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
import { useWidgetStore } from '../../stores/widget';
import WidgetShell from './WidgetShell.vue';
import { widgetRegistry } from './widgetRegistry';

const router = useRouter();
const flowStore = useFlowStore();
const widgetStore = useWidgetStore();

const currentWidget = computed(() => {
  const type = widgetStore.activeWidget?.type;
  return type ? widgetRegistry[type] : undefined;
});

// 接收业务小屏事件，并交给流程 store 决定下一步。
function handleFlowAction(payload) {
  const target = flowStore.handleAskWidgetAction(payload);
  if (!target?.widgetType) {
    return;
  }

  widgetStore.openWidget(target.widgetType, target.props);
  nextTick(() => {
    document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
  });
}

// 普通小屏关闭会断开整条业务链路。
async function handleClose() {
  const target = flowStore.resetFlow();
  widgetStore.closeWidget();
  await router.replace(target.route);
  await nextTick();
  document.dispatchEvent(new CustomEvent('overlay-hitboxes-changed'));
}
</script>
