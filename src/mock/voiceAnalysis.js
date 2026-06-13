/**
 * 语音分析页 mock 数据。
 * 正式接入后由 IPC / postMessage 实时推送覆盖。
 */
import { enrichStudentsWithDetails } from "./voiceStudentAnalysis.js";

const STATUS_LABELS = {
  excellent: "优秀",
  good: "良好",
  pass: "及格",
  "needs-improvement": "待改进",
  unanswered: "未答",
  pending: "待评分",
};

const MOCK_WORD_CLOUD = [
  { text: "老师", size: "xl", color: "black" },
  { text: "学习", size: "lg", color: "green" },
  { text: "阳光", size: "md", color: "teal" },
  { text: "快乐", size: "lg", color: "green" },
  { text: "友谊", size: "xl", color: "black" },
  { text: "活动", size: "lg", color: "teal" },
  { text: "团结", size: "sm", color: "green" },
  { text: "操场", size: "md", color: "green" },
  { text: "图书馆", size: "sm", color: "teal" },
  { text: "自由", size: "sm", color: "green" },
];

const MOCK_STUDENT_ANSWERS = [
  {
    name: "张三",
    status: "excellent",
    text: "我理想的校园充满阳光，同学们在操场上奔跑，图书馆里安静学习，老师耐心讲解。",
  },
  {
    name: "李四",
    status: "good",
    text: "理想校园应该有丰富的社团活动，让同学们找到自己的兴趣，结交志同道合的朋友。",
  },
  {
    name: "王五",
    status: "pass",
    text: "校园里要有宽阔的运动场地，课间可以打球，学习和运动都不耽误。",
  },
  {
    name: "赵六",
    status: "excellent",
    text: "我希望校园里有更多绿色植物，环境优美，让我们心情舒畅，学习效率也会更高。",
  },
  {
    name: "孙七",
    status: "excellent",
    text: "理想的校园要师生关系融洽，老师像朋友一样和我们交流，不只是讲课。",
  },
  {
    name: "周八",
    status: "good",
    text: "校园应该有先进的设备，科学实验室、计算机房都要齐全，支持我们探索学习。",
  },
  {
    name: "吴九",
    status: "pass",
    text: "我向往自由开放的校园氛围，让同学们敢于表达自己的想法和创意。",
  },
  {
    name: "郑十",
    status: "excellent",
    text: "理想校园里有专业的心理辅导室，帮助同学们解决成长中的烦恼和压力。",
  },
];

const MOCK_EXCELLENT_ANSWERS = [
  {
    name: "张三",
    level: "excellent",
    text: "我理想的校园充满阳光，同学们在操场上奔跑，图书馆里安静学习，老师耐心讲解，每个人都能找到自己的闪光点。",
  },
  {
    name: "王五",
    level: "pass",
    text: "校园应该是自由开放的地方，有丰富的社团活动和多样的课外读物，让我们在快乐中成长。",
  },
  {
    name: "陈二",
    level: "excellent",
    text: "理想校园里师生关系融洽，像朋友一样交流，课外活动和团队合作让我们更有凝聚力。",
  },
];

function buildDistributions(students, hasQuestion) {
  if (!hasQuestion) {
    return [];
  }

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
function buildStudentListMap(students, hasQuestion) {
  const map = {};

  Object.values(STATUS_LABELS).forEach((label) => {
    if (label !== STATUS_LABELS.pending) {
      map[label] = [];
    }
  });

  if (!hasQuestion) {
    return map;
  }

  students.forEach((student) => {
    const label = STATUS_LABELS[student.status];
    if (label && map[label]) {
      map[label].push(student.name);
    }
  });

  return map;
}

function resolveHasQuestion(session = {}) {
  if (session.deferQuestionSetup) {
    return false;
  }

  return Boolean(
    session.hasQuestion ||
      session.questionText ||
      session.contentHtml ||
      session.imageSrc ||
      session.imageBase64,
  );
}

/**
 * 创建语音分析页 mock 数据。
 * @param {Record<string, unknown>} session 语音答题会话或已有分析状态。
 */
export function createMockVoiceAnalysis(session = {}) {
  const hasQuestion = resolveHasQuestion(session);
  const students = enrichStudentsWithDetails(
    MOCK_STUDENT_ANSWERS.map((item) => ({
      ...item,
      status: hasQuestion ? item.status : "pending",
    })),
    hasQuestion,
  );
  const distributions = buildDistributions(students, hasQuestion);
  const studentListMap = buildStudentListMap(students, hasQuestion);
  const answeredCount = students.length;
  const totalStudents = 30;
  const passCount = hasQuestion
    ? students.filter((item) => ["excellent", "good", "pass"].includes(item.status)).length
    : 0;

  const contentHtml = session.contentHtml || "";
  const questionText = session.questionText || "";
  const contentType = session.contentType || (session.imageSrc ? "image" : "html");

  return {
    pageTitle: "语音分析",
    subtitle: "语音题答题结果",
    hasQuestion,
    deferQuestionSetup: Boolean(session.deferQuestionSetup),
    questionMode: session.questionMode || (hasQuestion ? "voice" : null),
    questionText,
    contentHtml,
    contentType,
    imageSrc: session.imageSrc || "",
    imageBase64: session.imageBase64 || "",
    mimeType: session.mimeType || "image/png",
    wordCloud: MOCK_WORD_CLOUD,
    students,
    excellentAnswers: hasQuestion ? MOCK_EXCELLENT_ANSWERS : [],
    distributions,
    studentListMap,
    stats: {
      answeredCount,
      totalStudents,
      passRate: hasQuestion ? Math.round((passCount / totalStudents) * 100) : 0,
    },
    aiGradingComplete: hasQuestion,
  };
}

export { STATUS_LABELS };
