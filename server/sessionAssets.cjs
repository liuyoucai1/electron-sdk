const fs = require('fs');
const path = require('path');
const os = require('os');

const STORE_DIR = path.join(os.tmpdir(), 'electron-skd-session-assets');

// 确保本地会话资源目录存在。
function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
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

  const assetId = `${payload.sessionId || 'session'}-${Date.now()}`;
  const imagePath = path.join(STORE_DIR, `${assetId}.png`);
  const metaPath = path.join(STORE_DIR, `${assetId}.json`);

  fs.writeFileSync(imagePath, Buffer.from(imageBase64, 'base64'));
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
  if (!assetId) {
    return { ok: false, error: 'missing_asset_id' };
  }

  const imagePath = path.join(STORE_DIR, `${assetId}.png`);
  const metaPath = path.join(STORE_DIR, `${assetId}.json`);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }

  return { ok: true, data: { assetId } };
}

module.exports = {
  saveScreenshotAsset,
  releaseScreenshotAsset,
};
