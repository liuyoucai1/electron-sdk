import { defineStore } from 'pinia';

export const useOverlayStore = defineStore('overlay', {
  state: () => ({
    // 引用计数，支持多层弹框嵌套。
    floatingBallHideCount: 0,
    smallPageHostHideCount: 0,
  }),
  getters: {
    shouldHideFloatingBall: (state) => state.floatingBallHideCount > 0,
    shouldHideSmallPageHost: (state) => state.smallPageHostHideCount > 0,
  },
  actions: {
    // 弹框打开时调用，临时隐藏胶囊。
    hideFloatingBall() {
      this.floatingBallHideCount += 1;
    },

    // 弹框关闭时调用，恢复胶囊显示策略。
    showFloatingBall() {
      this.floatingBallHideCount = Math.max(0, this.floatingBallHideCount - 1);
    },

    // 弹框打开时隐藏当前普通小屏（如 ask-entry），与原先切换选题页一致。
    hideSmallPageHost() {
      this.smallPageHostHideCount += 1;
    },

    // 弹框关闭时恢复普通小屏显示。
    showSmallPageHost() {
      this.smallPageHostHideCount = Math.max(0, this.smallPageHostHideCount - 1);
    },

    // 流程结束或弹框异常卸载时，强制清零 overlay 锁，避免胶囊无法恢复。
    resetOverlays() {
      this.floatingBallHideCount = 0;
      this.smallPageHostHideCount = 0;
    },
  },
});
