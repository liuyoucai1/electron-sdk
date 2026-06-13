import { normalizeBase64Value } from "../views/ask/subjective/utils/resolveImageSrc.js";

/**
 * 调用 Electron 主进程区域截图能力。
 * 基于 electron-screenshots，用户可拖拽选区并点击确定/取消。
 */
export async function startRegionScreenshot() {
  if (!window.electronBridge?.startRegionScreenshot) {
    return {
      ok: false,
      cancelled: true,
      error: "Electron screenshot bridge is unavailable.",
    };
  }

  const result = await window.electronBridge.startRegionScreenshot();
  if (!result?.ok || result.cancelled) {
    return result;
  }

  const imageBase64 =
    normalizeBase64Value(result.imageBase64) ||
    (typeof result.imageBase64 === "string" ? result.imageBase64.trim() : "");

  if (!imageBase64) {
    return {
      ok: false,
      cancelled: true,
      error: "screenshot_empty",
    };
  }

  return {
    ...result,
    imageBase64,
    mimeType: result.mimeType || "image/png",
  };
}
