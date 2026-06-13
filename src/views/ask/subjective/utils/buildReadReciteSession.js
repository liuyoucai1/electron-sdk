import {
  getEssayParagraphs,
  getTextbookParagraphs,
} from "../../../../mock/reciteParagraphs.js";

// 将自定义文本拆成段落列表。
function paragraphsFromCustomText(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return [{ id: 1, label: "第1段", content: "" }];
  }

  return trimmed
    .split(/\n+/)
    .filter(Boolean)
    .map((content, index) => ({
      id: index + 1,
      label: `第${index + 1}段`,
      content,
    }));
}

// 规范化段落结构，供全屏答题页展示。
function normalizeParagraphs(list) {
  return (list || []).map((item, index) => ({
    id: item.id ?? index + 1,
    label: item.label || `第${index + 1}段`,
    content: item.content || "",
  }));
}

/**
 * 根据背读小屏提交载荷构建全屏答题会话数据。
 * @param {Record<string, unknown>} payload ReadReciteWidget 发出的 start-read-recite 载荷。
 */
export function buildReadReciteSession(payload = {}) {
  const tab = payload.tab || "textbook";
  let title = payload.contentTitle || "";
  let paragraphs = [];

  if (Array.isArray(payload.selectedParagraphs) && payload.selectedParagraphs.length) {
    paragraphs = normalizeParagraphs(payload.selectedParagraphs);
  } else if (tab === "custom") {
    title = title || "自定义内容";
    paragraphs = paragraphsFromCustomText(payload.content);
  } else if (tab === "essay") {
    paragraphs = normalizeParagraphs(getEssayParagraphs(payload.contentId));
  } else {
    paragraphs = normalizeParagraphs(getTextbookParagraphs(payload.contentId));
  }

  if (!title) {
    title = "背诵内容";
  }

  return {
    reciteType: payload.reciteType || "recite",
    standard: payload.standard || "standard",
    tab,
    contentId: payload.contentId || null,
    title,
    paragraphs,
    textbook: payload.textbook || null,
    subject: payload.subject || null,
  };
}
