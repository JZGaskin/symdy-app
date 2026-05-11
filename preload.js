/**
 * Symdy Desktop — preload script.
 * Exposes safe IPC methods to the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('symdy', {
  // Send a message to pi
  send: (message) => ipcRenderer.invoke('send-message', message),

  // Get connection status
  getStatus: () => ipcRenderer.invoke('get-status'),

  // Listen for events from pi
  onEvent: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('pi-event', handler);
    return () => ipcRenderer.removeListener('pi-event', handler);
  }
});
