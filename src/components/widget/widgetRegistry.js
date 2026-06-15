import { defineAsyncComponent } from 'vue';

export const widgetRegistry = {
  'analysis-compact': defineAsyncComponent(() => import('../../views/ask/widgets/AnalysisCompactWidget.vue')),
  'multi-batch-compact': defineAsyncComponent(() => import('../../views/ask/widgets/MultiBatchCompactWidget.vue')),
  'read-recite-analysis-compact': defineAsyncComponent(() =>
    import('../../views/ask/subjective/widgets/ReadReciteAnalysisCompactWidget.vue')
  ),
  'ask-entry': defineAsyncComponent(() => import('../../views/ask/widgets/AskEntryWidget.vue')),
  'answer-progress': defineAsyncComponent(() => import('../../views/ask/widgets/AnswerProgressWidget.vue')),
  'multi-question': defineAsyncComponent(() => import('../../views/ask/widgets/MultiQuestionWidget.vue')),
  'read-recite': defineAsyncComponent(() => import('../../views/ask/subjective/widgets/ReadReciteWidget.vue')),
  'select-question': defineAsyncComponent(() => import('../../views/ask/widgets/SelectQuestionWidget.vue')),
  'voice-question-method': defineAsyncComponent(() =>
    import('../../views/ask/subjective/widgets/VoiceQuestionMethodWidget.vue')
  ),
  'voice-question-input': defineAsyncComponent(() =>
    import('../../views/ask/subjective/widgets/VoiceQuestionInputWidget.vue')
  ),
};
