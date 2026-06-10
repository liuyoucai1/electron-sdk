const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { createBackend } = require('../server/backend.cjs');

const isDev = !app.isPackaged;
let overlayWindow;
let backend;
let interactiveRegions = [];
let fullscreenPage = false;
let passthroughEnabled = false;
let hitTestTimer;

function applyMousePassthrough(enabled) {
  if (!overlayWindow || passthroughEnabled === enabled) {
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
  if (!overlayWindow || fullscreenPage) {
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
      nodeIntegration: false
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
  ipcMain.handle('backend:request', async (_event, request) => {
    return backend.handleRequest(request);
  });

  ipcMain.handle('window:set-fullscreen-page', (_event, enabled) => {
    if (!overlayWindow) {
      return false;
    }

    fullscreenPage = Boolean(enabled);
    applyMousePassthrough(!fullscreenPage);
    updateMousePassthroughFromCursor();
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    return fullscreenPage;
  });

  ipcMain.handle('window:set-mouse-passthrough', (_event, enabled) => {
    if (!overlayWindow) {
      return false;
    }

    applyMousePassthrough(Boolean(enabled));
    return Boolean(enabled);
  });

  ipcMain.handle('window:set-interactive-regions', (_event, regions) => {
    interactiveRegions = Array.isArray(regions)
      ? regions
          .filter((region) => region && region.width > 0 && region.height > 0)
          .map((region) => ({
            x: Number(region.x) || 0,
            y: Number(region.y) || 0,
            width: Number(region.width) || 0,
            height: Number(region.height) || 0
          }))
      : [];
    updateMousePassthroughFromCursor();
    return interactiveRegions.length;
  });

  ipcMain.handle('app:get-version', () => app.getVersion());
}

app.whenReady().then(async () => {
  backend = createBackend();
  await backend.start();
  registerIpc();
  createOverlayWindow();

  overlayWindow.once('ready-to-show', () => {
    applyMousePassthrough(true);
    startHitTesting();
  });
});

app.on('before-quit', async () => {
  if (hitTestTimer) {
    clearInterval(hitTestTimer);
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
