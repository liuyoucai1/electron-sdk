import { requestBackend } from "./ipc.js";
import { revokeImageSrc } from "../views/ask/subjective/utils/resolveImageSrc.js";

let activeImageBlobUrl = null;

// 登记当前会话正在使用的 Blob URL，便于统一释放。
export function registerSessionImageBlob(imageSrc) {
  if (!imageSrc?.startsWith("blob:")) {
    return;
  }

  if (activeImageBlobUrl && activeImageBlobUrl !== imageSrc) {
    revokeImageSrc(activeImageBlobUrl);
  }

  activeImageBlobUrl = imageSrc;
}

// 释放内存中的图片资源（Blob URL），不删除已落库的本地文件。
export function releaseSessionImageMemory(session = {}) {
  if (session.imageSrc) {
    revokeImageSrc(session.imageSrc);
  }

  if (activeImageBlobUrl) {
    revokeImageSrc(activeImageBlobUrl);
    activeImageBlobUrl = null;
  }
}

// 会话结束时将截屏题目写入本地库，后续由 Node 同步到 OSS / 后端。
export async function persistScreenshotSessionAsset(payload = {}) {
  return requestBackend({
    type: "save-session-screenshot",
    sessionId: payload.sessionId || null,
    sourceType: payload.sourceType || "screenshot",
    imageBase64: payload.imageBase64 || "",
    mimeType: payload.mimeType || "image/png",
    bounds: payload.bounds || null,
  });
}

// 同步完成后删除本地截屏缓存文件。
export async function releasePersistedScreenshotAsset(assetId) {
  if (!assetId) {
    return { ok: false, error: "missing_asset_id" };
  }

  return requestBackend({
    type: "release-session-screenshot",
    assetId,
  });
}

/**
 * 截屏答题链路结束：先快照并释放前端内存，再异步落本地库。
 * @param {import('pinia').Store} flowStore
 */
export function finalizeScreenshotSession(flowStore) {
  const session = flowStore.answerProgressState || {};
  const screenshotState = flowStore.screenshotQuestionState || {};
  const payload = {
    sessionId: flowStore.sessionId,
    sourceType: "screenshot",
    imageBase64: session.imageBase64 || screenshotState.imageBase64 || "",
    mimeType: session.mimeType || screenshotState.mimeType || "image/png",
    bounds: session.bounds || screenshotState.bounds || null,
  };

  releaseSessionImageMemory(session);
  flowStore.clearScreenshotSessionState();

  if (!payload.imageBase64) {
    return Promise.resolve({ ok: false, error: "empty_image" });
  }

  return persistScreenshotSessionAsset(payload).catch((error) => {
    console.error("截屏题目落库失败:", error);
    return { ok: false, error: error?.message || "persist_failed" };
  });
}
