import { defineStore } from 'pinia';
import { buildAnswerProgressFromQuestionBatch } from '../views/ask/utils/buildAnswerProgressBatch.js';
import {
  buildAnswerProgressFromReadRecite,
  buildAnswerProgressFromScreenshot,
  buildAnswerProgressFromVoice
} from '../views/ask/subjective/utils/buildAnswerProgressSession.js';
import { buildReadReciteAnalysis } from '../views/ask/subjective/utils/buildReadReciteAnalysis.js';
import { buildVoiceAnalysis, buildVoiceAnalysisWithQuestion } from '../views/ask/subjective/utils/buildVoiceAnalysis.js';
import { resolveImageSrc } from '../shared/assets/resolveImageSrc.js';
import {
  finalizeScreenshotSession,
  releaseSessionImageMemory
} from '../api/sessionAsset.js';

const ASK_ACTION_HANDLERS = {
  'close-flow': 'resetFlow',
  'open-answer-progress': 'openAnswerProgress',
  'finish-answering': 'finishAnswering',
  'open-multi-question': 'openMultiQuestion',
  'open-read-recite': 'openReadRecite',
  'open-voice-question': 'openVoiceQuestion',
  'select-voice-method': 'selectVoiceMethod',
  'open-voice-question-from-analysis': 'openVoiceQuestionFromAnalysis',
  'cancel-voice-question-from-analysis': 'cancelVoiceQuestionFromAnalysis',
  'set-voice-analysis-question': 'setVoiceAnalysisQuestion',
  'back-voice-question-method': 'backVoiceQuestionMethod',
  'start-voice-question': 'startVoiceQuestion',
  'confirm-screenshot-question': 'confirmScreenshotQuestion',
  'start-read-recite': 'startReadRecite',
  'finish-answer-progress': 'finishAnswerProgress',
  'finish-read-recite': 'finishAnswerProgress',
  'next-answer-progress-question': 'nextAnswerProgressQuestion',
  'start-question-batch-progress': 'startQuestionBatchProgress',
  'open-select-question': 'openSelectQuestion'
};

const ANSWER_PROGRESS_ENTRY_TARGETS = {
  'ask-entry': {
    nextStep: 'single-analysis',
    nextViewMode: 'fullscreen',
    fullscreenRoute: '/ask/objective-detail'
  },
  'fullscreen-analysis': {
    nextStep: 'single-analysis',
    nextViewMode: 'fullscreen',
    fullscreenRoute: '/ask/objective-detail'
  },
  'multi-question': {
    nextStep: 'batch-analysis',
    nextViewMode: 'fullscreen',
    fullscreenRoute: '/ask/multi-batch-analysis'
  },
  'select-question': {
    nextStep: 'single-analysis',
    nextViewMode: 'fullscreen',
    fullscreenRoute: '/ask/objective-detail'
  }
};

const FINISH_ANSWERING_TARGETS = {
  'ask-entry': { step: 'single-analysis', mode: 'fullscreen', route: '/ask/objective-detail' },
  'fullscreen-analysis': { step: 'single-analysis', mode: 'fullscreen', route: '/ask/objective-detail' },
  'multi-question': { step: 'batch-analysis', mode: 'fullscreen', route: '/ask/multi-batch-analysis' },
  'select-question': { step: 'single-analysis', mode: 'fullscreen', route: '/ask/objective-detail' }
};

const QUESTION_BATCH_FINISH_TARGET = FINISH_ANSWERING_TARGETS['multi-question'];

const FULLSCREEN_ROUTE_STEPS = {
  '/ask/multi-batch-analysis': 'batch-analysis',
  '/ask/objective-detail': 'single-analysis',
  '/ask/answer-progress': 'answer-progress',
  '/ask/read-recite-progress': 'answer-progress',
  '/ask/read-recite-analysis': 'read-recite-analysis',
  '/ask/read-recite-student-analysis': 'read-recite-student-analysis',
  '/ask/voice-analysis': 'voice-analysis',
  '/ask/voice-student-analysis': 'voice-student-analysis'
};

const READ_RECITE_COMPACT_ROUTES = new Set([
  '/ask/read-recite-analysis',
  '/ask/read-recite-student-analysis',
  '/ask/voice-analysis',
  '/ask/voice-student-analysis'
]);

const INITIAL_STATE = {
  activeFlow: null,
  currentStep: null,
  viewMode: 'idle',
  sessionId: null,
  questionId: null,
  questionType: null,
  batchId: null,
  batchSize: null,
  currentQuestionIndex: 0,
  nextStep: null,
  nextViewMode: null,
  fullscreenRoute: null,
  fullscreenQuery: null,
  objectiveAnalysisState: null,
  batchAnalysisState: null,
  answerProgressState: null,
  readReciteAnalysisState: null,
  voiceQuestionState: null,
  voiceAnalysisState: null,
  voiceStudentIndex: 0,
  readReciteStudentIndex: 0,
  voiceQuestionInputContext: null,
  screenshotQuestionState: null,
  compactParent: null,
  answerProgressEntry: null,
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
    shouldHideFloatingBall: (state) =>
      ['fullscreen', 'compact', 'minimized'].includes(state.viewMode)
  },
  actions: {
    startAskFlow() {
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

      return this.createSmallPageTarget('ask-entry', {
        sessionId: this.sessionId
      });
    },

    handleAskWidgetAction(payload) {
      if (!payload || this.activeFlow !== 'ask') {
        return null;
      }

      const handlerName = ASK_ACTION_HANDLERS[payload.action];
      if (!handlerName || typeof this[handlerName] !== 'function') {
        return null;
      }

      return this[handlerName](payload);
    },

    createSmallPageTarget(pageType, props = {}, options = {}) {
      return {
        displayMode: 'small-page',
        pageType,
        props,
        ...(options.showFloatingBall !== undefined
          ? { showFloatingBall: options.showFloatingBall }
          : {}),
      };
    },

    openSmallPage(step, pageType, props = {}, options = {}) {
      this.currentStep = step;
      this.viewMode = 'small-page';

      return this.createSmallPageTarget(pageType, props, options);
    },

    openFullscreen(step, route, query = null) {
      this.currentStep = step;
      this.viewMode = 'fullscreen';
      this.fullscreenRoute = route;
      if (query) {
        this.fullscreenQuery = query;
      }

      return {
        displayMode: 'fullscreen',
        route: this.fullscreenRoute,
        ...(query ? { query } : {})
      };
    },

    openAnswerProgress(payload) {
      this.currentStep = 'answer-progress';
      this.viewMode = 'small-page';
      this.questionId = payload.questionId || null;
      this.questionType = payload.questionType || null;
      this.batchSize = payload.questionCount || null;
      this.answerProgressEntry = payload.entrySource || 'ask-entry';

      const target =
        ANSWER_PROGRESS_ENTRY_TARGETS[this.answerProgressEntry] ||
        ANSWER_PROGRESS_ENTRY_TARGETS['ask-entry'];

      this.nextStep = target.nextStep;
      this.nextViewMode = target.nextViewMode;
      this.fullscreenRoute = target.fullscreenRoute;

      return this.createSmallPageTarget('answer-progress', {
        sessionId: this.sessionId,
        questionType: payload.questionType,
        optionCount: payload.optionCount,
        entrySource: this.answerProgressEntry
      });
    },

    finishAnswering() {
      const entry = this.answerProgressEntry || 'ask-entry';
      const target = FINISH_ANSWERING_TARGETS[entry] || FINISH_ANSWERING_TARGETS['ask-entry'];

      this.currentStep = target.step;
      this.viewMode = target.mode;
      this.fullscreenRoute = target.route;
      this.nextStep = null;
      this.nextViewMode = null;

      const query = {
        entrySource: entry,
        questionType: this.questionType || '',
        batchSize: this.batchSize || ''
      };

      this.answerProgressEntry = null;

      return {
        displayMode: 'fullscreen',
        route: this.fullscreenRoute,
        query
      };
    },

    openMultiQuestion() {
      return this.openSmallPage('multi-question', 'multi-question', {
        sessionId: this.sessionId
      });
    },

    openReadRecite(payload) {
      return this.openSmallPage('read-recite', 'read-recite', {
        sessionId: this.sessionId,
        reciteType: payload.reciteType
      });
    },

    openVoiceQuestion() {
      return this.openSmallPage('voice-question-method', 'voice-question-method', {
        sessionId: this.sessionId
      });
    },

    selectVoiceMethod(payload) {
      if (payload.method === 'voice') {
        this.voiceQuestionInputContext = null;
        return this.openSmallPage('voice-question-input', 'voice-question-input', {
          sessionId: this.sessionId
        });
      }

      if (payload.method === 'later') {
        const analysis = buildVoiceAnalysis({ deferQuestionSetup: true });
        const query = {
          sourceType: 'voice',
          deferQuestion: '1'
        };

        this.saveVoiceQuestionState({ deferQuestionSetup: true });
        this.saveVoiceAnalysisState(analysis);
        return {
          ...this.openFullscreen('voice-analysis', '/ask/voice-analysis', query),
          query
        };
      }

      return null;
    },

    openVoiceQuestionFromAnalysis() {
      this.voiceQuestionInputContext = 'analysis';
      return this.openSmallPage(
        'voice-question-input',
        'voice-question-input',
        {
          sessionId: this.sessionId,
          fromAnalysis: true,
        },
        { showFloatingBall: false },
      );
    },

    cancelVoiceQuestionFromAnalysis() {
      this.voiceQuestionInputContext = null;
      return this.openFullscreen('voice-analysis', '/ask/voice-analysis');
    },

    setVoiceAnalysisQuestion(payload) {
      let questionPayload = { ...payload };

      if (payload.questionMode === 'screenshot') {
        const imageSrc = resolveImageSrc({
          imageBase64: payload.imageBase64 || '',
          mimeType: payload.mimeType || 'image/png'
        });

        questionPayload = {
          questionMode: 'screenshot',
          contentType: 'image',
          imageBase64: payload.imageBase64 || '',
          imageSrc,
          mimeType: payload.mimeType || 'image/png',
          contentHtml: null,
          questionText: ''
        };
      }

      const analysis = buildVoiceAnalysisWithQuestion(
        this.voiceAnalysisState || {},
        questionPayload
      );

      this.saveVoiceAnalysisState(analysis);

      return {
        ...this.openFullscreen('voice-analysis', '/ask/voice-analysis'),
        analysis
      };
    },

    backVoiceQuestionMethod() {
      return this.openSmallPage(
        'voice-question-method',
        'voice-question-method',
        {
          sessionId: this.sessionId,
        },
        { showFloatingBall: this.voiceQuestionInputContext !== 'analysis' },
      );
    },

    startVoiceQuestion(payload) {
      const questionText = payload.questionText || '';

      if (this.voiceQuestionInputContext === 'analysis') {
        const voiceSession = buildAnswerProgressFromVoice({
          questionText,
          contentHtml: payload.contentHtml
        });
        const analysis = buildVoiceAnalysisWithQuestion(this.voiceAnalysisState || {}, {
          questionMode: 'voice',
          questionText: voiceSession.questionText,
          contentHtml: voiceSession.contentHtml,
          contentType: 'html'
        });

        this.voiceQuestionInputContext = null;
        this.saveVoiceAnalysisState(analysis);

        return {
          ...this.openFullscreen('voice-analysis', '/ask/voice-analysis'),
          analysis
        };
      }

      const session = buildAnswerProgressFromVoice({
        questionText,
        contentHtml: payload.contentHtml
      });
      const query = {
        sourceType: 'voice'
      };

      this.saveVoiceQuestionState({ questionText });
      this.saveAnswerProgressState(session);

      return this.openFullscreen('answer-progress', '/ask/answer-progress', query);
    },

    confirmScreenshotQuestion(payload) {
      const session = buildAnswerProgressFromScreenshot({
        imageBase64: payload.imageBase64 || '',
        mimeType: payload.mimeType || 'image/png',
        bounds: payload.bounds || null
      });
      const query = {
        sourceType: 'screenshot'
      };

      this.saveAnswerProgressState(session);
      this.saveScreenshotQuestionState({
        imageBase64: payload.imageBase64 || '',
        mimeType: payload.mimeType || 'image/png',
        bounds: payload.bounds || null
      });

      return this.openFullscreen('answer-progress', '/ask/answer-progress', query);
    },

    startReadRecite(payload) {
      const session = buildAnswerProgressFromReadRecite(payload);
      const query = {
        sourceType: 'read-recite',
        reciteType: session.reciteType,
        tab: session.tab
      };

      this.saveAnswerProgressState(session);

      return this.openFullscreen('answer-progress', '/ask/answer-progress', query);
    },

    startQuestionBatchProgress(payload) {
      const session = buildAnswerProgressFromQuestionBatch(payload);
      this.currentStep = 'answer-progress';
      this.viewMode = 'fullscreen';
      this.answerProgressEntry = payload.entrySource || 'select-question';
      this.batchSize = session.questions.length;
      this.currentQuestionIndex = 0;
      this.batchId = `batch-${Date.now()}`;

      this.saveAnswerProgressState(session);

      const query = {
        sourceType: 'question-batch',
        entrySource: this.answerProgressEntry,
        batchSize: session.questions.length
      };

      return this.openFullscreen('answer-progress', '/ask/answer-progress', query);
    },

    nextAnswerProgressQuestion() {
      const session = this.answerProgressState || {};
      if (session.sourceType !== 'question-batch') {
        return null;
      }

      const questions = Array.isArray(session.questions) ? session.questions : [];
      const nextIndex = Number(session.currentQuestionIndex || 0) + 1;
      if (nextIndex >= questions.length) {
        return null;
      }

      this.currentQuestionIndex = nextIndex;
      this.saveAnswerProgressState({
        ...session,
        currentQuestionIndex: nextIndex
      });

      return null;
    },

    finishAnswerProgress() {
      const session = this.answerProgressState || {};

      if (session.sourceType === 'question-batch') {
        const entry = session.entrySource || 'select-question';
        const target = QUESTION_BATCH_FINISH_TARGET;

        this.currentStep = target.step;
        this.viewMode = target.mode;
        this.fullscreenRoute = target.route;
        this.nextStep = null;
        this.nextViewMode = null;

        const query = {
          entrySource: entry,
          batchSize: session.questions?.length || 0,
          sourceType: 'question-batch',
          tab: session.tab || ''
        };

        this.answerProgressEntry = null;

        return {
          displayMode: 'fullscreen',
          route: this.fullscreenRoute,
          query
        };
      }

      if (session.sourceType === 'screenshot') {
        finalizeScreenshotSession(this);
        return this.resetFlow();
      }

      if (session.sourceType === 'voice') {
        const analysis = buildVoiceAnalysis(session);
        const query = {
          sourceType: 'voice',
          ...(session.deferQuestionSetup ? { deferQuestion: '1' } : {})
        };

        this.saveVoiceAnalysisState(analysis);
        return this.openFullscreen('voice-analysis', '/ask/voice-analysis', query);
      }

      const analysis = buildReadReciteAnalysis(session);
      const query = {
        sourceType: session.sourceType || 'read-recite',
        reciteType: analysis.reciteType,
        tab: analysis.tab
      };

      this.saveReadReciteAnalysisState(analysis);
      return this.openFullscreen('read-recite-analysis', '/ask/read-recite-analysis', query);
    },

    openSelectQuestion(payload) {
      return this.openSmallPage('select-question', 'select-question', {
        sessionId: this.sessionId,
        initialTab: payload.initialTab || payload.source || 'self',
      });
    },

    shrinkFullscreenToCompact() {
      this.viewMode = 'compact';
      const isBatchAnalysis =
        this.currentStep === 'batch-analysis' ||
        this.fullscreenRoute === '/ask/multi-batch-analysis';
      const isReadReciteAnalysis =
        this.currentStep === 'read-recite-analysis' ||
        this.currentStep === 'voice-analysis' ||
        READ_RECITE_COMPACT_ROUTES.has(this.fullscreenRoute);
      const widgetType = isBatchAnalysis
        ? 'multi-batch-compact'
        : isReadReciteAnalysis
        ? 'read-recite-analysis-compact'
        : 'analysis-compact';

      return {
        displayMode: 'compact',
        widgetType,
        props: {
          sessionId: this.sessionId,
          questionId: this.questionId,
          step: this.currentStep
        }
      };
    },

    setFullscreenContext(context = {}) {
      if (context.currentStep) {
        this.currentStep = context.currentStep;
      }
      if (context.fullscreenRoute) {
        this.fullscreenRoute = context.fullscreenRoute;
      }
      if (context.fullscreenQuery) {
        this.fullscreenQuery = context.fullscreenQuery;
      }
      if (context.viewMode) {
        this.viewMode = context.viewMode;
      }

      return {
        currentStep: this.currentStep,
        fullscreenRoute: this.fullscreenRoute,
        fullscreenQuery: this.fullscreenQuery,
        viewMode: this.viewMode
      };
    },

    minimizeWidget() {
      this.minimizedFrom = 'compact';
      this.viewMode = 'minimized';

      return {
        viewMode: this.viewMode
      };
    },

    minimizeFullscreen(title) {
      this.minimizedFrom = 'fullscreen';
      this.viewMode = 'minimized';

      const widgetType = READ_RECITE_COMPACT_ROUTES.has(this.fullscreenRoute)
        ? 'read-recite-analysis-compact'
        : this.fullscreenRoute === '/ask/multi-batch-analysis'
        ? 'multi-batch-compact'
        : 'analysis-compact';

      return {
        viewMode: this.viewMode,
        widgetType,
        widgetTitle: title || '答题分析'
      };
    },

    restoreWidget() {
      if (this.minimizedFrom === 'fullscreen') {
        this.viewMode = 'fullscreen';
        this.minimizedFrom = null;

        return {
          viewMode: this.viewMode,
          route: this.fullscreenRoute,
          query: this.fullscreenQuery || {}
        };
      }

      this.viewMode = 'compact';
      this.minimizedFrom = null;

      return {
        viewMode: this.viewMode
      };
    },

    expandWidgetToFullscreen() {
      if (!this.fullscreenRoute) {
        return null;
      }

      this.viewMode = 'fullscreen';
      this.compactParent = null;
      this.currentStep = FULLSCREEN_ROUTE_STEPS[this.fullscreenRoute] || this.currentStep;

      return {
        viewMode: this.viewMode,
        route: this.fullscreenRoute,
        query: this.fullscreenQuery || {}
      };
    },

    saveObjectiveAnalysisState(payload) {
      this.objectiveAnalysisState = payload;
    },

    saveBatchAnalysisState(payload) {
      this.batchAnalysisState = payload;
    },

    saveAnswerProgressState(payload) {
      this.answerProgressState = payload;
    },

    saveReadReciteState(payload) {
      this.saveAnswerProgressState(payload);
    },

    saveReadReciteAnalysisState(payload) {
      this.readReciteAnalysisState = payload;
    },

    saveVoiceQuestionState(payload) {
      this.voiceQuestionState = payload;
    },

    saveVoiceAnalysisState(payload) {
      this.voiceAnalysisState = payload;
    },

    saveVoiceStudentIndex(index) {
      this.voiceStudentIndex = Number.isFinite(index) ? index : 0;
    },

    saveReadReciteStudentIndex(index) {
      this.readReciteStudentIndex = Number.isFinite(index) ? index : 0;
    },

    saveScreenshotQuestionState(payload) {
      this.screenshotQuestionState = payload;
    },

    saveCompactParent(payload) {
      this.compactParent = payload;
    },

    returnToCompactParent() {
      const parent = this.compactParent;
      if (!parent) {
        return null;
      }

      this.compactParent = null;
      this.viewMode = 'compact';

      if (parent.widgetType === 'multi-batch-compact') {
        this.currentStep = 'batch-analysis';
        this.fullscreenRoute = '/ask/multi-batch-analysis';
        this.fullscreenQuery = this.batchAnalysisState?.routeQuery || {};
      }

      return {
        widgetType: parent.widgetType,
        props: parent.props,
        position: parent.position || null
      };
    },

    clearScreenshotSessionState() {
      this.answerProgressState = null;
      this.screenshotQuestionState = null;
    },

    resetFlow() {
      releaseSessionImageMemory(this.answerProgressState || {});
      Object.assign(this, INITIAL_STATE);

      return {
        viewMode: this.viewMode,
        route: '/'
      };
    }
  }
});
