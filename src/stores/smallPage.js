import { defineStore } from "pinia";

// position 含义：
//   'follow-ball' — 跟随胶囊，显示在胶囊左侧或右侧
//   'center'      — 屏幕居中
//   'draggable'   — 可拖拽，默认位置由 defaultAnchor 决定
//
// hideFloatingBall: true 时该小屏打开期间强制隐藏胶囊。
const SMALL_PAGE_PRESETS = {
  "ask-entry": {
    title: "发起提问",
    width: 470,
    height: 640,
    position: "follow-ball",
  },
  "answer-progress": {
    title: "答题进行中",
    width: 360,
    height: 160,
    position: "draggable",
    defaultAnchor: { right: 50, bottom: 50 },
    hideFloatingBall: true,
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
  activePage: null,
  // 胶囊（悬浮球）在视口中的实时位置，用于普通小屏定位到胶囊旁边。
  ballPosition: {
    x: window.innerWidth - 112,
    y: window.innerHeight - 130,
  },
};

export const useSmallPageStore = defineStore("smallPage", {
  state: () => ({
    ...INITIAL_STATE,
  }),
  getters: {
    // 当前小屏是否要求隐藏胶囊。
    shouldHideFloatingBall: (state) =>
      state.activePage?.hideFloatingBall === true,
  },
  actions: {
    // 打开普通小屏页面，只写入业务承载所需的最小信息。
    openPage(type, props = {}) {
      const preset = SMALL_PAGE_PRESETS[type];

      if (!preset) {
        this.activePage = null;
        return;
      }

      const page = {
        id: `small-page-${type}`,
        type,
        title: preset.title,
        width: preset.width,
        height: preset.height,
        position: preset.position,
        hideFloatingBall: Boolean(preset.hideFloatingBall),
        props,
      };

      // draggable 模式：根据 defaultAnchor 计算初始 left / top。
      if (preset.position === "draggable" && preset.defaultAnchor) {
        const anchor = preset.defaultAnchor;
        page.dragX =
          anchor.left != null
            ? anchor.left
            : window.innerWidth - page.width - (anchor.right || 0);
        page.dragY =
          anchor.top != null
            ? anchor.top
            : window.innerHeight - page.height - (anchor.bottom || 0);
      }

      this.activePage = page;
    },

    // 由 FloatingBall 拖拽或窗口 resize 时更新，供 WidgetHost 计算小屏定位。
    updateBallPosition(x, y) {
      this.ballPosition = { x, y };
    },

    // 拖拽小屏时更新当前位置，由 WidgetHost 在 pointermove 时调用。
    updateDragPosition(x, y) {
      if (this.activePage) {
        this.activePage.dragX = x;
        this.activePage.dragY = y;
      }
    },

    // 动态更新小屏高度（收起/展开切换时使用）。
    updateHeight(height) {
      if (!this.activePage) {
        return;
      }

      this.activePage.height = height;

      // 高度变化后重新 clamp Y，防止底部超出视口。
      if (this.activePage.position === 'draggable' && this.activePage.dragY != null) {
        const MARGIN = 12;
        const maxY = window.innerHeight - height - MARGIN;
        if (this.activePage.dragY > maxY) {
          this.activePage.dragY = maxY;
        }
      }
    },

    // 清空普通小屏页面。
    closePage() {
      this.activePage = null;
    },
  },
});
