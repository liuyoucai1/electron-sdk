import { createMockVoiceAnalysis } from "../../../../mock/voiceAnalysis.js";

/**
 * 根据语音答题会话构建语音分析页初始数据（当前为 mock，后续由 IPC 实时更新）。
 * @param {Record<string, unknown>} session flowStore.answerProgressState
 */
export function buildVoiceAnalysis(session = {}) {
  return createMockVoiceAnalysis(session);
}

/**
 * 在分析页补设题目后，合并题目信息并重新生成评分态 mock。
 * @param {Record<string, unknown>} current 当前 voiceAnalysisState
 * @param {Record<string, unknown>} questionPayload 新题目载荷
 */
export function buildVoiceAnalysisWithQuestion(current = {}, questionPayload = {}) {
  return createMockVoiceAnalysis({
    ...current,
    ...questionPayload,
    deferQuestionSetup: false,
    hasQuestion: true,
  });
}

/**
 * 将语音分析状态映射为背读判分缩屏可复用的数据结构。
 * @param {Record<string, unknown>} voiceAnalysis
 */
export function mapVoiceAnalysisToReadReciteState(voiceAnalysis = {}) {
  const hasQuestion = Boolean(voiceAnalysis.hasQuestion);
  const students = (voiceAnalysis.students || []).map((item) => ({
    name: item.name,
    status: hasQuestion ? item.status : "unanswered",
  }));

  return {
    sourceType: "voice",
    pageTitle: voiceAnalysis.pageTitle || "语音分析",
    subtitle: voiceAnalysis.subtitle || "语音题答题结果",
    contentHtml:
      voiceAnalysis.contentHtml ||
      voiceAnalysis.questionText ||
      "<p></p>",
    students,
    distributions: voiceAnalysis.distributions || [],
    studentListMap: voiceAnalysis.studentListMap || {},
    stats: voiceAnalysis.stats || {
      answeredCount: 0,
      totalStudents: 0,
      passRate: 0,
    },
    aiGradingComplete: voiceAnalysis.aiGradingComplete === true,
    reciteType: "read",
  };
}
