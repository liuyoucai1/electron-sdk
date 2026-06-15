const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const { createBackend } = require('../server/backend.cjs');
const { createScreenshotService } = require('./screenshot.cjs');

const isDev = !app.isPackaged;
let overlayWindow;
let backend;
let screenshotService;
let interactiveRegions = [];
let fullscreenPage = false;
let passthroughEnabled = false;
let hitTestTimer;
const MAX_INTERACTIVE_REGIONS = 80;

function isTrustedSender(event) {
  const frameUrl = event.senderFrame?.url || '';

  if (isDev) {
    return frameUrl.startsWith('http://127.0.0.1:5173/');
  }

  return frameUrl.startsWith('file://') && frameUrl.includes('/dist/index.html');
}

function rejectUntrustedSender(event, fallback = false) {
  if (isTrustedSender(event)) {
    return null;
  }

  console.warn(`Blocked IPC from untrusted sender: ${event.senderFrame?.url || 'unknown'}`);
  return fallback;
}

function applyMousePassthrough(enabled) {
  if (!overlayWindow || overlayWindow.isDestroyed() || passthroughEnabled === enabled) {
    return;
  }

  passthroughEnabled = enabled;
  overlayWindow.setIgnoreMouseEvents(enabled, { forward: true });
}

function pointInRegion(point, region) {
  return (
    point.x >= region.x &&
    point.x <= region.x + region.width &&
    point.y >= region.y &&
    point.y <= region.y + region.height
  );
}

function updateMousePassthroughFromCursor() {
  if (!overlayWindow || overlayWindow.isDestroyed() || fullscreenPage) {
    applyMousePassthrough(false);
    return;
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const windowBounds = overlayWindow.getBounds();
  const localPoint = {
    x: cursorPoint.x - windowBounds.x,
    y: cursorPoint.y - windowBounds.y
  };
  const overInteractiveRegion = interactiveRegions.some((region) =>
    pointInRegion(localPoint, region)
  );

  applyMousePassthrough(!overInteractiveRegion);
}

function startHitTesting() {
  if (hitTestTimer) {
    return;
  }

  hitTestTimer = setInterval(updateMousePassthroughFromCursor, 50);
}

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { bounds } = primaryDisplay;

  overlayWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  overlayWindow.webContents.on('will-navigate', (event, url) => {
    const allowedUrl = isDev
      ? url.startsWith('http://127.0.0.1:5173/')
      : url.startsWith('file://') && url.includes('/dist/index.html');

    if (!allowedUrl) {
      event.preventDefault();
    }
  });

  overlayWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  overlayWindow.on('closed', () => {
    overlayWindow = undefined;
    if (hitTestTimer) {
      clearInterval(hitTestTimer);
      hitTestTimer = undefined;
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    overlayWindow.loadURL('http://127.0.0.1:5173');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function registerIpc() {
  ipcMain.handle('backend:request', async (event, request) => {
    const rejected = rejectUntrustedSender(event, {
      ok: false,
      error: 'untrusted_sender'
    });
    if (rejected) {
      return rejected;
    }

    return backend.handleRequest(request);
  });

  ipcMain.handle('window:set-fullscreen-page', (event, enabled) => {
    const rejected = rejectUntrustedSender(event);
    if (rejected !== null) {
      return rejected;
    }

    if (!overlayWindow) {
      return false;
    }

    fullscreenPage = Boolean(enabled);
    applyMousePassthrough(!fullscreenPage);
    updateMousePassthroughFromCursor();
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    return fullscreenPage;
  });

  ipcMain.handle('window:set-mouse-passthrough', (event, enabled) => {
    const rejected = rejectUntrustedSender(event);
    if (rejected !== null) {
      return rejected;
    }

    if (!overlayWindow) {
      return false;
    }

    applyMousePassthrough(Boolean(enabled));
    return Boolean(enabled);
  });

  ipcMain.handle('window:set-interactive-regions', (event, regions) => {
    const rejected = rejectUntrustedSender(event, 0);
    if (rejected !== null) {
      return rejected;
    }

    const bounds = overlayWindow?.getBounds() || { width: 1920, height: 1080 };
    interactiveRegions = Array.isArray(regions)
      ? regions
          .slice(0, MAX_INTERACTIVE_REGIONS)
          .filter((region) => region && region.width > 0 && region.height > 0)
          .map((region) => ({
            x: Math.max(0, Math.min(Number(region.x) || 0, bounds.width)),
            y: Math.max(0, Math.min(Number(region.y) || 0, bounds.height)),
            width: Math.max(0, Math.min(Number(region.width) || 0, bounds.width)),
            height: Math.max(0, Math.min(Number(region.height) || 0, bounds.height))
          }))
      : [];
    updateMousePassthroughFromCursor();
    return interactiveRegions.length;
  });

  ipcMain.handle('app:get-version', (event) => {
    const rejected = rejectUntrustedSender(event, '');
    if (rejected !== null) {
      return rejected;
    }

    return app.getVersion();
  });

  ipcMain.handle('screenshot:start-region', async (event) => {
    const rejected = rejectUntrustedSender(event, {
      ok: false,
      cancelled: true,
      error: 'untrusted_sender'
    });
    if (rejected) {
      return rejected;
    }

    if (!screenshotService) {
      return {
        ok: false,
        cancelled: true,
        error: 'screenshot_unavailable'
      };
    }

    return screenshotService.startRegionCapture();
  });

  ipcMain.handle('app:quit', (event) => {
    const rejected = rejectUntrustedSender(event);
    if (rejected !== null) {
      return rejected;
    }

    app.quit();
  });
}

app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.electron.skd');
  }

  backend = createBackend();
  await backend.start();
  registerIpc();
  createOverlayWindow();
  screenshotService = createScreenshotService({ overlayWindow });

  overlayWindow.once('ready-to-show', () => {
    applyMousePassthrough(true);
    startHitTesting();
  });

  // 开发环境：F12 打开/关闭 DevTools，便于查看 Console 报错。
  if (isDev) {
    globalShortcut.register('F12', () => {
      if (!overlayWindow) {
        return;
      }

      if (overlayWindow.webContents.isDevToolsOpened()) {
        overlayWindow.webContents.closeDevTools();
      } else {
        overlayWindow.webContents.openDevTools({ mode: 'detach' });
      }
    });
  }
});

app.on('will-quit', () => {
  if (isDev) {
    globalShortcut.unregisterAll();
  }
});

app.on('before-quit', async () => {
  if (hitTestTimer) {
    clearInterval(hitTestTimer);
    hitTestTimer = undefined;
  }

  if (backend) {
    await backend.stop();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
