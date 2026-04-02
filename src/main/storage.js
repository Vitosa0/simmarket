const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");
const { DEFAULT_CONFIG } = require("./defaults");

const MAX_EVENT_RECORDS = 8;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function appDataPaths() {
  const baseDir = app.getPath("userData");
  ensureDir(baseDir);
  return {
    baseDir,
    configPath: path.join(baseDir, "config.json"),
    statePath: path.join(baseDir, "state.json"),
    eventsPath: path.join(baseDir, "events.log")
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
    pollSeconds: Number(config.pollSeconds ?? DEFAULT_CONFIG.pollSeconds),
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

function appendEvent(paths, record) {
  ensureDir(path.dirname(paths.eventsPath));
  const nextLine = JSON.stringify(record);
  const lines = fs.existsSync(paths.eventsPath)
    ? fs.readFileSync(paths.eventsPath, "utf8").split("\n").filter(Boolean)
    : [];
  lines.push(nextLine);
  const boundedLines = lines.slice(-MAX_EVENT_RECORDS);
  fs.writeFileSync(paths.eventsPath, boundedLines.join("\n") + "\n", "utf8");
}

function recentEvents(paths, limit = MAX_EVENT_RECORDS) {
  if (!fs.existsSync(paths.eventsPath)) {
    return [];
  }
  const lines = fs.readFileSync(paths.eventsPath, "utf8").split("\n").filter(Boolean);
  return lines
    .map((line, index) => {
      try {
        const payload = JSON.parse(line);
        payload.eventId = `${index + 1}:${Buffer.from(line).toString("base64").slice(0, 12)}`;
        return payload;
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .slice(-limit)
    .reverse();
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

module.exports = {
  appDataPaths,
  loadConfig,
  saveConfig,
  loadState,
  saveState,
  appendEvent,
  recentEvents,
  deleteEvent
};
