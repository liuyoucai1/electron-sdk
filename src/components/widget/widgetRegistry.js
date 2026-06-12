import AnswerProgressWidget from '../../views/ask/widgets/AnswerProgressWidget.vue';
import AskEntryWidget from '../../views/ask/widgets/AskEntryWidget.vue';
import MultiQuestionWidget from '../../views/ask/widgets/MultiQuestionWidget.vue';
import ReadReciteWidget from '../../views/ask/widgets/ReadReciteWidget.vue';
import SelectQuestionWidget from '../../views/ask/widgets/SelectQuestionWidget.vue';

export const widgetRegistry = {
  'ask-entry': AskEntryWidget,
  'answer-progress': AnswerProgressWidget,
  'multi-question': MultiQuestionWidget,
  'read-recite': ReadReciteWidget,
  'select-question': SelectQuestionWidget
};
