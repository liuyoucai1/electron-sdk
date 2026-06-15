import { findQuestionById } from '../../../shared/utils/selectQuestion.js';
import { questionsByTab } from '../../../mock/selectQuestion.js';

// 根据选题结果构建多题客观题答题进行中会话。
export function buildAnswerProgressFromQuestionBatch(payload = {}) {
  const questionIds = Array.isArray(payload.questionIds) ? payload.questionIds : [];
  const questions = questionIds
    .map((questionId) => findQuestionById(questionId, questionsByTab))
    .filter(Boolean)
    .map((question) => ({
      id: question.id,
      type: question.type,
      stem: question.stem,
      difficulty: question.difficulty,
    }));

  return {
    sourceType: 'question-batch',
    entrySource: payload.entrySource || 'select-question',
    tab: payload.tab || 'self',
    questions,
    currentQuestionIndex: 0,
    contentType: 'objective',
    allowHideContent: false,
  };
}

// 读取多题会话中的当前题目。
export function getCurrentBatchQuestion(session = {}) {
  const questions = Array.isArray(session.questions) ? session.questions : [];
  const index = Number(session.currentQuestionIndex) || 0;
  return questions[index] || null;
}

// 将多题会话中的当前题转为页面展示字段。
export function resolveBatchQuestionView(session = {}) {
  const question = getCurrentBatchQuestion(session);
  const questions = Array.isArray(session.questions) ? session.questions : [];
  const currentQuestionIndex = Number(session.currentQuestionIndex) || 0;

  if (!question) {
    return {
      contentType: 'objective',
      title: '',
      objectiveStem: '',
      questionTypeLabel: '',
      questionIndex: 0,
      totalQuestions: questions.length,
    };
  }

  return {
    contentType: 'objective',
    title: '',
    objectiveStem: question.stem,
    questionTypeLabel: question.type,
    questionIndex: currentQuestionIndex + 1,
    totalQuestions: questions.length,
  };
}
