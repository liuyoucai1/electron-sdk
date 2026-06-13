// 规范化截图 base64，兼容字符串、data URL 前缀与 Buffer 序列化结构。
export function normalizeBase64Value(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.replace(/^data:image\/[\w+.-]+;base64,/, "").trim();
  }

  if (value instanceof Uint8Array) {
    let binary = "";
    value.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  if (Array.isArray(value)) {
    return normalizeBase64Value(Uint8Array.from(value));
  }

  if (value?.type === "Buffer" && Array.isArray(value.data)) {
    return normalizeBase64Value(value.data);
  }

  return "";
}

// 从 base64 创建 Blob URL。
export function toBlobUrlFromBase64(base64, mimeType = "image/png") {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

// 将 data URL 转为 Blob URL，降低浏览器对超长 data URL 的限制影响。
export function toBlobUrlFromDataUrl(dataUrl) {
  try {
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mimeType = mimeMatch?.[1] || "image/png";
    return toBlobUrlFromBase64(base64, mimeType);
  } catch {
    return "";
  }
}

// 将截图数据解析为可展示的 image src（优先 Blob URL，避免超长 data URL 失效）。
export function resolveImageSrc(state = {}) {
  if (
    state.imageSrc &&
    (state.imageSrc.startsWith("blob:") || state.imageSrc.startsWith("data:image"))
  ) {
    return state.imageSrc;
  }

  if (state.imageDataUrl?.startsWith("data:image")) {
    return toBlobUrlFromDataUrl(state.imageDataUrl) || state.imageDataUrl;
  }

  const base64 = normalizeBase64Value(state.imageBase64);
  if (!base64) {
    return "";
  }

  const mimeType = state.mimeType || "image/png";
  return toBlobUrlFromBase64(base64, mimeType) || `data:${mimeType};base64,${base64}`;
}

// 释放 Blob URL，避免内存泄漏。
export function revokeImageSrc(imageSrc) {
  if (imageSrc?.startsWith("blob:")) {
    URL.revokeObjectURL(imageSrc);
  }
}
