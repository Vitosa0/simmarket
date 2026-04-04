const { Notification } = require("electron");
const { getResourceById } = require("./catalog");

const DISCORD_AVATAR_URL = "https://raw.githubusercontent.com/Vitosa0/simmarket/main/src/assets/branding/simmarket-mark-1024.png";

const API_TIMEOUT_MS = 20000;
const FETCH_RETRY_LIMIT = 3;
const TRANSIENT_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const SHORT_COOLDOWN_MS = 20_000;
const RATE_LIMIT_COOLDOWN_MS = 45_000;
const STALE_TICKER_MAX_AGE_MS = 6 * 60 * 1000;
const ALLOWED_CONDITIONS = new Set(["<=", ">=", "<", ">", "==", "between"]);
const QUALITY_MIN = 0;
const QUALITY_MAX = 12;
const latestTickerSnapshots = new Map();
const latestProductSnapshots = new Map();
let marketCooldownUntil = 0;

function isoNow() {
  return new Date().toISOString();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    quality: Number.isFinite(Number(rawRule.quality)) ? Number(rawRule.quality) : 0,
    condition,
    targetPrice: Number(targetPriceRaw),
    enabled: Boolean(rawRule.enabled ?? true),
    repeatWhileMatched: Boolean(rawRule.repeatWhileMatched ?? true),
    notificationKindOverride: String(rawRule.notificationKindOverride || "").trim().toLowerCase()
  };
  if (!Number.isFinite(normalized.resourceId) || normalized.resourceId <= 0) {
    throw new Error(`Activo inválido en alerta ${index}`);
  }
  if (!Number.isInteger(normalized.quality) || normalized.quality < QUALITY_MIN || normalized.quality > QUALITY_MAX) {
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
  let lastError = null;
  for (let attempt = 0; attempt < FETCH_RETRY_LIMIT; attempt += 1) {
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
        const error = new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.transient = TRANSIENT_HTTP_STATUSES.has(response.status);
        const retryAfter = Number(response.headers.get("retry-after"));
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          error.retryAfterMs = retryAfter * 1000;
        }
        throw error;
      }
      return await response.json();
    } catch (error) {
      const message = String(error?.message || "");
      const transient = Boolean(
        error?.transient
          || error?.name === "AbortError"
          || /fetch failed|network|econn|socket|timed out|timeout|enotfound|eai_again/i.test(message)
      );
      error.transient = transient;
      lastError = error;
      if (!transient || attempt === FETCH_RETRY_LIMIT - 1) {
        throw error;
      }
      const retryDelay = Number(error?.retryAfterMs) || (850 * (attempt + 1));
      await wait(retryDelay);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error("No se pudo consultar el mercado.");
}

function marketTickerUrl(realmId) {
  return `https://www.simcompanies.com/api/v3/market-ticker/${realmId}/`;
}

function marketProductUrl(realmId, resourceId) {
  return `https://www.simcompanies.com/api/v3/market/all/${realmId}/${resourceId}/`;
}

function tickerSnapshotKey(realmId) {
  return `${realmId}`;
}

function productSnapshotKey(realmId, resourceId) {
  return `${realmId}:${resourceId}`;
}

function hasTickerSnapshot(realmId) {
  return latestTickerSnapshots.has(tickerSnapshotKey(realmId));
}

function hasProductSnapshot(realmId, resourceId) {
  return latestProductSnapshots.has(productSnapshotKey(realmId, resourceId));
}

function snapshotIso(fetchedAt) {
  return new Date(fetchedAt).toISOString();
}

async function fetchMarketTicker(realmId, cache, { allowNetwork = true } = {}) {
  const cacheKey = `${realmId}`;
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, (async () => {
      const cachedTicker = latestTickerSnapshots.get(tickerSnapshotKey(realmId));
      const now = Date.now();

      if (!allowNetwork) {
        if (cachedTicker) {
          return cachedTicker;
        }
        throw new Error("Todavía no hay un ticker guardado para reutilizar.");
      }

      if (marketCooldownUntil > now) {
        if (cachedTicker && (now - cachedTicker.fetchedAt) <= STALE_TICKER_MAX_AGE_MS) {
          return cachedTicker;
        }
        const cooldownError = new Error("HTTP Error 429: Too Many Requests");
        cooldownError.status = 429;
        cooldownError.transient = true;
        throw cooldownError;
      }

      try {
        const rows = await fetchJson(marketTickerUrl(realmId));
        const snapshot = {
          rows,
          fetchedAt: Date.now()
        };
        latestTickerSnapshots.set(tickerSnapshotKey(realmId), snapshot);
        if (marketCooldownUntil && Date.now() >= marketCooldownUntil) {
          marketCooldownUntil = 0;
        }
        return snapshot;
      } catch (error) {
        const isRateLimited = Number(error?.status) === 429;
        if (isRateLimited) {
          marketCooldownUntil = Math.max(marketCooldownUntil, Date.now() + (Number(error?.retryAfterMs) || RATE_LIMIT_COOLDOWN_MS));
        } else if (error?.transient) {
          marketCooldownUntil = Math.max(marketCooldownUntil, Date.now() + SHORT_COOLDOWN_MS);
        }

        if (cachedTicker && (Date.now() - cachedTicker.fetchedAt) <= STALE_TICKER_MAX_AGE_MS && (isRateLimited || error?.transient)) {
          return cachedTicker;
        }
        throw error;
      }
    })());
  }
  return cache.get(cacheKey);
}

async function fetchMarketProduct(realmId, resourceId, cache, { allowNetwork = true } = {}) {
  const cacheKey = productSnapshotKey(realmId, resourceId);
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, (async () => {
      const cachedProduct = latestProductSnapshots.get(cacheKey);
      const now = Date.now();

      if (!allowNetwork) {
        if (cachedProduct) {
          return cachedProduct;
        }
        throw new Error("Todavía no hay una lectura guardada para ese producto.");
      }

      if (marketCooldownUntil > now) {
        if (cachedProduct && (now - cachedProduct.fetchedAt) <= STALE_TICKER_MAX_AGE_MS) {
          return cachedProduct;
        }
        const cooldownError = new Error("HTTP Error 429: Too Many Requests");
        cooldownError.status = 429;
        cooldownError.transient = true;
        throw cooldownError;
      }

      try {
        const rows = await fetchJson(marketProductUrl(realmId, resourceId));
        const snapshot = {
          rows,
          fetchedAt: Date.now()
        };
        latestProductSnapshots.set(cacheKey, snapshot);
        if (marketCooldownUntil && Date.now() >= marketCooldownUntil) {
          marketCooldownUntil = 0;
        }
        return snapshot;
      } catch (error) {
        const isRateLimited = Number(error?.status) === 429;
        if (isRateLimited) {
          marketCooldownUntil = Math.max(marketCooldownUntil, Date.now() + (Number(error?.retryAfterMs) || RATE_LIMIT_COOLDOWN_MS));
        } else if (error?.transient) {
          marketCooldownUntil = Math.max(marketCooldownUntil, Date.now() + SHORT_COOLDOWN_MS);
        }

        if (cachedProduct && (Date.now() - cachedProduct.fetchedAt) <= STALE_TICKER_MAX_AGE_MS && (isRateLimited || error?.transient)) {
          return cachedProduct;
        }
        throw error;
      }
    })());
  }
  return cache.get(cacheKey);
}

function lowestListingForQuality(rows, quality) {
  const numericQuality = Number(quality);
  return (Array.isArray(rows) ? rows : []).reduce((lowest, row) => {
    const rowQuality = Number(row?.quality);
    const rowPrice = Number(row?.price);
    if (!Number.isFinite(rowQuality) || rowQuality !== numericQuality || !Number.isFinite(rowPrice)) {
      return lowest;
    }
    if (!lowest || rowPrice < Number(lowest.price)) {
      return row;
    }
    return lowest;
  }, null);
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

async function scanAlerts({ config, state, appendEvent, onTrigger, triggerNotifications = true, allowNetwork = true }) {
  const normalizedAlerts = config.alerts.map((rule, index) => normalizeRule(rule, index + 1));
  const realmId = Number(config.realmId || 0);
  const channels = config.channels || {};
  const tickerCache = new Map();
  const productCache = new Map();
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

  let tickerSnapshot = null;
  const needsTicker = normalizedAlerts.some((rule) => Number(rule.quality) === 0);
  if (needsTicker) {
    try {
      tickerSnapshot = await fetchMarketTicker(realmId, tickerCache, { allowNetwork });
    } catch (error) {
      normalizedAlerts
        .filter((rule) => Number(rule.quality) === 0)
        .forEach((rule) => {
          errors.push({ alertId: rule.id, error: error.message });
          appendEvent({
            time: isoNow(),
            type: "error",
            alertId: rule.id,
            label: rule.label,
            error: error.message
          });
        });
    }
  }

  const tickerByResource = new Map(
    (Array.isArray(tickerSnapshot?.rows) ? tickerSnapshot.rows : [])
      .map((row) => [Number(row?.kind), row])
      .filter(([kind]) => Number.isFinite(kind))
  );

  async function processRule(rule, resourceName, price, sourceTime) {
    const matched = rule.enabled ? evaluateCondition(rule, price) : false;
    const previousState = state[rule.id] || {};
    const shouldNotify = matched && rule.enabled && (rule.repeatWhileMatched || !previousState.matched);

    state[rule.id] = {
      matched,
      lastSeenPrice: price,
      lastSeenAt: isoNow(),
      resourceTime: sourceTime || null,
      lastNotifiedAt: shouldNotify ? isoNow() : (previousState.lastNotifiedAt || null)
    };

    results[rule.id] = {
      price,
      matched,
      resourceName,
      sourceTime: sourceTime || null
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
  }

  for (const [resourceId, rules] of groupedByResource.entries()) {
    const numericResourceId = Number(resourceId);
    const resource = getResourceById(numericResourceId);
    const resourceName = resource?.label || `Recurso ${numericResourceId}`;
    const q0Rules = rules.filter((rule) => Number(rule.quality) === 0);
    const qualityRules = rules.filter((rule) => Number(rule.quality) > 0);

    if (q0Rules.length) {
      const tickerRow = tickerByResource.get(numericResourceId);
      if (!tickerRow || !Number.isFinite(Number(tickerRow.price))) {
        q0Rules.forEach((rule) => {
          const errorMessage = "No se encontró un precio mínimo actual para Q0 en ese producto.";
          errors.push({ alertId: rule.id, error: errorMessage });
          appendEvent({
            time: isoNow(),
            type: "error",
            alertId: rule.id,
            label: rule.label,
            error: errorMessage
          });
        });
      } else {
        const tickerPrice = Number(tickerRow.price);
        const tickerSourceTime = tickerSnapshot ? snapshotIso(tickerSnapshot.fetchedAt) : null;
        for (const rule of q0Rules) {
          try {
            await processRule(rule, resourceName, tickerPrice, tickerSourceTime);
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
    }

    if (!qualityRules.length) {
      continue;
    }

    let productSnapshot;
    try {
      productSnapshot = await fetchMarketProduct(realmId, numericResourceId, productCache, { allowNetwork });
    } catch (error) {
      qualityRules.forEach((rule) => {
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

    for (const rule of qualityRules) {
      try {
        const lowestListing = lowestListingForQuality(productSnapshot.rows, rule.quality);
        if (!lowestListing || !Number.isFinite(Number(lowestListing.price))) {
          throw new Error(`No se encontró un precio actual para Q${rule.quality} en ese producto.`);
        }
        const price = Number(lowestListing.price);
        const sourceTime = lowestListing.datetimeDecayUpdated || lowestListing.posted || snapshotIso(productSnapshot.fetchedAt);
        await processRule(rule, resourceName, price, sourceTime);
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
  hasProductSnapshot,
  hasTickerSnapshot,
  isoNow,
  normalizeRule,
  scanAlerts
};
