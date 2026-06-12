import { defineStore } from "pinia";

// position 含义：
//   'follow-ball' — 跟随胶囊，显示在胶囊左侧或右侧
//   'center'      — 屏幕居中
//   'draggable'   — 可拖拽，初始位置由 initialAnchor / defaultAnchor 决定
//
// heightMode 含义：
//   'fixed'   — 使用 height 作为固定高度
//   'content' — 高度随内容自适应，超过 maxHeight 后内部滚动，外壳不再撑高
//
// initialAnchor: 'follow-ball' 时初始贴胶囊（与 ask-entry 一致），之后仍可拖拽。
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
    position: "draggable",
    heightMode: "content",
    maxHeight: 500,
    initialHeight: 200,
    defaultAnchor: { right: 50, bottom: 50 },
    hideFloatingBall: true,
  },
  "multi-question": {
    title: "多题提问",
    width: 480,
    position: "draggable",
    heightMode: "content",
    maxHeight: 700,
    initialHeight: 576,
    initialAnchor: "follow-ball",
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

// 计算贴胶囊的初始 left / top，与 WidgetHost 中 follow-ball 实时定位逻辑一致。
function computeFollowBallAnchor(ball, pageWidth, pageHeight) {
  const BALL_RADIUS = 45;
  const GAP = 16;
  const VIEWPORT_MARGIN = 12;

  const rightEdge = ball.x + BALL_RADIUS + GAP;
  const fitsRight = rightEdge + pageWidth + VIEWPORT_MARGIN <= window.innerWidth;
  const leftEdge = ball.x - BALL_RADIUS - GAP;
  const fitsLeft = leftEdge - pageWidth - VIEWPORT_MARGIN >= 0;

  const left = fitsRight || !fitsLeft ? rightEdge : leftEdge - pageWidth;
  let top = ball.y - pageHeight / 2;
  top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(top, window.innerHeight - pageHeight - VIEWPORT_MARGIN),
  );

  return { left, top };
}

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
        heightMode: preset.heightMode || "fixed",
        maxHeight: preset.maxHeight || null,
        position: preset.position,
        hideFloatingBall: Boolean(preset.hideFloatingBall),
        props,
      };

      // draggable 模式：计算初始 left / top。
      // content 模式下用 initialHeight 估算锚点高度，实际高度由内容决定。
      if (preset.position === "draggable") {
        const anchorHeight =
          preset.heightMode === "content"
            ? preset.initialHeight || preset.maxHeight || 400
            : preset.height;

        if (preset.initialAnchor === "follow-ball") {
          const pos = computeFollowBallAnchor(
            this.ballPosition,
            preset.width,
            anchorHeight,
          );
          page.dragX = pos.left;
          page.dragY = pos.top;
        } else if (preset.defaultAnchor) {
          const anchor = preset.defaultAnchor;
          page.dragX =
            anchor.left != null
              ? anchor.left
              : window.innerWidth - preset.width - (anchor.right || 0);
          page.dragY =
            anchor.top != null
              ? anchor.top
              : window.innerHeight - anchorHeight - (anchor.bottom || 0);
        }
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

    // 清空普通小屏页面。
    closePage() {
      this.activePage = null;
    },
  },
});
