import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  saveScreenshotAsset,
  releaseScreenshotAsset,
  STORE_DIR
} = require("../../server/sessionAssets.cjs");

test("saveScreenshotAsset creates an internal safe asset id", () => {
  const result = saveScreenshotAsset({
    sessionId: "../outside",
    imageBase64: Buffer.from("png").toString("base64")
  });

  assert.equal(result.ok, true);
  assert.match(result.data.assetId, /^[0-9a-f-]{36}$/i);
  assert.equal(result.data.imagePath.startsWith(path.resolve(STORE_DIR)), true);

  releaseScreenshotAsset(result.data.assetId);
});

test("releaseScreenshotAsset rejects path traversal ids", () => {
  const outsidePath = path.join(os.tmpdir(), "electron-skd-outside.png");
  fs.writeFileSync(outsidePath, "keep");

  const result = releaseScreenshotAsset("../electron-skd-outside");

  assert.equal(result.ok, false);
  assert.equal(fs.existsSync(outsidePath), true);
  fs.unlinkSync(outsidePath);
});
