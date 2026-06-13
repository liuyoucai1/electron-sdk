import { defineStore } from "pinia";

const WIDGET_PRESETS = {
  "analysis-compact": {
    title: "题目分析",
    width: 400,
    height: 800,
    position: "right",
  },
  "multi-batch-compact": {
    title: "多题答题分析",
    width: 400,
    height: 800,
    position: "right",
  },
  "read-recite-analysis-compact": {
    title: "背诵分析",
    width: 400,
    height: 800,
    position: "right",
  }
};

const INITIAL_STATE = {
  activeWidget: null,
  nextZIndex: 20,
  scale: 1,
};

export const useWidgetStore = defineStore("widget", {
  state: () => ({
    ...INITIAL_STATE,
  }),
  actions: {
    // 根据业务步骤打开对应缩屏，并一次性写入尺寸位置。
    openWidget(type, props = {}, options = {}) {
      const preset = WIDGET_PRESETS[type];

      if (!preset) {
        this.activeWidget = null;
        return;
      }

      const prev = this.activeWidget;
      const preservePosition = Boolean(options.preservePosition && prev);
      const scale = preservePosition ? prev.scale : this.resolveScale(preset);
      const viewportWidth = window.innerWidth || 1920;
      const viewportHeight = window.innerHeight || 1080;
      const defaultX =
        preset.position === "right"
          ? viewportWidth - preset.width * scale - 32
          : preset.position === "bottom-right"
          ? viewportWidth - preset.width * scale - 24
          : (viewportWidth - preset.width * scale) / 2;
      const defaultY =
        preset.position === "right"
          ? (viewportHeight - preset.height * scale) / 2
          : preset.position === "bottom-right"
          ? viewportHeight - preset.height * scale - 24
          : (viewportHeight - preset.height * scale) / 2;

      this.scale = scale;
      this.activeWidget = {
        id: `widget-${type}`,
        type,
        mode: "compact",
        title: preset.title,
        x: preservePosition ? prev.x : Math.max(24, defaultX),
        y: preservePosition ? prev.y : Math.max(24, defaultY),
        width: preset.width,
        height: preset.height,
        minWidth: preset.minWidth || preset.width,
        minHeight: preset.minHeight || preset.height,
        zIndex: this.nextZIndex,
        scale,
        props,
      };
      this.nextZIndex += 1;
    },

    // 根据视口尺寸得到统一缩放比例。
    resolveScale(preset) {
      const viewportWidth = window.innerWidth || 1920;
      const viewportHeight = window.innerHeight || 1080;
      const widthScale = (viewportWidth - 48) / preset.width;
      const heightScale = (viewportHeight - 48) / preset.height;

      return Math.max(0.82, Math.min(1, widthScale, heightScale));
    },

    // 更新缩屏位置。
    moveWidget(position) {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.x = position.x;
      this.activeWidget.y = position.y;
    },

    // 标记缩屏最小化，保留业务链路。
    minimizeWidget() {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.mode = "minimized";
    },

    // 从最小化恢复缩屏。
    restoreWidget() {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.mode = "compact";
      this.activeWidget.zIndex = this.nextZIndex;
      this.nextZIndex += 1;
    },

    // 清空缩屏。
    closeWidget() {
      this.activeWidget = null;
    },
  },
});
