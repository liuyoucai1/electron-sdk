import { defineStore } from "pinia";

const WIDGET_PRESETS = {
  "ask-entry": {
    title: "发起提问",
    width: 470,
    height: 650,
    position: "center",
  },
  "answer-progress": {
    title: "答题进行中",
    width: 355,
    height: 200,
    position: "bottom-right",
  },
  "multi-question": {
    title: "多题提问",
    width: 390,
    height: 460,
    position: "center",
  },
  "read-recite": {
    title: "背读",
    width: 975,
    height: 710,
    position: "center",
  },
  "select-question": {
    title: "选题提问",
    width: 975,
    height: 710,
    position: "center",
  },
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
    // 根据业务步骤打开对应小屏，并一次性写入尺寸位置。
    openWidget(type, props = {}) {
      const preset = WIDGET_PRESETS[type];

      if (!preset) {
        this.activeWidget = null;
        return;
      }

      const scale = this.resolveScale(preset);
      const viewportWidth = window.innerWidth || 1920;
      const viewportHeight = window.innerHeight || 1080;
      const defaultX =
        preset.position === "bottom-right"
          ? viewportWidth - preset.width * scale - 24
          : (viewportWidth - preset.width * scale) / 2;
      const defaultY =
        preset.position === "bottom-right"
          ? viewportHeight - preset.height * scale - 24
          : (viewportHeight - preset.height * scale) / 2;

      this.scale = scale;
      this.activeWidget = {
        id: `widget-${type}`,
        type,
        mode: preset.mode || "widget",
        title: preset.title,
        x: Math.max(24, defaultX),
        y: Math.max(24, defaultY),
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

    // 更新小屏位置。
    moveWidget(position) {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.x = position.x;
      this.activeWidget.y = position.y;
    },

    // 标记侧屏最小化，保留业务链路。
    minimizeWidget() {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.mode = "minimized";
    },

    // 从最小化恢复侧屏。
    restoreWidget() {
      if (!this.activeWidget) {
        return;
      }

      this.activeWidget.mode = "sidePanel";
      this.activeWidget.zIndex = this.nextZIndex;
      this.nextZIndex += 1;
    },

    // 清空小屏。
    closeWidget() {
      this.activeWidget = null;
    },
  },
});
