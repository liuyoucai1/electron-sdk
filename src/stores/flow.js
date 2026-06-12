import { defineStore } from 'pinia';

const INITIAL_STATE = {
  activeFlow: null,
  currentStep: null,
  viewMode: 'idle',
  sessionId: null,
  questionId: null,
  batchId: null,
  currentQuestionIndex: 0,
  nextStep: null,
  nextViewMode: null,
  fullscreenRoute: null
};

export const useFlowStore = defineStore('flow', {
  state: () => ({
    ...INITIAL_STATE
  }),
  getters: {
    hasActiveFlow: (state) => Boolean(state.activeFlow),
    isFullscreen: (state) => state.viewMode === 'fullscreen',
    isSmallPageVisible: (state) => state.viewMode === 'small-page',
    isCompactVisible: (state) => ['compact', 'minimized'].includes(state.viewMode),
    shouldHideFloatingBall: (state) => state.viewMode !== 'idle'
  },
  actions: {
    // 从悬浮球进入“问”线路入口小屏。
    startAskFlow() {
      this.activeFlow = 'ask';
      this.currentStep = 'ask-entry';
      this.viewMode = 'small-page';
      this.sessionId = `ask-${Date.now()}`;
      this.questionId = null;
      this.batchId = null;
      this.currentQuestionIndex = 0;
      this.nextStep = null;
      this.nextViewMode = null;
      this.fullscreenRoute = '/ask/fullscreen';

      return {
        displayMode: 'small-page',
        pageType: 'ask-entry',
        props: {
          sessionId: this.sessionId
        }
      };
    },

    // 根据问入口小屏的动作进入下一阶段小屏。
    handleAskWidgetAction(payload) {
      if (!payload || this.activeFlow !== 'ask') {
        return null;
      }

      if (payload.action === 'close-flow') {
        return this.resetFlow();
      }

      if (payload.action === 'open-answer-progress') {
        this.currentStep = 'answer-progress';
        this.viewMode = 'small-page';
        this.questionId = payload.questionId || null;
        this.nextStep = 'single-analysis';
        this.nextViewMode = 'fullscreen';

        return {
          displayMode: 'small-page',
          pageType: 'answer-progress',
          props: {
            sessionId: this.sessionId,
            questionType: payload.questionType,
            optionCount: payload.optionCount
          }
        };
      }

      if (payload.action === 'finish-answering') {
        this.currentStep = this.nextStep || 'single-analysis';
        this.viewMode = this.nextViewMode || 'fullscreen';
        this.nextStep = null;
        this.nextViewMode = null;
        this.fullscreenRoute = '/ask/fullscreen';

        return {
          displayMode: 'fullscreen',
          route: this.fullscreenRoute
        };
      }

      if (payload.action === 'open-multi-question') {
        this.currentStep = 'multi-question';
        this.viewMode = 'small-page';

        return {
          displayMode: 'small-page',
          pageType: 'multi-question',
          props: {
            sessionId: this.sessionId
          }
        };
      }

      if (payload.action === 'open-read-recite') {
        this.currentStep = 'read-recite';
        this.viewMode = 'small-page';

        return {
          displayMode: 'small-page',
          pageType: 'read-recite',
          props: {
            sessionId: this.sessionId,
            reciteType: payload.reciteType
          }
        };
      }

      if (payload.action === 'open-select-question') {
        this.currentStep = 'select-question';
        this.viewMode = 'small-page';

        return {
          displayMode: 'small-page',
          pageType: 'select-question',
          props: {
            sessionId: this.sessionId,
            source: payload.source
          }
        };
      }

      return null;
    },

    // 全屏页面缩放为 400 x 800 缩屏。
    shrinkFullscreenToCompact() {
      this.viewMode = 'compact';

      return {
        displayMode: 'compact',
        widgetType: 'analysis-compact',
        props: {
          sessionId: this.sessionId,
          questionId: this.questionId,
          step: this.currentStep
        }
      };
    },

    // 进入缩屏最小化状态。
    minimizeWidget() {
      this.viewMode = 'minimized';

      return {
        viewMode: this.viewMode
      };
    },

    // 从最小化按钮恢复缩屏。
    restoreWidget() {
      this.viewMode = 'compact';

      return {
        viewMode: this.viewMode
      };
    },

    // 缩屏重新进入全屏。正式流程接入时需先写入 fullscreenRoute。
    expandWidgetToFullscreen() {
      if (!this.fullscreenRoute) {
        return null;
      }

      this.viewMode = 'fullscreen';

      return {
        viewMode: this.viewMode,
        route: this.fullscreenRoute
      };
    },

    // 关闭任意业务形态，结束整条业务流程。
    resetFlow() {
      Object.assign(this, INITIAL_STATE);

      return {
        viewMode: this.viewMode,
        route: '/'
      };
    }
  }
});
