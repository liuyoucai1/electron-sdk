/**
 * 背读判分页 mock 数据。
 * 正式接入后由 IPC / postMessage 实时推送覆盖。
 */
import { enrichReadReciteStudentsWithDetails } from "./readReciteStudentAnalysis.js";

const STATUS_LABELS = {
  excellent: "优秀",
  good: "良好",
  pass: "及格",
  "needs-improvement": "待改进",
  unanswered: "未答",
};

const MOCK_STUDENTS = [
  { name: "张三", status: "excellent" },
  { name: "李四", status: "good" },
  { name: "王五", status: "pass" },
  { name: "赵六", status: "needs-improvement" },
  { name: "孙七", status: "excellent" },
  { name: "周八", status: "good" },
  { name: "吴九", status: "pass" },
  { name: "郑十", status: "excellent" },
  { name: "钱一", status: "good" },
  { name: "陈二", status: "excellent" },
  { name: "刘三", status: "excellent" },
  { name: "林四", status: "pass" },
  { name: "黄五", status: "needs-improvement" },
  { name: "何六", status: "excellent" },
  { name: "马七", status: "good" },
  { name: "许八", status: "pass" },
  { name: "朱九", status: "excellent" },
  { name: "胡十", status: "good" },
  { name: "郭一", status: "excellent" },
  { name: "罗二", status: "good" },
  { name: "高三", status: "pass" },
  { name: "梁四", status: "excellent" },
  { name: "宋五", status: "good" },
  { name: "韩六", status: "needs-improvement" },
  { name: "唐七", status: "excellent" },
  { name: "冯八", status: "good" },
  { name: "未答一", status: "unanswered" },
  { name: "未答二", status: "unanswered" },
  { name: "未答三", status: "unanswered" },
  { name: "未答四", status: "unanswered" },
];

// 将段落列表转为 HTML 字符串（mock 用；正式数据直接给 HTML）。
export function paragraphsToHtml(paragraphs = []) {
  if (!paragraphs.length) {
    return "<p></p>";
  }

  return paragraphs
    .map((item) => `<p>${item.content || ""}</p>`)
    .join("");
}

// 根据学生列表统计作答分布。
function buildDistributions(students) {
  const total = students.length || 1;
  const buckets = [
    { status: "excellent", label: STATUS_LABELS.excellent },
    { status: "good", label: STATUS_LABELS.good },
    { status: "pass", label: STATUS_LABELS.pass },
    { status: "needs-improvement", label: STATUS_LABELS["needs-improvement"] },
    { status: "unanswered", label: STATUS_LABELS.unanswered },
  ];

  return buckets.map((bucket) => {
    const count = students.filter((item) => item.status === bucket.status).length;
    return {
      ...bucket,
      count,
      percent: Math.round((count / total) * 100),
    };
  });
}

// 构建各评分档对应的学生姓名列表。
function buildStudentListMap(students) {
  const map = {};

  Object.values(STATUS_LABELS).forEach((label) => {
    map[label] = [];
  });

  students.forEach((student) => {
    const label = STATUS_LABELS[student.status];
    if (label) {
      map[label].push(student.name);
    }
  });

  return map;
}

/**
 * 创建背读判分页 mock 分析数据。
 * @param {Record<string, unknown>} session 背读答题会话。
 */
export function createMockReadReciteAnalysis(session = {}) {
  const students = enrichReadReciteStudentsWithDetails(
    MOCK_STUDENTS.map((item) => ({ ...item })),
  );
  const distributions = buildDistributions(students);
  const studentListMap = buildStudentListMap(students);
  const answeredCount = students.filter((item) => item.status !== "unanswered").length;
  const totalStudents = students.length;
  const passCount = students.filter((item) =>
    ["excellent", "good", "pass"].includes(item.status),
  ).length;

  const contentHtml =
    session.contentHtml ||
    paragraphsToHtml(session.paragraphs) ||
    "<p>Ancient, camp, strange, vacation, fantastic, town, take sb's breath away...</p>";

  return {
    pageTitle: session.reciteType === "read" ? "朗读分析" : "背诵分析",
    subtitle: session.title || "背诵内容",
    contentHtml,
    students,
    distributions,
    studentListMap,
    stats: {
      answeredCount,
      totalStudents,
      passRate: Math.round((passCount / totalStudents) * 100),
    },
    aiGradingComplete: true,
    reciteType: session.reciteType || "recite",
    standard: session.standard || "standard",
    tab: session.tab || "textbook",
    contentId: session.contentId || null,
  };
}

export { STATUS_LABELS };
