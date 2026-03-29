const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => shell.openExternal(url),
  showContextMenu: (params) => ipcRenderer.invoke('show-context-menu', params),
  onContextMenuCommand: (callback) => ipcRenderer.on('context-menu-command', (event, data) => callback(data)),
  clearBrowserData: (type) => ipcRenderer.invoke('browser-clear-data', type),
  setCookiePolicy: (policy) => ipcRenderer.invoke('set-cookie-policy', policy),
  closeApp: () => ipcRenderer.invoke('close-app')
});
