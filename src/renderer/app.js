const VIEW_STORAGE_KEY = "simco-desktop-view";
const CALC_STORAGE_KEY = "simco-desktop-calculator";
const THEME_STORAGE_KEY = "simco-desktop-theme";
const CALC_TARGET_PCTS = [2, 5, 10, 15, 20, 25, 30, 50];
const SPLASH_TOTAL_MS = 6000;
const SPLASH_PROGRESS_SEGMENTS = [
  { start: 0, end: 270, from: 0, to: 4, power: 0.72 },
  { start: 270, end: 683, from: 4, to: 13, power: 1.45 },
  { start: 683, end: 885, from: 13, to: 13 },
  { start: 885, end: 1170, from: 13, to: 21, power: 0.88 },
  { start: 1170, end: 1523, from: 21, to: 29, power: 1.7 },
  { start: 1523, end: 1718, from: 29, to: 29 },
  { start: 1718, end: 2145, from: 29, to: 41, power: 0.7 },
  { start: 2145, end: 2363, from: 41, to: 44, power: 1.95 },
  { start: 2363, end: 2670, from: 44, to: 44 },
  { start: 2670, end: 3128, from: 44, to: 56, power: 1.15 },
  { start: 3128, end: 3330, from: 56, to: 60, power: 0.62 },
  { start: 3330, end: 3645, from: 60, to: 60 },
  { start: 3645, end: 4208, from: 60, to: 69, power: 1.58 },
  { start: 4208, end: 4463, from: 69, to: 71, power: 0.95 },
  { start: 4463, end: 4800, from: 71, to: 71 },
  { start: 4800, end: 5190, from: 71, to: 75, power: 1.9 },
  { start: 5190, end: 5400, from: 75, to: 75 },
  { start: 5400, end: SPLASH_TOTAL_MS, from: 75, to: 100, power: 0.48 }
];

const state = {
  dashboard: null,
  draft: {
    alerts: [],
    channels: {},
    config: {}
  },
  selectedAlertId: null,
  filter: "all",
  search: "",
  resourceSearch: "",
  resourceSelectorOpen: false,
  resourceActiveGroup: null,
  resourceManualMode: false,
  activeView: localStorage.getItem(VIEW_STORAGE_KEY) || "mercado",
  theme: localStorage.getItem(THEME_STORAGE_KEY) || "dark",
  calculator: loadCalculatorState(),
  dirty: false,
  refreshTimer: null,
  toastTimer: null
};

const byId = (id) => document.getElementById(id);

function loadCalculatorState() {
  try {
    const saved = JSON.parse(localStorage.getItem(CALC_STORAGE_KEY) || "{}");
    return {
      buyPrice: saved.buyPrice ?? "",
      quantity: saved.quantity ?? "",
      transportPrice: saved.transportPrice ?? "",
      transportUnits: saved.transportUnits ?? "0",
      sellCheck: saved.sellCheck ?? ""
    };
  } catch (error) {
    return {
      buyPrice: "",
      quantity: "",
      transportPrice: "",
      transportUnits: "0",
      sellCheck: ""
    };
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSearch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (Number.isInteger(number)) return String(number);
  if (Math.abs(number) >= 100) return number.toFixed(2).replace(/\.?0+$/, "");
  return number.toFixed(3).replace(/\.?0+$/, "");
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "—";
  return `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
}

function formatCompactReading(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const datePart = date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit"
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return `${datePart} · ${timePart}`;
}

function formatHeaderTime(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sunIconMarkup() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2"></circle>
      <path d="M12 2.8v2.5M12 18.7v2.5M21.2 12h-2.5M5.3 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5"></path>
    </svg>
  `;
}

function moonIconMarkup() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M19.3 14.7A8.2 8.2 0 0 1 9.3 4.7a8.9 8.9 0 1 0 10 10Z"></path>
    </svg>
  `;
}

function applyTheme(theme = state.theme) {
  state.theme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = state.theme;
  localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  renderThemeToggle();
}

function renderThemeToggle() {
  const button = byId("themeToggleButton");
  const icon = byId("themeToggleIcon");
  if (!button || !icon) return;
  const nextTheme = state.theme === "light" ? "dark" : "light";
  button.setAttribute("aria-label", nextTheme === "light" ? "Activar modo claro" : "Activar modo oscuro");
  button.setAttribute("title", nextTheme === "light" ? "Activar modo claro" : "Activar modo oscuro");
  icon.innerHTML = nextTheme === "light" ? sunIconMarkup() : moonIconMarkup();
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  const statusMessage = byId("statusMessage");
  if (!statusMessage) return;
  statusMessage.textContent = message;
  state.toastTimer = window.setTimeout(() => {
    statusMessage.textContent = state.dirty ? "Cambios pendientes" : "Listo";
  }, 1800);
}

async function callDesktop(method, payload) {
  if (!window.simcoDesktop?.[method]) {
    throw new Error("La API de escritorio no está disponible.");
  }
  return window.simcoDesktop[method](payload);
}

function splashProgressForElapsed(elapsedMs) {
  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= SPLASH_TOTAL_MS) return 100;
  for (const segment of SPLASH_PROGRESS_SEGMENTS) {
    if (elapsedMs > segment.end) continue;
    if (segment.from === segment.to) return segment.to;
    const progress = (elapsedMs - segment.start) / (segment.end - segment.start);
    const eased = Math.pow(Math.max(0, Math.min(progress, 1)), segment.power ?? 1);
    return segment.from + ((segment.to - segment.from) * eased);
  }
  return 100;
}

async function runSplashScreen() {
  const overlay = byId("splashOverlay");
  const fill = byId("splashProgressFill");
  if (!overlay || !fill) return;
  document.body.classList.add("splash-active");
  fill.style.width = "0%";

  const startedAt = performance.now();
  await new Promise((resolve) => {
    function tick(now) {
      const elapsed = now - startedAt;
      fill.style.width = `${splashProgressForElapsed(elapsed).toFixed(2)}%`;
      if (elapsed >= SPLASH_TOTAL_MS) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  });

  fill.style.width = "100%";
  overlay.classList.add("hidden");
  document.body.classList.remove("splash-active");
}

function resourceCatalog() {
  return state.dashboard?.resourceCatalog || [];
}

function resourceEntry(resourceId) {
  return resourceCatalog().find((item) => Number(item.id) === Number(resourceId)) || null;
}

function resourceLabel(resourceId) {
  if (resourceId === "" || resourceId === null || resourceId === undefined) return "Activo manual";
  return resourceEntry(resourceId)?.label || `Recurso ${resourceId}`;
}

function resourceChoice(alert) {
  const match = resourceEntry(alert.resourceId);
  return match ? String(match.id) : "custom";
}

function resourceSearchTokens(item) {
  return normalizeSearch([item.group, item.label, item.apiName, item.id].filter(Boolean).join(" "));
}

function filteredResourceCatalog(query = state.resourceSearch) {
  const normalized = normalizeSearch(query);
  if (!normalized) return resourceCatalog();
  return resourceCatalog().filter((item) => resourceSearchTokens(item).includes(normalized));
}

function resetResourceSelectorState({ keepOpen = false } = {}) {
  state.resourceSearch = "";
  state.resourceSelectorOpen = keepOpen;
  state.resourceActiveGroup = null;
}

function resourceGroups() {
  const groups = new Map();
  resourceCatalog().forEach((item) => {
    const group = item.group || "Varios";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(item);
  });
  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}

function filteredResourceGroups(query = state.resourceSearch) {
  const normalized = normalizeSearch(query);
  return resourceGroups().flatMap((entry) => {
    const matchesByName = !normalized || normalizeSearch(entry.name).includes(normalized);
    const matchedItems = !normalized
      ? entry.items
      : entry.items.filter((item) => resourceSearchTokens(item).includes(normalized));
    if (!normalized || matchesByName || matchedItems.length) {
      return [{
        ...entry,
        matchedItems,
        visibleCount: matchedItems.length
      }];
    }
    return [];
  });
}

function filteredResourcesInActiveGroup(query = state.resourceSearch) {
  if (!state.resourceActiveGroup) return [];
  const items = resourceCatalog().filter((item) => item.group === state.resourceActiveGroup);
  const normalized = normalizeSearch(query);
  if (!normalized) return items;
  return items.filter((item) => resourceSearchTokens(item).includes(normalized));
}

function resourceCrumbsMarkup() {
  if (!state.resourceActiveGroup) {
    return `<span class="selector-tag">Rubros</span>`;
  }
  return [
    `<span class="selector-tag">Rubro</span>`,
    `<span class="selector-tag">${escapeHtml(state.resourceActiveGroup)}</span>`,
    `<span class="selector-tag">Activos</span>`
  ].join("");
}

function focusResourceSearch() {
  window.requestAnimationFrame(() => {
    const input = byId("editorResourceSearch");
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

function logoUrlForItem(item) {
  if (item?.logoUrl) return item.logoUrl;
  return resourceEntry(item?.resourceId)?.logoUrl || "";
}

function avatarMarkup(item, fallback = "A") {
  const logoUrl = logoUrlForItem(item);
  if (logoUrl) {
    return `<div class="avatar"><img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(item.resourceName || item.label || fallback)}" /></div>`;
  }
  return `<div class="avatar">${escapeHtml((item.resourceName || item.label || fallback).slice(0, 1))}</div>`;
}

function inferActionKey(alert) {
  if (alert.condition === "<=" || alert.condition === "<") return "buy";
  if (alert.condition === ">=" || alert.condition === ">") return "sell";
  if (alert.condition === "between") return "range";
  return "check";
}

function actionLabel(alert) {
  const key = inferActionKey(alert);
  if (key === "buy") return "Compra";
  if (key === "sell") return "Venta";
  if (key === "range") return "Rango";
  return "Control";
}

function actionBadgeClass(key) {
  if (key === "buy") return "badge-buy";
  if (key === "sell") return "badge-sell";
  if (key === "range") return "badge-range";
  return "badge-idle";
}

function statusBadgeClass(tone, enabled = true) {
  if (!enabled) return "badge-muted";
  if (tone === "match") return "badge-match";
  if (tone === "watch") return "badge-watch";
  if (tone === "error") return "badge-error";
  return "badge-idle";
}

function editableAlert(alert) {
  return {
    id: alert.id,
    label: alert.label,
    resourceId: alert.resourceId,
    quality: alert.quality,
    condition: alert.condition,
    targetPrice: alert.targetPrice,
    targetPriceMax: alert.targetPriceMax ?? "",
    enabled: Boolean(alert.enabled),
    repeatWhileMatched: Boolean(alert.repeatWhileMatched),
    notificationKindOverride: alert.notificationKindOverride || ""
  };
}

function syncDraftFromDashboard(dashboard) {
  state.dashboard = dashboard;
  state.draft = {
    alerts: clone((dashboard.alerts || []).map(editableAlert)),
    channels: clone(dashboard.config?.channels || {}),
    config: {
      realmId: dashboard.config?.realmId ?? 0,
      pollSeconds: dashboard.config?.pollSeconds ?? 180,
      scanEnabled: dashboard.config?.scanEnabled !== false
    }
  };
  if (!state.selectedAlertId || !state.draft.alerts.some((item) => item.id === state.selectedAlertId)) {
    state.selectedAlertId = state.draft.alerts[0]?.id || null;
  }
  resetResourceSelectorState();
  state.resourceManualMode = false;
  setDirty(false);
}

function setDirty(nextValue) {
  state.dirty = nextValue;
  byId("saveButton").textContent = nextValue ? "Guardar cambios pendientes" : "Guardar cambios";
  const pill = byId("draftStatPill");
  pill.innerHTML = nextValue ? "Estado <span>Pendiente</span>" : "Estado <span>Guardado</span>";
  pill.classList.toggle("attention", nextValue);
}

function selectedAlert() {
  return state.draft.alerts.find((item) => item.id === state.selectedAlertId) || null;
}

function ensureSelectedAlert() {
  if (!state.selectedAlertId || !state.draft.alerts.some((item) => item.id === state.selectedAlertId)) {
    state.selectedAlertId = state.draft.alerts[0]?.id || null;
  }
}

function mergedAlert(alert) {
  const runtime = (state.dashboard?.alerts || []).find((item) => item.id === alert.id) || {};
  return {
    ...runtime,
    ...alert,
    resourceName: runtime.resourceName || resourceLabel(alert.resourceId),
    actionKey: runtime.actionKey || inferActionKey(alert),
    actionLabel: runtime.actionLabel || actionLabel(alert),
    priceDisplay: runtime.priceDisplay || "-",
    triggerSentence: runtime.triggerSentence || "Sin lectura",
    gapDisplay: runtime.gapDisplay || "-",
    gapPercentDisplay: runtime.gapPercentDisplay || "-",
    gapSentence: runtime.gapSentence || "Todavía no hay una lectura cargada para esta alerta.",
    statusText: runtime.statusText || (alert.enabled ? "Sin lectura" : "Pausada"),
    statusTone: runtime.statusTone || (alert.enabled ? "idle" : "muted"),
    lastSeenLocal: runtime.lastSeenLocal || "-",
    lastSeenCompact: formatCompactReading(runtime.lastSeenAt || runtime.sourceTime || ""),
    matched: Boolean(runtime.matched),
    logoUrl: runtime.logoUrl || resourceEntry(alert.resourceId)?.logoUrl || ""
  };
}

function draftPayload() {
  if (!state.draft.alerts.length) {
    throw new Error("Necesitas al menos una alerta.");
  }
  return {
    realmId: Number(state.draft.config.realmId || 0),
    pollSeconds: Number(state.draft.config.pollSeconds || 180),
    scanEnabled: state.draft.config.scanEnabled !== false,
    channels: state.draft.channels,
    alerts: state.draft.alerts.map((alert) => ({
      ...alert,
      resourceId: Number(alert.resourceId),
      quality: Number(alert.quality),
      targetPrice: Number(alert.targetPrice),
      ...(alert.condition === "between" ? { targetPriceMax: Number(alert.targetPriceMax) } : {})
    }))
  };
}

async function persistDraft(showSuccessMessage = true) {
  const dashboard = await callDesktop("saveConfig", draftPayload());
  syncDraftFromDashboard(dashboard);
  renderAll();
  if (showSuccessMessage) showToast("Cambios guardados");
}

function renderActiveView() {
  const isCalculator = state.activeView === "calculadora";
  byId("view-mercado").classList.toggle("active", !isCalculator);
  byId("view-calculadora").classList.toggle("active", isCalculator);
  byId("tab-mercado").classList.toggle("active", !isCalculator);
  byId("tab-calculadora").classList.toggle("active", isCalculator);
  byId("marketToolbar").style.display = isCalculator ? "none" : "";
}

function switchView(view) {
  state.activeView = view === "calculadora" ? "calculadora" : "mercado";
  localStorage.setItem(VIEW_STORAGE_KEY, state.activeView);
  renderActiveView();
}

function renderHeader() {
  const dashboard = state.dashboard;
  if (!dashboard) return;
  byId("headerMonitorStat").textContent = dashboard.monitor?.statusLabel || "Sin datos";
  byId("headerAlertsStat").textContent = String(dashboard.summary?.enabledAlerts || 0);
  byId("headerOpportunityStat").textContent = String(dashboard.summary?.matchedAlerts || 0);
  byId("headerScanStat").textContent = formatHeaderTime(dashboard.scan?.scannedAt);
  renderScanToggleButton();
}

function renderScanToggleButton() {
  const button = byId("scanToggleButton");
  if (!button) return;
  const scanEnabled = state.dashboard?.monitor?.scanEnabled !== false;
  button.textContent = scanEnabled ? "Parar escaneo" : "Iniciar escaneo";
  button.classList.toggle("action-btn-danger", scanEnabled);
  button.classList.toggle("action-btn-success", !scanEnabled);
}

function renderSelectedRuntime() {
  const alert = selectedAlert();
  if (!alert) {
    byId("selectedRuntime").innerHTML = `<div class="empty-card">Todavía no hay alertas.</div>`;
    return;
  }
  const item = mergedAlert(alert);
  byId("selectedRuntime").innerHTML = `
    <div class="summary-top">
      ${avatarMarkup(item, "A")}
      <div class="summary-title">
        <div class="summary-name">${escapeHtml(item.label)}</div>
        <div class="summary-meta">${escapeHtml(item.resourceName)} · Q${escapeHtml(item.quality)} · ID ${escapeHtml(item.resourceId)}</div>
      </div>
      <span class="badge ${actionBadgeClass(item.actionKey)}">${escapeHtml(item.actionLabel)}</span>
    </div>
    <div class="summary-metrics">
      <div class="metric-box"><span>Precio actual</span><strong>${escapeHtml(item.priceDisplay)}</strong></div>
      <div class="metric-box"><span>Tu objetivo</span><strong>${escapeHtml(formatNumber(item.targetPrice))}</strong></div>
      <div class="metric-box"><span>Cuánto falta</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
    </div>
    <div class="summary-line"><strong>Estado:</strong> ${escapeHtml(item.statusText)}</div>
    <div class="summary-line"><strong>Lectura:</strong> ${escapeHtml(item.gapSentence)}</div>
    <div class="summary-line"><strong>Última revisión:</strong> ${escapeHtml(item.lastSeenLocal)}</div>
  `;
}

function resourceSelectionSummary(alert) {
  const selectedItem = resourceEntry(alert.resourceId);
  if (selectedItem) {
    return {
      title: selectedItem.label,
      subtitle: `${selectedItem.group} · ${selectedItem.apiName} · ID ${selectedItem.id}`
    };
  }
  return {
    title: `ID ${alert.resourceId || ""}`,
    subtitle: "Activo manual"
  };
}

function resourceSelectorOptionsMarkup(alert) {
  if (!state.resourceActiveGroup) {
    const groups = filteredResourceGroups();
    if (!groups.length) {
      return `<div class="selector-empty">No hay rubros que coincidan con la búsqueda.</div>`;
    }
    const selectedGroup = resourceEntry(alert.resourceId)?.group || "";
    const normalizedQuery = normalizeSearch(state.resourceSearch);
    return groups.map((entry) => {
      const active = entry.name === selectedGroup;
      let helper = `${entry.items.length} activos`;
      if (normalizedQuery) {
        helper = normalizeSearch(entry.name).includes(normalizedQuery) && entry.matchedItems.length === entry.items.length
          ? `${entry.items.length} activos`
          : `${entry.visibleCount} coincidencia${entry.visibleCount === 1 ? "" : "s"}`;
      }
      return `
        <button class="selector-option${active ? " active" : ""}" type="button" data-action="open-resource-group" data-resource-group="${escapeHtml(entry.name)}">
          <div class="selector-option-main">
            ${avatarMarkup({ resourceName: entry.name, logoUrl: entry.items[0]?.logoUrl }, "R")}
            <span>${escapeHtml(entry.name)}</span>
          </div>
          <small>${escapeHtml(helper)}</small>
        </button>
      `;
    }).join("");
  }

  const items = filteredResourcesInActiveGroup();
  if (!items.length) {
    return `<div class="selector-empty">No hay activos que coincidan con la búsqueda.</div>`;
  }

  return items.map((item) => {
    const active = Number(item.id) === Number(alert.resourceId);
    return `
      <button class="selector-option${active ? " active" : ""}" type="button" data-action="select-resource" data-resource-id="${item.id}">
        <div class="selector-option-main">
          ${avatarMarkup({ resourceId: item.id, resourceName: item.label, logoUrl: item.logoUrl }, "A")}
          <span>${escapeHtml(item.label)}</span>
        </div>
        <small>${escapeHtml(item.apiName)} · ID ${item.id}</small>
      </button>
    `;
  }).join("");
}

function editorMarkup(alert) {
  if (!alert) return `<div class="empty-card">Selecciona una alerta para editarla.</div>`;
  const merged = mergedAlert(alert);
  const targetMaxClass = alert.condition === "between" ? "" : "hidden";
  const selectorSummary = resourceSelectionSummary(alert);
  const activeGroupItems = filteredResourcesInActiveGroup();
  const visibleGroupCount = filteredResourceGroups().length;
  const selectorCountLabel = state.resourceActiveGroup
    ? `${activeGroupItems.length} activos visibles`
    : `${visibleGroupCount} rubros visibles`;
  const selectorSearchPlaceholder = state.resourceActiveGroup
    ? "Buscar activo por nombre o ID"
    : "Buscar rubro o activo";
  return `
    <div class="editor-card">
      <div class="summary-top">
        ${avatarMarkup(merged, "A")}
        <div class="summary-title">
          <div class="summary-name">${escapeHtml(alert.label || "Nueva alerta")}</div>
          <div class="summary-meta">${escapeHtml(merged.resourceName)} · Q${escapeHtml(alert.quality)}</div>
        </div>
        <span class="badge ${statusBadgeClass(merged.statusTone, alert.enabled)}">${escapeHtml(merged.statusText)}</span>
      </div>

      <div class="editor-preview">
        <div class="editor-preview-label">Así se interpreta</div>
        <div class="editor-preview-title">${escapeHtml(merged.triggerSentence || "Sin lectura")}</div>
        <div class="editor-preview-subtitle">${escapeHtml(merged.gapSentence || "")}</div>
      </div>

      <div class="input-group">
        <label for="editorLabel">Nombre visible</label>
        <input id="editorLabel" class="styled-input" data-field="label" type="text" value="${escapeHtml(alert.label)}" />
      </div>

      <div class="input-group">
        <label>Activo</label>
        <div class="hierarchy-selector${state.resourceSelectorOpen ? " open" : ""}" id="editorResourceSelector">
          <button type="button" class="selector-summary" data-action="toggle-resource-selector">
            <div class="selector-summary-main">
              <div class="selector-title">${escapeHtml(selectorSummary.title)}</div>
              <div class="selector-subtitle">${escapeHtml(selectorSummary.subtitle)}</div>
            </div>
            <div class="selector-chevron">${state.resourceSelectorOpen ? "▲" : "▼"}</div>
          </button>
          <div class="selector-panel">
            <input id="editorResourceSearch" class="selector-search" data-field="resource-search" type="text" value="${escapeHtml(state.resourceSearch)}" placeholder="${escapeHtml(selectorSearchPlaceholder)}" />
            <div class="selector-crumbs">${resourceCrumbsMarkup()}<span class="selector-tag">${escapeHtml(selectorCountLabel)}</span></div>
            <div class="selector-actions">
              ${state.resourceActiveGroup ? '<button type="button" class="selector-action-btn" data-action="back-resource-groups">Volver a rubros</button>' : ""}
            </div>
            <div class="selector-list">${resourceSelectorOptionsMarkup(alert)}</div>
          </div>
        </div>
      </div>

      <div class="input-group">
        <label for="editorQuality">Calidad</label>
        <input id="editorQuality" class="styled-input" data-field="quality" type="number" min="0" step="1" value="${escapeHtml(alert.quality)}" />
      </div>

      <div class="form-row">
        <div class="input-group">
          <label for="editorCondition">Tipo de alerta</label>
          <select id="editorCondition" class="styled-select" data-field="condition">
            <option value="<=" ${alert.condition === "<=" ? "selected" : ""}>Compra cuando baja a</option>
            <option value=">=" ${alert.condition === ">=" ? "selected" : ""}>Venta cuando sube a</option>
            <option value="<" ${alert.condition === "<" ? "selected" : ""}>Menor que</option>
            <option value=">" ${alert.condition === ">" ? "selected" : ""}>Mayor que</option>
            <option value="==" ${alert.condition === "==" ? "selected" : ""}>Igual a</option>
            <option value="between" ${alert.condition === "between" ? "selected" : ""}>Entre dos precios</option>
          </select>
        </div>
        <div class="input-group">
          <label for="editorTarget">Precio gatillo</label>
          <input id="editorTarget" class="styled-input" data-field="targetPrice" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPrice)}" />
        </div>
      </div>

      <div id="editorTargetMaxGroup" class="input-group ${targetMaxClass}">
        <label for="editorTargetMax">Precio máximo</label>
        <input id="editorTargetMax" class="styled-input" data-field="targetPriceMax" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPriceMax)}" />
      </div>

      <label class="inline-toggle">
        <span>Alerta activa</span>
        <input data-field="enabled" type="checkbox" ${alert.enabled ? "checked" : ""} />
      </label>

      <label class="inline-toggle">
        <span>Avisar en cada escaneo mientras siga en zona</span>
        <input data-field="repeatWhileMatched" type="checkbox" ${alert.repeatWhileMatched ? "checked" : ""} />
      </label>

      <div class="editor-actions">
        <button id="removeAlertButton" class="action-btn action-btn-danger" type="button">Eliminar alerta</button>
      </div>
    </div>
  `;
}

function renderEditor() {
  byId("editorContainer").innerHTML = editorMarkup(selectedAlert());
}

function renderChannels() {
  byId("channelDesktop").checked = Boolean(state.draft.channels.desktop);
  byId("channelDiscord").value = state.draft.channels.discordWebhookUrl || "";
  byId("channelTelegramToken").value = state.draft.channels.telegramBotToken || "";
  byId("channelTelegramChat").value = state.draft.channels.telegramChatId || "";
}

function passesFilter(item) {
  const actionKey = inferActionKey(item);
  if (state.filter === "buy" && actionKey !== "buy") return false;
  if (state.filter === "sell" && actionKey !== "sell") return false;
  if (state.filter === "match" && !mergedAlert(item).matched) return false;
  if (state.filter === "disabled" && item.enabled) return false;
  const query = normalizeSearch(state.search);
  if (!query) return true;
  const merged = mergedAlert(item);
  return normalizeSearch([item.label, merged.resourceName, item.resourceId, `q${item.quality}`].join(" ")).includes(query);
}

function alertCardMarkup(alert) {
  const item = mergedAlert(alert);
  return `
    <article class="contact-card${item.id === state.selectedAlertId ? " selected" : ""}${item.enabled ? "" : " muted"}" data-alert-id="${escapeHtml(item.id)}">
      <div class="card-top">
        ${avatarMarkup(item, "A")}
        <div class="card-title">
          <div class="contact-name">${escapeHtml(item.label)}</div>
          <div class="contact-meta">${escapeHtml(item.resourceName)} · Q${escapeHtml(item.quality)} · ID ${escapeHtml(item.resourceId)}</div>
        </div>
        <span class="badge ${actionBadgeClass(item.actionKey)}">${escapeHtml(item.actionLabel)}</span>
      </div>
      <div class="market-grid">
        <div class="metric-box"><span>Precio actual</span><strong>${escapeHtml(item.priceDisplay)}</strong></div>
        <div class="metric-box"><span>Objetivo</span><strong>${escapeHtml(formatNumber(item.targetPrice))}</strong></div>
        <div class="metric-box"><span>Brecha</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
      </div>
      <hr class="card-divider" />
      <div class="card-perception">${escapeHtml(item.triggerSentence)}</div>
      <div class="card-notes">${escapeHtml(item.gapSentence)}</div>
      <div class="card-tags">
        <span class="tag">${escapeHtml(item.statusText)}</span>
        <span class="tag">Última lectura ${escapeHtml(item.lastSeenCompact)}</span>
        <span class="tag">Brecha ${escapeHtml(item.gapPercentDisplay)}</span>
      </div>
    </article>
  `;
}

function renderAlertList() {
  const items = state.draft.alerts.filter(passesFilter);
  byId("alertsList").innerHTML = items.length
    ? items.map(alertCardMarkup).join("")
    : `<div class="empty-card">No hay alertas para ese filtro.</div>`;
}

function eventBadgeClass(type) {
  if (type === "trigger") return "badge-match";
  if (type === "error") return "badge-error";
  if (type === "cleared") return "badge-watch";
  return "badge-idle";
}

function eventDescription(item) {
  if (item.type === "trigger") return item.body || `${item.label}: alerta disparada.`;
  if (item.type === "cleared") return `${item.label}: salió de la zona vigilada.`;
  if (item.type === "error") return item.error || "Error sin detalle.";
  return "Evento del monitor.";
}

function renderEvents() {
  const events = state.dashboard?.events || [];
  byId("eventsFeed").innerHTML = events.length
    ? events.map((item) => `
        <article class="event-card" data-event-id="${escapeHtml(item.eventId)}">
          <div class="event-head">
            <div class="event-title">${escapeHtml(item.label || item.alertId || item.type || "Evento")}</div>
            <div class="event-actions">
              <span class="badge ${eventBadgeClass(item.type)}">${escapeHtml(item.type || "evento")}</span>
              <button class="mini-btn mini-btn-danger delete-event-btn" type="button">Eliminar</button>
            </div>
          </div>
          <div class="event-body">${escapeHtml(eventDescription(item))}</div>
          <div class="event-time">${escapeHtml(formatDateTime(item.time))}</div>
        </article>
      `).join("")
    : `<div class="empty-card">Todavía no hay movimientos recientes.</div>`;
}

function renderFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function renderAll() {
  ensureSelectedAlert();
  renderActiveView();
  renderThemeToggle();
  renderHeader();
  renderSelectedRuntime();
  renderEditor();
  renderChannels();
  renderFilterButtons();
  renderAlertList();
  renderEvents();
  syncCalculatorInputs();
  recalculateCalculator();
}

function currentAlertIndex() {
  return state.draft.alerts.findIndex((item) => item.id === state.selectedAlertId);
}

function updateEditorDecoration() {
  const alert = selectedAlert();
  if (!alert) return;
  const maxGroup = byId("editorTargetMaxGroup");
  if (maxGroup) {
    maxGroup.classList.toggle("hidden", alert.condition !== "between");
  }
}

function handleEditorMutation(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const alert = selectedAlert();
  if (!alert) return;

  const actionTarget = target.closest("[data-action]");
  if (actionTarget?.dataset.action === "toggle-resource-selector") {
    event.preventDefault();
    event.stopPropagation();
    state.resourceSelectorOpen = !state.resourceSelectorOpen;
    renderEditor();
    if (state.resourceSelectorOpen) {
      focusResourceSearch();
    } else {
      resetResourceSelectorState();
      renderEditor();
    }
    return;
  }

  if (actionTarget?.dataset.action === "back-resource-groups") {
    event.preventDefault();
    event.stopPropagation();
    state.resourceActiveGroup = null;
    state.resourceSearch = "";
    renderEditor();
    focusResourceSearch();
    return;
  }

  if (actionTarget?.dataset.action === "open-resource-group") {
    event.preventDefault();
    event.stopPropagation();
    state.resourceActiveGroup = actionTarget.dataset.resourceGroup || null;
    state.resourceSearch = "";
    renderEditor();
    focusResourceSearch();
    return;
  }

  if (actionTarget?.dataset.action === "select-resource") {
    event.preventDefault();
    event.stopPropagation();
    alert.resourceId = Number(actionTarget.dataset.resourceId);
    resetResourceSelectorState();
    setDirty(true);
    renderSelectedRuntime();
    renderEditor();
    renderAlertList();
    return;
  }

  if (target.closest("#removeAlertButton")) {
    removeSelectedAlert();
    return;
  }

  if (event.type === "click") {
    return;
  }

  const field = target.dataset.field;
  if (!field) return;

  if (field === "resource-search") {
    state.resourceSearch = target.value;
    renderEditor();
    focusResourceSearch();
    return;
  }

  if (field === "enabled" || field === "repeatWhileMatched") {
    alert[field] = target.checked;
  } else if (field === "quality" || field === "resourceId") {
    alert[field] = Number(target.value);
  } else if (field === "targetPrice" || field === "targetPriceMax") {
    alert[field] = target.value;
  } else {
    alert[field] = target.value;
  }

  setDirty(true);
  renderSelectedRuntime();
  if (field === "condition") {
    renderEditor();
    return;
  }
  updateEditorDecoration();
}

function handleChannelsChange() {
  state.draft.channels.desktop = byId("channelDesktop").checked;
  state.draft.channels.discordWebhookUrl = byId("channelDiscord").value.trim();
  state.draft.channels.telegramBotToken = byId("channelTelegramToken").value.trim();
  state.draft.channels.telegramChatId = byId("channelTelegramChat").value.trim();
  setDirty(true);
}

async function saveConfig() {
  try {
    await persistDraft(true);
  } catch (error) {
    showToast(error.message);
  }
}

async function scanNow() {
  try {
    if (state.dirty) {
      await persistDraft(false);
    }
    const dashboard = await callDesktop("scanNow");
    state.dashboard = dashboard;
    renderAll();
    showToast(dashboard.scan?.errors?.length ? `Escaneo con ${dashboard.scan.errors.length} error(es)` : "Escaneo terminado");
  } catch (error) {
    showToast(error.message);
  }
}

async function toggleScanEnabled() {
  const currentEnabled = state.dashboard?.monitor?.scanEnabled !== false;
  const nextEnabled = !currentEnabled;
  if (state.dashboard?.monitor) {
    state.dashboard.monitor = {
      ...state.dashboard.monitor,
      scanEnabled: nextEnabled,
      statusLabel: state.dashboard.monitor?.statusLabel === "Escaneando"
        ? state.dashboard.monitor.statusLabel
        : nextEnabled ? "Activo" : "Pausado"
    };
  }
  state.draft.config.scanEnabled = nextEnabled;
  renderHeader();
  try {
    const dashboard = await callDesktop("setScanEnabled", nextEnabled);
    state.dashboard = dashboard;
    state.draft.config.scanEnabled = dashboard.config?.scanEnabled !== false;
    renderAll();
    showToast(nextEnabled ? "Escaneo automático reanudado" : "Escaneo automático detenido");
  } catch (error) {
    state.draft.config.scanEnabled = currentEnabled;
    if (state.dashboard?.monitor) {
      state.dashboard.monitor = {
        ...state.dashboard.monitor,
        scanEnabled: currentEnabled,
        statusLabel: currentEnabled ? "Activo" : "Pausado"
      };
    }
    renderHeader();
    showToast(error.message);
  }
}

function newAlertId() {
  return `draft-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function addAlert() {
  state.draft.alerts.unshift({
    id: newAlertId(),
    label: "Nueva alerta",
    resourceId: 2,
    quality: 0,
    condition: "<=",
    targetPrice: 0.37,
    targetPriceMax: "",
    enabled: true,
    repeatWhileMatched: true,
    notificationKindOverride: ""
  });
  state.selectedAlertId = state.draft.alerts[0].id;
  resetResourceSelectorState();
  setDirty(true);
  renderAll();
}

function removeSelectedAlert() {
  if (state.draft.alerts.length <= 1) {
    showToast("Necesitas al menos una alerta");
    return;
  }
  const index = currentAlertIndex();
  if (index === -1) return;
  state.draft.alerts.splice(index, 1);
  state.selectedAlertId = state.draft.alerts[Math.max(0, index - 1)]?.id || state.draft.alerts[0]?.id || null;
  setDirty(true);
  renderAll();
}

function discardDraft() {
  if (!state.dashboard) return;
  syncDraftFromDashboard(state.dashboard);
  renderAll();
  showToast("Cambios descartados");
}

async function deleteEvent(eventId) {
  const dashboard = await callDesktop("deleteEvent", eventId);
  state.dashboard = dashboard;
  renderAll();
  showToast("Evento eliminado");
}

async function loadDashboard({ quiet = false } = {}) {
  try {
    const dashboard = await callDesktop("getDashboard");
    if (!state.dirty || !state.draft.alerts.length) {
      syncDraftFromDashboard(dashboard);
      renderAll();
    } else {
      state.dashboard = dashboard;
      state.draft.config.scanEnabled = dashboard.config?.scanEnabled !== false;
      renderHeader();
      renderSelectedRuntime();
      renderAlertList();
      renderEvents();
    }
    if (!quiet) showToast("Panel actualizado");
  } catch (error) {
    showToast(error.message);
  }
}

function startAutoRefresh() {
  clearInterval(state.refreshTimer);
  state.refreshTimer = window.setInterval(() => {
    loadDashboard({ quiet: true });
  }, 15000);
}

function persistCalculatorState() {
  localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(state.calculator));
}

function syncCalculatorInputs() {
  [
    ["calc-buy-price", "buyPrice"],
    ["calc-qty", "quantity"],
    ["calc-transport-price", "transportPrice"],
    ["calc-transport-units", "transportUnits"],
    ["calc-sell-check", "sellCheck"]
  ].forEach(([id, key]) => {
    const element = byId(id);
    if (element) element.value = state.calculator[key] ?? "";
  });
}

function recalculateCalculator() {
  const buyPrice = Number(state.calculator.buyPrice);
  const qty = Number(state.calculator.quantity) || 1;
  const transportPrice = Number(state.calculator.transportPrice) || 0;
  const transportUnits = Number(state.calculator.transportUnits) || 0;
  const sellCheck = Number(state.calculator.sellCheck);
  const empty = byId("calc-empty-state");
  const main = byId("calc-main-results");
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
    empty.style.display = "flex";
    main.style.display = "none";
    return;
  }
  empty.style.display = "flex";
  empty.style.display = "none";
  main.style.display = "flex";
  const feeRate = 0.04;
  const freightPerUnit = transportPrice * transportUnits;
  const freight = freightPerUnit * qty;
  const breakevenUnit = (buyPrice + freightPerUnit) / (1 - feeRate);
  const feeOnBreakeven = breakevenUnit * feeRate;
  byId("calc-breakeven-price").textContent = formatCurrency(breakevenUnit);
  byId("calc-d-cost").textContent = formatCurrency(buyPrice);
  byId("calc-d-fee").textContent = formatCurrency(feeOnBreakeven);
  byId("calc-d-freight").textContent = formatCurrency(freightPerUnit);
  byId("calc-s-total").textContent = formatCurrency(buyPrice * qty + freight);
  byId("calc-s-fee").textContent = formatCurrency(breakevenUnit * feeRate * qty);
  byId("calc-s-freight").textContent = formatCurrency(freight);
  const grid = byId("calc-targets-grid");
  grid.innerHTML = "";
  CALC_TARGET_PCTS.forEach((pct) => {
    const targetNetPerUnit = buyPrice * (1 + pct / 100) + freightPerUnit;
    const targetSellPrice = targetNetPerUnit / (1 - feeRate);
    const gainPerUnit = targetSellPrice * (1 - feeRate) - buyPrice - freightPerUnit;
    const gainTotal = gainPerUnit * qty;
    const card = document.createElement("div");
    card.className = "calc-card calc-target";
    card.innerHTML = `
      <div class="calc-target-pct">+${pct}% ganancia</div>
      <div class="calc-target-price">${formatCurrency(targetSellPrice)}</div>
      <div class="calc-target-gain gain-pos">+${formatCurrency(gainTotal)} total</div>
      <div class="calc-target-note">${formatCurrency(gainPerUnit)}/u</div>
    `;
    grid.appendChild(card);
  });
  const checker = byId("calc-checker-section");
  const verdict = byId("calc-verdict");
  const verdictDetail = byId("calc-verdict-detail");
  if (Number.isFinite(sellCheck) && sellCheck > 0) {
    checker.style.display = "flex";
    const netPerUnit = sellCheck * (1 - feeRate) - buyPrice - freightPerUnit;
    const netTotal = netPerUnit * qty;
    const pctGain = (netPerUnit / buyPrice) * 100;
    if (Math.abs(netPerUnit) < 0.01) {
      verdict.className = "calc-verdict breakeven-v";
      verdict.textContent = "Breakeven exacto";
      verdictDetail.textContent = "No ganás ni perdés.";
    } else if (netPerUnit > 0) {
      verdict.className = "calc-verdict ganancia";
      verdict.textContent = `+${pctGain.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · Ganancia`;
      verdictDetail.innerHTML = `<span class="gain-pos">+${formatCurrency(netTotal)}</span> total · <span class="gain-pos">+${formatCurrency(netPerUnit)}</span> por unidad`;
    } else {
      verdict.className = "calc-verdict perdida";
      verdict.textContent = `${pctGain.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · Pérdida`;
      verdictDetail.innerHTML = `<span class="gain-neg">-${formatCurrency(Math.abs(netTotal))}</span> total · <span class="gain-neg">-${formatCurrency(Math.abs(netPerUnit))}</span> por unidad`;
    }
  } else {
    checker.style.display = "none";
    verdict.className = "calc-verdict";
    verdict.textContent = "Ingresá un precio";
    verdictDetail.textContent = "";
  }
}

function bindStaticUi() {
  byId("themeToggleButton").addEventListener("click", () => {
    applyTheme(state.theme === "light" ? "dark" : "light");
  });
  byId("tab-mercado").addEventListener("click", () => switchView("mercado"));
  byId("tab-calculadora").addEventListener("click", () => switchView("calculadora"));
  byId("scanNowButton").addEventListener("click", scanNow);
  byId("scanToggleButton").addEventListener("click", toggleScanEnabled);
  byId("saveButton").addEventListener("click", saveConfig);
  byId("resetButton").addEventListener("click", discardDraft);
  byId("addAlertButton").addEventListener("click", addAlert);
  byId("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderAlertList();
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilterButtons();
      renderAlertList();
    });
  });

  byId("alertsList").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest("[data-alert-id]");
    if (!card) return;
    state.selectedAlertId = card.dataset.alertId;
    resetResourceSelectorState();
    renderSelectedRuntime();
    renderEditor();
    renderAlertList();
  });

  byId("editorContainer").addEventListener("input", handleEditorMutation);
  byId("editorContainer").addEventListener("change", handleEditorMutation);
  byId("editorContainer").addEventListener("click", handleEditorMutation);

  document.addEventListener("click", (event) => {
    if (!state.resourceSelectorOpen) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const selector = byId("editorResourceSelector");
    if (selector && !selector.contains(target)) {
      resetResourceSelectorState();
      renderEditor();
    }
  });

  byId("eventsFeed").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("delete-event-btn")) return;
    const card = target.closest("[data-event-id]");
    if (!card?.dataset.eventId) return;
    deleteEvent(card.dataset.eventId);
  });

  ["channelDesktop", "channelDiscord", "channelTelegramToken", "channelTelegramChat"].forEach((id) => {
    const element = byId(id);
    element.addEventListener("input", handleChannelsChange);
    element.addEventListener("change", handleChannelsChange);
  });

  [
    ["calc-buy-price", "buyPrice"],
    ["calc-qty", "quantity"],
    ["calc-transport-price", "transportPrice"],
    ["calc-transport-units", "transportUnits"],
    ["calc-sell-check", "sellCheck"]
  ].forEach(([id, key]) => {
    const element = byId(id);
    const eventName = element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventName, (event) => {
      state.calculator[key] = event.target.value;
      persistCalculatorState();
      recalculateCalculator();
    });
  });
}

async function boot() {
  applyTheme(state.theme);
  bindStaticUi();
  renderActiveView();
  syncCalculatorInputs();
  recalculateCalculator();
  const dashboardPromise = loadDashboard({ quiet: true });
  await Promise.all([dashboardPromise, runSplashScreen()]);
  startAutoRefresh();
}

window.addEventListener("DOMContentLoaded", boot);
