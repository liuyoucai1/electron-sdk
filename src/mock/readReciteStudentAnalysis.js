import { STATUS_LABELS } from "./readReciteAnalysis.js";
import { MOCK_WAVEFORM_HEIGHTS } from "./voiceStudentAnalysis.js";

const MOCK_TRANSCRIPT =
  "盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。";

const MOCK_COMPARISON_SEGMENTS = [
  { text: "盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山", type: "correct" },
  { text: "朗润", type: "error" },
  { text: "起来了，水", type: "correct" },
  { text: "涨", type: "error" },
  { text: "起来了，太阳的脸", type: "correct" },
  { text: "红", type: "error" },
  { text: "起来了。", type: "correct" },
];

const DIMENSION_TEMPLATES = {
  excellent: [
    { key: "pronunciation", label: "发音准确度", score: 33, max: 35, weight: 35 },
    { key: "fluency", label: "流利度", score: 24, max: 25, weight: 25 },
    { key: "rhythm", label: "韵律语调", score: 24, max: 25, weight: 25 },
    { key: "completeness", label: "完整度", score: 13, max: 15, weight: 15 },
  ],
  good: [
    { key: "pronunciation", label: "发音准确度", score: 28, max: 35, weight: 35 },
    { key: "fluency", label: "流利度", score: 20, max: 25, weight: 25 },
    { key: "rhythm", label: "韵律语调", score: 19, max: 25, weight: 25 },
    { key: "completeness", label: "完整度", score: 11, max: 15, weight: 15 },
  ],
  pass: [
    { key: "pronunciation", label: "发音准确度", score: 24, max: 35, weight: 35 },
    { key: "fluency", label: "流利度", score: 17, max: 25, weight: 25 },
    { key: "rhythm", label: "韵律语调", score: 16, max: 25, weight: 25 },
    { key: "completeness", label: "完整度", score: 9, max: 15, weight: 15 },
  ],
  "needs-improvement": [
    { key: "pronunciation", label: "发音准确度", score: 18, max: 35, weight: 35 },
    { key: "fluency", label: "流利度", score: 12, max: 25, weight: 25 },
    { key: "rhythm", label: "韵律语调", score: 11, max: 25, weight: 25 },
    { key: "completeness", label: "完整度", score: 6, max: 15, weight: 15 },
  ],
};

const SCORE_BY_STATUS = {
  excellent: 94,
  good: 78,
  pass: 66,
  "needs-improvement": 52,
};

// 根据评分档生成维度得分。
function buildDimensions(status) {
  const template = DIMENSION_TEMPLATES[status] || DIMENSION_TEMPLATES.good;
  return template.map((item) => ({ ...item }));
}

// 计算综合得分。
function buildTotalScore(status, dimensions) {
  if (status === "excellent" && dimensions[0]?.score === 33) {
    return 94;
  }

  return SCORE_BY_STATUS[status] || dimensions.reduce((sum, item) => sum + item.score, 0);
}

/**
 * 为背读学生列表补充详情字段（转写、原文对照、维度得分等）。
 * @param {Array<Record<string, unknown>>} students
 */
export function enrichReadReciteStudentsWithDetails(students = []) {
  return students.map((student) => {
    if (student.status === "unanswered") {
      return { ...student };
    }

    const dimensions = buildDimensions(student.status);
    const score = buildTotalScore(student.status, dimensions);

    return {
      ...student,
      text: student.text || MOCK_TRANSCRIPT,
      comparisonSegments: student.comparisonSegments || MOCK_COMPARISON_SEGMENTS,
      score,
      levelLabel: STATUS_LABELS[student.status] || "良好",
      dimensions,
      durationSeconds: student.durationSeconds || 57,
    };
  });
}

export { MOCK_WAVEFORM_HEIGHTS, MOCK_COMPARISON_SEGMENTS };
