const SUBJECTIVE_QUESTION_TYPE = '主观题';

const OBJECTIVE_QUESTION_TYPE_CODE = {
  单选题: 2,
  多选题: 3,
  判断题: 4,
  数字题: 20,
};

// 将选题列表中的题型文案映射为即兴提问同款 questionType 编码。
export function resolveObjectiveQuestionTypeCode(question) {
  if (!question?.type) {
    return 2;
  }

  return OBJECTIVE_QUESTION_TYPE_CODE[question.type] || 2;
}

// 判断题目是否为主观题。
export function isSubjectiveQuestion(question) {
  if (!question) {
    return false;
  }

  return question.type === SUBJECTIVE_QUESTION_TYPE || question.category === 'subjective';
}

// 从选题 mock 全量列表中按 id 查找题目。
export function findQuestionById(questionId, questionsByTabMap) {
  for (const list of Object.values(questionsByTabMap)) {
    const matched = list.find((item) => item.id === questionId);
    if (matched) {
      return matched;
    }
  }

  return null;
}

// 将已选题目 id 列表拆分为主观题与客观题。
export function splitSelectedQuestionIds(questionIds, questionsByTabMap) {
  const subjectiveIds = [];
  const objectiveIds = [];

  questionIds.forEach((questionId) => {
    const question = findQuestionById(questionId, questionsByTabMap);
    if (isSubjectiveQuestion(question)) {
      subjectiveIds.push(questionId);
      return;
    }

    objectiveIds.push(questionId);
  });

  return { subjectiveIds, objectiveIds };
}
