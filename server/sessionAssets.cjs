const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const STORE_DIR = path.join(os.tmpdir(), 'electron-skd-session-assets');
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ASSET_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 确保本地会话资源目录存在。
function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

// 判断资源 ID 是否为主进程生成的安全 UUID。
function isSafeAssetId(assetId) {
  return typeof assetId === 'string' && ASSET_ID_PATTERN.test(assetId);
}

// 解析资源文件路径，并确保最终路径仍在本地资源目录内。
function resolveAssetPath(assetId, extension) {
  if (!isSafeAssetId(assetId)) {
    return null;
  }

  const resolvedStoreDir = path.resolve(STORE_DIR);
  const resolvedPath = path.resolve(STORE_DIR, `${assetId}.${extension}`);
  const boundary = `${resolvedStoreDir}${path.sep}`;

  if (!resolvedPath.startsWith(boundary)) {
    return null;
  }

  return resolvedPath;
}

// 校验 base64 图片，避免超大 payload 阻塞主进程或耗尽磁盘。
function decodeImageBase64(imageBase64) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) {
    return { ok: false, error: 'invalid_base64' };
  }

  const estimatedBytes = Math.floor((imageBase64.length * 3) / 4);
  if (estimatedBytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'image_too_large' };
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  if (buffer.length > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'image_too_large' };
  }

  return { ok: true, buffer };
}

/**
 * 会话结束时将截屏题目写入本地待同步库（当前为本地文件，后续可换 SQLite）。
 * 有网络后由 Node 同步到 OSS / 后端，同步成功后再调用 releaseScreenshotAsset 删除。
 */
function saveScreenshotAsset(payload = {}) {
  const imageBase64 = payload.imageBase64 || '';
  if (!imageBase64) {
    return { ok: false, error: 'empty_image' };
  }

  ensureStoreDir();

  const decoded = decodeImageBase64(imageBase64);
  if (!decoded.ok) {
    return decoded;
  }

  const assetId = crypto.randomUUID();
  const imagePath = resolveAssetPath(assetId, 'png');
  const metaPath = resolveAssetPath(assetId, 'json');

  if (!imagePath || !metaPath) {
    return { ok: false, error: 'invalid_asset_path' };
  }

  fs.writeFileSync(imagePath, decoded.buffer);
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        id: assetId,
        sessionId: payload.sessionId || null,
        sourceType: payload.sourceType || 'screenshot',
        mimeType: payload.mimeType || 'image/png',
        bounds: payload.bounds || null,
        imagePath,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  return {
    ok: true,
    data: {
      assetId,
      imagePath,
      syncStatus: 'pending',
    },
  };
}

// 同步完成后删除本地截屏文件与元数据。
function releaseScreenshotAsset(assetId) {
  if (!isSafeAssetId(assetId)) {
    return { ok: false, error: 'invalid_asset_id' };
  }

  const imagePath = resolveAssetPath(assetId, 'png');
  const metaPath = resolveAssetPath(assetId, 'json');

  if (!imagePath || !metaPath) {
    return { ok: false, error: 'invalid_asset_path' };
  }

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }

  return { ok: true, data: { assetId } };
}

module.exports = {
  STORE_DIR,
  saveScreenshotAsset,
  releaseScreenshotAsset,
};
