export async function requestBackend(payload) {
  if (!window.electronBridge?.request) {
    return {
      ok: false,
      error: 'Electron IPC bridge is unavailable.'
    };
  }

  return window.electronBridge.request(payload);
}
