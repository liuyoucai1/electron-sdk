const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  request: (payload) => ipcRenderer.invoke('backend:request', payload),
  setFullscreenPage: (enabled) => ipcRenderer.invoke('window:set-fullscreen-page', enabled),
  setMousePassthrough: (enabled) => ipcRenderer.invoke('window:set-mouse-passthrough', enabled),
  setInteractiveRegions: (regions) => ipcRenderer.invoke('window:set-interactive-regions', regions),
  startRegionScreenshot: () => ipcRenderer.invoke('screenshot:start-region'),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  quit: () => ipcRenderer.invoke('app:quit')
});
