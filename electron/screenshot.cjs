const Screenshots = require('electron-screenshots');

const SCREENSHOT_LANG = {
  magnifier_position_label: '坐标',
  operation_ok_title: '确定',
  operation_cancel_title: '取消',
  operation_save_title: '保存',
  operation_redo_title: '重做',
  operation_undo_title: '撤销',
  operation_mosaic_title: '马赛克',
  operation_text_title: '文本',
  operation_brush_title: '画笔',
  operation_arrow_title: '箭头',
  operation_ellipse_title: '椭圆',
  operation_rectangle_title: '矩形'
};

/**
 * 创建区域截图服务，基于 electron-screenshots。
 * @param {{ overlayWindow?: import('electron').BrowserWindow | null }} options
 */
function createScreenshotService(options = {}) {
  const { overlayWindow = null } = options;
  const screenshots = new Screenshots({
    singleWindow: true,
    lang: SCREENSHOT_LANG
  });

  let pendingResolve = null;

  // 截图结束后恢复业务悬浮窗显示。
  function restoreOverlayWindow() {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      return;
    }

    overlayWindow.show();
    overlayWindow.focus();
  }

  // 开始截图前隐藏业务悬浮窗，避免截进自身 UI。
  function hideOverlayWindow() {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      return;
    }

    overlayWindow.hide();
  }

  // 结束一次截图 Promise。
  function settle(result) {
    restoreOverlayWindow();

    if (typeof pendingResolve === 'function') {
      pendingResolve(result);
      pendingResolve = null;
    }
  }

  // 将截图插件返回的 buffer 统一转为 base64 字符串。
  function convertCaptureBufferToBase64(buffer) {
    if (!buffer) {
      return '';
    }

    if (Buffer.isBuffer(buffer)) {
      return buffer.toString('base64');
    }

    if (buffer instanceof Uint8Array) {
      return Buffer.from(buffer).toString('base64');
    }

    if (Array.isArray(buffer)) {
      return Buffer.from(buffer).toString('base64');
    }

    if (typeof buffer.toString === 'function') {
      return buffer.toString('base64');
    }

    return '';
  }

  screenshots.on('ok', (_event, buffer, data) => {
    const imageBase64 = convertCaptureBufferToBase64(buffer);

    settle({
      ok: true,
      cancelled: false,
      imageBase64,
      mimeType: 'image/png',
      bounds: data?.bounds || null,
      display: data?.display || null
    });
  });

  screenshots.on('cancel', () => {
    settle({
      ok: true,
      cancelled: true
    });
  });

  return {
    screenshots,
    // 打开全屏选区截图，返回 base64 图片或取消状态。
    startRegionCapture() {
      if (typeof pendingResolve === 'function') {
        return Promise.resolve({
          ok: false,
          cancelled: true,
          error: 'screenshot_busy'
        });
      }

      return new Promise((resolve) => {
        pendingResolve = resolve;
        hideOverlayWindow();

        screenshots.startCapture().catch((error) => {
          settle({
            ok: false,
            cancelled: true,
            error: error?.message || 'screenshot_failed'
          });
        });
      });
    }
  };
}

module.exports = {
  createScreenshotService
};
