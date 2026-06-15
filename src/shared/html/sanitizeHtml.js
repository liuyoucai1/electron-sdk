const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

// 转义纯文本中的 HTML 特殊字符。
export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

// 将纯文本按行转为安全段落 HTML。
export function plainTextToSafeHtml(text = "") {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return "<p></p>";
  }

  return trimmed
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

// 将段落列表转为安全段落 HTML。
export function paragraphsToSafeHtml(paragraphs = []) {
  if (!paragraphs.length) {
    return "<p></p>";
  }

  return paragraphs
    .map((item) => `<p>${escapeHtml(item.content || "")}</p>`)
    .join("");
}

// 针对业务内 HTML 做轻量净化，移除脚本、危险 URL 和事件属性。
export function sanitizeTrustedHtml(html = "") {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/\s(href|src)\s*=\s*"javascript:[^"]*"/gi, "")
    .replace(/\s(href|src)\s*=\s*'javascript:[^']*'/gi, "");
}
