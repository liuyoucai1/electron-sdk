import { createMockReadReciteAnalysis } from "../../../../mock/readReciteAnalysis.js";

/**
 * 根据背读答题会话构建判分页初始数据（当前为 mock，后续由 IPC 实时更新）。
 * @param {Record<string, unknown>} session flowStore.answerProgressState
 */
export function buildReadReciteAnalysis(session = {}) {
  return createMockReadReciteAnalysis(session);
}
