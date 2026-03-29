const DEFAULT_HOME = 'https://www.duckduckgo.com/';
const tabStrip = document.getElementById('tab-strip');
const newTabBtn = document.getElementById('new-tab-btn');
const closeAppBtn = document.getElementById('close-app-btn');
const addressBar = document.getElementById('address-bar');
const navBack = document.getElementById('nav-back');
const navForward = document.getElementById('nav-forward');
const navReload = document.getElementById('nav-reload');
const navReloadIcon = navReload.querySelector('.reload-icon');
const navHome = document.getElementById('nav-home');
const webviewContainer = document.getElementById('webview-container');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');
const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsSections = document.querySelectorAll('.settings-section');
const keybindAction = document.getElementById('tab-middle-click-action');
const themeAccent = document.getElementById('theme-accent');
const themeSurface = document.getElementById('theme-surface');
const themeBackground = document.getElementById('theme-background');
const themeBorderColor = document.getElementById('theme-border-color');
const themeBorderWidth = document.getElementById('theme-border-width');
const themeTabActiveBg = document.getElementById('theme-tab-active-bg');
const themeTabInactiveBg = document.getElementById('theme-tab-inactive-bg');
const themeTabActiveText = document.getElementById('theme-tab-active-text');
const themeTabInactiveText = document.getElementById('theme-tab-inactive-text');
const themeSettingsFontColor = document.getElementById('theme-settings-font-color');
const themeGradient = document.getElementById('theme-gradient');
const themeGradientAccent = document.getElementById('theme-gradient-accent');
const themeGradientSurface = document.getElementById('theme-gradient-surface');
const themeGradientTabActive = document.getElementById('theme-gradient-tab-active');
const themeGradientTabInactive = document.getElementById('theme-gradient-tab-inactive');
const themeGradientControls = document.querySelectorAll('.theme-gradient-dependent');
const themeGlow = document.getElementById('theme-glow');
const credentialSaveModal = document.getElementById('credential-save-modal');
const credentialSaveText = document.getElementById('credential-save-text');
const credentialSaveConfirm = document.getElementById('credential-save-confirm');
const credentialSaveDismiss = document.getElementById('credential-save-dismiss');
const videoPopoutBtn = document.getElementById('video-popout-btn');
let pendingCredential = null;
const cookieEnabled = document.getElementById('cookie-enabled');
const cookieLevel = document.getElementById('cookie-level');
const cookieExceptionDomain1 = document.getElementById('cookie-exception-domain-1');
const cookieExceptionAction1 = document.getElementById('cookie-exception-action-1');
const cookieExceptionDomain2 = document.getElementById('cookie-exception-domain-2');
const cookieExceptionAction2 = document.getElementById('cookie-exception-action-2');
const cookieExceptionDomain3 = document.getElementById('cookie-exception-domain-3');
const cookieExceptionAction3 = document.getElementById('cookie-exception-action-3');
const cookieExceptionDomain4 = document.getElementById('cookie-exception-domain-4');
const cookieExceptionAction4 = document.getElementById('cookie-exception-action-4');
const searchOverlay = document.getElementById('search-overlay');
const searchOverlayInput = document.getElementById('search-overlay-input');
const shortcutOpenSearch = document.getElementById('shortcut-open-search');
const shortcutMuteTab = document.getElementById('shortcut-mute-tab');
const shortcutRefreshTab = document.getElementById('shortcut-refresh-tab');
const websiteShortcutKey1 = document.getElementById('website-shortcut-key-1');
const websiteShortcutUrl1 = document.getElementById('website-shortcut-url-1');
const websiteShortcutKey2 = document.getElementById('website-shortcut-key-2');
const websiteShortcutUrl2 = document.getElementById('website-shortcut-url-2');
const websiteShortcutKey3 = document.getElementById('website-shortcut-key-3');
const websiteShortcutUrl3 = document.getElementById('website-shortcut-url-3');
const clearCookiesBtn = document.getElementById('clear-cookies-btn');
const clearStorageBtn = document.getElementById('clear-storage-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const clearPasswordsBtn = document.getElementById('clear-passwords-btn');
const privacyStatus = document.getElementById('privacy-status');

const SETTINGS_KEY = 'davosBrowserSettings';
const defaultSettings = {
  keybinds: {
    tabMiddleClick: 'close',
    openSearch: 'Control+Space',
    muteTab: 'Control+M',
    refreshTab: 'F5',
    websites: [
      { key: 'Alt+1', url: '' },
      { key: 'Alt+2', url: '' },
      { key: 'Alt+3', url: '' }
    ]
  },
  theme: {
    accent: '#7c3aed',
    surface: '#ffffff',
    background: '#eef1f6',
    panel: '#f8fbff',
    input: '#fbfdff',
    borderColor: '#94a3b8',
    borderWidth: '1px',
    tabActiveBg: '#ffffff',
    tabInactiveBg: 'rgba(255, 255, 255, 0.85)',
    tabActiveText: '#111827',
    tabInactiveText: '#111827',
    settingsFontColor: '#111827',
    gradient: false,
    gradientAccent: '#7c3aed',
    gradientSurface: '#f8fbff',
    gradientTabActive: '#ffffff',
    gradientTabInactive: 'rgba(255, 255, 255, 0.85)',
    glow: true,
    text: '#111827'
  },
  privacy: {
    cookiesEnabled: true,
    cookieLevel: 'blockAll',
    exceptions: [
      { domain: 'google.com', action: 'allow' },
      { domain: 'youtube.com', action: 'allow' },
      { domain: '', action: 'allow' },
      { domain: '', action: 'allow' }
    ]
  },
  credentials: []
};

let settings = loadSettings();
applyTheme(settings.theme);
applyCookiePolicy(settings.privacy);

function deepMerge(defaultValues, savedValues) {
  const merged = { ...defaultValues };
  for (const key in savedValues) {
    if (savedValues[key] && typeof savedValues[key] === 'object' && !Array.isArray(savedValues[key])) {
      merged[key] = deepMerge(defaultValues[key] || {}, savedValues[key]);
    } else {
      merged[key] = savedValues[key];
    }
  }
  return merged;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return deepMerge(defaultSettings, {});
    return deepMerge(defaultSettings, JSON.parse(raw));
  } catch (error) {
    return deepMerge(defaultSettings, {});
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function cleanDomain(value) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

function loadCookieExceptionsFromUI() {
  settings.privacy.exceptions = [
    { domain: cleanDomain(cookieExceptionDomain1.value), action: cookieExceptionAction1.value },
    { domain: cleanDomain(cookieExceptionDomain2.value), action: cookieExceptionAction2.value },
    { domain: cleanDomain(cookieExceptionDomain3.value), action: cookieExceptionAction3.value },
    { domain: cleanDomain(cookieExceptionDomain4.value), action: cookieExceptionAction4.value }
  ].filter((exception) => exception.domain);
  saveSettings();
}

function findSavedCredential(host) {
  if (!host || !settings.credentials) return null;
  return settings.credentials.find((credential) => {
    const credentialHost = credential.host.toLowerCase();
    const normalizedHost = host.toLowerCase();
    return normalizedHost === credentialHost || normalizedHost.endsWith(`.${credentialHost}`);
  });
}

function addOrUpdateSavedCredential(host, username, password) {
  if (!host || !username || !password) return;
  const normalizedHost = host.toLowerCase();
  const existing = settings.credentials.find((credential) => credential.host.toLowerCase() === normalizedHost && credential.username === username);
  if (existing) {
    existing.password = password;
  } else {
    settings.credentials.push({ host: normalizedHost, username, password });
  }
  saveSettings();
}

function showCredentialSavePrompt(host, username, password) {
  if (!credentialSaveModal || !credentialSaveText) return;
  pendingCredential = { host, username, password };
  credentialSaveText.textContent = `Save login for ${host}?`;
  credentialSaveModal.classList.add('open');
  credentialSaveModal.setAttribute('aria-hidden', 'false');
}

function hideCredentialSavePrompt() {
  if (!credentialSaveModal) return;
  pendingCredential = null;
  credentialSaveModal.classList.remove('open');
  credentialSaveModal.setAttribute('aria-hidden', 'true');
}

function savePendingCredential() {
  if (!pendingCredential) return;
  addOrUpdateSavedCredential(pendingCredential.host, pendingCredential.username, pendingCredential.password);
  hideCredentialSavePrompt();
}

function fillCredentialsForTab(tab) {
  const credential = findSavedCredential(getHost(tab.url));
  if (!credential || !tab || !tab.webview) return;
  const script = `(() => {
    const username = ${JSON.stringify(credential.username)};
    const password = ${JSON.stringify(credential.password)};
    const inputs = Array.from(document.querySelectorAll('input'));
    const passwordInput = inputs.find((input) => input.type === 'password');
    if (!passwordInput) return false;
    const usernameInput = inputs.find((input) => {
      const type = (input.type || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      return type === 'text' || type === 'email' || name.includes('user') || name.includes('email') || id.includes('user') || id.includes('email') || placeholder.includes('user') || placeholder.includes('email');
    }) || inputs.find((input) => input.type === 'text' || input.type === 'email');
    if (usernameInput) {
      usernameInput.value = username;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })();`;
  tab.webview.executeJavaScript(script, true).catch(() => null);
}

function captureCredentialsForTab(tab) {
  if (!tab || !tab.webview) return;
  const script = `new Promise((resolve) => {
    function getFields() {
      const passwordInput = document.querySelector('input[type="password"]');
      if (!passwordInput || !passwordInput.value) return null;
      const candidates = Array.from(document.querySelectorAll('input')).filter((input) => {
        const type = (input.type || '').toLowerCase();
        return type === 'text' || type === 'email';
      });
      const usernameInput = candidates.find((input) => {
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        return name.includes('user') || name.includes('email') || id.includes('user') || id.includes('email') || placeholder.includes('user') || placeholder.includes('email');
      }) || candidates[0];
      if (!usernameInput || !usernameInput.value) return null;
      return { username: usernameInput.value, password: passwordInput.value };
    }

    let resolved = false;
    function cleanup() {
      resolved = true;
      document.removeEventListener('input', onUserInput, true);
      document.removeEventListener('change', onUserInput, true);
      document.removeEventListener('blur', onUserInput, true);
      document.removeEventListener('keyup', onUserInput, true);
      document.removeEventListener('submit', onSubmit, true);
      observer.disconnect();
      clearTimeout(timeout);
    }

    function sendIfReady() {
      if (resolved) return;
      const value = getFields();
      if (value) {
        cleanup();
        resolve(value);
      }
    }

    function onUserInput() {
      sendIfReady();
    }

    function onSubmit() {
      sendIfReady();
    }

    const observer = new MutationObserver(sendIfReady);
    observer.observe(document, { childList: true, subtree: true });
    document.addEventListener('input', onUserInput, true);
    document.addEventListener('change', onUserInput, true);
    document.addEventListener('blur', onUserInput, true);
    document.addEventListener('keyup', onUserInput, true);
    document.addEventListener('submit', onSubmit, true);

    const timeout = setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve(null);
      }
    }, 25000);

    sendIfReady();
  });`;

  tab.webview.executeJavaScript(script, true).then((matched) => {
    if (!matched || !matched.username || !matched.password) return;
    const host = getHost(tab.url);
    if (!findSavedCredential(host)) {
      showCredentialSavePrompt(host, matched.username, matched.password);
    }
  }).catch(() => null);
}

function setupCredentialHandling(tab) {
  fillCredentialsForTab(tab);
  captureCredentialsForTab(tab);
}

async function applyCookiePolicy(privacy) {
  if (!window.electronAPI || !window.electronAPI.setCookiePolicy) return;
  const policy = {
    enabled: privacy.cookiesEnabled,
    level: privacy.cookieLevel,
    exceptions: privacy.exceptions || []
  };
  await window.electronAPI.setCookiePolicy(policy);
}

function popoutActiveVideo() {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.webview) return;
  tab.webview.executeJavaScript(`(async () => {
    const video = document.querySelector('video');
    if (!video) return false;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return true;
    }
    if (video.readyState >= 3) {
      await video.requestPictureInPicture();
      return true;
    }
    return false;
  })();`, true).catch(() => null);
}

let videoPopoutTimer = null;

function setVideoPopoutVisible(visible) {
  if (!videoPopoutBtn) return;
  videoPopoutBtn.style.display = 'inline-flex';
}

function refreshVideoPopoutButtonState() {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.webview) {
    setVideoPopoutVisible(false);
    return;
  }
  tab.webview.executeJavaScript(`(function() {
    const video = document.querySelector('video');
    return !!(video && !video.paused && !video.ended && video.readyState >= 3);
  })();`, true).then((isPlaying) => {
    setVideoPopoutVisible(Boolean(isPlaying));
  }).catch(() => {
    setVideoPopoutVisible(false);
  });
}

function startVideoPopoutPolling() {
  if (videoPopoutTimer) return;
  refreshVideoPopoutButtonState();
  videoPopoutTimer = setInterval(refreshVideoPopoutButtonState, 1200);
}

function stopVideoPopoutPolling() {
  if (!videoPopoutTimer) return;
  clearInterval(videoPopoutTimer);
  videoPopoutTimer = null;
}

function normalizeShortcut(combo) {
  if (!combo || typeof combo !== 'string') return '';
  const parts = combo.split('+').map((part) => part.trim()).filter(Boolean);
  const normalized = [];
  parts.forEach((part) => {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') {
      if (!normalized.includes('Control')) normalized.push('Control');
      return;
    }
    if (lower === 'alt') {
      if (!normalized.includes('Alt')) normalized.push('Alt');
      return;
    }
    if (lower === 'shift') {
      if (!normalized.includes('Shift')) normalized.push('Shift');
      return;
    }
    if (lower === 'meta' || lower === 'cmd' || lower === 'win' || lower === 'command') {
      if (!normalized.includes('Meta')) normalized.push('Meta');
      return;
    }
    if (lower === 'space' || lower === 'spacebar') {
      normalized.push('Space');
      return;
    }
    if (lower.length === 1) {
      normalized.push(lower.toUpperCase());
    } else {
      normalized.push(part);
    }
  });
  const order = ['Control', 'Alt', 'Shift', 'Meta'];
  const sorted = normalized.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return sorted.join('+');
}

function getEventShortcut(event) {
  const keys = [];
  if (event.ctrlKey) keys.push('Control');
  if (event.altKey) keys.push('Alt');
  if (event.shiftKey) keys.push('Shift');
  if (event.metaKey) keys.push('Meta');
  let key = event.key;
  if (!key) return '';
  if (key === ' ') key = 'Space';
  if (key === 'Esc') key = 'Escape';
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    return normalizeShortcut(keys.join('+'));
  }
  if (key.length === 1) key = key.toUpperCase();
  keys.push(key);
  return normalizeShortcut(keys.join('+'));
}

function isEditableTarget(target) {
  return target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

function openSearchOverlay() {
  if (!searchOverlay || !searchOverlayInput) return;
  searchOverlay.classList.add('open');
  searchOverlay.setAttribute('aria-hidden', 'false');
  searchOverlayInput.value = '';
  searchOverlayInput.focus();
}

function closeSearchOverlay() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove('open');
  searchOverlay.setAttribute('aria-hidden', 'true');
}

function toggleMuteActiveTab() {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.webview) return;
  const isMuted = tab.webview.isAudioMuted();
  tab.webview.setAudioMuted(!isMuted);
}

function refreshActiveTab() {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (tab && tab.webview) tab.webview.reload();
}

function loadWebsiteShortcut(shortcut) {
  if (!shortcut || !shortcut.url) return;
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.webview) return;
  tab.webview.loadURL(normalizeUrl(shortcut.url));
}

function getActiveShortcutValue(value) {
  return normalizeShortcut(value || '');
}

function matchShortcut(eventShortcut, settingShortcut) {
  return eventShortcut && normalizeShortcut(eventShortcut) === normalizeShortcut(settingShortcut);
}

function saveWebsiteShortcuts() {
  settings.keybinds.websites = [
    { key: websiteShortcutKey1.value.trim(), url: websiteShortcutUrl1.value.trim() },
    { key: websiteShortcutKey2.value.trim(), url: websiteShortcutUrl2.value.trim() },
    { key: websiteShortcutKey3.value.trim(), url: websiteShortcutUrl3.value.trim() }
  ];
  saveSettings();
}

function handleGlobalKeydown(event) {
  if (event.defaultPrevented) return;
  if (isEditableTarget(document.activeElement)) return;
  const shortcut = getEventShortcut(event);
  if (!shortcut) return;

  if (matchShortcut(shortcut, settings.keybinds.openSearch)) {
    event.preventDefault();
    openSearchOverlay();
    return;
  }

  if (matchShortcut(shortcut, settings.keybinds.muteTab)) {
    event.preventDefault();
    toggleMuteActiveTab();
    return;
  }

  if (matchShortcut(shortcut, settings.keybinds.refreshTab)) {
    event.preventDefault();
    refreshActiveTab();
    return;
  }

  for (const shortcutItem of settings.keybinds.websites || []) {
    if (shortcutItem.key && shortcutItem.url && matchShortcut(shortcut, shortcutItem.key)) {
      event.preventDefault();
      loadWebsiteShortcut(shortcutItem);
      return;
    }
  }
}

function handleSearchOverlayKeydown(event) {
  if (!searchOverlay || !searchOverlay.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSearchOverlay();
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    const value = searchOverlayInput.value.trim();
    closeSearchOverlay();
    const tab = tabs.find((item) => item.id === activeTabId);
    if (tab && tab.webview) tab.webview.loadURL(normalizeUrl(value));
  }
}

function hexToRgba(hex, alpha) {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((x) => x + x).join('');
  }
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--surface', theme.gradient ? `linear-gradient(135deg, ${theme.surface}, ${theme.gradientSurface})` : theme.surface);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--input-bg', theme.input);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--button-bg', theme.surface);
  root.style.setProperty('--button-hover', hexToRgba(theme.accent, 0.08));
  root.style.setProperty('--newtab-bg', hexToRgba(theme.accent, 0.12));
  root.style.setProperty('--accent-soft', hexToRgba(theme.accent, 0.12));
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--border-width', theme.borderWidth);
  root.style.setProperty('--tab-active-bg', theme.gradient ? `linear-gradient(135deg, ${theme.tabActiveBg}, ${theme.gradientTabActive})` : theme.tabActiveBg);
  root.style.setProperty('--tab-inactive-bg', theme.gradient ? `linear-gradient(135deg, ${theme.tabInactiveBg}, ${theme.gradientTabInactive})` : theme.tabInactiveBg);
  root.style.setProperty('--tab-active-text', theme.tabActiveText);
  root.style.setProperty('--tab-inactive-text', theme.tabInactiveText);
  root.style.setProperty('--settings-font-color', theme.settingsFontColor);
  root.style.setProperty('--background', theme.gradient ? `linear-gradient(135deg, ${theme.gradientAccent}, ${theme.gradientSurface})` : theme.background);
  root.style.setProperty('--shadow', theme.glow ? '0 18px 45px rgba(74, 41, 181, 0.08)' : '0 14px 28px rgba(15, 23, 42, 0.06)');
}

function populateSettingsUI() {
  keybindAction.value = settings.keybinds.tabMiddleClick;
  shortcutOpenSearch.value = settings.keybinds.openSearch;
  shortcutMuteTab.value = settings.keybinds.muteTab;
  shortcutRefreshTab.value = settings.keybinds.refreshTab;
  websiteShortcutKey1.value = settings.keybinds.websites[0]?.key || '';
  websiteShortcutUrl1.value = settings.keybinds.websites[0]?.url || '';
  websiteShortcutKey2.value = settings.keybinds.websites[1]?.key || '';
  websiteShortcutUrl2.value = settings.keybinds.websites[1]?.url || '';
  websiteShortcutKey3.value = settings.keybinds.websites[2]?.key || '';
  websiteShortcutUrl3.value = settings.keybinds.websites[2]?.url || '';
  cookieEnabled.checked = settings.privacy.cookiesEnabled;
  cookieLevel.value = settings.privacy.cookieLevel;
  cookieExceptionDomain1.value = settings.privacy.exceptions[0]?.domain || '';
  cookieExceptionAction1.value = settings.privacy.exceptions[0]?.action || 'allow';
  cookieExceptionDomain2.value = settings.privacy.exceptions[1]?.domain || '';
  cookieExceptionAction2.value = settings.privacy.exceptions[1]?.action || 'allow';
  cookieExceptionDomain3.value = settings.privacy.exceptions[2]?.domain || '';
  cookieExceptionAction3.value = settings.privacy.exceptions[2]?.action || 'allow';
  cookieExceptionDomain4.value = settings.privacy.exceptions[3]?.domain || '';
  cookieExceptionAction4.value = settings.privacy.exceptions[3]?.action || 'allow';
  themeAccent.value = settings.theme.accent;
  themeSurface.value = settings.theme.surface;
  themeBackground.value = settings.theme.background;
  themeBorderColor.value = settings.theme.borderColor;
  themeBorderWidth.value = parseInt(settings.theme.borderWidth, 10);
  themeTabActiveBg.value = settings.theme.tabActiveBg;
  themeTabInactiveBg.value = settings.theme.tabInactiveBg;
  themeTabActiveText.value = settings.theme.tabActiveText;
  themeTabInactiveText.value = settings.theme.tabInactiveText;
  themeSettingsFontColor.value = settings.theme.settingsFontColor;
  themeGradient.checked = settings.theme.gradient;
  themeGradientAccent.value = settings.theme.gradientAccent;
  themeGradientSurface.value = settings.theme.gradientSurface;
  themeGradientTabActive.value = settings.theme.gradientTabActive;
  themeGradientTabInactive.value = settings.theme.gradientTabInactive;
  themeGlow.checked = settings.theme.glow;
  updateGradientControlsVisibility();
  privacyStatus.textContent = '';
}

function updateGradientControlsVisibility() {
  const visible = themeGradient && themeGradient.checked;
  themeGradientControls.forEach((control) => {
    control.classList.toggle('hidden', !visible);
  });
}

function openSettings() {
  settingsModal.classList.add('open');
  settingsModal.setAttribute('aria-hidden', 'false');
  populateSettingsUI();
}

function closeSettings() {
  settingsModal.classList.remove('open');
  settingsModal.setAttribute('aria-hidden', 'true');
  saveSettings();
}

function setSettingsTab(tabName) {
  settingsTabs.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
  settingsSections.forEach((section) => {
    section.classList.toggle('active', section.dataset.section === tabName);
  });
}

function updateThemeFromUI() {
  settings.theme.accent = themeAccent.value;
  settings.theme.surface = themeSurface.value;
  settings.theme.background = themeBackground.value;
  settings.theme.borderColor = themeBorderColor.value;
  settings.theme.borderWidth = `${parseInt(themeBorderWidth.value, 10) || 1}px`;
  settings.theme.tabActiveBg = themeTabActiveBg.value;
  settings.theme.tabInactiveBg = themeTabInactiveBg.value;
  settings.theme.tabActiveText = themeTabActiveText.value;
  settings.theme.tabInactiveText = themeTabInactiveText.value;
  settings.theme.settingsFontColor = themeSettingsFontColor.value;
  settings.theme.gradient = themeGradient.checked;
  settings.theme.gradientAccent = themeGradientAccent.value;
  settings.theme.gradientSurface = themeGradientSurface.value;
  settings.theme.gradientTabActive = themeGradientTabActive.value;
  settings.theme.gradientTabInactive = themeGradientTabInactive.value;
  settings.theme.glow = themeGlow.checked;
  applyTheme(settings.theme);
  saveSettings();
}

function updatePrivacyStatus(message) {
  privacyStatus.textContent = message;
}

async function clearBrowserData(type) {
  const result = await window.electronAPI.clearBrowserData(type);
  if (result && result.success) {
    updatePrivacyStatus(`${type.replace('-', ' ')} cleared successfully.`);
  } else {
    updatePrivacyStatus(`Could not clear ${type.replace('-', ' ')}.`);
  }
}

let tabs = [];
let activeTabId = null;

function normalizeUrl(input) {
  const raw = input.trim();
  if (!raw) {
    return DEFAULT_HOME;
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw);
  const looksLikeHost = /\.[a-zA-Z]{2,}|localhost/.test(raw);
  const hasSpace = /\s/.test(raw);

  if (hasScheme) {
    return raw;
  }

  if (looksLikeHost && !hasSpace) {
    return `https://${raw}`;
  }

  return `https://duckduckgo.com/?q=${encodeURIComponent(raw)}`;
}

function createTab(url = DEFAULT_HOME, activate = true) {
  const id = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const tabButton = document.createElement('button');
  tabButton.className = 'tab';
  tabButton.dataset.tabId = id;

  const label = document.createElement('span');
  label.className = 'tab-label';
  label.textContent = 'New Tab';
  tabButton.appendChild(label);

  const closeButton = document.createElement('span');
  closeButton.className = 'tab-close';
  closeButton.textContent = '×';
  closeButton.title = 'Close tab';
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closeTab(id);
  });
  tabButton.appendChild(closeButton);

  tabButton.addEventListener('click', () => activateTab(id));
  tabStrip.appendChild(tabButton);

  const webview = document.createElement('webview');
  webview.className = 'tab-webview';
  webview.dataset.tabId = id;
  webview.setAttribute('src', url);
  webview.setAttribute('webpreferences', 'contextIsolation=yes,nodeIntegration=no,sandbox=yes,webSecurity=yes');
  webview.style.display = 'none';
  webviewContainer.appendChild(webview);

  const tab = { id, url, title: 'New Tab', button: tabButton, tabLabel: label, webview };
  tabs.push(tab);

  webview.addEventListener('did-start-loading', () => {
    if (navReloadIcon) navReloadIcon.classList.add('spin');
  });

  webview.addEventListener('did-stop-loading', () => {
    if (navReloadIcon) navReloadIcon.classList.remove('spin');
    if (tab.webview && tab.webview.getURL) {
      tab.url = tab.webview.getURL();
      if (id === activeTabId) addressBar.value = tab.url;
    }
    updateNavigationState();
    refreshVideoPopoutButtonState();
    setupCredentialHandling(tab);
  });

  webview.addEventListener('page-title-updated', (event) => {
    tab.title = event.title || 'New Tab';
    tab.tabLabel.textContent = tab.title;
  });

  webview.addEventListener('did-navigate', (event) => {
    tab.url = event.url;
    if (id === activeTabId) addressBar.value = tab.url;
    updateNavigationState();
    refreshVideoPopoutButtonState();
  });

  webview.addEventListener('did-navigate-in-page', (event) => {
    tab.url = event.url;
    if (id === activeTabId) addressBar.value = tab.url;
    updateNavigationState();
    refreshVideoPopoutButtonState();
  });

  webview.addEventListener('new-window', (event) => {
    event.preventDefault();
    createTab(event.url, true);
  });

  webview.addEventListener('context-menu', (event) => {
    event.preventDefault();
    window.electronAPI.showContextMenu({
      mediaType: event.params.mediaType,
      linkURL: event.params.linkURL,
      srcURL: event.params.srcURL,
      selectionText: event.params.selectionText,
      x: event.params.x,
      y: event.params.y
    });
  });

  tabButton.addEventListener('auxclick', (event) => {
    if (event.button === 1) {
      event.preventDefault();
      if (settings.keybinds.tabMiddleClick === 'close') {
        closeTab(id);
      }
    }
  });

  if (activate) {
    activateTab(id);
  }

  return tab;
}

function activateTab(id) {
  const tab = tabs.find((candidate) => candidate.id === id);
  if (!tab) return;

  activeTabId = id;

  tabs.forEach((candidate) => {
    const isActive = candidate.id === id;
    candidate.button.classList.toggle('active', isActive);
    candidate.webview.style.display = isActive ? 'flex' : 'none';
  });

  addressBar.value = tab.url;
  updateNavigationState();
  refreshVideoPopoutButtonState();
  startVideoPopoutPolling();
}

function closeTab(id) {
  const index = tabs.findIndex((tab) => tab.id === id);
  if (index === -1) return;

  const [removedTab] = tabs.splice(index, 1);
  removedTab.button.remove();
  removedTab.webview.remove();

  if (activeTabId === id) {
    const nextTab = tabs[index] || tabs[index - 1] || createTab(DEFAULT_HOME, true);
    activateTab(nextTab.id);
  }
}

function updateNavigationState() {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.webview) {
    navBack.disabled = true;
    navForward.disabled = true;
    return;
  }

  navBack.disabled = !tab.webview.canGoBack();
  navForward.disabled = !tab.webview.canGoForward();
}

newTabBtn.addEventListener('click', () => createTab(DEFAULT_HOME, true));

navBack.addEventListener('click', () => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (tab && typeof tab.webview.canGoBack === 'function' && tab.webview.canGoBack()) tab.webview.goBack();
});

navForward.addEventListener('click', () => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (tab && typeof tab.webview.canGoForward === 'function' && tab.webview.canGoForward()) tab.webview.goForward();
});

navReload.addEventListener('click', () => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (tab) tab.webview.reload();
});

navHome.addEventListener('click', () => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (tab) tab.webview.loadURL(DEFAULT_HOME);
});

window.electronAPI.onContextMenuCommand((data) => {
  if (!data || !data.command) return;
  if (data.command === 'open-link' && data.url) {
    createTab(data.url, true);
  }
});

if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
if (settingsClose) settingsClose.addEventListener('click', closeSettings);
if (settingsModal) {
  settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) closeSettings();
  });
}
settingsTabs.forEach((button) => {
  button.addEventListener('click', () => setSettingsTab(button.dataset.tab));
});
if (keybindAction) {
  keybindAction.addEventListener('change', (event) => {
    settings.keybinds.tabMiddleClick = event.target.value;
    saveSettings();
  });
}
if (cookieEnabled) {
  cookieEnabled.addEventListener('change', (event) => {
    settings.privacy.cookiesEnabled = event.target.checked;
    saveSettings();
    applyCookiePolicy(settings.privacy);
  });
}
if (cookieLevel) {
  cookieLevel.addEventListener('change', (event) => {
    settings.privacy.cookieLevel = event.target.value;
    saveSettings();
    applyCookiePolicy(settings.privacy);
  });
}
[cookieExceptionDomain1, cookieExceptionAction1, cookieExceptionDomain2, cookieExceptionAction2, cookieExceptionDomain3, cookieExceptionAction3, cookieExceptionDomain4, cookieExceptionAction4].forEach((element) => {
  if (!element) return;
  element.addEventListener('change', () => {
    loadCookieExceptionsFromUI();
    applyCookiePolicy(settings.privacy);
  });
});
if (videoPopoutBtn) {
  videoPopoutBtn.addEventListener('click', () => popoutActiveVideo());
}
if (closeAppBtn) {
  closeAppBtn.addEventListener('click', () => window.electronAPI?.closeApp?.());
}
if (credentialSaveConfirm) {
  credentialSaveConfirm.addEventListener('click', savePendingCredential);
}
if (credentialSaveDismiss) {
  credentialSaveDismiss.addEventListener('click', hideCredentialSavePrompt);
}
[themeAccent, themeSurface, themeBackground, themeBorderColor, themeBorderWidth, themeTabActiveBg, themeTabInactiveBg, themeTabActiveText, themeTabInactiveText, themeSettingsFontColor, themeGradient, themeGradientAccent, themeGradientSurface, themeGradientTabActive, themeGradientTabInactive, themeGlow].forEach((input) => {
  if (!input) return;
  const listener = () => updateThemeFromUI();
  input.addEventListener('input', listener);
  input.addEventListener('change', listener);
});

if (themeGradient) {
  themeGradient.addEventListener('change', () => {
    updateGradientControlsVisibility();
    updateThemeFromUI();
  });
}
if (clearCookiesBtn) clearCookiesBtn.addEventListener('click', () => clearBrowserData('cookies'));
if (clearStorageBtn) clearStorageBtn.addEventListener('click', () => clearBrowserData('storage'));
if (clearAllBtn) clearAllBtn.addEventListener('click', () => clearBrowserData('all'));
if (clearPasswordsBtn) clearPasswordsBtn.addEventListener('click', () => clearBrowserData('passwords'));

if (shortcutOpenSearch) {
  shortcutOpenSearch.addEventListener('change', (event) => {
    settings.keybinds.openSearch = event.target.value.trim();
    saveSettings();
  });
}
if (shortcutMuteTab) {
  shortcutMuteTab.addEventListener('change', (event) => {
    settings.keybinds.muteTab = event.target.value.trim();
    saveSettings();
  });
}
if (shortcutRefreshTab) {
  shortcutRefreshTab.addEventListener('change', (event) => {
    settings.keybinds.refreshTab = event.target.value.trim();
    saveSettings();
  });
}
[websiteShortcutKey1, websiteShortcutUrl1, websiteShortcutKey2, websiteShortcutUrl2, websiteShortcutKey3, websiteShortcutUrl3].forEach((element) => {
  if (!element) return;
  element.addEventListener('change', saveWebsiteShortcuts);
});

if (searchOverlayInput) searchOverlayInput.addEventListener('keydown', handleSearchOverlayKeydown);
if (searchOverlay) {
  searchOverlay.addEventListener('click', (event) => {
    if (event.target === searchOverlay) closeSearchOverlay();
  });
}
window.addEventListener('keydown', handleGlobalKeydown);

addressBar.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab) return;
  tab.webview.loadURL(normalizeUrl(addressBar.value));
});

window.addEventListener('DOMContentLoaded', () => {
  createTab(DEFAULT_HOME, true);
});
