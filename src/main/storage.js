const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");
const { DEFAULT_CONFIG } = require("./defaults");

const VITO_DATA_DIR = "simmarket-vito";

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
  if (!config || typeof config !== "object") {
    return structuredClone(DEFAULT_CONFIG);
  }
  return {
    realmId: Number(config.realmId ?? DEFAULT_CONFIG.realmId),
    pollSeconds: DEFAULT_CONFIG.pollSeconds,
    scanEnabled: Boolean(config.scanEnabled ?? DEFAULT_CONFIG.scanEnabled),
    channels: {
      desktop: Boolean(config.channels?.desktop ?? DEFAULT_CONFIG.channels.desktop),
      discordWebhookUrl: String(config.channels?.discordWebhookUrl ?? ""),
      telegramBotToken: String(config.channels?.telegramBotToken ?? ""),
      telegramChatId: String(config.channels?.telegramChatId ?? "")
    },
    alerts: Array.isArray(config.alerts) ? config.alerts : structuredClone(DEFAULT_CONFIG.alerts)
  };
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
  loadConfig,
  saveConfig,
  loadState,
  saveState,
  loadPriceHistory,
  savePriceHistory,
  appendEvent,
  recentEvents,
  deleteEvent,
  clearEvents
};
