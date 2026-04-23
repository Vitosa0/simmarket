const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, nativeImage, shell, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { RESOURCE_CATALOG, getResourceById } = require("./catalog");
const { DEFAULT_CONFIG, REALM_OPTIONS } = require("./defaults");
const {
  appDataPaths,
  appendEvent,
  clearEvents,
  deleteEvent,
  loadConfig,
  loadPriceHistory,
  loadState,
  normalizeConfig,
  normalizeRealmId,
  realmDataPaths,
  recentEvents,
  saveConfig,
  savePriceHistory,
  saveState
} = require("./storage");
const {
  classifyRule,
  describeCondition,
  fetchMarketProduct,
  fetchMarketTicker,
  formatMarketNumber,
  hasProductSnapshot,
  hasTickerSnapshot,
  lowestListingForQuality,
  normalizeRule,
  scanAlerts,
  snapshotIso
} = require("./monitor");

let mainWindow = null;
let startupWindow = null;
let scanTimer = null;
let scanInFlight = false;
let discordAvatarData = null;
let lastDiscordBrandedWebhook = "";
let discordBrandingInFlightWebhook = "";
const IS_WINDOWS = process.platform === "win32";
const IS_MAC = process.platform === "darwin";
const IS_DEV = !app.isPackaged;
const UPDATE_REPO = {
  owner: "Vitosa0",
  repo: "simmarket"
};
const APP_ICON_PATH = process.platform === "win32"
  ? path.join(__dirname, "..", "assets", "branding", "simmarket-mark.ico")
  : path.join(__dirname, "..", "assets", "branding", "simmarket-mark-1024.png");
const APP_ICON_PNG_PATH = path.join(__dirname, "..", "assets", "branding", "simmarket-mark-1024.png");
const APP_ICON_DISCORD_PNG_PATH = path.join(__dirname, "..", "assets", "branding", "simmarket-mark-discord.png");
let windowsUpdaterConfigured = false;
let mainWindowReady = false;
let startupSequenceDone = false;
let windowsUpdatePromptVisible = true;
let lastScanSnapshot = {
  scannedAt: null,
  errors: []
};
const gotSingleInstanceLock = app.requestSingleInstanceLock();
let updateState = {
  platform: process.platform,
  strategy: IS_WINDOWS ? "windows-auto" : IS_MAC ? "mac-manual" : "unsupported",
  currentVersion: app.getVersion(),
  status: "idle",
  checking: false,
  available: false,
  downloading: false,
  downloaded: false,
  progress: 0,
  latestVersion: "",
  releaseName: "",
  releaseNotes: "",
  publishedAt: "",
  downloadUrl: "",
  lastCheckedAt: "",
  error: "",
  promptVisible: false
};
let uiLanguage = "es";

const RELEASE_FETCH_TIMEOUT_MS = 5000;
const DISCORD_BRANDING_TIMEOUT_MS = 2500;
const SCAN_INTERVAL_MS = DEFAULT_CONFIG.pollSeconds * 1000;
const PRICE_HISTORY_MAX_POINTS = 120;
const ALERT_CHART_POINT_COUNT = 10;
const PORTFOLIO_CHART_POINT_COUNT = 30;
const PORTFOLIO_MARKET_FEE_RATE = 0.04;
const PORTFOLIO_TRANSPORT_RESOURCE_ID = 13;
const SIMTOOLS_HISTORY_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;
const SIMTOOLS_HISTORY_REQUEST_DELAY_MS = 120;
const SIMTOOLS_HISTORY_REQUEST_TIMEOUT_MS = 20_000;
const SIMTOOLS_HISTORY_MAX_RETRIES = 4;
const SIMTOOLS_HISTORY_DAYS = 180;
const SIMTOOLS_HISTORY_GRANULARITY = "1d";
let simtoolsHistoryCacheDir = "";
let simtoolsManifestCache = null;
const simtoolsArchiveCache = new Map();
let simtoolsHistoryRefreshTimer = null;
let simtoolsHistoryRefreshPromise = null;

const STARTUP_WINDOW_COMPACT = {
  width: 430,
  height: 248
};

const STARTUP_WINDOW_EXPANDED = {
  width: 430,
  height: 322
};

function normalizeUiLanguage(locale) {
  return locale === "en" ? "en" : "es";
}

function setUiLanguage(locale) {
  uiLanguage = normalizeUiLanguage(locale);
  return uiLanguage;
}

function isEnglishUi() {
  return uiLanguage === "en";
}

function uiText(esText, enText) {
  return isEnglishUi() ? enText : esText;
}

function defaultAlertLabel(index) {
  return uiText(`Alerta ${index}`, `Alert ${index}`);
}

function resourceFallbackLabel(resourceId) {
  return uiText(`Recurso ${resourceId}`, `Resource ${resourceId}`);
}

function realmMeta(realmId) {
  const normalizedRealmId = normalizeRealmId(realmId);
  return REALM_OPTIONS.find((realm) => Number(realm.id) === normalizedRealmId) || REALM_OPTIONS[0];
}

function localizedRealmName(realmId) {
  const realm = realmMeta(realmId);
  return isEnglishUi() ? realm.labelEn : realm.labelEs;
}

function localizedResourceName(resource) {
  if (!resource) return "";
  return isEnglishUi()
    ? String(resource.labelEn || resource.apiName || resource.label || "").trim()
    : String(resource.label || resource.labelEs || resource.apiName || "").trim();
}

if (IS_WINDOWS) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("disable-direct-composition");
}

if (!gotSingleInstanceLock) {
  app.quit();
}

function dataPaths() {
  return appDataPaths();
}

function activeRealmDataPaths(rootPaths, config) {
  const realmId = normalizeRealmId(config?.activeRealmId ?? config?.realmId);
  return realmDataPaths(rootPaths, realmId);
}

function promoteMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  if (IS_WINDOWS) {
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.moveTop();
    mainWindow.focus();
    setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      if (!mainWindow.isMaximized()) {
        mainWindow.maximize();
      }
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      }
      mainWindow.moveTop();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(false);
    }, 180);
    return;
  }
  mainWindow.focus();
}

function revealMainWindowIfReady() {
  if (!mainWindow || mainWindow.isDestroyed() || !mainWindowReady || !startupSequenceDone) return;
  if (startupWindow && !startupWindow.isDestroyed()) {
    startupWindow.setAlwaysOnTop(false);
    startupWindow.hide();
  }
  if (!IS_WINDOWS) {
    mainWindow.setSimpleFullScreen(false);
    mainWindow.setFullScreen(true);
  }
  promoteMainWindow();
  if (startupWindow && !startupWindow.isDestroyed()) {
    setTimeout(() => {
      if (!startupWindow || startupWindow.isDestroyed()) return;
      startupWindow.close();
      startupWindow = null;
    }, IS_WINDOWS ? 120 : 0);
  }
}

function continueIntoApp() {
  patchUpdateState({
    promptVisible: false
  });
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }
  startupSequenceDone = true;
  revealMainWindowIfReady();
  queueSimtoolsHistoryRefresh("startup");
  return updateState;
}

function normalizePortfolioHolding(rawHolding, index, locale = "es") {
  const resolvedLocale = locale === "en" ? "en" : "es";
  const resourceId = Number(rawHolding?.resourceId);
  const quality = Number.isFinite(Number(rawHolding?.quality)) ? Number(rawHolding.quality) : 0;
  const quantity = Number(rawHolding?.quantity);
  const buyPrice = Number(rawHolding?.buyPrice);
  const resource = getResourceById(resourceId);

  if (!Number.isFinite(resourceId) || resourceId <= 0 || !resource) {
    throw new Error(resolvedLocale === "en"
      ? `Invalid asset in portfolio position ${index}.`
      : `Activo inválido en la posición ${index} de cartera.`);
  }
  if (!Number.isInteger(quality) || quality < 0 || quality > 12) {
    throw new Error(resolvedLocale === "en"
      ? `Invalid quality in portfolio position ${index}.`
      : `Calidad inválida en la posición ${index} de cartera.`);
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(resolvedLocale === "en"
      ? `Invalid quantity in portfolio position ${index}.`
      : `Cantidad inválida en la posición ${index} de cartera.`);
  }
  if (!Number.isFinite(buyPrice) || buyPrice < 0) {
    throw new Error(resolvedLocale === "en"
      ? `Invalid purchase price in portfolio position ${index}.`
      : `Precio de compra inválido en la posición ${index} de cartera.`);
  }

  return {
    id: String(rawHolding?.id || `holding-${resourceId}-q${quality}-${index}`),
    resourceId,
    quality,
    quantity,
    buyPrice,
    createdAt: String(rawHolding?.createdAt || new Date().toISOString())
  };
}

function focusPrimaryWindows() {
  const windowToFocus = (mainWindow && !mainWindow.isDestroyed())
    ? mainWindow
    : (startupWindow && !startupWindow.isDestroyed() ? startupWindow : null);
  if (!windowToFocus) return;
  if (windowToFocus.isMinimized()) {
    windowToFocus.restore();
  }
  windowToFocus.show();
  windowToFocus.focus();
}

function isOfflineUpdateError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return [
    "failed to fetch",
    "fetch failed",
    "internet_disconnected",
    "internet disconnected",
    "offline",
    "network",
    "enotfound",
    "eai_again",
    "econnrefused",
    "econnreset",
    "net::",
    "socket hang up"
  ].some((token) => message.includes(token));
}

function startupWindowNeedsExpandedLayout(status = updateState.status) {
  return ["available", "downloading", "downloaded", "installing", "offline"].includes(String(status || ""));
}

function syncStartupWindowSize() {
  if (!startupWindow || startupWindow.isDestroyed()) return;
  const nextSize = startupWindowNeedsExpandedLayout() ? STARTUP_WINDOW_EXPANDED : STARTUP_WINDOW_COMPACT;
  const bounds = startupWindow.getBounds();
  if (bounds.width === nextSize.width && bounds.height === nextSize.height) return;
  startupWindow.setSize(nextSize.width, nextSize.height, true);
  startupWindow.center();
}

function createStartupWindow() {
  if (startupWindow && !startupWindow.isDestroyed()) return startupWindow;
  startupWindow = new BrowserWindow({
    width: STARTUP_WINDOW_COMPACT.width,
    height: STARTUP_WINDOW_COMPACT.height,
    center: true,
    frame: true,
    transparent: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: "#0b0b0b",
    ...(fs.existsSync(APP_ICON_PATH) ? { icon: APP_ICON_PATH } : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  startupWindow.loadFile(path.join(__dirname, "..", "renderer", "startup-update.html"), {
    query: {
      version: app.getVersion()
    }
  });
  startupWindow.on("closed", () => {
    startupWindow = null;
  });
  syncStartupWindowSize();
  return startupWindow;
}

function isDiscordWebhookUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || "").trim());
    if (!["discord.com", "www.discord.com", "ptb.discord.com", "canary.discord.com", "discordapp.com"].includes(parsed.hostname)) {
      return false;
    }
    return /\/api(?:\/v\d+)?\/webhooks\/[^/]+\/[^/]+/i.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

function canonicalDiscordWebhookUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || "").trim());
    if (!["discord.com", "www.discord.com", "ptb.discord.com", "canary.discord.com", "discordapp.com"].includes(parsed.hostname)) {
      return "";
    }
    const match = parsed.pathname.match(/(\/api(?:\/v\d+)?\/webhooks\/[^/]+\/[^/]+)/i);
    if (!match) {
      return "";
    }
    return `${parsed.protocol}//${parsed.host}${match[1]}`;
  } catch (error) {
    return "";
  }
}

function appIconDataUri() {
  if (discordAvatarData) return discordAvatarData;
  const iconPath = fs.existsSync(APP_ICON_DISCORD_PNG_PATH) ? APP_ICON_DISCORD_PNG_PATH : APP_ICON_PNG_PATH;
  const buffer = fs.readFileSync(iconPath);
  discordAvatarData = `data:image/png;base64,${buffer.toString("base64")}`;
  return discordAvatarData;
}

async function configureDiscordWebhookBranding(webhookUrl) {
  const targetUrl = canonicalDiscordWebhookUrl(webhookUrl);
  if (!targetUrl || targetUrl === lastDiscordBrandedWebhook || targetUrl === discordBrandingInFlightWebhook) {
    return;
  }
  discordBrandingInFlightWebhook = targetUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISCORD_BRANDING_TIMEOUT_MS);
  try {
    const response = await fetch(targetUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        name: "SimMarket",
        avatar: appIconDataUri()
      })
    });
    if (!response.ok) {
      throw new Error(`Discord branding ${response.status}`);
    }
    lastDiscordBrandedWebhook = targetUrl;
  } finally {
    if (discordBrandingInFlightWebhook === targetUrl) {
      discordBrandingInFlightWebhook = "";
    }
    clearTimeout(timer);
  }
}

function sendUpdateState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:state", updateState);
  }
  if (startupWindow && !startupWindow.isDestroyed()) {
    startupWindow.webContents.send("updates:state", updateState);
  }
}

function patchUpdateState(patch) {
  updateState = {
    ...updateState,
    ...patch
  };
  syncStartupWindowSize();
  sendUpdateState();
  return updateState;
}

function normalizeVersion(rawVersion) {
  return String(rawVersion || "").trim().replace(/^v/i, "");
}

function compareVersions(left, right) {
  const leftParts = normalizeVersion(left).split(".").map((part) => Number(part.replace(/[^\d].*$/, "")) || 0);
  const rightParts = normalizeVersion(right).split(".").map((part) => Number(part.replace(/[^\d].*$/, "")) || 0);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function releaseAssetForMac(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const preferredTokens = process.arch === "arm64"
    ? ["arm64", "aarch64"]
    : ["x64", "intel", "amd64"];
  const compatibleKinds = [".pkg", ".dmg"];
  const compatibleAssets = assets.filter((asset) => compatibleKinds.some((kind) => asset.name?.endsWith(kind)));
  const preferredAsset = compatibleAssets.find((asset) => preferredTokens.some((token) => asset.name?.toLowerCase().includes(token)));
  if (preferredAsset) {
    return preferredAsset;
  }
  const universalAsset = compatibleAssets.find((asset) => {
    const name = String(asset.name || "").toLowerCase();
    return name.includes("universal")
      || preferredTokens.every((token) => !name.includes(token)) && !["arm64", "aarch64", "x64", "intel", "amd64"].some((token) => name.includes(token));
  });
  return universalAsset || null;
}

async function fetchLatestRelease() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RELEASE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.github.com/repos/${UPDATE_REPO.owner}/${UPDATE_REPO.repo}/releases/latest`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "SimMarket"
      },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`GitHub release ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function checkMacUpdates({ showPrompt = true } = {}) {
  patchUpdateState({
    status: "checking",
    checking: true,
    error: "",
    promptVisible: false
  });

  try {
    const release = await fetchLatestRelease();
    const latestVersion = normalizeVersion(release.tag_name || release.name || "");
    const hasUpdate = compareVersions(latestVersion, app.getVersion()) > 0;
    const asset = releaseAssetForMac(release);
    if (hasUpdate && !asset?.browser_download_url) {
      return patchUpdateState({
        status: "error",
        checking: false,
        available: false,
        downloading: false,
        downloaded: false,
        progress: 0,
        latestVersion,
        releaseName: String(release.name || release.tag_name || "").trim(),
        releaseNotes: String(release.body || "").trim(),
        publishedAt: String(release.published_at || "").trim(),
        downloadUrl: "",
        lastCheckedAt: new Date().toISOString(),
        error: uiText("Hay una versión nueva, pero no hay un instalador compatible para esta Mac.", "There is a new version, but there is no compatible installer for this Mac."),
        promptVisible: showPrompt
      });
    }
    const nextState = {
      checking: false,
      available: hasUpdate && Boolean(asset?.browser_download_url),
      downloading: false,
      downloaded: false,
      progress: 0,
      latestVersion,
      releaseName: String(release.name || release.tag_name || "").trim(),
      releaseNotes: String(release.body || "").trim(),
      publishedAt: String(release.published_at || "").trim(),
      downloadUrl: asset?.browser_download_url || "",
      lastCheckedAt: new Date().toISOString(),
      error: "",
      promptVisible: hasUpdate && showPrompt
    };
    nextState.status = nextState.available ? "available" : "up-to-date";
    return patchUpdateState(nextState);
  } catch (error) {
    const offline = isOfflineUpdateError(error);
    return patchUpdateState({
      status: offline ? "offline" : "error",
      checking: false,
      available: false,
      downloading: false,
      downloaded: false,
      progress: 0,
      lastCheckedAt: new Date().toISOString(),
      error: offline ? uiText("Sin conexión a internet.", "No internet connection.") : error.message,
      promptVisible: offline ? true : false
    });
  }
}

function configureWindowsUpdater() {
  if (!IS_WINDOWS || IS_DEV || windowsUpdaterConfigured) return;
  windowsUpdaterConfigured = true;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    patchUpdateState({
      status: "checking",
      checking: true,
      available: false,
      downloading: false,
      downloaded: false,
      progress: 0,
      error: "",
      promptVisible: false
    });
  });

  autoUpdater.on("update-available", (info) => {
    patchUpdateState({
      status: "available",
      checking: false,
      available: true,
      downloading: false,
      downloaded: false,
      progress: 0,
      latestVersion: normalizeVersion(info?.version || ""),
      releaseName: String(info?.releaseName || info?.version || "").trim(),
      releaseNotes: typeof info?.releaseNotes === "string" ? info.releaseNotes : "",
      publishedAt: String(info?.releaseDate || "").trim(),
      lastCheckedAt: new Date().toISOString(),
      error: "",
      promptVisible: windowsUpdatePromptVisible
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    patchUpdateState({
      status: "downloading",
      checking: false,
      available: true,
      downloading: true,
      downloaded: false,
      progress: Number(progress?.percent || 0),
      promptVisible: windowsUpdatePromptVisible
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    patchUpdateState({
      status: "downloaded",
      checking: false,
      available: true,
      downloading: false,
      downloaded: true,
      progress: 100,
      latestVersion: normalizeVersion(info?.version || updateState.latestVersion),
      releaseName: String(info?.releaseName || info?.version || updateState.releaseName || "").trim(),
      releaseNotes: typeof info?.releaseNotes === "string" ? info.releaseNotes : updateState.releaseNotes,
      publishedAt: String(info?.releaseDate || updateState.publishedAt || "").trim(),
      lastCheckedAt: new Date().toISOString(),
      error: "",
      promptVisible: windowsUpdatePromptVisible
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    patchUpdateState({
      status: "up-to-date",
      checking: false,
      available: false,
      downloading: false,
      downloaded: false,
      progress: 0,
      latestVersion: normalizeVersion(info?.version || updateState.currentVersion),
      releaseName: "",
      releaseNotes: "",
      publishedAt: "",
      lastCheckedAt: new Date().toISOString(),
      error: "",
      promptVisible: false
    });
  });

  autoUpdater.on("error", (error) => {
    const offline = isOfflineUpdateError(error);
    patchUpdateState({
      status: offline ? "offline" : "error",
      checking: false,
      downloading: false,
      downloaded: false,
      progress: 0,
      lastCheckedAt: new Date().toISOString(),
      error: offline ? uiText("Sin conexión a internet.", "No internet connection.") : error.message,
      promptVisible: offline ? true : false
    });
  });
}

async function checkForUpdates({ showPrompt = true } = {}) {
  if (IS_WINDOWS) {
    if (IS_DEV) {
      return patchUpdateState({
        status: "idle",
        checking: false,
        available: false,
        downloading: false,
        downloaded: false,
        progress: 0,
        lastCheckedAt: new Date().toISOString(),
        error: "",
        promptVisible: false
      });
    }
    windowsUpdatePromptVisible = showPrompt;
    configureWindowsUpdater();
    await autoUpdater.checkForUpdates();
    return updateState;
  }

  if (IS_MAC) {
    return checkMacUpdates({ showPrompt });
  }

  return patchUpdateState({
    status: "unsupported",
    checking: false,
    promptVisible: false
  });
}

async function runUpdatePrimaryAction() {
  if (IS_WINDOWS) {
    if (updateState.downloaded) {
      autoUpdater.quitAndInstall();
      return { ok: true };
    }
    if (updateState.status === "offline") {
      windowsUpdatePromptVisible = false;
      await checkForUpdates({ showPrompt: false });
      return updateState;
    }
    if (updateState.available && !updateState.downloading) {
      await autoUpdater.downloadUpdate();
    }
    return updateState;
  }

  if (IS_MAC && updateState.status === "offline") {
    await checkMacUpdates({ showPrompt: false });
    return updateState;
  }

  if (IS_MAC && updateState.downloadUrl) {
    await shell.openExternal(updateState.downloadUrl);
    return patchUpdateState({
      promptVisible: false,
      status: "available"
    });
  }

  return updateState;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForWindowsStartupState() {
  const startedAt = Date.now();
  const timeoutMs = 12000;
  while ((Date.now() - startedAt) < timeoutMs) {
    if (["up-to-date", "error", "available", "downloading", "downloaded"].includes(updateState.status)) {
      return updateState.status;
    }
    await wait(120);
  }
  return updateState.status;
}

async function runStartupSequence() {
  createStartupWindow();
  const minVisibleMs = 3000;
  const startedAt = Date.now();
  try {
    await checkForUpdates({ showPrompt: false });
  } catch (error) {
    // Startup should continue even if update lookup fails.
  }
  const elapsed = Date.now() - startedAt;
  if (elapsed < minVisibleMs) {
    await new Promise((resolve) => setTimeout(resolve, minVisibleMs - elapsed));
  }
  if (["available", "downloading", "downloaded", "installing", "offline"].includes(updateState.status)) {
    patchUpdateState({
      promptVisible: false
    });
    return;
  }
  continueIntoApp();
}

function buildConfigSnapshot(config) {
  const storedConfig = normalizeConfig(config);
  const activeRealmId = normalizeRealmId(storedConfig.activeRealmId ?? storedConfig.realmId);
  const realmBuckets = storedConfig.realms && typeof storedConfig.realms === "object"
    ? structuredClone(storedConfig.realms)
    : {};
  const activeBucket = realmBuckets[String(activeRealmId)] || {
    alerts: storedConfig.alerts,
    portfolio: storedConfig.portfolio
  };
  const normalizedAlerts = [];
  const skippedAlerts = [];
  const normalizedPortfolio = [];
  const skippedPortfolio = [];
  (Array.isArray(activeBucket.alerts) ? activeBucket.alerts : []).forEach((alert, index) => {
    try {
      normalizedAlerts.push(normalizeRule(alert, index + 1, uiLanguage));
    } catch (error) {
      skippedAlerts.push({
        index,
        label: String(alert?.label || defaultAlertLabel(index + 1)),
        error: error.message
      });
    }
  });
  (Array.isArray(activeBucket.portfolio) ? activeBucket.portfolio : []).forEach((holding, index) => {
    try {
      normalizedPortfolio.push(normalizePortfolioHolding(holding, index + 1, uiLanguage));
    } catch (error) {
      skippedPortfolio.push({
        index,
        error: error.message
      });
    }
  });
  realmBuckets[String(activeRealmId)] = {
    alerts: normalizedAlerts,
    portfolio: normalizedPortfolio
  };
  return {
    realmId: activeRealmId,
    activeRealmId,
    realm: {
      id: activeRealmId,
      key: realmMeta(activeRealmId).key,
      label: localizedRealmName(activeRealmId)
    },
    availableRealms: REALM_OPTIONS.map((realm) => ({
      id: Number(realm.id),
      key: realm.key,
      label: isEnglishUi() ? realm.labelEn : realm.labelEs,
      labelEs: realm.labelEs,
      labelEn: realm.labelEn
    })),
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(storedConfig.scanEnabled ?? true),
    channels: {
      desktop: Boolean(storedConfig.channels?.desktop),
      discordWebhookUrl: String(storedConfig.channels?.discordWebhookUrl || ""),
      telegramBotToken: String(storedConfig.channels?.telegramBotToken || ""),
      telegramChatId: String(storedConfig.channels?.telegramChatId || "")
    },
    alerts: normalizedAlerts,
    skippedAlerts,
    portfolio: normalizedPortfolio,
    skippedPortfolio,
    realms: realmBuckets
  };
}

function summarizeMarketStatus(scanErrors = []) {
  const errors = Array.isArray(scanErrors) ? scanErrors : [];
  if (!errors.length) {
    return {
      state: "ok",
      title: uiText("Mercado conectado", "Market connected"),
      message: uiText("Las lecturas del mercado están entrando normalmente.", "Market readings are coming in normally."),
      affectedAlerts: 0
    };
  }

  const rateLimited = errors.some((item) => String(item.error || "").includes("429"));
  if (rateLimited) {
    return {
      state: "rate-limited",
      title: uiText("SimCompanies limitó temporalmente las consultas", "SimCompanies temporarily rate-limited requests"),
      message: uiText("La app va a reintentar sola. No hace falta tocar nada.", "The app will retry on its own. You do not need to do anything."),
      affectedAlerts: errors.length
    };
  }

  return {
    state: "error",
    title: uiText("No se pudo leer el mercado", "Could not read the market"),
    message: uiText("Hubo un problema temporal al consultar precios. Vamos a volver a intentar.", "There was a temporary problem while reading prices. We will retry."),
    affectedAlerts: errors.length
  };
}

function isoLocal(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
}

function signedPercent(value) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0.00%";
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}%`;
}

function readJsonFileSafe(filePath, fallback = null) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function writeJsonFileSafe(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function simtoolsHistoryRoot(paths) {
  return path.join(paths.baseDir, "simtools-history");
}

function isDefaultRealmHistoryPath(paths) {
  const baseName = path.basename(String(paths?.baseDir || ""));
  return !/^realm-\d+$/.test(baseName) || baseName === "realm-0";
}

function simtoolsSyncMetaPath(paths) {
  return path.join(simtoolsHistoryRoot(paths), "sync-meta.json");
}

function loadSimtoolsSyncMeta(paths) {
  const payload = readJsonFileSafe(simtoolsSyncMetaPath(paths), {});
  return payload && typeof payload === "object" ? payload : {};
}

function saveSimtoolsSyncMeta(paths, meta) {
  writeJsonFileSafe(simtoolsSyncMetaPath(paths), meta);
}

function slugifyHistoryName(raw) {
  return String(raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "recurso";
}

function defaultSimtoolsManifest(realmId) {
  return {
    version: 1,
    source: "https://api.simcotools.com",
    importedAt: "",
    realmId: Number(realmId || 0),
    granularity: SIMTOOLS_HISTORY_GRANULARITY,
    days: SIMTOOLS_HISTORY_DAYS,
    productCount: 0,
    comboCount: 0,
    products: []
  };
}

function roundHistoryValue(value, digits = 4) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const factor = 10 ** digits;
  return Math.round(numeric * factor) / factor;
}

function normalizeSimtoolsCandles(candles = []) {
  return candles
    .map((row) => {
      const open = Number(row?.open);
      const high = Number(row?.high);
      const low = Number(row?.low);
      const close = Number(row?.close);
      const volume = Number(row?.volume);
      const vwap = row?.vwap === null || row?.vwap === undefined ? close : Number(row?.vwap);
      const date = String(row?.date || "").trim();
      if (![open, high, low, close, volume, vwap].every(Number.isFinite) || !date) {
        return null;
      }
      return { date, open, high, low, close, volume, vwap };
    })
    .filter(Boolean)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
}

function summarizeSimtoolsCandles(candles = []) {
  if (!candles.length) return null;
  const closes = candles.map((candle) => Number(candle.close)).filter(Number.isFinite);
  const volumes = candles.map((candle) => Number(candle.volume)).filter(Number.isFinite);
  if (!closes.length) return null;
  const averageWindow = (size) => {
    const slice = closes.slice(-Math.min(size, closes.length));
    if (!slice.length) return null;
    return roundHistoryValue(slice.reduce((total, value) => total + value, 0) / slice.length);
  };
  return {
    count: candles.length,
    firstDate: candles[0].date,
    lastDate: candles[candles.length - 1].date,
    latestClose: roundHistoryValue(closes[closes.length - 1]),
    previousClose: roundHistoryValue(closes.length > 1 ? closes[closes.length - 2] : closes[closes.length - 1]),
    minClose: roundHistoryValue(Math.min(...closes)),
    maxClose: roundHistoryValue(Math.max(...closes)),
    avg7: averageWindow(7),
    avg30: averageWindow(30),
    avg90: averageWindow(90),
    avg180: averageWindow(180),
    latestVolume: roundHistoryValue(volumes[volumes.length - 1], 3),
    latestVWAP: roundHistoryValue(candles[candles.length - 1].vwap)
  };
}

function qualitySummaryFromArchive(quality, archiveQuality) {
  const stats = archiveQuality?.stats;
  if (!stats) return null;
  return {
    quality: Number(quality),
    ...stats
  };
}

function rebuildManifestProducts(manifest, archivesByResourceId) {
  const products = Array.isArray(manifest?.products) ? manifest.products : [];
  const nextProducts = products
    .map((product) => {
      const archive = archivesByResourceId.get(Number(product.resourceId));
      if (!archive) {
        return product;
      }
      const qualities = Object.entries(archive.qualities || {})
        .map(([quality, value]) => qualitySummaryFromArchive(quality, value))
        .filter(Boolean)
        .sort((left, right) => left.quality - right.quality);
      return {
        resourceId: Number(archive.resourceId),
        name: String(archive.name || product.name || ""),
        fileName: String(product.fileName || `${String(archive.resourceId).padStart(3, "0")}-${slugifyHistoryName(archive.name)}.json`),
        qualities
      };
    })
    .sort((left, right) => Number(left.resourceId) - Number(right.resourceId));
  manifest.products = nextProducts;
  manifest.productCount = nextProducts.length;
  manifest.comboCount = nextProducts.reduce((total, product) => total + (product.qualities?.length || 0), 0);
}

function buildSimtoolsSyncTargets(config) {
  const targets = new Map();
  RESOURCE_CATALOG.forEach((resource) => {
    targets.set(`${resource.id}:0`, {
      resourceId: Number(resource.id),
      quality: 0,
      name: resource.label
    });
  });
  (Array.isArray(config?.alerts) ? config.alerts : []).forEach((rule) => {
    const resource = getResourceById(rule.resourceId);
    const quality = Number(rule.quality || 0);
    const key = `${Number(rule.resourceId)}:${quality}`;
    if (!targets.has(key)) {
      targets.set(key, {
        resourceId: Number(rule.resourceId),
        quality,
        name: resource?.label || `Recurso ${rule.resourceId}`
      });
    }
  });
  (Array.isArray(config?.portfolio) ? config.portfolio : []).forEach((holding) => {
    const resource = getResourceById(holding.resourceId);
    const quality = Number(holding.quality || 0);
    const key = `${Number(holding.resourceId)}:${quality}`;
    if (!targets.has(key)) {
      targets.set(key, {
        resourceId: Number(holding.resourceId),
        quality,
        name: resource?.label || `Recurso ${holding.resourceId}`
      });
    }
  });
  return [...targets.values()];
}

function hasManifestQuality(manifest, target) {
  const product = Array.isArray(manifest?.products)
    ? manifest.products.find((item) => Number(item?.resourceId) === Number(target.resourceId))
    : null;
  return Array.isArray(product?.qualities)
    && product.qualities.some((quality) => Number(quality?.quality) === Number(target.quality));
}

function selectSimtoolsSyncTargets(manifest, config, meta = {}, force = false) {
  const targets = buildSimtoolsSyncTargets(config);
  if (force || !Array.isArray(manifest?.products) || !manifest.products.length) {
    return { targets, fullRefresh: true };
  }
  const lastSuccessAtMs = Date.parse(String(meta?.lastSuccessAt || ""));
  if (!Number.isFinite(lastSuccessAtMs) || (Date.now() - lastSuccessAtMs) >= SIMTOOLS_HISTORY_REFRESH_INTERVAL_MS) {
    return { targets, fullRefresh: true };
  }
  const missingTargets = targets.filter((target) => !hasManifestQuality(manifest, target));
  if (missingTargets.length) {
    return { targets: missingTargets, fullRefresh: false };
  }
  return { targets: [], fullRefresh: false };
}

async function fetchSimtoolsJson(url) {
  let attempt = 0;
  while (attempt <= SIMTOOLS_HISTORY_MAX_RETRIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SIMTOOLS_HISTORY_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": `SimMarket/${app.getVersion()}`
        },
        signal: controller.signal
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      const status = Number(error?.status);
      const transient = [408, 425, 429, 500, 502, 503, 504].includes(status)
        || isOfflineUpdateError(error)
        || String(error?.name || "").toLowerCase() === "aborterror";
      if (!transient || attempt === SIMTOOLS_HISTORY_MAX_RETRIES) {
        throw error;
      }
      await wait(1200 * (attempt + 1));
      attempt += 1;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(uiText("No se pudo completar la consulta a SimTools.", "Could not complete the SimTools request."));
}

async function fetchSimtoolsCandles(realmId, resourceId, quality, startMs, endMs) {
  const url = `https://api.simcotools.com/v1/realms/${realmId}/market/resources/${resourceId}/${quality}/candlesticks?granularity=${SIMTOOLS_HISTORY_GRANULARITY}&start=${startMs}&end=${endMs}`;
  const payload = await fetchSimtoolsJson(url);
  return normalizeSimtoolsCandles(Array.isArray(payload?.candlesticks) ? payload.candlesticks : []);
}

function simtoolsHistoryDirCandidates(paths) {
  const appDataRoot = app.getPath("appData");
  const candidates = [simtoolsHistoryRoot(paths)];
  if (isDefaultRealmHistoryPath(paths)) {
    candidates.push(
      path.join(appDataRoot, "simmarket-vito", "simtools-history"),
      path.join(appDataRoot, "simmarket", "simtools-history")
    );
  }
  return [...new Set(candidates)];
}

function resolveSimtoolsHistoryDir(paths) {
  return simtoolsHistoryDirCandidates(paths)
    .find((candidate) => fs.existsSync(path.join(candidate, "manifest.json"))) || "";
}

function loadSimtoolsHistoryManifest(paths) {
  const historyDir = resolveSimtoolsHistoryDir(paths);
  if (!historyDir) return null;
  if (simtoolsHistoryCacheDir !== historyDir) {
    simtoolsHistoryCacheDir = historyDir;
    simtoolsManifestCache = null;
    simtoolsArchiveCache.clear();
  }
  if (simtoolsManifestCache) {
    return simtoolsManifestCache;
  }
  simtoolsManifestCache = readJsonFileSafe(path.join(historyDir, "manifest.json"), null);
  return simtoolsManifestCache;
}

function loadSimtoolsProductArchive(paths, resourceId) {
  const manifest = loadSimtoolsHistoryManifest(paths);
  if (!manifest?.products?.length) return null;
  const numericResourceId = Number(resourceId);
  const productMeta = manifest.products.find((item) => Number(item?.resourceId) === numericResourceId);
  if (!productMeta?.fileName) return null;
  const historyDir = simtoolsHistoryCacheDir || resolveSimtoolsHistoryDir(paths);
  if (!historyDir) return null;
  const archivePath = path.join(historyDir, productMeta.fileName);
  if (simtoolsArchiveCache.has(archivePath)) {
    return simtoolsArchiveCache.get(archivePath);
  }
  const archive = readJsonFileSafe(archivePath, null);
  simtoolsArchiveCache.set(archivePath, archive);
  return archive;
}

async function refreshSimtoolsHistoryIfNeeded(paths, config, { force = false, reason = "background" } = {}) {
  if (simtoolsHistoryRefreshPromise) {
    return simtoolsHistoryRefreshPromise;
  }

  simtoolsHistoryRefreshPromise = (async () => {
    const historyDir = simtoolsHistoryRoot(paths);
    fs.mkdirSync(historyDir, { recursive: true });

    const manifest = loadSimtoolsHistoryManifest(paths) || defaultSimtoolsManifest(config.realmId);
    const meta = loadSimtoolsSyncMeta(paths);
    const syncPlan = selectSimtoolsSyncTargets(manifest, config, meta, force);

    if (!syncPlan.targets.length) {
      return {
        skipped: true,
        reason,
        updatedTargets: 0,
        failedTargets: 0
      };
    }

    const nowIso = new Date().toISOString();
    saveSimtoolsSyncMeta(paths, {
      ...meta,
      lastAttemptAt: nowIso,
      lastReason: reason,
      status: "running"
    });

    const nextManifest = structuredClone(manifest);
    const archivesByResourceId = new Map();
    const updatedTargets = [];
    const failedTargets = [];
    const endMs = Date.now();
    const startMs = endMs - (SIMTOOLS_HISTORY_DAYS * 24 * 60 * 60 * 1000);

    for (let index = 0; index < syncPlan.targets.length; index += 1) {
      const target = syncPlan.targets[index];
      const productMeta = Array.isArray(nextManifest.products)
        ? nextManifest.products.find((item) => Number(item?.resourceId) === Number(target.resourceId))
        : null;
      const fileName = String(productMeta?.fileName || `${String(target.resourceId).padStart(3, "0")}-${slugifyHistoryName(target.name)}.json`);
      const archivePath = path.join(historyDir, fileName);
      const archive = archivesByResourceId.get(Number(target.resourceId))
        || readJsonFileSafe(archivePath, null)
        || {
          version: 1,
          source: "https://api.simcotools.com",
          realmId: Number(config.realmId || 0),
          resourceId: Number(target.resourceId),
          name: String(target.name || productMeta?.name || uiText(`Recurso ${target.resourceId}`, `Resource ${target.resourceId}`)),
          importedAt: nowIso,
          granularity: SIMTOOLS_HISTORY_GRANULARITY,
          days: SIMTOOLS_HISTORY_DAYS,
          qualities: {}
        };

      try {
        const candles = await fetchSimtoolsCandles(config.realmId, target.resourceId, target.quality, startMs, endMs);
        if (!candles.length) {
          throw new Error(uiText("SimTools no devolvió velas.", "SimTools returned no candles."));
        }
        archive.version = 1;
        archive.source = "https://api.simcotools.com";
        archive.realmId = Number(config.realmId || 0);
        archive.resourceId = Number(target.resourceId);
        archive.name = String(target.name || archive.name || uiText(`Recurso ${target.resourceId}`, `Resource ${target.resourceId}`));
        archive.importedAt = nowIso;
        archive.granularity = SIMTOOLS_HISTORY_GRANULARITY;
        archive.days = SIMTOOLS_HISTORY_DAYS;
        archive.qualities = {
          ...(archive.qualities || {}),
          [String(target.quality)]: {
            candles,
            stats: summarizeSimtoolsCandles(candles)
          }
        };
        archivesByResourceId.set(Number(target.resourceId), archive);
        writeJsonFileSafe(archivePath, archive);
        updatedTargets.push(`${target.resourceId}:q${target.quality}`);
      } catch (error) {
        failedTargets.push({
          resourceId: Number(target.resourceId),
          quality: Number(target.quality),
          error: String(error?.message || error || uiText("Error desconocido", "Unknown error"))
        });
      }

      if (index < syncPlan.targets.length - 1) {
        await wait(SIMTOOLS_HISTORY_REQUEST_DELAY_MS);
      }
    }

    if (archivesByResourceId.size) {
      archivesByResourceId.forEach((archive, resourceId) => {
        const existingMeta = Array.isArray(nextManifest.products)
          ? nextManifest.products.find((item) => Number(item?.resourceId) === Number(resourceId))
          : null;
        if (!existingMeta) {
          nextManifest.products.push({
            resourceId: Number(resourceId),
            name: String(archive.name || `Recurso ${resourceId}`),
            fileName: `${String(resourceId).padStart(3, "0")}-${slugifyHistoryName(archive.name)}.json`,
            qualities: []
          });
        }
      });
      nextManifest.importedAt = nowIso;
      nextManifest.realmId = Number(config.realmId || 0);
      nextManifest.granularity = SIMTOOLS_HISTORY_GRANULARITY;
      nextManifest.days = SIMTOOLS_HISTORY_DAYS;
      rebuildManifestProducts(nextManifest, archivesByResourceId);
      writeJsonFileSafe(path.join(historyDir, "manifest.json"), nextManifest);
      simtoolsHistoryCacheDir = historyDir;
      simtoolsManifestCache = null;
      simtoolsArchiveCache.clear();
    }

    saveSimtoolsSyncMeta(paths, {
      ...meta,
      lastAttemptAt: nowIso,
      lastSuccessAt: updatedTargets.length ? nowIso : meta?.lastSuccessAt || "",
      lastReason: reason,
      status: failedTargets.length ? "completed-with-errors" : "completed",
      updatedTargets,
      failedTargets
    });

    return {
      skipped: false,
      reason,
      updatedTargets: updatedTargets.length,
      failedTargets: failedTargets.length
    };
  })()
    .finally(() => {
      simtoolsHistoryRefreshPromise = null;
    });

  return simtoolsHistoryRefreshPromise;
}

function startSimtoolsHistoryAutoRefresh() {
  clearInterval(simtoolsHistoryRefreshTimer);
  simtoolsHistoryRefreshTimer = setInterval(() => {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    const paths = activeRealmDataPaths(rootPaths, config);
    refreshSimtoolsHistoryIfNeeded(paths, config, { reason: "interval" })
      .then((result) => {
        if (!result?.updatedTargets) return;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("dashboard:updated");
        }
      })
      .catch(() => {});
  }, SIMTOOLS_HISTORY_REFRESH_INTERVAL_MS);
}

function queueSimtoolsHistoryRefresh(reason = "startup", { force = false } = {}) {
  const rootPaths = dataPaths();
  const config = buildConfigSnapshot(loadConfig(rootPaths));
  const paths = activeRealmDataPaths(rootPaths, config);
  startSimtoolsHistoryAutoRefresh();
  refreshSimtoolsHistoryIfNeeded(paths, config, { reason, force })
    .then((result) => {
      if (!result?.updatedTargets) return;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("dashboard:updated");
      }
    })
    .catch(() => {});
}

function buildExternalChartSeries(paths, rule) {
  const archive = loadSimtoolsProductArchive(paths, rule.resourceId);
  const qualityBucket = archive?.qualities?.[String(rule.quality)];
  const candles = Array.isArray(qualityBucket?.candles) ? qualityBucket.candles : [];
  return candles
    .slice(-ALERT_CHART_POINT_COUNT)
    .map((candle) => normalizeHistoryPoint({
      price: candle?.close,
      time: candle?.date
    }))
    .filter(Boolean);
}

function mergeChartSeries(baseSeries = [], overlaySeries = [], fallbackPoint = null) {
  const merged = [];
  const seen = new Set();
  const pushPoint = (point) => {
    const normalized = normalizeHistoryPoint(point);
    if (!normalized) return;
    const key = `${normalized.time}|${normalized.price}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
  };

  baseSeries.forEach(pushPoint);
  const baseLastTime = merged.length ? Date.parse(merged[merged.length - 1].time) : -Infinity;
  overlaySeries
    .filter(Boolean)
    .filter((point) => {
      const parsed = Date.parse(String(point?.time || ""));
      return !Number.isFinite(baseLastTime) || !merged.length || !Number.isFinite(parsed) || parsed >= baseLastTime;
    })
    .forEach(pushPoint);
  pushPoint(fallbackPoint);
  return merged.slice(-ALERT_CHART_POINT_COUNT);
}

function alertSeriesKey(resourceId, quality) {
  return `${Number(resourceId) || 0}:q${Number(quality) || 0}`;
}

function portfolioTransportSeriesKey() {
  return alertSeriesKey(PORTFOLIO_TRANSPORT_RESOURCE_ID, 0);
}

function finitePortfolioNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function portfolioNetUnitPrice(grossPrice, transportUnits, transportPrice) {
  const resolvedGrossPrice = finitePortfolioNumber(grossPrice);
  const resolvedTransportUnits = Number(transportUnits || 0);
  const needsTransportPrice = resolvedTransportUnits > 0;
  const resolvedTransportPrice = finitePortfolioNumber(transportPrice);
  if (!Number.isFinite(resolvedGrossPrice)) return null;
  if (needsTransportPrice && !Number.isFinite(resolvedTransportPrice)) return null;
  return (resolvedGrossPrice * (1 - PORTFOLIO_MARKET_FEE_RATE)) - (resolvedTransportUnits * (resolvedTransportPrice || 0));
}

function latestPortfolioSeriesPointBeforeDate(series = [], date) {
  if (!Array.isArray(series) || !series.length || !date) return null;
  for (let index = series.length - 1; index >= 0; index -= 1) {
    const point = series[index];
    if (String(point?.date || "") <= date && Number.isFinite(Number(point?.price))) {
      return point;
    }
  }
  return null;
}

function latestPortfolioArchiveSeries(paths, resourceId, quality) {
  const archive = loadSimtoolsProductArchive(paths, resourceId);
  const qualityBucket = archive?.qualities?.[String(quality)];
  const candles = Array.isArray(qualityBucket?.candles) ? qualityBucket.candles.slice(-PORTFOLIO_CHART_POINT_COUNT) : [];
  return candles
    .map((candle) => ({
      date: String(candle?.date || "").trim(),
      price: Number(candle?.close)
    }))
    .filter((point) => point.date && Number.isFinite(point.price))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function normalizeHistoryPoint(point) {
  const price = Number(point?.price);
  const time = String(point?.time || "").trim();
  if (!Number.isFinite(price) || !time) return null;
  return { price, time };
}

function chartDayKey(time) {
  const raw = String(time || "").trim();
  if (!raw) return "";
  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return raw.slice(0, 10);
}

function newestHistoryPoint(points = []) {
  return (Array.isArray(points) ? points : [])
    .map(normalizeHistoryPoint)
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = Date.parse(String(left.time || ""));
      const rightTime = Date.parse(String(right.time || ""));
      if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime;
      return String(left.time || "").localeCompare(String(right.time || ""));
    })
    .at(-1) || null;
}

function compactLocalSeriesByDay(points = []) {
  const byDay = new Map();
  (Array.isArray(points) ? points : [])
    .map(normalizeHistoryPoint)
    .filter(Boolean)
    .forEach((point) => {
      const day = chartDayKey(point.time);
      if (!day) return;
      const previous = byDay.get(day);
      const previousTime = previous ? Date.parse(previous.time) : NaN;
      const pointTime = Date.parse(point.time);
      if (!previous || !Number.isFinite(previousTime) || !Number.isFinite(pointTime) || pointTime >= previousTime) {
        byDay.set(day, point);
      }
    });
  return [...byDay.values()].sort((left, right) => chartDayKey(left.time).localeCompare(chartDayKey(right.time)));
}

function buildAlertHistoryMap(paths, config, historyBySeries = {}, state = {}, liveResults = {}) {
  const chartByAlertId = new Map();
  config.alerts.forEach((rawRule, index) => {
    const rule = normalizeRule(rawRule, index + 1);
    const seriesKey = alertSeriesKey(rule.resourceId, rule.quality);
    const runtime = liveResults?.[rule.id] || {};
    const persisted = state?.[rule.id] || {};
    const externalSeries = buildExternalChartSeries(paths, rule);
    const localSeries = Array.isArray(historyBySeries?.[seriesKey])
      ? historyBySeries[seriesKey].map(normalizeHistoryPoint).filter(Boolean)
      : [];
    const fallbackPrice = Number.isFinite(Number(runtime?.price))
      ? Number(runtime.price)
      : Number(persisted?.lastSeenPrice);
    const fallbackTime = String(runtime?.sourceTime || persisted?.resourceTime || persisted?.lastSeenAt || "").trim();
    const fallbackPoint = Number.isFinite(fallbackPrice) && fallbackTime
      ? { price: fallbackPrice, time: fallbackTime }
      : null;
    const latestLocalPoint = newestHistoryPoint(localSeries);
    const latestPoint = newestHistoryPoint([fallbackPoint, latestLocalPoint]);
    const rawBaseSeries = externalSeries.length
      ? externalSeries
      : compactLocalSeriesByDay(localSeries);
    const latestDay = chartDayKey(latestPoint?.time);
    const baseSeries = latestDay
      ? rawBaseSeries.filter((point) => chartDayKey(point.time) !== latestDay)
      : rawBaseSeries;
    const series = mergeChartSeries(baseSeries, [], latestPoint);
    if (!series.length) {
      return;
    }
    const points = series.slice(-ALERT_CHART_POINT_COUNT);
    const values = points.map((point) => point.price).filter(Number.isFinite);
    if (!values.length) {
      return;
    }
    chartByAlertId.set(rule.id, {
      points,
      minPrice: Math.min(...values),
      maxPrice: Math.max(...values),
      targetPrice: Number.isFinite(Number(rule.targetPrice)) ? Number(rule.targetPrice) : null,
      targetPriceMax: Number.isFinite(Number(rule.targetPriceMax)) ? Number(rule.targetPriceMax) : null
    });
  });
  return chartByAlertId;
}

function updatePriceHistory(paths, config, liveResults = {}, scannedAt = null) {
  const historyBySeries = loadPriceHistory(paths);
  config.alerts.forEach((rawRule, index) => {
    const rule = normalizeRule(rawRule, index + 1);
    const runtime = liveResults?.[rule.id];
    const price = Number(runtime?.price);
    if (!Number.isFinite(price)) {
      return;
    }
    const seriesKey = alertSeriesKey(rule.resourceId, rule.quality);
    const nextPoint = {
      price,
      time: String(runtime?.sourceTime || scannedAt || new Date().toISOString())
    };
    if (!nextPoint.time) {
      return;
    }
    const currentSeries = Array.isArray(historyBySeries[seriesKey])
      ? historyBySeries[seriesKey].map(normalizeHistoryPoint).filter(Boolean)
      : [];
    const previousPoint = currentSeries[currentSeries.length - 1];
    if (!previousPoint || previousPoint.time !== nextPoint.time || Number(previousPoint.price) !== nextPoint.price) {
      currentSeries.push(nextPoint);
    }
    historyBySeries[seriesKey] = currentSeries.slice(-PRICE_HISTORY_MAX_POINTS);
  });
  savePriceHistory(paths, historyBySeries);
  return historyBySeries;
}

function priceGap(rule, price) {
  if (!Number.isFinite(price)) {
    return {
      gapDisplay: "-",
      gapPercentDisplay: "-",
      gapSentence: uiText("Todavía no hay una lectura cargada para esta alerta.", "There is no reading loaded for this alert yet.")
    };
  }
  if (rule.condition === "<=" || rule.condition === "<") {
    const diff = price - rule.targetPrice;
    const pct = rule.targetPrice ? (diff / rule.targetPrice) * 100 : 0;
    return diff > 0
      ? {
          gapDisplay: formatMarketNumber(diff),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: uiText(`Le faltan ${formatMarketNumber(diff)} para entrar en compra.`, `${formatMarketNumber(diff)} away from entering the buy zone.`)
        }
      : {
          gapDisplay: formatMarketNumber(Math.abs(diff)),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: uiText(`Ya está ${formatMarketNumber(Math.abs(diff))} abajo de tu precio de compra.`, `Already ${formatMarketNumber(Math.abs(diff))} below your buy price.`)
        };
  }
  if (rule.condition === ">=" || rule.condition === ">") {
    const diff = rule.targetPrice - price;
    const pct = rule.targetPrice ? ((price - rule.targetPrice) / rule.targetPrice) * 100 : 0;
    return diff > 0
      ? {
          gapDisplay: formatMarketNumber(diff),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: uiText(`Le faltan ${formatMarketNumber(diff)} para entrar en venta.`, `${formatMarketNumber(diff)} away from entering the sell zone.`)
        }
      : {
          gapDisplay: formatMarketNumber(Math.abs(diff)),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: uiText(`Ya está ${formatMarketNumber(Math.abs(diff))} arriba de tu precio de venta.`, `Already ${formatMarketNumber(Math.abs(diff))} above your sell price.`)
        };
  }
  if (rule.condition === "between") {
    const low = Math.min(rule.targetPrice, rule.targetPriceMax);
    const high = Math.max(rule.targetPrice, rule.targetPriceMax);
    if (price >= low && price <= high) {
      return {
        gapDisplay: "0",
        gapPercentDisplay: "0.00%",
        gapSentence: uiText("El precio ya está dentro del rango.", "The price is already inside the range.")
      };
    }
    const edge = price < low ? low : high;
    const diff = Math.abs(price - edge);
    const pct = edge ? ((price - edge) / edge) * 100 : 0;
    return {
      gapDisplay: formatMarketNumber(diff),
      gapPercentDisplay: signedPercent(pct),
      gapSentence: uiText(`Le faltan ${formatMarketNumber(diff)} para entrar al rango.`, `${formatMarketNumber(diff)} away from entering the range.`)
    };
  }
  const diff = Math.abs(price - rule.targetPrice);
  const pct = rule.targetPrice ? ((price - rule.targetPrice) / rule.targetPrice) * 100 : 0;
  return {
    gapDisplay: formatMarketNumber(diff),
    gapPercentDisplay: signedPercent(pct),
    gapSentence: uiText(`Le faltan ${formatMarketNumber(diff)} para tocar tu precio objetivo.`, `${formatMarketNumber(diff)} away from your target price.`)
  };
}

function buildAlertRows(config, state, liveResults = {}, chartByAlertId = new Map()) {
  return config.alerts.map((rawRule, index) => {
    const rule = normalizeRule(rawRule, index + 1, uiLanguage);
    const runtime = liveResults[rule.id] || {};
    const persisted = state[rule.id] || {};
    const resource = getResourceById(rule.resourceId);
    const resourceName = localizedResourceName(resource) || runtime.resourceName || resourceFallbackLabel(rule.resourceId);
    const price = Number.isFinite(runtime.price) ? runtime.price : Number(persisted.lastSeenPrice);
    const matched = typeof runtime.matched === "boolean" ? runtime.matched : Boolean(persisted.matched);
    const action = classifyRule(rule, uiLanguage);
    const gap = priceGap(rule, price);
    return {
      index,
      id: rule.id,
      label: rule.label,
      resourceId: rule.resourceId,
      resourceName,
      quality: rule.quality,
      logoFile: resource?.logoFile || "",
      logoUrl: resource?.logoUrl || "",
      condition: rule.condition,
      targetPrice: rule.targetPrice,
      targetPriceMax: rule.targetPriceMax ?? null,
      enabled: rule.enabled,
      repeatWhileMatched: rule.repeatWhileMatched,
      notificationKindOverride: rule.notificationKindOverride || "",
      actionKey: action.key,
      actionLabel: action.label,
      price,
      priceDisplay: Number.isFinite(price) ? formatMarketNumber(price) : "-",
      targetDisplay: describeCondition(rule, uiLanguage),
      triggerSentence:
        rule.condition === "<=" ? uiText(`Avisa si baja a ${formatMarketNumber(rule.targetPrice)} o menos`, `Alert me if it drops to ${formatMarketNumber(rule.targetPrice)} or below`) :
        rule.condition === "<" ? uiText(`Avisa si baja de ${formatMarketNumber(rule.targetPrice)}`, `Alert me if it drops below ${formatMarketNumber(rule.targetPrice)}`) :
        rule.condition === ">=" ? uiText(`Avisa si sube a ${formatMarketNumber(rule.targetPrice)} o más`, `Alert me if it rises to ${formatMarketNumber(rule.targetPrice)} or above`) :
        rule.condition === ">" ? uiText(`Avisa si sube de ${formatMarketNumber(rule.targetPrice)}`, `Alert me if it rises above ${formatMarketNumber(rule.targetPrice)}`) :
        rule.condition === "between" ? uiText(`Avisa si entra entre ${formatMarketNumber(rule.targetPrice)} y ${formatMarketNumber(rule.targetPriceMax)}`, `Alert me if it enters the range ${formatMarketNumber(rule.targetPrice)} to ${formatMarketNumber(rule.targetPriceMax)}`) :
        uiText(`Avisa si toca ${formatMarketNumber(rule.targetPrice)}`, `Alert me if it hits ${formatMarketNumber(rule.targetPrice)}`),
      gapDisplay: gap.gapDisplay,
      gapPercentDisplay: gap.gapPercentDisplay,
      gapSentence: gap.gapSentence,
      matched,
      statusText: !rule.enabled
        ? uiText("Pausada", "Paused")
        : matched
          ? (action.key === "buy"
            ? uiText("Momento de compra", "Buy moment")
            : action.key === "sell"
              ? uiText("Momento de venta", "Sell moment")
              : uiText("Dentro del rango", "Inside range"))
          : uiText("Todavía no llegó", "Not there yet"),
      statusTone: !rule.enabled ? "muted" : matched ? "match" : "watch",
      lastSeenAt: runtime.sourceTime || persisted.lastSeenAt || "",
      lastSeenLocal: isoLocal(runtime.sourceTime || persisted.lastSeenAt),
      sourceTime: runtime.sourceTime || persisted.resourceTime || "",
      sourceTimeLocal: isoLocal(runtime.sourceTime || persisted.resourceTime),
      lastNotifiedAt: persisted.lastNotifiedAt || null,
      chart: chartByAlertId.get(rule.id) || null
    };
  });
}

async function refreshPortfolioMarketState(paths, config, state, { allowNetwork = false, locale = "es" } = {}) {
  const holdings = Array.isArray(config?.portfolio) ? config.portfolio : [];
  const portfolioMarket = state.__portfolioMarket && typeof state.__portfolioMarket === "object"
    ? state.__portfolioMarket
    : {};
  const nextMarket = { ...portfolioMarket };
  const tickerCache = new Map();
  const productCache = new Map();
  const realmId = Number(config?.realmId || 0);
  const results = new Map();

  let tickerSnapshot = null;
  if (holdings.length) {
    try {
      tickerSnapshot = await fetchMarketTicker(realmId, tickerCache, { allowNetwork, locale });
    } catch (_error) {
      tickerSnapshot = null;
    }
  }

  const tickerByResource = new Map(
    (Array.isArray(tickerSnapshot?.rows) ? tickerSnapshot.rows : [])
      .map((row) => [Number(row?.kind), row])
      .filter(([kind]) => Number.isFinite(kind))
  );

  let transportEntry = null;
  try {
    const transportSnapshot = await fetchMarketProduct(realmId, PORTFOLIO_TRANSPORT_RESOURCE_ID, productCache, { allowNetwork, locale });
    const transportListing = lowestListingForQuality(transportSnapshot?.rows, 0);
    if (transportListing && Number.isFinite(Number(transportListing.price))) {
      transportEntry = {
        resourceId: PORTFOLIO_TRANSPORT_RESOURCE_ID,
        quality: 0,
        resourceName: localizedResourceName(getResourceById(PORTFOLIO_TRANSPORT_RESOURCE_ID)) || resourceFallbackLabel(PORTFOLIO_TRANSPORT_RESOURCE_ID),
        price: Number(transportListing.price),
        sourceTime: transportListing.datetimeDecayUpdated || transportListing.posted || snapshotIso(transportSnapshot.fetchedAt),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (_error) {
    transportEntry = null;
  }

  if (!transportEntry) {
    const transportTickerRow = tickerByResource.get(PORTFOLIO_TRANSPORT_RESOURCE_ID);
    if (transportTickerRow && Number.isFinite(Number(transportTickerRow.price))) {
      transportEntry = {
        resourceId: PORTFOLIO_TRANSPORT_RESOURCE_ID,
        quality: 0,
        resourceName: localizedResourceName(getResourceById(PORTFOLIO_TRANSPORT_RESOURCE_ID)) || resourceFallbackLabel(PORTFOLIO_TRANSPORT_RESOURCE_ID),
        price: Number(transportTickerRow.price),
        sourceTime: tickerSnapshot ? snapshotIso(tickerSnapshot.fetchedAt) : "",
        updatedAt: new Date().toISOString()
      };
    }
  }

  if (transportEntry) {
    nextMarket[portfolioTransportSeriesKey()] = transportEntry;
    results.set(portfolioTransportSeriesKey(), transportEntry);
  }

  const uniqueCombos = new Map();
  holdings.forEach((holding) => {
    uniqueCombos.set(alertSeriesKey(holding.resourceId, holding.quality), holding);
  });

  for (const [seriesKey, holding] of uniqueCombos.entries()) {
    const resourceId = Number(holding.resourceId);
    const quality = Number(holding.quality || 0);
    const resource = getResourceById(resourceId);
    const resourceName = localizedResourceName(resource) || resourceFallbackLabel(resourceId);

    try {
      const productSnapshot = await fetchMarketProduct(realmId, resourceId, productCache, { allowNetwork, locale });
      const listing = lowestListingForQuality(productSnapshot.rows, quality);
      if (!listing || !Number.isFinite(Number(listing.price))) {
        if (quality !== 0) {
          continue;
        }
        const tickerRow = tickerByResource.get(resourceId);
        if (!tickerRow || !Number.isFinite(Number(tickerRow.price))) {
          continue;
        }
        const fallbackEntry = {
          resourceId,
          quality,
          resourceName,
          price: Number(tickerRow.price),
          sourceTime: tickerSnapshot ? snapshotIso(tickerSnapshot.fetchedAt) : "",
          updatedAt: new Date().toISOString()
        };
        nextMarket[seriesKey] = fallbackEntry;
        results.set(seriesKey, fallbackEntry);
        continue;
      }
      const nextEntry = {
        resourceId,
        quality,
        resourceName,
        price: Number(listing.price),
        sourceTime: listing.datetimeDecayUpdated || listing.posted || snapshotIso(productSnapshot.fetchedAt),
        updatedAt: new Date().toISOString()
      };
      nextMarket[seriesKey] = nextEntry;
      results.set(seriesKey, nextEntry);
    } catch (_error) {
      if (quality === 0) {
        const tickerRow = tickerByResource.get(resourceId);
        if (tickerRow && Number.isFinite(Number(tickerRow.price))) {
          const fallbackEntry = {
            resourceId,
            quality,
            resourceName,
            price: Number(tickerRow.price),
            sourceTime: tickerSnapshot ? snapshotIso(tickerSnapshot.fetchedAt) : "",
            updatedAt: new Date().toISOString()
          };
          nextMarket[seriesKey] = fallbackEntry;
          results.set(seriesKey, fallbackEntry);
        }
      }
      // Conservamos la última lectura guardada para no vaciar la cartera si esta consulta falla.
    }
  }

  state.__portfolioMarket = nextMarket;
  return results;
}

async function getPortfolioResourceMeta(paths, config, resourceId, { allowNetwork = true, locale = "es" } = {}) {
  const numericResourceId = Number(resourceId);
  const resource = getResourceById(numericResourceId);
  if (!Number.isFinite(numericResourceId) || numericResourceId <= 0 || !resource) {
    throw new Error(uiText("Activo inválido para cartera.", "Invalid portfolio asset."));
  }

  const qualitySet = new Set([0]);
  const qualitySources = new Set(["default"]);
  const archive = loadSimtoolsProductArchive(paths, numericResourceId);
  const archiveQualities = Object.keys(archive?.qualities || {})
    .map((quality) => Number(quality))
    .filter((quality) => Number.isInteger(quality) && quality >= 0 && quality <= 12);
  archiveQualities.forEach((quality) => qualitySet.add(quality));
  if (archiveQualities.length) {
    qualitySources.add("history");
  }

  (Array.isArray(config?.portfolio) ? config.portfolio : [])
    .filter((holding) => Number(holding?.resourceId) === numericResourceId)
    .forEach((holding) => {
      const quality = Number(holding?.quality || 0);
      if (Number.isInteger(quality) && quality >= 0 && quality <= 12) {
        qualitySet.add(quality);
      }
    });
  if ((Array.isArray(config?.portfolio) ? config.portfolio : []).some((holding) => Number(holding?.resourceId) === numericResourceId)) {
    qualitySources.add("portfolio");
  }

  try {
    const productSnapshot = await fetchMarketProduct(Number(config?.realmId || 0), numericResourceId, new Map(), { allowNetwork, locale });
    const snapshotQualities = (Array.isArray(productSnapshot?.rows) ? productSnapshot.rows : [])
      .map((row) => Number(row?.quality))
      .filter((quality) => Number.isInteger(quality) && quality >= 0 && quality <= 12);
    snapshotQualities.forEach((quality) => qualitySet.add(quality));
    if (snapshotQualities.length) {
      qualitySources.add("market");
    }
  } catch (_error) {
    // Si no hay snapshot actual, seguimos con la mejor metadata local disponible.
  }

  const availableQualities = [...qualitySet].sort((left, right) => left - right);
  const transportUnits = Number(resource.transportUnits || 0);
  return {
    resourceId: numericResourceId,
    resourceName: localizedResourceName(resource) || resourceFallbackLabel(numericResourceId),
    transportUnits,
    availableQualities,
    fixedQuality: availableQualities[0] ?? 0,
    supportsQualitySelection: availableQualities.length > 1,
    qualityMode: availableQualities.length > 1 ? "select" : "fixed",
    qualitySources: [...qualitySources]
  };
}

function buildPortfolioHistoryChart(paths, portfolio = [], livePortfolioMap = new Map(), state = {}) {
  if (!Array.isArray(portfolio) || !portfolio.length) return null;
  const transportSeries = latestPortfolioArchiveSeries(paths, PORTFOLIO_TRANSPORT_RESOURCE_ID, 0);
  const seriesCollection = portfolio
    .map((holding) => ({
      holding,
      transportUnits: Number(getResourceById(holding.resourceId)?.transportUnits || 0),
      points: latestPortfolioArchiveSeries(paths, holding.resourceId, holding.quality)
    }))
    .filter((entry) => entry.points.length);

  if (!seriesCollection.length) return null;

  const allDates = [...new Set(seriesCollection.flatMap((entry) => entry.points.map((point) => point.date)))]
    .sort((left, right) => left.localeCompare(right));
  const totals = [];

  allDates.forEach((date) => {
    const transportPoint = latestPortfolioSeriesPointBeforeDate(transportSeries, date);
    const transportPrice = finitePortfolioNumber(transportPoint?.price);
    let grossValue = 0;
    let netValue = 0;
    let anyGrossValue = false;
    let anyNetValue = false;

    seriesCollection.forEach((entry) => {
      const latestPoint = latestPortfolioSeriesPointBeforeDate(entry.points, date);
      if (!latestPoint) return;
      const quantity = Number(entry.holding?.quantity || 0);
      const grossUnitPrice = finitePortfolioNumber(latestPoint.price);
      if (!Number.isFinite(grossUnitPrice) || !Number.isFinite(quantity)) return;

      grossValue += grossUnitPrice * quantity;
      anyGrossValue = true;

      const netUnitPrice = portfolioNetUnitPrice(grossUnitPrice, entry.transportUnits, transportPrice);
      if (!Number.isFinite(netUnitPrice)) return;
      netValue += netUnitPrice * quantity;
      anyNetValue = true;
    });

    if (anyGrossValue || anyNetValue) {
      totals.push({
        time: date,
        grossValue: anyGrossValue ? grossValue : null,
        netValue: anyNetValue ? netValue : null,
        transportPrice: Number.isFinite(transportPrice) ? transportPrice : null
      });
    }
  });

  const liveTransportEntry = livePortfolioMap.get(portfolioTransportSeriesKey())
    || state.__portfolioMarket?.[portfolioTransportSeriesKey()]
    || null;
  const liveTransportPrice = finitePortfolioNumber(liveTransportEntry?.price);

  let latestLiveGrossValue = 0;
  let latestLiveNetValue = 0;
  let anyLiveGrossValue = false;
  let anyLiveNetValue = false;
  portfolio.forEach((holding) => {
    const liveEntry = livePortfolioMap.get(alertSeriesKey(holding.resourceId, holding.quality))
      || state.__portfolioMarket?.[alertSeriesKey(holding.resourceId, holding.quality)];
    const price = finitePortfolioNumber(liveEntry?.price);
    const quantity = Number(holding.quantity || 0);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return;
    latestLiveGrossValue += price * quantity;
    anyLiveGrossValue = true;

    const transportUnits = Number(getResourceById(holding.resourceId)?.transportUnits || 0);
    const netUnitPrice = portfolioNetUnitPrice(price, transportUnits, liveTransportPrice);
    if (!Number.isFinite(netUnitPrice)) return;
    latestLiveNetValue += netUnitPrice * quantity;
    anyLiveNetValue = true;
  });

  const latestLiveDate = new Date().toISOString().slice(0, 10);
  if (anyLiveGrossValue || anyLiveNetValue) {
    const lastPoint = totals[totals.length - 1];
    if (lastPoint?.time === latestLiveDate) {
      if (anyLiveGrossValue) {
        lastPoint.grossValue = latestLiveGrossValue;
      }
      if (anyLiveNetValue) {
        lastPoint.netValue = latestLiveNetValue;
      }
      if (Number.isFinite(liveTransportPrice)) {
        lastPoint.transportPrice = liveTransportPrice;
      }
    } else {
      totals.push({
        time: latestLiveDate,
        grossValue: anyLiveGrossValue ? latestLiveGrossValue : null,
        netValue: anyLiveNetValue ? latestLiveNetValue : null,
        transportPrice: Number.isFinite(liveTransportPrice) ? liveTransportPrice : null
      });
    }
  }

  const points = totals.slice(-PORTFOLIO_CHART_POINT_COUNT);
  const grossValues = points.map((point) => Number(point.grossValue)).filter(Number.isFinite);
  const netValues = points.map((point) => Number(point.netValue)).filter(Number.isFinite);
  if (!points.length || (!grossValues.length && !netValues.length)) return null;

  return {
    points,
    latestTime: points[points.length - 1]?.time || "",
    latestGrossValue: grossValues.length ? grossValues[grossValues.length - 1] : null,
    latestNetValue: netValues.length ? netValues[netValues.length - 1] : null,
    hasGrossSeries: grossValues.length > 0,
    hasNetSeries: netValues.length > 0
  };
}

function buildPortfolioRows(paths, config, state, livePortfolioMap = new Map()) {
  const holdings = Array.isArray(config?.portfolio) ? config.portfolio : [];
  const persistedPortfolio = state.__portfolioMarket && typeof state.__portfolioMarket === "object"
    ? state.__portfolioMarket
    : {};
  const transportEntry = livePortfolioMap.get(portfolioTransportSeriesKey())
    || persistedPortfolio[portfolioTransportSeriesKey()]
    || null;
  const transportPrice = finitePortfolioNumber(transportEntry?.price);
  const positions = holdings.map((holding) => {
    const resource = getResourceById(holding.resourceId);
    const seriesKey = alertSeriesKey(holding.resourceId, holding.quality);
    const liveEntry = livePortfolioMap.get(seriesKey) || persistedPortfolio[seriesKey] || null;
    const currentPrice = finitePortfolioNumber(liveEntry?.price);
    const quantity = Number(holding.quantity || 0);
    const buyPrice = Number(holding.buyPrice || 0);
    const transportUnits = Number(resource?.transportUnits || 0);
    const invested = buyPrice * quantity;
    const grossCurrentValue = Number.isFinite(currentPrice) ? currentPrice * quantity : null;
    const grossPnl = Number.isFinite(grossCurrentValue) ? grossCurrentValue - invested : null;
    const grossPnlPct = invested > 0 && Number.isFinite(grossPnl) ? (grossPnl / invested) * 100 : null;
    const netCurrentPrice = portfolioNetUnitPrice(currentPrice, transportUnits, transportPrice);
    const netCurrentValue = Number.isFinite(netCurrentPrice) ? netCurrentPrice * quantity : null;
    const netPnl = Number.isFinite(netCurrentValue) ? netCurrentValue - invested : null;
    const netPnlPct = invested > 0 && Number.isFinite(netPnl) ? (netPnl / invested) * 100 : null;
    return {
      id: String(holding.id),
      resourceId: Number(holding.resourceId),
      resourceName: localizedResourceName(resource) || resourceFallbackLabel(holding.resourceId),
      groupName: isEnglishUi() ? String(resource?.groupEn || resource?.group || "") : String(resource?.group || ""),
      quality: Number(holding.quality || 0),
      quantity,
      buyPrice,
      invested,
      transportUnits,
      transportPrice,
      grossCurrentPrice: Number.isFinite(currentPrice) ? currentPrice : null,
      grossCurrentValue,
      grossPnl,
      grossPnlPct,
      netCurrentPrice,
      netCurrentValue,
      netPnl,
      netPnlPct,
      currentPrice: Number.isFinite(currentPrice) ? currentPrice : null,
      currentValue: grossCurrentValue,
      pnl: grossPnl,
      pnlPct: grossPnlPct,
      priceSourceTime: String(liveEntry?.sourceTime || ""),
      createdAt: String(holding.createdAt || ""),
      logoUrl: resource?.logoUrl || "",
      missingPrice: !Number.isFinite(currentPrice),
      missingNetPrice: transportUnits > 0 ? !Number.isFinite(netCurrentPrice) : !Number.isFinite(currentPrice)
    };
  });

  const totalInvested = positions.reduce((total, item) => total + item.invested, 0);
  const totalUnits = positions.reduce((total, item) => total + item.quantity, 0);
  const grossPricedEntries = positions.filter((item) => Number.isFinite(item.grossCurrentValue));
  const grossPricedPositions = grossPricedEntries.length;
  const totalGrossCurrentValue = grossPricedEntries.reduce((total, item) => total + Number(item.grossCurrentValue || 0), 0);
  const totalGrossInvestedPriced = grossPricedEntries.reduce((total, item) => total + item.invested, 0);
  const totalGrossPnl = grossPricedPositions ? totalGrossCurrentValue - totalGrossInvestedPriced : 0;
  const totalGrossPnlPct = totalGrossInvestedPriced > 0 ? (totalGrossPnl / totalGrossInvestedPriced) * 100 : null;

  const netPricedEntries = positions.filter((item) => Number.isFinite(item.netCurrentValue));
  const netPricedPositions = netPricedEntries.length;
  const totalNetCurrentValue = netPricedEntries.reduce((total, item) => total + Number(item.netCurrentValue || 0), 0);
  const totalNetInvestedPriced = netPricedEntries.reduce((total, item) => total + item.invested, 0);
  const totalNetPnl = netPricedPositions ? totalNetCurrentValue - totalNetInvestedPriced : 0;
  const totalNetPnlPct = totalNetInvestedPriced > 0 ? (totalNetPnl / totalNetInvestedPriced) * 100 : null;

  const chart = buildPortfolioHistoryChart(paths, holdings, livePortfolioMap, state);

  return {
    positions: positions.map((item) => ({
      ...item,
      investedDisplay: formatMarketNumber(item.invested),
      grossCurrentPriceDisplay: Number.isFinite(item.grossCurrentPrice) ? formatMarketNumber(item.grossCurrentPrice) : "-",
      grossCurrentValueDisplay: Number.isFinite(item.grossCurrentValue) ? formatMarketNumber(item.grossCurrentValue) : "-",
      grossPnlDisplay: Number.isFinite(item.grossPnl) ? formatMarketNumber(item.grossPnl) : "-",
      grossPnlPctDisplay: Number.isFinite(item.grossPnlPct) ? `${item.grossPnlPct >= 0 ? "+" : ""}${item.grossPnlPct.toFixed(2)}%` : "-",
      netCurrentPriceDisplay: Number.isFinite(item.netCurrentPrice) ? formatMarketNumber(item.netCurrentPrice) : "-",
      netCurrentValueDisplay: Number.isFinite(item.netCurrentValue) ? formatMarketNumber(item.netCurrentValue) : "-",
      netPnlDisplay: Number.isFinite(item.netPnl) ? formatMarketNumber(item.netPnl) : "-",
      netPnlPctDisplay: Number.isFinite(item.netPnlPct) ? `${item.netPnlPct >= 0 ? "+" : ""}${item.netPnlPct.toFixed(2)}%` : "-",
      currentPriceDisplay: Number.isFinite(item.currentPrice) ? formatMarketNumber(item.currentPrice) : "-",
      currentValueDisplay: Number.isFinite(item.currentValue) ? formatMarketNumber(item.currentValue) : "-",
      pnlDisplay: Number.isFinite(item.pnl) ? formatMarketNumber(item.pnl) : "-",
      pnlPctDisplay: Number.isFinite(item.pnlPct) ? `${item.pnlPct >= 0 ? "+" : ""}${item.pnlPct.toFixed(2)}%` : "-",
      weightPct: totalGrossCurrentValue > 0 && Number.isFinite(item.grossCurrentValue) ? (item.grossCurrentValue / totalGrossCurrentValue) * 100 : 0
    })),
    summary: {
      positionCount: positions.length,
      pricedPositions: grossPricedPositions,
      grossPricedPositions,
      netPricedPositions,
      totalUnits,
      totalInvested,
      totalCurrentValue: totalGrossCurrentValue,
      totalPnl: totalGrossPnl,
      totalPnlPct: totalGrossPnlPct,
      totalGrossCurrentValue,
      totalGrossPnl,
      totalGrossPnlPct,
      totalNetCurrentValue,
      totalNetPnl,
      totalNetPnlPct,
      transportPrice,
      feeRate: PORTFOLIO_MARKET_FEE_RATE,
      coveragePct: positions.length ? (grossPricedPositions / positions.length) * 100 : 0,
      grossCoveragePct: positions.length ? (grossPricedPositions / positions.length) * 100 : 0,
      netCoveragePct: positions.length ? (netPricedPositions / positions.length) * 100 : 0
    },
    chart
  };
}

function buildDashboard(liveResults = {}, scanErrors = [], scannedAt = null, livePortfolioMap = new Map()) {
  const rootPaths = dataPaths();
  const config = buildConfigSnapshot(loadConfig(rootPaths));
  const paths = activeRealmDataPaths(rootPaths, config);
  const state = loadState(paths);
  const historyBySeries = loadPriceHistory(paths);
  const chartByAlertId = buildAlertHistoryMap(paths, config, historyBySeries, state, liveResults);
  const alerts = buildAlertRows(config, state, liveResults, chartByAlertId);
  const portfolio = buildPortfolioRows(paths, config, state, livePortfolioMap);
  const events = recentEvents(paths);
  const effectiveErrors = Array.isArray(scanErrors) && (scanErrors.length || scannedAt)
    ? scanErrors
    : lastScanSnapshot.errors;
  const effectiveScannedAt = scannedAt || lastScanSnapshot.scannedAt;
  const marketStatus = summarizeMarketStatus(effectiveErrors);
  return {
    app: {
      name: "SimMarket",
      mode: app.isPackaged ? "production" : "development",
      dataDir: rootPaths.baseDir,
      realmDataDir: paths.baseDir,
      configPath: rootPaths.configPath,
      statePath: paths.statePath,
      logPath: paths.eventsPath,
      realm: config.realm
    },
    config,
    summary: {
      totalAlerts: alerts.length,
      enabledAlerts: alerts.filter((item) => item.enabled).length,
      matchedAlerts: alerts.filter((item) => item.enabled && item.matched).length
    },
    monitor: {
      statusLabel: scanInFlight ? uiText("Escaneando", "Scanning") : config.scanEnabled === false ? uiText("Pausado", "Paused") : uiText("Activo", "Active"),
      intervalSeconds: config.pollSeconds,
      scanEnabled: config.scanEnabled !== false,
      marketState: marketStatus.state,
      marketTitle: marketStatus.title,
      marketMessage: marketStatus.message,
      affectedAlerts: marketStatus.affectedAlerts
    },
    alerts,
    portfolio,
    events,
    resourceCatalog: RESOURCE_CATALOG,
    updates: updateState,
    scan: {
      scannedAt: effectiveScannedAt,
      scannedLocal: isoLocal(effectiveScannedAt),
      errors: effectiveErrors
    },
    warnings: config.skippedAlerts
  };
}

async function runScan(triggerNotifications = true, options = {}) {
  if (scanInFlight) {
    return buildDashboard();
  }
  scanInFlight = true;
  try {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    const paths = activeRealmDataPaths(rootPaths, config);
    const state = loadState(paths);
    const append = (record) => appendEvent(paths, record);
    const result = await scanAlerts({
      config,
      state,
      appendEvent: append,
      allowNetwork: options.allowNetwork !== false,
      triggerNotifications,
      locale: uiLanguage,
      onTrigger: (payload) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("alert:triggered", payload);
        }
        if (config.channels?.desktop) {
          if (process.platform === "darwin" && app.dock) {
            app.dock.bounce("informational");
          }
        }
      }
    });
    const portfolioLiveMap = await refreshPortfolioMarketState(paths, config, state, {
      allowNetwork: options.allowNetwork !== false,
      locale: uiLanguage
    });
    saveState(paths, state);
    updatePriceHistory(paths, config, result.results, result.scannedAt);
    lastScanSnapshot = {
      scannedAt: result.scannedAt,
      errors: result.errors
    };
    return buildDashboard(result.results, result.errors, result.scannedAt, portfolioLiveMap);
  } finally {
    scanInFlight = false;
  }
}

function restartScheduler() {
  if (scanTimer) {
    clearTimeout(scanTimer);
    scanTimer = null;
  }
}

function scheduleNextScan(delayMs = SCAN_INTERVAL_MS) {
  restartScheduler();
  const config = buildConfigSnapshot(loadConfig(dataPaths()));
  if (config.scanEnabled === false) {
    return;
  }
  scanTimer = setTimeout(async () => {
    scanTimer = null;
    const startedAt = Date.now();
    try {
      await runScan(true);
    } catch (_error) {
      // El próximo ciclo vuelve a intentar automáticamente.
    } finally {
      const elapsed = Date.now() - startedAt;
      scheduleNextScan(Math.max(0, SCAN_INTERVAL_MS - elapsed));
    }
  }, Math.max(0, Number(delayMs) || 0));
}

async function startAutomaticScanning(triggerNotifications = false) {
  restartScheduler();
  const config = buildConfigSnapshot(loadConfig(dataPaths()));
  if (config.scanEnabled === false) {
    return buildDashboard();
  }
  const startedAt = Date.now();
  try {
    return await runScan(triggerNotifications);
  } finally {
    const elapsed = Date.now() - startedAt;
    scheduleNextScan(Math.max(0, SCAN_INTERVAL_MS - elapsed));
  }
}

function alertNeedsCachedMarketData(alert, realmId) {
  if (Boolean(alert?.enabled) === false) return false;
  const quality = Number(alert?.quality || 0);
  const resourceId = Number(alert?.resourceId || 0);
  if (!Number.isFinite(resourceId) || resourceId <= 0) return false;
  if (quality === 0) {
    return !hasTickerSnapshot(realmId);
  }
  return !hasProductSnapshot(realmId, resourceId);
}

function configNeedsNetworkPriming(previousConfig, nextConfig) {
  const realmId = Number(nextConfig?.realmId || 0);
  const nextAlerts = Array.isArray(nextConfig?.alerts) ? nextConfig.alerts : [];
  const previousAlerts = Array.isArray(previousConfig?.alerts) ? previousConfig.alerts : [];
  const previousById = new Map(previousAlerts.map((alert) => [String(alert.id), alert]));

  if (!lastScanSnapshot.scannedAt) {
    return nextAlerts.some((alert) => alertNeedsCachedMarketData(alert, realmId));
  }

  if (Number(previousConfig?.realmId || 0) !== realmId) {
    return nextAlerts.some((alert) => alertNeedsCachedMarketData(alert, realmId));
  }

  return nextAlerts.some((alert) => {
    const previous = previousById.get(String(alert.id));
    if (!previous) {
      return alertNeedsCachedMarketData(alert, realmId);
    }
    const becameEnabled = Boolean(previous.enabled) === false && Boolean(alert.enabled) !== false;
    const resourceChanged = Number(previous.resourceId) !== Number(alert.resourceId);
    const qualityChanged = Number(previous.quality) !== Number(alert.quality);
    if (!becameEnabled && !resourceChanged && !qualityChanged) {
      return false;
    }
    return alertNeedsCachedMarketData(alert, realmId);
  });
}

function portfolioHoldingNeedsCachedMarketData(holding, realmId) {
  const quality = Number(holding?.quality || 0);
  const resourceId = Number(holding?.resourceId || 0);
  if (!Number.isFinite(resourceId) || resourceId <= 0) return false;
  if (quality === 0) {
    return !hasTickerSnapshot(realmId);
  }
  return !hasProductSnapshot(realmId, resourceId);
}

function portfolioNeedsNetworkPriming(previousConfig, nextConfig) {
  const realmId = Number(nextConfig?.realmId || 0);
  const nextPortfolio = Array.isArray(nextConfig?.portfolio) ? nextConfig.portfolio : [];
  const previousPortfolio = Array.isArray(previousConfig?.portfolio) ? previousConfig.portfolio : [];
  const previousById = new Map(previousPortfolio.map((holding) => [String(holding.id), holding]));

  if (Number(previousConfig?.realmId || 0) !== realmId) {
    return nextPortfolio.some((holding) => portfolioHoldingNeedsCachedMarketData(holding, realmId));
  }

  return nextPortfolio.some((holding) => {
    const previous = previousById.get(String(holding.id));
    if (!previous) {
      return portfolioHoldingNeedsCachedMarketData(holding, realmId);
    }
    const resourceChanged = Number(previous.resourceId) !== Number(holding.resourceId);
    const qualityChanged = Number(previous.quality) !== Number(holding.quality);
    if (!resourceChanged && !qualityChanged) {
      return false;
    }
    return portfolioHoldingNeedsCachedMarketData(holding, realmId);
  });
}

async function refreshAfterConfigSave(allowNetwork = false) {
  const startedAt = Date.now();
  try {
    return await runScan(false, { allowNetwork });
  } finally {
    const elapsed = Date.now() - startedAt;
    scheduleNextScan(Math.max(0, SCAN_INTERVAL_MS - elapsed));
  }
}

function createWindow() {
  mainWindowReady = false;
  mainWindow = new BrowserWindow({
    width: 1460,
    height: 940,
    minWidth: 1220,
    minHeight: 780,
    center: true,
    show: false,
    fullscreen: !IS_WINDOWS,
    simpleFullscreen: false,
    autoHideMenuBar: IS_WINDOWS,
    backgroundColor: "#0b0b0b",
    ...(fs.existsSync(APP_ICON_PATH) ? { icon: APP_ICON_PATH } : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (IS_WINDOWS) {
    mainWindow.setMenuBarVisibility(false);
    if (typeof mainWindow.removeMenu === "function") {
      mainWindow.removeMenu();
    }
  }

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindowReady = true;
    revealMainWindowIfReady();
  });
}

function normalizeIncomingPortfolio(payload) {
  return Array.isArray(payload)
    ? payload.map((holding, index) => normalizePortfolioHolding(holding, index + 1, uiLanguage))
    : structuredClone(DEFAULT_CONFIG.portfolio);
}

function normalizeIncomingConfig(payload, previousConfig = DEFAULT_CONFIG) {
  const previous = normalizeConfig(previousConfig);
  const activeRealmId = normalizeRealmId(payload?.activeRealmId ?? payload?.realmId ?? previous.activeRealmId);
  const incomingRealms = payload?.realms && typeof payload.realms === "object" ? payload.realms : {};
  const nextRealms = structuredClone(previous.realms || {});
  REALM_OPTIONS.forEach((realm) => {
    const realmId = Number(realm.id);
    const key = String(realmId);
    const incomingBucket = incomingRealms[key] && typeof incomingRealms[key] === "object" ? incomingRealms[key] : null;
    nextRealms[key] = {
      alerts: Array.isArray(incomingBucket?.alerts)
        ? structuredClone(incomingBucket.alerts)
        : Array.isArray(nextRealms[key]?.alerts) ? structuredClone(nextRealms[key].alerts) : [],
      portfolio: Array.isArray(incomingBucket?.portfolio)
        ? structuredClone(incomingBucket.portfolio)
        : Array.isArray(nextRealms[key]?.portfolio) ? structuredClone(nextRealms[key].portfolio) : []
    };
  });

  const activeAlerts = Array.isArray(payload?.alerts)
    ? payload.alerts.map((alert, index) => normalizeRule(alert, index + 1))
    : Array.isArray(nextRealms[String(activeRealmId)]?.alerts)
      ? nextRealms[String(activeRealmId)].alerts
      : [];
  const activePortfolio = normalizeIncomingPortfolio(Array.isArray(payload?.portfolio)
    ? payload.portfolio
    : nextRealms[String(activeRealmId)]?.portfolio);
  nextRealms[String(activeRealmId)] = {
    alerts: activeAlerts,
    portfolio: activePortfolio
  };

  return normalizeConfig({
    ...previous,
    realmId: activeRealmId,
    activeRealmId,
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(payload?.scanEnabled ?? true),
    channels: {
      desktop: Boolean(payload?.channels?.desktop),
      discordWebhookUrl: String(payload?.channels?.discordWebhookUrl || ""),
      telegramBotToken: String(payload?.channels?.telegramBotToken || ""),
      telegramChatId: String(payload?.channels?.telegramChatId || "")
    },
    alerts: activeAlerts,
    portfolio: activePortfolio,
    realms: nextRealms
  });
}

app.on("second-instance", () => {
  focusPrimaryWindows();
});

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) return;
  if (IS_WINDOWS) {
    Menu.setApplicationMenu(null);
  }
  if (process.platform === "darwin" && fs.existsSync(APP_ICON_PATH)) {
    app.dock.setIcon(nativeImage.createFromPath(APP_ICON_PATH));
  }
  createStartupWindow();
  configureWindowsUpdater();
  const initialConfig = buildConfigSnapshot(loadConfig(dataPaths()));
  if (initialConfig.channels?.discordWebhookUrl) {
    configureDiscordWebhookBranding(initialConfig.channels.discordWebhookUrl).catch(() => {});
  }
  if (initialConfig.scanEnabled !== false) {
    startAutomaticScanning(false).catch(() => {
      scheduleNextScan(SCAN_INTERVAL_MS);
    });
  }

  ipcMain.handle("dashboard:get", async () => buildDashboard());
  ipcMain.handle("catalog:get", async () => RESOURCE_CATALOG);
  ipcMain.handle("ui:set-language", async (_event, locale) => setUiLanguage(locale));
  ipcMain.handle("updates:get-state", async () => updateState);
  ipcMain.handle("updates:check", async () => checkForUpdates({ showPrompt: true }));
  ipcMain.handle("updates:primary-action", async () => runUpdatePrimaryAction());
  ipcMain.handle("updates:dismiss", async () => patchUpdateState({ promptVisible: false }));
  ipcMain.handle("startup:continue", async () => continueIntoApp());

  ipcMain.handle("config:save", async (_event, payload) => {
    const rootPaths = dataPaths();
    const previousStoredConfig = loadConfig(rootPaths);
    const previousConfig = buildConfigSnapshot(previousStoredConfig);
    const nextConfig = normalizeIncomingConfig(payload, previousStoredConfig);
    const nextSnapshot = buildConfigSnapshot(nextConfig);
    const paths = activeRealmDataPaths(rootPaths, nextSnapshot);
    saveConfig(rootPaths, nextConfig);
    refreshSimtoolsHistoryIfNeeded(paths, nextSnapshot, { reason: "config-save" })
      .then((result) => {
        if (!result?.updatedTargets) return;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("dashboard:updated");
        }
      })
      .catch(() => {});
    if (nextConfig.channels?.discordWebhookUrl) {
      configureDiscordWebhookBranding(nextConfig.channels.discordWebhookUrl).catch(() => {});
    } else {
      lastDiscordBrandedWebhook = "";
      discordBrandingInFlightWebhook = "";
    }
    const needsPortfolioNetwork = portfolioNeedsNetworkPriming(previousConfig, nextSnapshot);
    if (nextConfig.scanEnabled !== false) {
      const needsNetwork = configNeedsNetworkPriming(previousConfig, nextSnapshot) || needsPortfolioNetwork;
      return refreshAfterConfigSave(needsNetwork);
    }
    restartScheduler();
    if (needsPortfolioNetwork && nextSnapshot.portfolio.length) {
      const nextState = loadState(paths);
      await refreshPortfolioMarketState(paths, nextSnapshot, nextState, {
        allowNetwork: true,
        locale: uiLanguage
      });
      saveState(paths, nextState);
    }
    return buildDashboard();
  });

  ipcMain.handle("portfolio:save", async (_event, payload) => {
    const rootPaths = dataPaths();
    const currentConfig = normalizeConfig(loadConfig(rootPaths));
    const activeRealmId = normalizeRealmId(currentConfig.activeRealmId ?? currentConfig.realmId);
    const nextPortfolio = normalizeIncomingPortfolio(payload);
    const nextRealms = structuredClone(currentConfig.realms || {});
    nextRealms[String(activeRealmId)] = {
      alerts: Array.isArray(nextRealms[String(activeRealmId)]?.alerts)
        ? nextRealms[String(activeRealmId)].alerts
        : [],
      portfolio: nextPortfolio
    };
    const nextConfig = normalizeConfig({
      ...currentConfig,
      realmId: activeRealmId,
      activeRealmId,
      portfolio: nextPortfolio,
      realms: nextRealms
    });
    const nextSnapshot = buildConfigSnapshot(nextConfig);
    const paths = activeRealmDataPaths(rootPaths, nextSnapshot);
    saveConfig(rootPaths, nextConfig);
    refreshSimtoolsHistoryIfNeeded(paths, nextSnapshot, { reason: "portfolio-save" })
      .then((result) => {
        if (!result?.updatedTargets) return;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("dashboard:updated");
        }
      })
      .catch(() => {});
    const nextState = loadState(paths);
    await refreshPortfolioMarketState(paths, nextSnapshot, nextState, {
      allowNetwork: true,
      locale: uiLanguage
    });
    saveState(paths, nextState);
    return buildDashboard();
  });

  ipcMain.handle("portfolio:refresh", async () => {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    const paths = activeRealmDataPaths(rootPaths, config);
    const nextState = loadState(paths);
    await refreshPortfolioMarketState(paths, config, nextState, {
      allowNetwork: true,
      locale: uiLanguage
    });
    saveState(paths, nextState);
    return buildDashboard();
  });

  ipcMain.handle("portfolio:resource-meta", async (_event, payload) => {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    const paths = activeRealmDataPaths(rootPaths, config);
    return getPortfolioResourceMeta(paths, config, payload?.resourceId, {
      allowNetwork: true,
      locale: uiLanguage
    });
  });

  ipcMain.handle("realm:switch", async (_event, payload) => {
    const rootPaths = dataPaths();
    const currentConfig = normalizeConfig(loadConfig(rootPaths));
    const nextRealmId = normalizeRealmId(typeof payload === "object" ? payload?.realmId : payload);
    const nextConfig = normalizeConfig({
      ...currentConfig,
      realmId: nextRealmId,
      activeRealmId: nextRealmId
    });
    saveConfig(rootPaths, nextConfig);
    lastScanSnapshot = {
      scannedAt: null,
      errors: []
    };
    const nextSnapshot = buildConfigSnapshot(nextConfig);
    const paths = activeRealmDataPaths(rootPaths, nextSnapshot);
    refreshSimtoolsHistoryIfNeeded(paths, nextSnapshot, { reason: "realm-switch" })
      .then((result) => {
        if (!result?.updatedTargets) return;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("dashboard:updated");
        }
      })
      .catch(() => {});
    const nextState = loadState(paths);
    if (nextSnapshot.portfolio.length) {
      refreshPortfolioMarketState(paths, nextSnapshot, nextState, {
        allowNetwork: true,
        locale: uiLanguage
      })
        .then(() => {
          saveState(paths, nextState);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("dashboard:updated");
          }
        })
        .catch(() => {});
    }
    return buildDashboard();
  });

  ipcMain.handle("scan:now", async () => runScan(false, { allowNetwork: true }));

  ipcMain.handle("monitor:set-enabled", async (_event, enabled) => {
    const paths = dataPaths();
    const nextConfig = {
      ...loadConfig(paths),
      scanEnabled: Boolean(enabled)
    };
    saveConfig(paths, nextConfig);
    if (nextConfig.scanEnabled) {
      return startAutomaticScanning(false);
    }
    restartScheduler();
    return buildDashboard();
  });

  ipcMain.handle("event:delete", async (_event, eventId) => {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    deleteEvent(activeRealmDataPaths(rootPaths, config), eventId);
    return buildDashboard();
  });

  ipcMain.handle("events:clear", async () => {
    const rootPaths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(rootPaths));
    clearEvents(activeRealmDataPaths(rootPaths, config));
    return buildDashboard();
  });

  ipcMain.handle("external:open", async (_event, url) => {
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return { ok: false };
    }
    await shell.openExternal(url);
    return { ok: true };
  });

  ipcMain.handle("data:open-directory", async () => {
    await shell.openPath(dataPaths().baseDir);
    return true;
  });
  runStartupSequence().catch(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow();
    }
    startupSequenceDone = true;
    revealMainWindowIfReady();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startupSequenceDone = false;
      runStartupSequence().catch(() => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createWindow();
        }
        startupSequenceDone = true;
        revealMainWindowIfReady();
      });
    }
  });
});

app.on("window-all-closed", () => {
  clearInterval(simtoolsHistoryRefreshTimer);
  if (process.platform !== "darwin") {
    app.quit();
  }
});
