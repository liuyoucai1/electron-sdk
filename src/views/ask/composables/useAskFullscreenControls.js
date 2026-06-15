import { nextTick } from "vue";
import { useRouter } from "vue-router";
import { useFlowStore } from "../../../stores/flow";
import { useSmallPageStore } from "../../../stores/smallPage";
import { useWidgetStore } from "../../../stores/widget";

// Refresh Electron transparent-window hitboxes after overlay changes.
function notifyOverlayHitboxesChanged() {
  document.dispatchEvent(new CustomEvent("overlay-hitboxes-changed"));
}

// Shared controls for ask fullscreen pages.
export function useAskFullscreenControls() {
  const router = useRouter();
  const flowStore = useFlowStore();
  const smallPageStore = useSmallPageStore();
  const widgetStore = useWidgetStore();

  // Update fullscreen flow context through one store action.
  function setFullscreenContext(context = {}) {
    flowStore.setFullscreenContext(context);
  }

  // Shrink the current fullscreen page into a compact widget.
  async function shrinkToCompact(options = {}) {
    const target = options.target || flowStore.shrinkFullscreenToCompact();
    const widgetType = options.widgetType || target.widgetType;
    const props = {
      ...target.props,
      ...(options.props || {}),
    };

    smallPageStore.closePage();
    widgetStore.openWidget(widgetType, props, options.widgetOptions || {});
    await router.replace(options.route || "/");
    await nextTick();
    notifyOverlayHitboxesChanged();
  }

  // Minimize the current fullscreen page to the right-side taskbar entry.
  async function minimizeToTaskbar(title, options = {}) {
    const target = flowStore.minimizeFullscreen(title);
    const widgetType = options.widgetType || target.widgetType;
    const props = {
      sessionId: flowStore.sessionId,
      questionId: flowStore.questionId,
      step: flowStore.currentStep,
      ...(options.props || {}),
    };

    widgetStore.openWidget(widgetType, props, options.widgetOptions || {});
    widgetStore.minimizeWidget();
    smallPageStore.closePage();
    await router.replace(options.route || "/");
    await nextTick();
    notifyOverlayHitboxesChanged();
  }

  // Close the whole ask flow.
  async function closeAskFlow() {
    const target = flowStore.resetFlow();
    smallPageStore.closePage();
    widgetStore.closeWidget();
    await router.replace(target.route);
    await nextTick();
    notifyOverlayHitboxesChanged();
  }

  // Consume a target returned by flowStore actions.
  async function navigateFlowTarget(target) {
    if (!target) {
      return;
    }

    smallPageStore.closePage();
    widgetStore.closeWidget();

    if (target.displayMode === "small-page" && target.pageType) {
      smallPageStore.openPage(target.pageType, target.props || {}, {
        ...(target.showFloatingBall !== undefined
          ? { showFloatingBall: target.showFloatingBall }
          : {}),
      });
      await router.replace("/");
      await nextTick();
      notifyOverlayHitboxesChanged();
      return;
    }

    if (target.viewMode === "idle" || target.route === "/") {
      await router.replace("/");
      await nextTick();
      notifyOverlayHitboxesChanged();
      return;
    }

    if (!target.route) {
      return;
    }

    await router.push({
      path: target.route,
      query: target.query || flowStore.fullscreenQuery || {},
    });
    await nextTick();
    notifyOverlayHitboxesChanged();
  }

  return {
    closeAskFlow,
    minimizeToTaskbar,
    navigateFlowTarget,
    setFullscreenContext,
    shrinkToCompact,
  };
}
