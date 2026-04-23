const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");
const { DEFAULT_CONFIG, DEFAULT_REALM_ID, REALM_OPTIONS } = require("./defaults");

const VITO_DATA_DIR = "simmarket-vito";
const REALM_IDS = REALM_OPTIONS.map((realm) => Number(realm.id));

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfMissing(sourcePath, targetPath) {
  if (!sourcePath || !targetPath || !fs.existsSync(sourcePath) || fs.existsSync(targetPath)) {
    return;
  }
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function migrateLegacyData(preferredDir, legacyDirs = []) {
  ensureDir(preferredDir);
  const requiredFiles = ["config.json", "state.json", "events.log", "price-history.json"];
  const missingAnyRequired = requiredFiles.some((fileName) => !fs.existsSync(path.join(preferredDir, fileName)));
  if (!missingAnyRequired) {
    return;
  }

  legacyDirs
    .filter(Boolean)
    .filter((dirPath) => dirPath !== preferredDir && fs.existsSync(dirPath))
    .forEach((legacyDir) => {
      requiredFiles.forEach((fileName) => {
        copyFileIfMissing(path.join(legacyDir, fileName), path.join(preferredDir, fileName));
      });
      const legacyHistoryDir = path.join(legacyDir, "simtools-history");
      const preferredHistoryDir = path.join(preferredDir, "simtools-history");
      if (fs.existsSync(legacyHistoryDir) && !fs.existsSync(preferredHistoryDir)) {
        fs.cpSync(legacyHistoryDir, preferredHistoryDir, { recursive: true });
      }
    });
}

function appDataPaths() {
  const appDataRoot = app.getPath("appData");
  const legacyUserDataDir = app.getPath("userData");
  const baseDir = path.join(appDataRoot, VITO_DATA_DIR);
  migrateLegacyData(baseDir, [
    legacyUserDataDir,
    path.join(appDataRoot, "simmarket")
  ]);
  ensureDir(baseDir);
  return {
    baseDir,
    configPath: path.join(baseDir, "config.json"),
    statePath: path.join(baseDir, "state.json"),
    eventsPath: path.join(baseDir, "events.log"),
    priceHistoryPath: path.join(baseDir, "price-history.json")
  };
}

function normalizeRealmId(value) {
  const numericValue = Number(value);
  return REALM_IDS.includes(numericValue) ? numericValue : DEFAULT_REALM_ID;
}

function cloneList(value, fallback = []) {
  return Array.isArray(value) ? structuredClone(value) : structuredClone(fallback);
}

function normalizeRealmBucket(value) {
  const bucket = value && typeof value === "object" ? value : {};
  return {
    alerts: cloneList(bucket.alerts, DEFAULT_CONFIG.alerts),
    portfolio: cloneList(bucket.portfolio, DEFAULT_CONFIG.portfolio)
  };
}

function normalizeRealmBuckets(config, activeRealmId) {
  const rawRealms = config?.realms && typeof config.realms === "object" ? config.realms : {};
  const hasRealmBuckets = Boolean(config?.realms && typeof config.realms === "object");
  const buckets = {};
  REALM_IDS.forEach((realmId) => {
    buckets[String(realmId)] = normalizeRealmBucket(rawRealms[String(realmId)]);
  });

  const legacyAlerts = Array.isArray(config?.alerts) ? structuredClone(config.alerts) : null;
  const legacyPortfolio = Array.isArray(config?.portfolio) ? structuredClone(config.portfolio) : null;
  const activeKey = String(activeRealmId);
  if (!hasRealmBuckets) {
    buckets[activeKey] = {
      alerts: legacyAlerts || structuredClone(DEFAULT_CONFIG.alerts),
      portfolio: legacyPortfolio || structuredClone(DEFAULT_CONFIG.portfolio)
    };
  } else if (legacyAlerts || legacyPortfolio) {
    const rawActiveBucket = rawRealms[activeKey] && typeof rawRealms[activeKey] === "object" ? rawRealms[activeKey] : {};
    buckets[activeKey] = {
      alerts: Array.isArray(rawActiveBucket.alerts)
        ? structuredClone(rawActiveBucket.alerts)
        : legacyAlerts || buckets[activeKey].alerts,
      portfolio: Array.isArray(rawActiveBucket.portfolio)
        ? structuredClone(rawActiveBucket.portfolio)
        : legacyPortfolio || buckets[activeKey].portfolio
    };
  }
  return buckets;
}

function normalizeConfig(config) {
  const rawConfig = config && typeof config === "object" ? config : DEFAULT_CONFIG;
  const activeRealmId = normalizeRealmId(rawConfig.activeRealmId ?? rawConfig.realmId);
  const realms = normalizeRealmBuckets(rawConfig, activeRealmId);
  const activeBucket = realms[String(activeRealmId)] || normalizeRealmBucket();
  return {
    realmId: activeRealmId,
    activeRealmId,
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(rawConfig.scanEnabled ?? DEFAULT_CONFIG.scanEnabled),
    channels: {
      desktop: Boolean(rawConfig.channels?.desktop ?? DEFAULT_CONFIG.channels.desktop),
      discordWebhookUrl: String(rawConfig.channels?.discordWebhookUrl ?? ""),
      telegramBotToken: String(rawConfig.channels?.telegramBotToken ?? ""),
      telegramChatId: String(rawConfig.channels?.telegramChatId ?? "")
    },
    alerts: structuredClone(activeBucket.alerts),
    portfolio: structuredClone(activeBucket.portfolio),
    realms
  };
}

function realmDataPaths(paths, realmId) {
  const activeRealmId = normalizeRealmId(realmId);
  const realmDir = path.join(paths.baseDir, `realm-${activeRealmId}`);
  ensureDir(realmDir);

  if (activeRealmId === DEFAULT_REALM_ID) {
    ["state.json", "events.log", "price-history.json"].forEach((fileName) => {
      copyFileIfMissing(path.join(paths.baseDir, fileName), path.join(realmDir, fileName));
    });
    const legacyHistoryDir = path.join(paths.baseDir, "simtools-history");
    const realmHistoryDir = path.join(realmDir, "simtools-history");
    if (fs.existsSync(legacyHistoryDir) && !fs.existsSync(realmHistoryDir)) {
      fs.cpSync(legacyHistoryDir, realmHistoryDir, { recursive: true });
    }
  }

  return {
    rootBaseDir: paths.baseDir,
    rootConfigPath: paths.configPath,
    baseDir: realmDir,
    configPath: paths.configPath,
    statePath: path.join(realmDir, "state.json"),
    eventsPath: path.join(realmDir, "events.log"),
    priceHistoryPath: path.join(realmDir, "price-history.json")
  };
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function loadConfig(paths) {
  const config = readJson(paths.configPath, DEFAULT_CONFIG);
  return normalizeConfig(config);
}

function saveConfig(paths, config) {
  writeJson(paths.configPath, config);
}

function loadState(paths) {
  const payload = readJson(paths.statePath, {});
  return payload && typeof payload === "object" ? payload : {};
}

function saveState(paths, state) {
  writeJson(paths.statePath, state);
}

function loadPriceHistory(paths) {
  const payload = readJson(paths.priceHistoryPath, {});
  return payload && typeof payload === "object" ? payload : {};
}

function savePriceHistory(paths, history) {
  writeJson(paths.priceHistoryPath, history);
}

function appendEvent(paths, record) {
  ensureDir(path.dirname(paths.eventsPath));
  const nextLine = JSON.stringify(record);
  const lines = fs.existsSync(paths.eventsPath)
    ? fs.readFileSync(paths.eventsPath, "utf8").split("\n").filter(Boolean)
    : [];
  lines.push(nextLine);
  fs.writeFileSync(paths.eventsPath, lines.join("\n") + "\n", "utf8");
}

function recentEvents(paths, limit) {
  if (!fs.existsSync(paths.eventsPath)) {
    return [];
  }
  const lines = fs.readFileSync(paths.eventsPath, "utf8").split("\n").filter(Boolean);
  const parsed = lines
    .map((line, index) => {
      try {
        const payload = JSON.parse(line);
        payload.eventId = `${index + 1}:${Buffer.from(line).toString("base64").slice(0, 12)}`;
        return payload;
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    return parsed.slice(-limit).reverse();
  }
  return parsed.reverse();
}

function deleteEvent(paths, eventId) {
  if (!fs.existsSync(paths.eventsPath)) {
    return false;
  }
  const lines = fs.readFileSync(paths.eventsPath, "utf8").split("\n").filter(Boolean);
  let removed = false;
  const nextLines = lines.filter((line, index) => {
    const candidateId = `${index + 1}:${Buffer.from(line).toString("base64").slice(0, 12)}`;
    if (!removed && candidateId === eventId) {
      removed = true;
      return false;
    }
    return true;
  });
  fs.writeFileSync(paths.eventsPath, nextLines.join("\n") + (nextLines.length ? "\n" : ""), "utf8");
  return removed;
}

function clearEvents(paths) {
  if (!fs.existsSync(paths.eventsPath)) {
    return false;
  }
  fs.writeFileSync(paths.eventsPath, "", "utf8");
  return true;
}

module.exports = {
  appDataPaths,
  realmDataPaths,
  loadConfig,
  saveConfig,
  normalizeConfig,
  normalizeRealmId,
  loadState,
  saveState,
  loadPriceHistory,
  savePriceHistory,
  appendEvent,
  recentEvents,
  deleteEvent,
  clearEvents
};
