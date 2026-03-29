const { app, BrowserWindow, session, ipcMain, Menu, clipboard } = require('electron');
const path = require('path');

let cookiePolicy = {
  enabled: true,
  level: 'blockAll',
  exceptions: [
    { domain: 'google.com', action: 'allow' },
    { domain: 'youtube.com', action: 'allow' }
  ]
};

function getHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function matchesException(host, exceptionDomain) {
  if (!host || !exceptionDomain) return false;
  const normalizedHost = host.toLowerCase();
  const normalizedDomain = exceptionDomain.toLowerCase();
  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

function getOrigin(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`;
  } catch {
    return '';
  }
}

function shouldBlockCookies(details) {
  const urlHost = getHost(details.url);
  const initiator = details.initiator || details.referrer || '';
  const initiatorHost = getHost(initiator);
  const isThirdParty = initiatorHost && initiatorHost !== urlHost;
  const requestOrigin = getOrigin(details.url);
  const initiatorOrigin = getOrigin(initiator);
  const isCrossSite = initiatorOrigin && requestOrigin && initiatorOrigin !== requestOrigin;

  for (const exception of cookiePolicy.exceptions || []) {
    if (!exception.domain) continue;
    if (matchesException(urlHost, exception.domain)) {
      return exception.action === 'block';
    }
  }

  if (!cookiePolicy.enabled) {
    return true;
  }

  if (cookiePolicy.level === 'allowAll') return false;
  if (cookiePolicy.level === 'blockThirdParty') return isThirdParty;
  if (cookiePolicy.level === 'blockCrossSite') return isCrossSite;
  if (cookiePolicy.level === 'blockAll') return true;
  return false;
}

app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 940,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      webviewTag: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(false);
  });

  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['*://*/*'] }, (details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    if (shouldBlockCookies(details)) {
      for (const header of Object.keys(requestHeaders)) {
        if (header.toLowerCase() === 'cookie') {
          delete requestHeaders[header];
        }
      }
    }
    callback({ requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived({ urls: ['*://*/*'] }, (details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    if (shouldBlockCookies(details)) {
      for (const header of Object.keys(responseHeaders)) {
        if (header.toLowerCase() === 'set-cookie') {
          delete responseHeaders[header];
        }
      }
    }
    callback({ responseHeaders });
  });

  app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      webPreferences.preload = '';
      webPreferences.preloadURL = '';
      webPreferences.nodeIntegration = false;
      webPreferences.nodeIntegrationInSubFrames = false;
      webPreferences.nodeIntegrationInWorker = false;
      webPreferences.contextIsolation = true;
      webPreferences.sandbox = true;
      webPreferences.webSecurity = true;
      webPreferences.allowRunningInsecureContent = false;
    });
  });

  ipcMain.handle('show-context-menu', (event, params) => {
    const menuTemplate = [];

    if (params.linkURL) {
      menuTemplate.push({
        label: 'Open Link in New Tab',
        click: () => event.sender.send('context-menu-command', { command: 'open-link', url: params.linkURL })
      });
      menuTemplate.push({
        label: 'Copy Link Address',
        click: () => clipboard.writeText(params.linkURL)
      });
    }

    if (params.mediaType === 'image' && params.srcURL) {
      menuTemplate.push({
        label: 'Open Image in New Tab',
        click: () => event.sender.send('context-menu-command', { command: 'open-link', url: params.srcURL })
      });
      menuTemplate.push({
        label: 'Copy Image Address',
        click: () => clipboard.writeText(params.srcURL)
      });
    }

    if (params.selectionText) {
      menuTemplate.push({ type: 'separator' });
      menuTemplate.push({ role: 'copy', label: 'Copy' });
    }

    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: 'Inspect Element',
      click: () => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) window.webContents.openDevTools({ mode: 'right' });
      }
    });

    const menu = Menu.buildFromTemplate(menuTemplate.filter(Boolean));
    const window = BrowserWindow.fromWebContents(event.sender);
    menu.popup({ window });
  });

  ipcMain.handle('browser-clear-data', async (event, type) => {
    const ses = session.defaultSession;
    try {
      switch (type) {
        case 'cookies':
          await ses.clearStorageData({ storages: ['cookies'] });
          break;
        case 'storage':
          await ses.clearStorageData({ storages: ['localstorage', 'indexdb', 'serviceworkers', 'caches'] });
          break;
        case 'all':
          await ses.clearStorageData({ storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'serviceworkers', 'caches'] });
          break;
        case 'passwords':
          await ses.clearAuthCache();
          break;
        default:
          break;
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('close-app', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) window.close();
    return { success: true };
  });

  ipcMain.handle('set-cookie-policy', (event, policy) => {
    if (policy && typeof policy === 'object') {
      cookiePolicy.enabled = policy.enabled === true;
      cookiePolicy.level = ['allowAll', 'blockThirdParty', 'blockCrossSite', 'blockAll'].includes(policy.level)
        ? policy.level
        : 'blockThirdParty';
      if (Array.isArray(policy.exceptions)) {
        cookiePolicy.exceptions = policy.exceptions
          .filter((exception) => exception && exception.domain)
          .map((exception) => ({
            domain: exception.domain.toLowerCase(),
            action: exception.action === 'block' ? 'block' : 'allow'
          }));
      }
    }
    return { success: true, policy: cookiePolicy };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
