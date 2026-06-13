/**
 * 背读内容分段 mock 数据。
 * 正式接入后由教材/作文接口返回 paragraphs 列表。
 */
const DEFAULT_PARAGRAPHS = [
  { id: 1, label: "第1段", content: "Conversation 1" },
  { id: 2, label: "第2段", content: "Hi, Yaming. How was your vacation?" },
  {
    id: 3,
    label: "第3段",
    content: "Hi, Emma. It was great, I went to Mount Huangshan.",
  },
];

const TEXTBOOK_PARAGRAPHS = {
  word: [
    { id: 1, label: "第1段", content: "Ancient" },
    { id: 2, label: "第2段", content: "camp / strange / vacation" },
    { id: 3, label: "第3段", content: "fantastic / town / take sb's breath away" },
  ],
  secA_1b: DEFAULT_PARAGRAPHS,
  secA_2a: [
    { id: 1, label: "第1段", content: "Hi, Peter. How are you?" },
    { id: 2, label: "第2段", content: "Hi, Adam. I'm fine, thanks." },
    { id: 3, label: "第3段", content: "What did you do last weekend?" },
  ],
  secA_3a: [
    { id: 1, label: "第1段", content: "Reading passage introduction." },
    { id: 2, label: "第2段", content: "Main idea and supporting details." },
  ],
};

const ESSAY_PARAGRAPHS = {
  my_ideal: [
    { id: 1, label: "第1段", content: "每个人都有自己的理想，我的理想是成为一名优秀的教师。" },
    { id: 2, label: "第2段", content: "教师是人类灵魂的工程师，承担着传道授业解惑的重任。" },
    { id: 3, label: "第3段", content: "为了实现这个理想，我现在努力学习，将来考入师范大学。" },
  ],
  memorable_day: [
    { id: 1, label: "第1段", content: "那是一个阳光明媚的早晨，我和家人一起去爬山。" },
    { id: 2, label: "第2段", content: "山路蜿蜒，风景如画，我们一路欢声笑语。" },
    { id: 3, label: "第3段", content: "这次旅行让我更加珍惜与家人在一起的时光。" },
  ],
  my_hometown: [
    { id: 1, label: "第1段", content: "我的家乡是一个美丽的小镇，那里山清水秀。" },
    { id: 2, label: "第2段", content: "春天百花盛开，夏天绿树成荫，秋天稻谷飘香。" },
    { id: 3, label: "第3段", content: "无论走到哪里，我都深深眷恋着我的家乡。" },
  ],
};

// 获取教材背诵项的分段列表。
export function getTextbookParagraphs(contentId) {
  return TEXTBOOK_PARAGRAPHS[contentId] || DEFAULT_PARAGRAPHS;
}

// 获取满分作文的分段列表。
export function getEssayParagraphs(contentId) {
  return ESSAY_PARAGRAPHS[contentId] || DEFAULT_PARAGRAPHS;
}
