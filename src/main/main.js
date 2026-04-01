const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, nativeImage, shell, Menu } = require("electron");
const { RESOURCE_CATALOG, getResourceById } = require("./catalog");
const { DEFAULT_CONFIG } = require("./defaults");
const {
  appDataPaths,
  appendEvent,
  deleteEvent,
  loadConfig,
  loadState,
  recentEvents,
  saveConfig,
  saveState
} = require("./storage");
const { classifyRule, describeCondition, formatMarketNumber, normalizeRule, scanAlerts } = require("./monitor");

let mainWindow = null;
let scanTimer = null;
let scanInFlight = false;
let discordAvatarData = null;
const IS_WINDOWS = process.platform === "win32";
const APP_ICON_PATH = process.platform === "win32"
  ? path.join(__dirname, "..", "assets", "branding", "simmarket-mark.ico")
  : path.join(__dirname, "..", "assets", "branding", "simmarket-mark-1024.png");
const APP_ICON_PNG_PATH = path.join(__dirname, "..", "assets", "branding", "simmarket-mark-1024.png");

if (IS_WINDOWS) {
  app.disableHardwareAcceleration();
}

function dataPaths() {
  return appDataPaths();
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

function appIconDataUri() {
  if (discordAvatarData) return discordAvatarData;
  const buffer = fs.readFileSync(APP_ICON_PNG_PATH);
  discordAvatarData = `data:image/png;base64,${buffer.toString("base64")}`;
  return discordAvatarData;
}

async function configureDiscordWebhookBranding(webhookUrl) {
  if (!isDiscordWebhookUrl(webhookUrl)) {
    return;
  }
  const response = await fetch(String(webhookUrl).trim(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "SimMarket",
      avatar: appIconDataUri()
    })
  });
  if (!response.ok) {
    throw new Error(`Discord branding ${response.status}`);
  }
}

function buildConfigSnapshot(config) {
  return {
    realmId: Number(config.realmId || 0),
    pollSeconds: Number(config.pollSeconds || 180),
    scanEnabled: Boolean(config.scanEnabled ?? true),
    channels: {
      desktop: Boolean(config.channels?.desktop),
      discordWebhookUrl: String(config.channels?.discordWebhookUrl || ""),
      telegramBotToken: String(config.channels?.telegramBotToken || ""),
      telegramChatId: String(config.channels?.telegramChatId || "")
    },
    alerts: Array.isArray(config.alerts) ? config.alerts.map((alert, index) => normalizeRule(alert, index + 1)) : structuredClone(DEFAULT_CONFIG.alerts)
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
  const events = recentEvents(paths, 25);
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
      scanEnabled: config.scanEnabled !== false
    },
    alerts,
    events,
    resourceCatalog: RESOURCE_CATALOG,
    scan: {
      scannedAt,
      scannedLocal: isoLocal(scannedAt),
      errors: scanErrors
    }
  };
}

async function runScan(triggerNotifications = true) {
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
    return buildDashboard(result.results, result.errors, result.scannedAt);
  } finally {
    scanInFlight = false;
  }
}

function restartScheduler() {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  const config = buildConfigSnapshot(loadConfig(dataPaths()));
  if (config.scanEnabled === false) {
    return;
  }
  const intervalMs = Math.max(30, Number(config.pollSeconds || 180)) * 1000;
  scanTimer = setInterval(() => {
    runScan(true).catch(() => {});
  }, intervalMs);
}

function createWindow() {
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
    if (IS_WINDOWS) {
      mainWindow.setFullScreen(false);
      mainWindow.maximize();
    } else {
      mainWindow.setSimpleFullScreen(false);
      mainWindow.setFullScreen(true);
    }
    mainWindow.show();
  });
}

function normalizeIncomingConfig(payload) {
  return {
    realmId: Number(payload.realmId || 0),
    pollSeconds: Number(payload.pollSeconds || 180),
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

app.whenReady().then(() => {
  if (IS_WINDOWS) {
    Menu.setApplicationMenu(null);
  }
  if (process.platform === "darwin" && fs.existsSync(APP_ICON_PATH)) {
    app.dock.setIcon(nativeImage.createFromPath(APP_ICON_PATH));
  }
  createWindow();
  restartScheduler();
  const initialConfig = buildConfigSnapshot(loadConfig(dataPaths()));
  if (initialConfig.channels?.discordWebhookUrl) {
    configureDiscordWebhookBranding(initialConfig.channels.discordWebhookUrl).catch((error) => {
      appendEvent(dataPaths(), {
        time: new Date().toISOString(),
        type: "error",
        label: "Discord webhook",
        error: error.message
      });
    });
  }
  if (initialConfig.scanEnabled !== false) {
    runScan(false).catch(() => {});
  }

  ipcMain.handle("dashboard:get", async () => buildDashboard());

  ipcMain.handle("config:save", async (_event, payload) => {
    const paths = dataPaths();
    const nextConfig = normalizeIncomingConfig(payload);
    saveConfig(paths, nextConfig);
    if (nextConfig.channels?.discordWebhookUrl) {
      try {
        await configureDiscordWebhookBranding(nextConfig.channels.discordWebhookUrl);
      } catch (error) {
        appendEvent(paths, {
          time: new Date().toISOString(),
          type: "error",
          label: "Discord webhook",
          error: error.message
        });
      }
    }
    restartScheduler();
    return buildDashboard();
  });

  ipcMain.handle("scan:now", async () => runScan(true));

  ipcMain.handle("monitor:set-enabled", async (_event, enabled) => {
    const paths = dataPaths();
    const nextConfig = {
      ...loadConfig(paths),
      scanEnabled: Boolean(enabled)
    };
    saveConfig(paths, nextConfig);
    restartScheduler();
    if (nextConfig.scanEnabled) {
      return runScan(false);
    }
    return buildDashboard();
  });

  ipcMain.handle("event:delete", async (_event, eventId) => {
    deleteEvent(dataPaths(), eventId);
    return buildDashboard();
  });

  ipcMain.handle("data:open-directory", async () => {
    await shell.openPath(dataPaths().baseDir);
    return true;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
