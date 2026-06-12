import { defineStore } from 'pinia';

const INITIAL_STATE = {
  activeFlow: null,
  currentStep: null,
  viewMode: 'idle',
  sessionId: null,
  questionId: null,
  questionType: null,
  batchId: null,
  currentQuestionIndex: 0,
  nextStep: null,
  nextViewMode: null,
  fullscreenRoute: null,
  // 记录 AnswerProgressWidget 是从哪个入口打开的，
  // 用于”结束答题”时决定跳转到不同的详情页。
  // 取值示例：'ask-entry' | 'fullscreen-analysis' | 'multi-question'
  answerProgressEntry: null,
  // 记录最小化之前的状态，用于 restore 时判断回到哪里。
  // 'compact' | 'fullscreen' | null
  minimizedFrom: null
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
    // 小屏显示时胶囊保持可见，作为小屏的定位锚点；全屏/缩屏/最小化时隐藏。
    shouldHideFloatingBall: (state) => ['fullscreen', 'compact', 'minimized'].includes(state.viewMode)
  },
  actions: {
    // 从悬浮球进入”问”线路入口小屏；若已在小屏入口则返回 toggle 关闭信号。
    startAskFlow() {
      // 再次点击”问”时关闭当前普通小屏，回到 idle。
      if (this.activeFlow === 'ask' && this.currentStep === 'ask-entry' && this.viewMode === 'small-page') {
        return this.resetFlow();
      }

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
        this.questionType = payload.questionType || null;

        // 记录入口来源，供”结束答题”时决定跳转目标。
        this.answerProgressEntry = payload.entrySource || 'ask-entry';

        // 根据入口来源预设结束后的跳转目标。
        const entryRouteMap = {
          'ask-entry': { nextStep: 'single-analysis', nextViewMode: 'fullscreen', fullscreenRoute: '/ask/objective-detail' },
          'fullscreen-analysis': { nextStep: 'single-analysis', nextViewMode: 'fullscreen', fullscreenRoute: '/ask/objective-detail' },
          'multi-question': { nextStep: 'batch-analysis', nextViewMode: 'fullscreen', fullscreenRoute: '/ask/objective-detail' }
        };

        const target = entryRouteMap[this.answerProgressEntry] || entryRouteMap['ask-entry'];
        this.nextStep = target.nextStep;
        this.nextViewMode = target.nextViewMode;
        this.fullscreenRoute = target.fullscreenRoute;

        return {
          displayMode: 'small-page',
          pageType: 'answer-progress',
          props: {
            sessionId: this.sessionId,
            questionType: payload.questionType,
            optionCount: payload.optionCount,
            entrySource: this.answerProgressEntry
          }
        };
      }

      if (payload.action === 'finish-answering') {
        // 根据入口来源决定结束后的跳转目标。
        // entrySource 在 open-answer-progress 时写入，此处消费后清空。
        const entry = this.answerProgressEntry || 'ask-entry';

        const finishRouteMap = {
          'ask-entry': { step: 'single-analysis', mode: 'fullscreen', route: '/ask/objective-detail' },
          'fullscreen-analysis': { step: 'single-analysis', mode: 'fullscreen', route: '/ask/objective-detail' },
          'multi-question': { step: 'batch-analysis', mode: 'fullscreen', route: '/ask/objective-detail' }
        };

        const target = finishRouteMap[entry] || finishRouteMap['ask-entry'];

        this.currentStep = target.step;
        this.viewMode = target.mode;
        this.fullscreenRoute = target.route;
        this.nextStep = null;
        this.nextViewMode = null;

        const query = {
          entrySource: entry,
          questionType: this.questionType || ''
        };

        this.answerProgressEntry = null;

        return {
          displayMode: 'fullscreen',
          route: this.fullscreenRoute,
          query
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

    // 缩屏 → 最小化。
    minimizeWidget() {
      this.minimizedFrom = 'compact';
      this.viewMode = 'minimized';

      return {
        viewMode: this.viewMode
      };
    },

    // 全屏路由 → 最小化。
    // 由全屏页面调用，返回标题信息用于创建 taskbar 触发按钮。
    minimizeFullscreen(title) {
      this.minimizedFrom = 'fullscreen';
      this.viewMode = 'minimized';

      return {
        viewMode: this.viewMode,
        widgetType: 'analysis-compact',
        widgetTitle: title || '答题分析'
      };
    },

    // 从最小化按钮恢复。
    restoreWidget() {
      if (this.minimizedFrom === 'fullscreen') {
        this.viewMode = 'fullscreen';
        this.minimizedFrom = null;

        return {
          viewMode: this.viewMode,
          route: this.fullscreenRoute
        };
      }

      // 默认：从缩屏最小化恢复 → 回到 compact。
      this.viewMode = 'compact';
      this.minimizedFrom = null;

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
