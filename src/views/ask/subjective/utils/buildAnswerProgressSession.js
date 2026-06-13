import { buildReadReciteSession } from "./buildReadReciteSession.js";
import {
  normalizeBase64Value,
  resolveImageSrc,
  revokeImageSrc,
} from "./resolveImageSrc.js";

// 将纯文本转为 HTML 段落，供左侧 v-html 渲染。
function plainTextToHtml(text = "") {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return "<p></p>";
  }

  return trimmed
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

// 将段落列表转为 HTML，供左侧 v-html 渲染。
function paragraphsToHtml(paragraphs = []) {
  if (!paragraphs.length) {
    return "<p></p>";
  }

  return paragraphs
    .map((item) => `<p>${item.content || ""}</p>`)
    .join("");
}

/**
 * 从背读小屏载荷构建通用答题进行中会话。
 * @param {Record<string, unknown>} payload
 */
export function buildAnswerProgressFromReadRecite(payload = {}) {
  const readRecite = buildReadReciteSession(payload);

  return {
    sourceType: "read-recite",
    contentType: "html",
    title: readRecite.title,
    contentHtml: payload.contentHtml || paragraphsToHtml(readRecite.paragraphs),
    imageDataUrl: null,
    paragraphs: readRecite.paragraphs,
    reciteType: readRecite.reciteType,
    standard: readRecite.standard,
    tab: readRecite.tab,
    contentId: readRecite.contentId,
    textbook: readRecite.textbook,
    subject: readRecite.subject,
    allowHideContent: true,
  };
}

/**
 * 从语音/文字出题结果构建通用答题进行中会话。
 * @param {Record<string, unknown>} payload
 */
export function buildAnswerProgressFromVoice(payload = {}) {
  const deferQuestionSetup = Boolean(payload.deferQuestionSetup);
  const questionText = deferQuestionSetup
    ? ""
    : String(payload.questionText || "").trim();

  return {
    sourceType: "voice",
    contentType: "html",
    deferQuestionSetup,
    title: payload.title || "",
    contentHtml: deferQuestionSetup
      ? ""
      : payload.contentHtml || plainTextToHtml(questionText),
    questionText,
    imageDataUrl: null,
    imageSrc: null,
    paragraphs: null,
    reciteType: null,
    allowHideContent: false,
  };
}

/**
 * 从截屏出题结果构建通用答题进行中会话。
 * @param {Record<string, unknown>} screenshotState
 */
export function buildAnswerProgressFromScreenshot(screenshotState = {}) {
  const mimeType = screenshotState.mimeType || "image/png";
  const imageBase64 =
    normalizeBase64Value(screenshotState.imageBase64) ||
    normalizeBase64Value(
      screenshotState.imageDataUrl?.includes(",")
        ? screenshotState.imageDataUrl.split(",")[1]
        : "",
    );
  const imageSrc = resolveImageSrc({
    imageBase64,
    mimeType,
    imageDataUrl: screenshotState.imageDataUrl,
  });

  return {
    sourceType: "screenshot",
    contentType: "image",
    title: screenshotState.title || "截屏题目",
    contentHtml: null,
    imageBase64,
    imageDataUrl: imageSrc.startsWith("data:") ? imageSrc : "",
    imageSrc,
    mimeType,
    paragraphs: null,
    reciteType: null,
    bounds: screenshotState.bounds || null,
    allowHideContent: false,
  };
}

/**
 * 规范化答题进行中会话，兼容旧版 readReciteState 结构。
 * @param {Record<string, unknown>} session
 */
export function normalizeAnswerProgressSession(session = {}) {
  if (!session || typeof session !== "object") {
    return buildAnswerProgressFromReadRecite({});
  }

  if (
    session.sourceType === "screenshot" ||
    session.imageSrc ||
    session.imageDataUrl ||
    session.imageBase64
  ) {
    return buildAnswerProgressFromScreenshot(session);
  }

  if (session.sourceType === "voice") {
    return {
      ...buildAnswerProgressFromVoice(session),
      ...session,
      contentHtml: session.deferQuestionSetup
        ? ""
        : session.contentHtml ||
          plainTextToHtml(session.questionText || ""),
      allowHideContent: false,
    };
  }

  if (session.sourceType === "read-recite") {
    return {
      ...buildAnswerProgressFromReadRecite(session),
      ...session,
      contentHtml:
        session.contentHtml ||
        paragraphsToHtml(session.paragraphs || []),
      allowHideContent: true,
    };
  }

  if (session.paragraphs || session.reciteType) {
    return buildAnswerProgressFromReadRecite(session);
  }

  return buildAnswerProgressFromReadRecite({});
}

export { revokeImageSrc };
