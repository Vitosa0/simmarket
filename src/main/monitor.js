const { Notification } = require("electron");
const { getResourceById } = require("./catalog");

const DISCORD_AVATAR_URL = "https://raw.githubusercontent.com/Vitosa0/simmarket/main/src/assets/branding/simmarket-mark-1024.png";

const API_TIMEOUT_MS = 20000;
const ALLOWED_CONDITIONS = new Set(["<=", ">=", "<", ">", "==", "between"]);

function isoNow() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRule(rawRule, index) {
  const condition = String(rawRule.condition || "<=").trim().toLowerCase();
  if (!ALLOWED_CONDITIONS.has(condition)) {
    throw new Error(`Condición inválida en alerta ${index}`);
  }
  const label = String(rawRule.label || `Alerta ${index}`).trim() || `Alerta ${index}`;
  const targetPriceRaw = rawRule.targetPrice;
  if (targetPriceRaw === "" || targetPriceRaw === null || targetPriceRaw === undefined) {
    throw new Error(`Precio inválido en alerta ${index}`);
  }
  const normalized = {
    id: String(rawRule.id || slugify(`${label}-${rawRule.resourceId}-q${rawRule.quality}`) || `alert-${index}`),
    label,
    resourceId: Number(rawRule.resourceId),
    quality: Number(rawRule.quality ?? 0),
    condition,
    targetPrice: Number(targetPriceRaw),
    enabled: Boolean(rawRule.enabled ?? true),
    repeatWhileMatched: Boolean(rawRule.repeatWhileMatched ?? true),
    notificationKindOverride: String(rawRule.notificationKindOverride || "").trim().toLowerCase()
  };
  if (!Number.isFinite(normalized.resourceId) || normalized.resourceId <= 0) {
    throw new Error(`Activo inválido en alerta ${index}`);
  }
  if (!Number.isFinite(normalized.quality) || normalized.quality < 0) {
    throw new Error(`Calidad inválida en alerta ${index}`);
  }
  if (!Number.isFinite(normalized.targetPrice)) {
    throw new Error(`Precio inválido en alerta ${index}`);
  }
  if (condition === "between") {
    const targetPriceMaxRaw = rawRule.targetPriceMax;
    if (targetPriceMaxRaw === "" || targetPriceMaxRaw === null || targetPriceMaxRaw === undefined) {
      throw new Error(`Precio máximo inválido en alerta ${index}`);
    }
    normalized.targetPriceMax = Number(targetPriceMaxRaw);
    if (!Number.isFinite(normalized.targetPriceMax)) {
      throw new Error(`Precio máximo inválido en alerta ${index}`);
    }
  }
  return normalized;
}

function describeCondition(rule) {
  const target = formatMarketNumber(rule.targetPrice);
  if (rule.condition === "<=") return `<= ${target}`;
  if (rule.condition === ">=") return `>= ${target}`;
  if (rule.condition === "<") return `< ${target}`;
  if (rule.condition === ">") return `> ${target}`;
  if (rule.condition === "between") return `entre ${target} y ${formatMarketNumber(rule.targetPriceMax)}`;
  return `== ${target}`;
}

function evaluateCondition(rule, price) {
  if (rule.condition === "<=") return price <= rule.targetPrice;
  if (rule.condition === ">=") return price >= rule.targetPrice;
  if (rule.condition === "<") return price < rule.targetPrice;
  if (rule.condition === ">") return price > rule.targetPrice;
  if (rule.condition === "between") {
    const low = Math.min(rule.targetPrice, rule.targetPriceMax);
    const high = Math.max(rule.targetPrice, rule.targetPriceMax);
    return price >= low && price <= high;
  }
  return price === rule.targetPrice;
}

function classifyRule(rule) {
  if (rule.condition === "<=" || rule.condition === "<") return { key: "buy", label: "Compra" };
  if (rule.condition === ">=" || rule.condition === ">") return { key: "sell", label: "Venta" };
  if (rule.condition === "between") return { key: "range", label: "Rango" };
  return { key: "check", label: "Control" };
}

function formatMarketNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "-";
  }
  const number = Number(value);
  if (Number.isInteger(number)) return String(number);
  if (Math.abs(number) >= 100) return number.toFixed(2).replace(/\.?0+$/, "");
  return number.toFixed(3).replace(/\.?0+$/, "");
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "simmarket/1.0"
      },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function resourceUrl(realmId, resourceId) {
  return `https://api.simcotools.com/v1/realms/${realmId}/market/resources/${resourceId}`;
}

async function fetchResourceSummary(realmId, resourceId, cache) {
  const cacheKey = `${realmId}:${resourceId}`;
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, fetchJson(resourceUrl(realmId, resourceId)));
  }
  return cache.get(cacheKey);
}

function findQualitySummary(summary, quality) {
  const rows = summary?.resource?.summariesByQuality;
  if (!Array.isArray(rows)) {
    throw new Error("El recurso no devolvió calidades.");
  }
  const match = rows.find((item) => Number(item.quality) === Number(quality));
  if (!match) {
    throw new Error(`No se encontró la calidad Q${quality}.`);
  }
  return match;
}

function buildNotificationTitle(rule) {
  const override = rule.notificationKindOverride;
  if (override === "compra") return `Alerta de compra: ${rule.label}`;
  if (override === "venta") return `Alerta de venta: ${rule.label}`;
  if (override === "mercado") return `Alerta de mercado: ${rule.label}`;
  if (rule.condition === "<=" || rule.condition === "<") return `Alerta de compra: ${rule.label}`;
  if (rule.condition === ">=" || rule.condition === ">") return `Alerta de venta: ${rule.label}`;
  return `Alerta de mercado: ${rule.label}`;
}

function buildNotificationBody(rule, resourceName, price) {
  return `${resourceName} Q${rule.quality} | precio actual ${formatMarketNumber(price)} | objetivo ${describeCondition(rule)}`;
}

function sendDesktopNotification(title, body) {
  if (!Notification.isSupported()) {
    return;
  }
  new Notification({
    title,
    subtitle: "SimMarket",
    body,
    silent: false,
    ...(process.platform === "darwin" ? { sound: "Ping" } : {})
  }).show();
}

async function sendDiscordNotification(webhookUrl, title, body) {
  if (!webhookUrl) return;
  const canonicalWebhook = String(webhookUrl).trim().match(/^(https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/[^/]+\/[^/?#]+)/i)?.[1] || String(webhookUrl).trim();
  const response = await fetch(canonicalWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "SimMarket",
      avatar_url: DISCORD_AVATAR_URL,
      content: `**${title}**\n${body}`
    })
  });
  if (!response.ok) {
    throw new Error(`Discord ${response.status}`);
  }
}

async function sendTelegramNotification(botToken, chatId, title, body) {
  if (!botToken || !chatId) return;
  const params = new URLSearchParams({
    chat_id: chatId,
    text: `${title}\n${body}`
  });
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  if (!response.ok) {
    throw new Error(`Telegram ${response.status}`);
  }
}

async function notifyChannels(channels, title, body) {
  if (channels.desktop) {
    sendDesktopNotification(title, body);
  }
  if (channels.discordWebhookUrl) {
    await sendDiscordNotification(channels.discordWebhookUrl, title, body);
  }
  if (channels.telegramBotToken && channels.telegramChatId) {
    await sendTelegramNotification(channels.telegramBotToken, channels.telegramChatId, title, body);
  }
}

async function scanAlerts({ config, state, appendEvent, onTrigger, triggerNotifications = true }) {
  const normalizedAlerts = config.alerts.map((rule, index) => normalizeRule(rule, index + 1));
  const realmId = Number(config.realmId || 0);
  const channels = config.channels || {};
  const cache = new Map();
  const errors = [];
  const results = {};
  const groupedByResource = new Map();

  normalizedAlerts.forEach((rule) => {
    const key = String(rule.resourceId);
    if (!groupedByResource.has(key)) {
      groupedByResource.set(key, []);
    }
    groupedByResource.get(key).push(rule);
  });

  for (const [resourceId, rules] of groupedByResource.entries()) {
    let summary;
    try {
      summary = await fetchResourceSummary(realmId, Number(resourceId), cache);
    } catch (error) {
      rules.forEach((rule) => {
        errors.push({ alertId: rule.id, error: error.message });
        appendEvent({
          time: isoNow(),
          type: "error",
          alertId: rule.id,
          label: rule.label,
          error: error.message
        });
      });
      continue;
    }

    for (const rule of rules) {
      try {
        const qualitySummary = findQualitySummary(summary, rule.quality);
        const resource = getResourceById(rule.resourceId);
        const resourceName = resource?.label || summary?.resource?.name || `Recurso ${rule.resourceId}`;
        const price = Number(qualitySummary.price);
        const matched = rule.enabled ? evaluateCondition(rule, price) : false;
        const previousState = state[rule.id] || {};
        const shouldNotify = matched && rule.enabled && (rule.repeatWhileMatched || !previousState.matched);

        state[rule.id] = {
          matched,
          lastSeenPrice: price,
          lastSeenAt: isoNow(),
          resourceTime: qualitySummary.updatedAt || summary?.resource?.updatedAt || null,
          lastNotifiedAt: shouldNotify ? isoNow() : (previousState.lastNotifiedAt || null)
        };

        results[rule.id] = {
          price,
          matched,
          resourceName,
          sourceTime: qualitySummary.updatedAt || summary?.resource?.updatedAt || null
        };

        if (matched && shouldNotify) {
          const title = buildNotificationTitle(rule);
          const body = buildNotificationBody(rule, resourceName, price);
          if (triggerNotifications) {
            await notifyChannels(channels, title, body);
          }
          if (triggerNotifications && typeof onTrigger === "function") {
            onTrigger({
              alertId: rule.id,
              label: rule.label,
              title,
              body,
              resourceName,
              quality: rule.quality,
              price
            });
          }
          appendEvent({
            time: isoNow(),
            type: "trigger",
            alertId: rule.id,
            label: rule.label,
            price,
            body
          });
        }

        if (!matched && previousState.matched) {
          appendEvent({
            time: isoNow(),
            type: "cleared",
            alertId: rule.id,
            label: rule.label
          });
        }
      } catch (error) {
        errors.push({ alertId: rule.id, error: error.message });
        appendEvent({
          time: isoNow(),
          type: "error",
          alertId: rule.id,
          label: rule.label,
          error: error.message
        });
      }
    }
  }

  return {
    scannedAt: isoNow(),
    results,
    errors,
    normalizedAlerts
  };
}

module.exports = {
  classifyRule,
  describeCondition,
  evaluateCondition,
  formatMarketNumber,
  isoNow,
  normalizeRule,
  scanAlerts
};
