const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, nativeImage, shell, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { RESOURCE_CATALOG, getResourceById } = require("./catalog");
const { DEFAULT_CONFIG } = require("./defaults");
const {
  appDataPaths,
  appendEvent,
  clearEvents,
  deleteEvent,
  loadConfig,
  loadState,
  recentEvents,
  saveConfig,
  saveState
} = require("./storage");
const {
  classifyRule,
  describeCondition,
  formatMarketNumber,
  hasProductSnapshot,
  hasTickerSnapshot,
  normalizeRule,
  scanAlerts
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

const RELEASE_FETCH_TIMEOUT_MS = 5000;
const DISCORD_BRANDING_TIMEOUT_MS = 2500;
const SCAN_INTERVAL_MS = DEFAULT_CONFIG.pollSeconds * 1000;

const STARTUP_WINDOW_COMPACT = {
  width: 430,
  height: 248
};

const STARTUP_WINDOW_EXPANDED = {
  width: 430,
  height: 322
};

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
  return updateState;
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
        error: "Hay una versión nueva, pero no hay un instalador compatible para esta Mac.",
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
      error: offline ? "Sin conexion a internet." : error.message,
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
      error: offline ? "Sin conexion a internet." : error.message,
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
  const normalizedAlerts = [];
  const skippedAlerts = [];
  (Array.isArray(config.alerts) ? config.alerts : []).forEach((alert, index) => {
    try {
      normalizedAlerts.push(normalizeRule(alert, index + 1));
    } catch (error) {
      skippedAlerts.push({
        index,
        label: String(alert?.label || `Alerta ${index + 1}`),
        error: error.message
      });
    }
  });
  return {
    realmId: Number(config.realmId || 0),
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(config.scanEnabled ?? true),
    channels: {
      desktop: Boolean(config.channels?.desktop),
      discordWebhookUrl: String(config.channels?.discordWebhookUrl || ""),
      telegramBotToken: String(config.channels?.telegramBotToken || ""),
      telegramChatId: String(config.channels?.telegramChatId || "")
    },
    alerts: normalizedAlerts,
    skippedAlerts
  };
}

function summarizeMarketStatus(scanErrors = []) {
  const errors = Array.isArray(scanErrors) ? scanErrors : [];
  if (!errors.length) {
    return {
      state: "ok",
      title: "Mercado conectado",
      message: "Las lecturas del mercado están entrando normalmente.",
      affectedAlerts: 0
    };
  }

  const rateLimited = errors.some((item) => String(item.error || "").includes("429"));
  if (rateLimited) {
    return {
      state: "rate-limited",
      title: "SimCompanies limitó temporalmente las consultas",
      message: "La app va a reintentar sola. No hace falta tocar nada.",
      affectedAlerts: errors.length
    };
  }

  return {
    state: "error",
    title: "No se pudo leer el mercado",
    message: "Hubo un problema temporal al consultar precios. Vamos a volver a intentar.",
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

function priceGap(rule, price) {
  if (!Number.isFinite(price)) {
    return {
      gapDisplay: "-",
      gapPercentDisplay: "-",
      gapSentence: "Todavía no hay una lectura cargada para esta alerta."
    };
  }
  if (rule.condition === "<=" || rule.condition === "<") {
    const diff = price - rule.targetPrice;
    const pct = rule.targetPrice ? (diff / rule.targetPrice) * 100 : 0;
    return diff > 0
      ? {
          gapDisplay: formatMarketNumber(diff),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: `Le faltan ${formatMarketNumber(diff)} para entrar en compra.`
        }
      : {
          gapDisplay: formatMarketNumber(Math.abs(diff)),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: `Ya está ${formatMarketNumber(Math.abs(diff))} abajo de tu precio de compra.`
        };
  }
  if (rule.condition === ">=" || rule.condition === ">") {
    const diff = rule.targetPrice - price;
    const pct = rule.targetPrice ? ((price - rule.targetPrice) / rule.targetPrice) * 100 : 0;
    return diff > 0
      ? {
          gapDisplay: formatMarketNumber(diff),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: `Le faltan ${formatMarketNumber(diff)} para entrar en venta.`
        }
      : {
          gapDisplay: formatMarketNumber(Math.abs(diff)),
          gapPercentDisplay: signedPercent(pct),
          gapSentence: `Ya está ${formatMarketNumber(Math.abs(diff))} arriba de tu precio de venta.`
        };
  }
  if (rule.condition === "between") {
    const low = Math.min(rule.targetPrice, rule.targetPriceMax);
    const high = Math.max(rule.targetPrice, rule.targetPriceMax);
    if (price >= low && price <= high) {
      return {
        gapDisplay: "0",
        gapPercentDisplay: "0.00%",
        gapSentence: "El precio ya está dentro del rango."
      };
    }
    const edge = price < low ? low : high;
    const diff = Math.abs(price - edge);
    const pct = edge ? ((price - edge) / edge) * 100 : 0;
    return {
      gapDisplay: formatMarketNumber(diff),
      gapPercentDisplay: signedPercent(pct),
      gapSentence: `Le faltan ${formatMarketNumber(diff)} para entrar al rango.`
    };
  }
  const diff = Math.abs(price - rule.targetPrice);
  const pct = rule.targetPrice ? ((price - rule.targetPrice) / rule.targetPrice) * 100 : 0;
  return {
    gapDisplay: formatMarketNumber(diff),
    gapPercentDisplay: signedPercent(pct),
    gapSentence: `Le faltan ${formatMarketNumber(diff)} para tocar tu precio objetivo.`
  };
}

function buildAlertRows(config, state, liveResults = {}) {
  return config.alerts.map((rawRule, index) => {
    const rule = normalizeRule(rawRule, index + 1);
    const runtime = liveResults[rule.id] || {};
    const persisted = state[rule.id] || {};
    const resource = getResourceById(rule.resourceId);
    const resourceName = runtime.resourceName || resource?.label || `Recurso ${rule.resourceId}`;
    const price = Number.isFinite(runtime.price) ? runtime.price : Number(persisted.lastSeenPrice);
    const matched = typeof runtime.matched === "boolean" ? runtime.matched : Boolean(persisted.matched);
    const action = classifyRule(rule);
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
      targetDisplay: describeCondition(rule),
      triggerSentence:
        rule.condition === "<=" ? `Avisa si baja a ${formatMarketNumber(rule.targetPrice)} o menos` :
        rule.condition === "<" ? `Avisa si baja de ${formatMarketNumber(rule.targetPrice)}` :
        rule.condition === ">=" ? `Avisa si sube a ${formatMarketNumber(rule.targetPrice)} o más` :
        rule.condition === ">" ? `Avisa si sube de ${formatMarketNumber(rule.targetPrice)}` :
        rule.condition === "between" ? `Avisa si entra entre ${formatMarketNumber(rule.targetPrice)} y ${formatMarketNumber(rule.targetPriceMax)}` :
        `Avisa si toca ${formatMarketNumber(rule.targetPrice)}`,
      gapDisplay: gap.gapDisplay,
      gapPercentDisplay: gap.gapPercentDisplay,
      gapSentence: gap.gapSentence,
      matched,
      statusText: !rule.enabled ? "Pausada" : matched ? (action.key === "buy" ? "Momento de compra" : action.key === "sell" ? "Momento de venta" : "Dentro del rango") : "Todavía no llegó",
      statusTone: !rule.enabled ? "muted" : matched ? "match" : "watch",
      lastSeenAt: runtime.sourceTime || persisted.lastSeenAt || "",
      lastSeenLocal: isoLocal(runtime.sourceTime || persisted.lastSeenAt),
      sourceTime: runtime.sourceTime || persisted.resourceTime || "",
      sourceTimeLocal: isoLocal(runtime.sourceTime || persisted.resourceTime),
      lastNotifiedAt: persisted.lastNotifiedAt || null
    };
  });
}

function buildDashboard(liveResults = {}, scanErrors = [], scannedAt = null) {
  const paths = dataPaths();
  const config = buildConfigSnapshot(loadConfig(paths));
  const state = loadState(paths);
  const alerts = buildAlertRows(config, state, liveResults);
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
      dataDir: paths.baseDir,
      configPath: paths.configPath,
      statePath: paths.statePath,
      logPath: paths.eventsPath
    },
    config,
    summary: {
      totalAlerts: alerts.length,
      enabledAlerts: alerts.filter((item) => item.enabled).length,
      matchedAlerts: alerts.filter((item) => item.enabled && item.matched).length
    },
    monitor: {
      statusLabel: scanInFlight ? "Escaneando" : config.scanEnabled === false ? "Pausado" : "Activo",
      intervalSeconds: config.pollSeconds,
      scanEnabled: config.scanEnabled !== false,
      marketState: marketStatus.state,
      marketTitle: marketStatus.title,
      marketMessage: marketStatus.message,
      affectedAlerts: marketStatus.affectedAlerts
    },
    alerts,
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
    const paths = dataPaths();
    const config = buildConfigSnapshot(loadConfig(paths));
    const state = loadState(paths);
    const append = (record) => appendEvent(paths, record);
    const result = await scanAlerts({
      config,
      state,
      appendEvent: append,
      allowNetwork: options.allowNetwork !== false,
      triggerNotifications,
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
    saveState(paths, state);
    lastScanSnapshot = {
      scannedAt: result.scannedAt,
      errors: result.errors
    };
    return buildDashboard(result.results, result.errors, result.scannedAt);
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

function normalizeIncomingConfig(payload) {
  return {
    realmId: Number(payload.realmId || 0),
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(payload.scanEnabled ?? true),
    channels: {
      desktop: Boolean(payload.channels?.desktop),
      discordWebhookUrl: String(payload.channels?.discordWebhookUrl || ""),
      telegramBotToken: String(payload.channels?.telegramBotToken || ""),
      telegramChatId: String(payload.channels?.telegramChatId || "")
    },
    alerts: Array.isArray(payload.alerts) ? payload.alerts.map((alert, index) => normalizeRule(alert, index + 1)) : structuredClone(DEFAULT_CONFIG.alerts)
  };
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
  ipcMain.handle("updates:get-state", async () => updateState);
  ipcMain.handle("updates:check", async () => checkForUpdates({ showPrompt: true }));
  ipcMain.handle("updates:primary-action", async () => runUpdatePrimaryAction());
  ipcMain.handle("updates:dismiss", async () => patchUpdateState({ promptVisible: false }));
  ipcMain.handle("startup:continue", async () => continueIntoApp());

  ipcMain.handle("config:save", async (_event, payload) => {
    const paths = dataPaths();
    const previousConfig = buildConfigSnapshot(loadConfig(paths));
    const nextConfig = normalizeIncomingConfig(payload);
    saveConfig(paths, nextConfig);
    if (nextConfig.channels?.discordWebhookUrl) {
      configureDiscordWebhookBranding(nextConfig.channels.discordWebhookUrl).catch(() => {});
    } else {
      lastDiscordBrandedWebhook = "";
      discordBrandingInFlightWebhook = "";
    }
    if (nextConfig.scanEnabled !== false) {
      const needsNetwork = configNeedsNetworkPriming(previousConfig, nextConfig);
      return refreshAfterConfigSave(needsNetwork);
    } else {
      restartScheduler();
    }
    return buildDashboard();
  });

  ipcMain.handle("scan:now", async () => runScan(false, { allowNetwork: false }));

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
    deleteEvent(dataPaths(), eventId);
    return buildDashboard();
  });

  ipcMain.handle("events:clear", async () => {
    clearEvents(dataPaths());
    return buildDashboard();
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});
