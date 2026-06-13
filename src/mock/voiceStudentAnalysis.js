import { STATUS_LABELS } from "./voiceAnalysis.js";

const MOCK_STUDENT_DETAILS = {
  张三: {
    score: 92,
    levelLabel: "优秀",
    suggestion:
      "表达流畅自然，观点鲜明，细节丰富。建议在举例说明上再补充一两个具体场景。",
    durationSeconds: 52,
  },
  李四: {
    score: 78,
    levelLabel: "良好",
    suggestion:
      "答案结构清晰，要点覆盖较全面。建议加强结尾总结，让观点更完整。",
    durationSeconds: 41,
  },
  王五: {
    score: 65,
    levelLabel: "及格",
    suggestion:
      "基本回答了题目要求，表达较为朴实。建议丰富词汇并补充具体事例。",
    durationSeconds: 35,
  },
  赵六: {
    score: 90,
    levelLabel: "优秀",
    suggestion:
      "语言生动，观察细致，能够联系自身感受。继续保持并尝试更有层次的表达。",
    durationSeconds: 48,
  },
  孙七: {
    score: 94,
    levelLabel: "优秀",
    suggestion:
      "立意积极，逻辑顺畅，情感真挚。可进一步拓展对校园建设的思考深度。",
    durationSeconds: 55,
  },
  周八: {
    score: 63,
    levelLabel: "良好",
    suggestion:
      "答案结构清晰，要点覆盖较全面，表达较为自然。建议在细节描述和语言丰富性上进一步提升。",
    durationSeconds: 47,
  },
  吴九: {
    score: 68,
    levelLabel: "及格",
    suggestion:
      "能够表达主要想法，语气自然。建议围绕题目要点逐条展开，避免过于简略。",
    durationSeconds: 38,
  },
  郑十: {
    score: 86,
    levelLabel: "优秀",
    suggestion:
      "内容完整，条理清楚，有真情实感。可尝试使用更多连接词增强连贯性。",
    durationSeconds: 44,
  },
};

// 模拟波形高度数据。
export const MOCK_WAVEFORM_HEIGHTS = [
  8, 12, 16, 24, 20, 16, 8, 12, 16, 12, 8, 20, 24, 28, 16, 12, 8, 16, 20, 24,
  16, 12, 8, 12, 20, 28, 24, 16, 12, 16, 20, 12, 8, 12, 16, 8,
];

/**
 * 为学生列表补充详情字段（得分、等级、评语、时长）。
 * @param {Array<Record<string, unknown>>} students
 * @param {boolean} hasQuestion
 */
export function enrichStudentsWithDetails(students = [], hasQuestion = false) {
  return students.map((student) => {
    const detail = MOCK_STUDENT_DETAILS[student.name] || {
      score: 70,
      levelLabel: STATUS_LABELS[student.status] || "良好",
      suggestion: "表达较为自然，建议继续练习口语组织与细节描述。",
      durationSeconds: 40,
    };

    if (!hasQuestion || student.status === "pending") {
      return {
        ...student,
        score: null,
        levelLabel: null,
        suggestion: null,
        durationSeconds: detail.durationSeconds,
      };
    }

    return {
      ...student,
      ...detail,
      levelLabel: detail.levelLabel || STATUS_LABELS[student.status] || "良好",
    };
  });
}

export { MOCK_STUDENT_DETAILS };
