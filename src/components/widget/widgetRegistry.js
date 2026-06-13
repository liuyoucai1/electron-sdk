import AnalysisCompactWidget from '../../views/ask/widgets/AnalysisCompactWidget.vue';
import MultiBatchCompactWidget from '../../views/ask/widgets/MultiBatchCompactWidget.vue';
import AnswerProgressWidget from '../../views/ask/widgets/AnswerProgressWidget.vue';
import AskEntryWidget from '../../views/ask/widgets/AskEntryWidget.vue';
import MultiQuestionWidget from '../../views/ask/widgets/MultiQuestionWidget.vue';
import ReadReciteWidget from '../../views/ask/subjective/widgets/ReadReciteWidget.vue';
import ReadReciteAnalysisCompactWidget from '../../views/ask/subjective/widgets/ReadReciteAnalysisCompactWidget.vue';
import VoiceQuestionMethodWidget from '../../views/ask/subjective/widgets/VoiceQuestionMethodWidget.vue';
import VoiceQuestionInputWidget from '../../views/ask/subjective/widgets/VoiceQuestionInputWidget.vue';
import SelectQuestionWidget from '../../views/ask/widgets/SelectQuestionWidget.vue';

export const widgetRegistry = {
  'analysis-compact': AnalysisCompactWidget,
  'multi-batch-compact': MultiBatchCompactWidget,
  'read-recite-analysis-compact': ReadReciteAnalysisCompactWidget,
  'ask-entry': AskEntryWidget,
  'answer-progress': AnswerProgressWidget,
  'multi-question': MultiQuestionWidget,
  'read-recite': ReadReciteWidget,
  'select-question': SelectQuestionWidget,
  'voice-question-method': VoiceQuestionMethodWidget,
  'voice-question-input': VoiceQuestionInputWidget,
};
