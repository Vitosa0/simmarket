const VIEW_STORAGE_KEY = "simco-desktop-view";
const CALC_STORAGE_KEY = "simco-desktop-calculator";
const THEME_STORAGE_KEY = "simco-desktop-theme";
const CONTACTS_STORAGE_KEY = "simco-desktop-contacts";
const ONBOARDING_STORAGE_KEY = "simco-desktop-onboarding-completed";
const CALC_TARGET_PCTS = [2, 5, 10, 15, 20, 25, 30, 50];
const VARIOS_LABEL = "Varios";
const CONTACT_TYPE_OPTIONS = ["Proveedor", "Cliente", "Desconocido", "Social", "Socio"];
const CONTACT_TYPE_FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "Proveedor", label: "Proveedores" },
  { value: "Cliente", label: "Clientes" },
  { value: "Desconocido", label: "Desconocidos" },
  { value: "Social", label: "Social" },
  { value: "Socio", label: "Socios" }
];
const CONTACT_TRUST_FILTER_OPTIONS = [
  { value: "todos", label: "Toda confianza" },
  { value: "Alto", label: "Alta" },
  { value: "Medio", label: "Media" },
  { value: "Bajo", label: "Baja" },
  { value: "Neutro", label: "Neutro" }
];
const CONTACT_TRUST_OPTIONS = [
  { value: "Alto", tone: "alto" },
  { value: "Medio", tone: "medio" },
  { value: "Bajo", tone: "bajo" },
  { value: "Neutro", tone: "neutro" }
];
const SPLASH_TOTAL_MS = 6000;
const VITO_INTRO_TOTAL_MS = 3000;
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
  conditionSelectorOpen: false,
  contacts: loadContacts(),
  contactSearch: "",
  contactTypeFilter: "todos",
  contactTrustFilter: "todos",
  contactRubroFilter: "todos",
  contactDraft: emptyContactDraft(),
  contactSelectorOpen: false,
  contactTypeSelectorOpen: false,
  contactActiveGroup: null,
  contactResourceSearch: "",
  contactSelectedRubros: {},
  currentHistoryContactId: null,
  resourceManualMode: false,
  platform: window.simcoDesktop?.platform || "unknown",
  activeView: localStorage.getItem(VIEW_STORAGE_KEY) || "mercado",
  theme: localStorage.getItem(THEME_STORAGE_KEY) || "dark",
  calculator: loadCalculatorState(),
  updates: {
    platform: window.simcoDesktop?.platform || "unknown",
    strategy: "manual",
    currentVersion: "1.0.3",
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
  },
  onboardingVisible: false,
  onboardingStep: 0,
  warningSignature: "",
  dirty: false,
  refreshTimer: null,
  toastTimer: null
};

const ONBOARDING_STEPS = [
  {
    title: "Bienvenido a SimMarket",
    body: "La app está pensada para que vigiles mercado, armes alertas y tomes decisiones de compra o venta desde un solo panel.",
    points: [
      "Seguís activos por rubro y calidad.",
      "Las alertas entran en zona cuando el precio cumple tu regla.",
      "No necesitás tocar archivos ni JSON manuales."
    ]
  },
  {
    title: "Creá tu primera alerta",
    body: "Empezá por el botón Nueva alerta. Elegí activo, calidad, tipo de alerta y precio gatillo.",
    points: [
      "Menor que: zona de compra.",
      "Mayor que: zona de venta.",
      "Entre dos precios: vigilancia por rango."
    ]
  },
  {
    title: "Probá el mercado al instante",
    body: "Usá Escanear mercado para revisar el precio actual enseguida y validar si tu alerta ya está entrando en zona.",
    points: [
      "Si el mercado está limitado, SimMarket te lo va a indicar.",
      "Las notificaciones salen cuando una alerta entra en zona.",
      "Podés pausar o reanudar el escaneo automático cuando quieras."
    ],
    finalAction: true
  }
];

const byId = (id) => document.getElementById(id);

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

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

function emptyContactDraft() {
  return {
    name: "",
    type: "Proveedor",
    perception: "",
    notes: "",
    trust: "Medio"
  };
}

function uniqueList(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeContactHistory(contact) {
  if (!Array.isArray(contact.history)) return [];
  return contact.history.map((entry, index) => ({
    id: entry.id || `history-${Date.now()}-${index}`,
    date: String(entry.date || contact.date || "").trim(),
    summary: String(entry.summary || "Interacción guardada").trim(),
    note: String(entry.note || "").trim(),
    messages: Array.isArray(entry.messages)
      ? entry.messages
        .filter((message) => message && message.text)
        .map((message) => ({
          speaker: message.speaker === "me" ? "me" : "contact",
          text: String(message.text || "").trim(),
          time: String(message.time || "").trim()
        }))
      : []
  })).filter((entry) => entry.summary || entry.note || entry.messages.length);
}

function normalizeContactSelections(contact) {
  if (Array.isArray(contact.selections) && contact.selections.length) {
    return contact.selections
      .filter((selection) => selection && selection.rubro)
      .map((selection) => ({
        rubro: String(selection.rubro || "").trim(),
        products: uniqueList(selection.products)
      }))
      .filter((selection) => selection.rubro && selection.rubro !== VARIOS_LABEL);
  }

  if (Array.isArray(contact.rubros) && contact.rubros.length) {
    return uniqueList(contact.rubros)
      .filter((rubro) => rubro !== VARIOS_LABEL)
      .map((rubro) => ({
        rubro,
        products: []
      }));
  }

  if (contact.resourceId !== "" && contact.resourceId !== null && contact.resourceId !== undefined) {
    const match = resourceEntry(contact.resourceId);
    if (match) {
      return [{
        rubro: match.group || VARIOS_LABEL,
        products: [match.label]
      }];
    }
  }

  if (contact.rubro && contact.rubro !== VARIOS_LABEL) {
    return [{
      rubro: String(contact.rubro || "").trim(),
      products: uniqueList(contact.products)
    }];
  }

  return [];
}

function buildContactProductDisplay(selections) {
  if (!selections.length) return VARIOS_LABEL;
  return selections.map((selection) => {
    if (!selection.products.length) {
      return `${selection.rubro} · ${VARIOS_LABEL}`;
    }
    return `${selection.rubro} · ${selection.products.join(", ")}`;
  }).join(" | ");
}

function normalizeContactRecord(contact) {
  const selections = normalizeContactSelections(contact);
  const rubros = selections.length ? selections.map((selection) => selection.rubro) : [VARIOS_LABEL];
  const products = selections.flatMap((selection) => selection.products);
  const createdAt = contact.createdAt || new Date().toISOString();
  return {
    id: contact.id || `contact-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    name: String(contact.name || "").trim(),
    type: CONTACT_TYPE_OPTIONS.includes(contact.type) ? contact.type : "Proveedor",
    resourceId: contact.resourceId === "" || contact.resourceId === null || contact.resourceId === undefined
      ? ""
      : Number(contact.resourceId),
    rubro: rubros[0] || VARIOS_LABEL,
    rubros,
    selections,
    products,
    productDisplay: String(contact.productDisplay || contact.product || buildContactProductDisplay(selections)).trim() || VARIOS_LABEL,
    perception: String(contact.perception || "").trim(),
    notes: String(contact.notes || "").trim(),
    history: normalizeContactHistory(contact),
    trust: CONTACT_TRUST_OPTIONS.some((option) => option.value === contact.trust) ? contact.trust : "Medio",
    date: String(contact.date || formatContactDate(createdAt)).trim(),
    createdAt
  };
}

function loadContacts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONTACTS_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeContactRecord).filter((contact) => contact.name);
  } catch (error) {
    return [];
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

function formatContactDate(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
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

function showToast(message, tone = "neutral") {
  clearTimeout(state.toastTimer);
  const statusMessage = byId("statusMessage");
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
  statusMessage.classList.add("visible");
  state.toastTimer = window.setTimeout(() => {
    statusMessage.classList.remove("visible");
    statusMessage.textContent = "";
    delete statusMessage.dataset.tone;
  }, 2400);
}

function validateAlertDraft(alert) {
  const errors = {};
  if (!Number.isFinite(Number(alert.resourceId)) || Number(alert.resourceId) <= 0) {
    errors.resourceId = "Elegí un activo válido.";
  }
  if (!Number.isFinite(Number(alert.quality)) || Number(alert.quality) < 0 || !Number.isInteger(Number(alert.quality))) {
    errors.quality = "La calidad tiene que ser un entero igual o mayor a 0.";
  }
  const targetPriceRaw = String(alert.targetPrice ?? "").trim();
  if (!targetPriceRaw.length || !Number.isFinite(Number(targetPriceRaw))) {
    errors.targetPrice = "Cargá un precio gatillo válido.";
  }
  if (editorConditionValue(alert.condition) === "between") {
    const targetPriceMaxRaw = String(alert.targetPriceMax ?? "").trim();
    if (!targetPriceMaxRaw.length || !Number.isFinite(Number(targetPriceMaxRaw))) {
      errors.targetPriceMax = "Cargá el precio máximo del rango.";
    }
  }
  return errors;
}

function draftValidationSummary() {
  const byAlertId = {};
  let invalidCount = 0;
  state.draft.alerts.forEach((alert) => {
    const errors = validateAlertDraft(alert);
    if (Object.keys(errors).length) {
      byAlertId[alert.id] = errors;
      invalidCount += 1;
    }
  });
  return {
    byAlertId,
    invalidCount,
    isValid: invalidCount === 0
  };
}

function shouldShowOnboarding() {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true" && (state.dashboard?.alerts?.length || 0) === 0;
}

function openOnboarding() {
  state.onboardingVisible = true;
  state.onboardingStep = 0;
}

function completeOnboarding() {
  state.onboardingVisible = false;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
}

function warningSignature(warnings = []) {
  return JSON.stringify(
    (Array.isArray(warnings) ? warnings : []).map((warning) => ({
      label: warning.label,
      error: warning.error
    }))
  );
}

function liveAlertTone(payload) {
  const title = String(payload?.title || "").toLowerCase();
  if (title.includes("compra")) return "buy";
  if (title.includes("venta")) return "sell";
  return "market";
}

function liveAlertToneLabel(tone) {
  if (tone === "buy") return "Compra";
  if (tone === "sell") return "Venta";
  return "Mercado";
}

function showLiveAlert(payload) {
  const stack = byId("liveAlertStack");
  if (!stack || !payload?.title) return;
  const tone = liveAlertTone(payload);
  const card = document.createElement("article");
  card.className = `live-alert-card is-${tone}`;
  card.innerHTML = `
    <div class="live-alert-top">
      <div class="live-alert-title">${escapeHtml(payload.title)}</div>
      <div class="live-alert-pill">${escapeHtml(liveAlertToneLabel(tone))}</div>
    </div>
    <div class="live-alert-body">
      <div class="live-alert-label">${escapeHtml(payload.label || payload.resourceName || "Alerta")}</div>
      <div class="live-alert-copy">${escapeHtml(payload.body || "")}</div>
    </div>
  `;
  stack.prepend(card);
  const leave = () => {
    card.classList.add("is-leaving");
    window.setTimeout(() => card.remove(), 220);
  };
  window.setTimeout(leave, 5400);
}

async function callDesktop(method, payload) {
  if (!window.simcoDesktop?.[method]) {
    throw new Error("La API de escritorio no está disponible.");
  }
  return window.simcoDesktop[method](payload);
}

function persistContacts() {
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(state.contacts));
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
}

function buildVitoParticles() {
  const particles = byId("vitoParticles");
  if (!particles) return;
  particles.innerHTML = "";
  for (let index = 0; index < 30; index += 1) {
    const particle = document.createElement("span");
    particle.className = "vito-particle";
    particle.style.left = `${28 + Math.random() * 44}%`;
    particle.style.top = `${56 + Math.random() * 24}%`;
    particle.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 42}px`);
    particle.style.setProperty("--travel-y", `${220 + Math.random() * 260}px`);
    particle.style.animationDuration = `${1.05 + Math.random() * 0.95}s`;
    particle.style.animationDelay = `${Math.random() * 0.75}s`;
    particles.appendChild(particle);
  }
}

async function runVitoIntro() {
  const overlay = byId("vitoOverlay");
  if (!overlay) {
    document.body.classList.remove("splash-active");
    return;
  }

  buildVitoParticles();
  document.body.classList.add("intro-active");
  overlay.classList.remove("hidden");
  await wait(VITO_INTRO_TOTAL_MS);
  overlay.classList.add("hidden");
  await wait(450);

  const particles = byId("vitoParticles");
  if (particles) particles.innerHTML = "";

  document.body.classList.remove("intro-active");
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

function filteredGroupsByQuery(query = "") {
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

function filteredResourcesForGroup(group, query = "") {
  if (!group) return [];
  const items = resourceCatalog().filter((item) => item.group === group);
  const normalized = normalizeSearch(query);
  if (!normalized) return items;
  return items.filter((item) => resourceSearchTokens(item).includes(normalized));
}

function filteredResourceGroups(query = state.resourceSearch) {
  return filteredGroupsByQuery(query);
}

function filteredResourcesInActiveGroup(query = state.resourceSearch) {
  return filteredResourcesForGroup(state.resourceActiveGroup, query);
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

function letterAvatarMarkup(label, fallback = "C") {
  const safeLabel = String(label || "").trim();
  const letter = safeLabel ? safeLabel.charAt(0).toUpperCase() : fallback;
  return `<div class="avatar">${escapeHtml(letter)}</div>`;
}

function viewMeta(view = state.activeView) {
  if (view === "calculadora") {
    return {
      id: "calculadora",
      title: "CALCULADORA DE COSTOS",
      toolbarVisible: false
    };
  }
  if (view === "registro") {
    return {
      id: "registro",
      title: "REGISTRO DE CONTACTOS",
      toolbarVisible: false
    };
  }
  return {
    id: "mercado",
    title: "ALERTAS DE MERCADO",
    toolbarVisible: true
  };
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
    condition: editorConditionValue(alert.condition),
    targetPrice: alert.targetPrice,
    targetPriceMax: alert.targetPriceMax ?? "",
    enabled: Boolean(alert.enabled),
    repeatWhileMatched: Boolean(alert.repeatWhileMatched),
    notificationKindOverride: alert.notificationKindOverride || ""
  };
}

function syncDraftFromDashboard(dashboard) {
  state.dashboard = dashboard;
  state.updates = {
    ...state.updates,
    ...(dashboard.updates || {})
  };
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
  resetConditionSelectorState();
  state.resourceManualMode = false;
  setDirty(false);
}

function setDirty(nextValue) {
  state.dirty = nextValue;
  const pill = byId("draftStatPill");
  if (pill) {
    pill.innerHTML = nextValue ? "Estado <span>Pendiente</span>" : "Estado <span>Guardado</span>";
    pill.classList.toggle("attention", nextValue);
  }
  renderSaveButtonState();
}

function renderSaveButtonState() {
  const button = byId("saveButton");
  if (!button) return;
  const validation = draftValidationSummary();
  if (!validation.isValid) {
    button.textContent = validation.invalidCount === 1 ? "Corregir 1 alerta" : `Corregir ${validation.invalidCount} alertas`;
    button.disabled = true;
    return;
  }
  button.disabled = false;
  button.textContent = state.dirty ? "Guardar cambios pendientes" : "Guardar cambios";
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
    targetDisplay: runtime.targetDisplay || (editorConditionValue(alert.condition) === "between"
      ? `entre ${formatNumber(alert.targetPrice)} y ${formatNumber(alert.targetPriceMax)}`
      : formatNumber(alert.targetPrice)),
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

function validateDraftPayload() {
  const alerts = state.draft.alerts.map((alert, index) => {
    const label = String(alert.label || `Alerta ${index + 1}`).trim() || `Alerta ${index + 1}`;
    const resourceId = Number(alert.resourceId);
    const quality = Number(alert.quality);
    const targetRaw = String(alert.targetPrice ?? "").trim();
    if (!Number.isFinite(resourceId) || resourceId <= 0) {
      throw new Error(`La alerta "${label}" tiene un activo inválido.`);
    }
    if (!Number.isFinite(quality) || quality < 0) {
      throw new Error(`La alerta "${label}" tiene una calidad inválida.`);
    }
    if (!targetRaw.length || !Number.isFinite(Number(targetRaw))) {
      throw new Error(`Completa el precio gatillo de "${label}".`);
    }
    if (editorConditionValue(alert.condition) === "between") {
      const targetMaxRaw = String(alert.targetPriceMax ?? "").trim();
      if (!targetMaxRaw.length || !Number.isFinite(Number(targetMaxRaw))) {
        throw new Error(`Completa el precio máximo de "${label}".`);
      }
    }
    return {
      ...alert,
      resourceId,
      quality,
      targetPrice: Number(targetRaw),
      ...(editorConditionValue(alert.condition) === "between"
        ? { targetPriceMax: Number(String(alert.targetPriceMax ?? "").trim()) }
        : {})
    };
  });

  return {
    realmId: Number(state.draft.config.realmId || 0),
    pollSeconds: Number(state.draft.config.pollSeconds || 180),
    scanEnabled: state.draft.config.scanEnabled !== false,
    channels: state.draft.channels,
    alerts
  };
}

function draftPayload() {
  return validateDraftPayload();
}

async function persistDraft(showSuccessMessage = true) {
  const dashboard = await callDesktop("saveConfig", draftPayload());
  syncDraftFromDashboard(dashboard);
  renderAll();
  if (showSuccessMessage) showToast("Cambios guardados");
}

function renderActiveView() {
  const active = viewMeta();
  ["mercado", "calculadora", "registro"].forEach((view) => {
    byId(`view-${view}`)?.classList.toggle("active", active.id === view);
    byId(`tab-${view}`)?.classList.toggle("active", active.id === view);
  });
  byId("marketToolbar").style.display = active.toolbarVisible ? "" : "none";
  byId("viewTitle").textContent = active.title;
}

function switchView(view) {
  state.activeView = ["mercado", "calculadora", "registro"].includes(view) ? view : "mercado";
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
  renderSaveButtonState();
  renderScanToggleButton();
  renderUpdateButton();
}

function renderScanToggleButton() {
  const button = byId("scanToggleButton");
  if (!button) return;
  const scanEnabled = state.dashboard?.monitor?.scanEnabled !== false;
  button.textContent = scanEnabled ? "Parar escaneo" : "Iniciar escaneo";
  button.classList.toggle("action-btn-danger", scanEnabled);
  button.classList.toggle("action-btn-success", !scanEnabled);
}

function updateButtonLabel() {
  const updates = state.updates;
  if (updates.checking) return "Buscando update";
  if (updates.downloaded) return "Instalar update";
  if (updates.downloading) return `Descargando ${Math.round(updates.progress || 0)}%`;
  if (updates.available) return updates.platform === "win32" ? "Descargar update" : "Descargar update";
  return "Buscar updates";
}

function renderUpdateButton() {
  const button = byId("checkUpdatesButton");
  if (!button) return;
  const updates = state.updates;
  const shouldHide = updates.status === "up-to-date" && !updates.available && !updates.downloading && !updates.downloaded && !updates.error;
  button.style.display = shouldHide ? "none" : "";
  if (shouldHide) return;
  button.textContent = updateButtonLabel();
  button.disabled = Boolean(updates.checking || updates.downloading);
  button.classList.toggle("action-btn-success", Boolean(updates.downloaded));
  button.classList.toggle("filter-btn-strong", Boolean(updates.available && !updates.downloaded && !updates.downloading));
}

function updateModalTitle() {
  const updates = state.updates;
  if (updates.error) return "No se pudo revisar updates";
  if (updates.downloaded) return "Update lista para instalar";
  if (updates.downloading) return "Descargando update";
  if (updates.available) return "Hay una update disponible";
  if (updates.checking) return "Buscando updates";
  return "SimMarket actualizado";
}

function updateModalBody() {
  const updates = state.updates;
  if (updates.error) return updates.error;
  if (updates.downloaded) {
    return `SimMarket ${updates.latestVersion || ""} ya está descargada y lista para instalar.`;
  }
  if (updates.downloading) {
    return `Se está descargando SimMarket ${updates.latestVersion || ""}. Cuando termine vas a poder instalarla.`;
  }
  if (updates.available) {
    if (updates.platform === "win32") {
      return `Se detectó SimMarket ${updates.latestVersion || ""} y Windows va a descargarla automáticamente.`;
    }
    return `Se detectó SimMarket ${updates.latestVersion || ""}. Si querés, abrimos la descarga oficial desde GitHub.`;
  }
  if (updates.checking) {
    return "Estamos consultando GitHub para ver si hay una versión más nueva.";
  }
  return `Ya estás en la última versión disponible (${updates.currentVersion || "actual"}).`;
}

function updatePrimaryButtonLabel() {
  const updates = state.updates;
  if (updates.error) return "Cerrar";
  if (updates.downloaded) return updates.platform === "win32" ? "Instalar ahora" : "Cerrar";
  if (updates.available) return updates.platform === "win32" ? "Descargando..." : "Descargar";
  return "Cerrar";
}

function renderUpdateModal() {
  const modal = byId("updateModal");
  const title = byId("updateModalTitle");
  const body = byId("updateModalBody");
  const meta = byId("updateModalMeta");
  const progressWrap = byId("updateProgressWrap");
  const progressFill = byId("updateProgressFill");
  const progressLabel = byId("updateProgressLabel");
  const primary = byId("updatePrimaryButton");
  const dismiss = byId("updateDismissButton");
  if (!modal || !title || !body || !meta || !primary || !dismiss) return;

  const updates = state.updates;
  const shouldShow = Boolean(updates.promptVisible);
  modal.classList.toggle("visible", shouldShow);
  if (!shouldShow) return;

  title.textContent = updateModalTitle();
  body.textContent = updateModalBody();

  const metaBits = [];
  if (updates.currentVersion) metaBits.push(`Actual ${updates.currentVersion}`);
  if (updates.latestVersion) metaBits.push(`Nueva ${updates.latestVersion}`);
  if (updates.lastCheckedAt) metaBits.push(`Revisado ${formatCompactReading(updates.lastCheckedAt)}`);
  meta.textContent = metaBits.join(" · ");

  const showProgress = Boolean(updates.downloading || updates.downloaded);
  progressWrap.classList.toggle("hidden", !showProgress);
  progressFill.style.width = `${Math.max(0, Math.min(100, Number(updates.progress || 0)))}%`;
  progressLabel.textContent = updates.downloaded ? "100%" : `${Math.round(updates.progress || 0)}%`;

  primary.textContent = updatePrimaryButtonLabel();
  primary.disabled = Boolean((updates.platform === "win32" && updates.downloading) || (!updates.downloaded && !updates.available && !updates.error));
  dismiss.textContent = updates.downloaded && updates.platform === "win32" ? "Más tarde" : "Ahora no";
}

function renderMarketHealthBanner() {
  const banner = byId("marketHealthBanner");
  if (!banner) return;
  const monitor = state.dashboard?.monitor;
  if (!monitor || monitor.marketState === "ok") {
    banner.classList.add("hidden");
    banner.innerHTML = "";
    return;
  }

  const toneClass = monitor.marketState === "rate-limited" ? "rate-limited" : "error";
  const suffix = monitor.affectedAlerts ? ` · ${monitor.affectedAlerts} alerta${monitor.affectedAlerts === 1 ? "" : "s"} afectada${monitor.affectedAlerts === 1 ? "" : "s"}` : "";
  banner.className = `market-health-banner ${toneClass}`;
  banner.innerHTML = `
    <div class="market-health-title">${escapeHtml(monitor.marketTitle || "Estado del mercado")}</div>
    <div class="market-health-copy">${escapeHtml(monitor.marketMessage || "")}${escapeHtml(suffix)}</div>
  `;
}

function renderOnboarding() {
  const modal = byId("onboardingModal");
  const title = byId("onboardingTitle");
  const body = byId("onboardingBody");
  const points = byId("onboardingPoints");
  const progress = byId("onboardingProgress");
  const back = byId("onboardingBackButton");
  const next = byId("onboardingNextButton");
  if (!modal || !title || !body || !points || !progress || !back || !next) return;

  const visible = state.onboardingVisible && !state.updates.promptVisible;
  modal.classList.toggle("visible", visible);
  if (!visible) return;

  const step = ONBOARDING_STEPS[state.onboardingStep] || ONBOARDING_STEPS[0];
  title.textContent = step.title;
  body.textContent = step.body;
  points.innerHTML = step.points.map((point) => `<div class="onboarding-point">${escapeHtml(point)}</div>`).join("");
  progress.innerHTML = ONBOARDING_STEPS.map((_item, index) => `<span class="onboarding-dot${index === state.onboardingStep ? " active" : ""}"></span>`).join("");
  back.style.visibility = state.onboardingStep === 0 ? "hidden" : "visible";
  next.textContent = step.finalAction ? "Crear primera alerta" : "Siguiente";
}

function renderSelectedRuntime() {
  const alert = selectedAlert();
  if (!alert) {
    byId("selectedRuntime").innerHTML = `<div class="empty-card">Todavía no hay alertas.</div>`;
    return;
  }
  const item = mergedAlert(alert);
  const errors = draftValidationSummary().byAlertId[alert.id] || {};
  const firstError = Object.values(errors)[0] || "";
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
      <div class="metric-box"><span>Tu objetivo</span><strong>${escapeHtml(item.targetDisplay)}</strong></div>
      <div class="metric-box"><span>Cuánto falta</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
    </div>
    <div class="summary-line"><strong>Estado:</strong> ${escapeHtml(item.statusText)}</div>
    <div class="summary-line"><strong>Lectura:</strong> ${escapeHtml(item.gapSentence)}</div>
    <div class="summary-line"><strong>Última revisión:</strong> ${escapeHtml(item.lastSeenLocal)}</div>
    ${firstError ? `<div class="summary-line summary-line-error"><strong>Revisar:</strong> ${escapeHtml(firstError)}</div>` : ""}
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

function editorConditionValue(value) {
  if (value === "<=") return "<";
  if (value === ">=") return ">";
  if (value === "between") return "between";
  if (value === "<" || value === ">") return value;
  return "<";
}

function conditionOptionMeta(condition) {
  const normalized = editorConditionValue(condition);
  if (normalized === ">") {
    return {
      value: ">",
      title: "Mayor que"
    };
  }
  if (normalized === "between") {
    return {
      value: "between",
      title: "Entre dos precios"
    };
  }
  return {
    value: "<",
    title: "Menor que"
  };
}

function conditionSelectionSummary(alert) {
  const meta = conditionOptionMeta(alert.condition);
  return {
    title: meta.title
  };
}

function conditionSelectorOptionsMarkup(alert) {
  const currentValue = editorConditionValue(alert.condition);
  const options = ["<", ">", "between"].filter((value) => value !== currentValue);
  if (!options.length) {
    return `<div class="selector-empty">No hay otras opciones disponibles.</div>`;
  }
  return options.map((value) => {
    const meta = conditionOptionMeta(value);
    return `
      <button class="selector-option" type="button" data-action="select-condition" data-condition="${escapeHtml(value)}">
        <div class="selector-option-main">
          <span>${escapeHtml(meta.title)}</span>
        </div>
      </button>
    `;
  }).join("");
}

function resetConditionSelectorState() {
  state.conditionSelectorOpen = false;
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
  const errors = draftValidationSummary().byAlertId[alert.id] || {};
  const targetMaxClass = editorConditionValue(alert.condition) === "between" ? "" : "hidden";
  const selectorSummary = resourceSelectionSummary(alert);
  const conditionSummary = conditionSelectionSummary(alert);
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
        <div class="hierarchy-selector${state.resourceSelectorOpen ? " open" : ""}${errors.resourceId ? " is-invalid" : ""}" id="editorResourceSelector">
          <button type="button" class="selector-summary" data-action="toggle-resource-selector">
            <div class="selector-summary-main">
              <div class="selector-title">${escapeHtml(selectorSummary.title)}</div>
              ${selectorSummary.subtitle ? `<div class="selector-subtitle">${escapeHtml(selectorSummary.subtitle)}</div>` : ""}
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
        ${errors.resourceId ? `<div class="input-error-copy">${escapeHtml(errors.resourceId)}</div>` : ""}
      </div>

      <div class="input-group${errors.quality ? " error" : ""}">
        <label for="editorQuality">Calidad</label>
        <input id="editorQuality" class="styled-input${errors.quality ? " is-invalid" : ""}" data-field="quality" type="number" min="0" step="1" value="${escapeHtml(alert.quality)}" />
        ${errors.quality ? `<div class="input-error-copy">${escapeHtml(errors.quality)}</div>` : ""}
      </div>

      <div class="form-row">
        <div class="input-group">
          <label>Tipo de alerta</label>
          <div class="hierarchy-selector${state.conditionSelectorOpen ? " open" : ""}" id="editorConditionSelector">
            <button type="button" class="selector-summary" data-action="toggle-condition-selector">
              <div class="selector-summary-main">
                <div class="selector-title">${escapeHtml(conditionSummary.title)}</div>
              </div>
              <div class="selector-chevron">${state.conditionSelectorOpen ? "▲" : "▼"}</div>
            </button>
            <div class="selector-panel">
              <div class="selector-list">${conditionSelectorOptionsMarkup(alert)}</div>
            </div>
          </div>
        </div>
        <div class="input-group${errors.targetPrice ? " error" : ""}">
          <label for="editorTarget">Precio gatillo</label>
          <input id="editorTarget" class="styled-input${errors.targetPrice ? " is-invalid" : ""}" data-field="targetPrice" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPrice)}" />
          ${errors.targetPrice ? `<div class="input-error-copy">${escapeHtml(errors.targetPrice)}</div>` : ""}
        </div>
      </div>

      <div id="editorTargetMaxGroup" class="input-group ${targetMaxClass}${errors.targetPriceMax ? " error" : ""}">
        <label for="editorTargetMax">Precio máximo</label>
        <input id="editorTargetMax" class="styled-input${errors.targetPriceMax ? " is-invalid" : ""}" data-field="targetPriceMax" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPriceMax)}" />
        ${errors.targetPriceMax ? `<div class="input-error-copy">${escapeHtml(errors.targetPriceMax)}</div>` : ""}
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
  const hasErrors = Boolean(Object.keys(draftValidationSummary().byAlertId[alert.id] || {}).length);
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
        <div class="metric-box"><span>Objetivo</span><strong>${escapeHtml(item.targetDisplay)}</strong></div>
        <div class="metric-box"><span>Brecha</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
      </div>
      <hr class="card-divider" />
      <div class="card-perception">${escapeHtml(item.triggerSentence)}</div>
      <div class="card-notes">${escapeHtml(item.gapSentence)}</div>
      <div class="card-tags">
        <span class="tag">${escapeHtml(item.statusText)}</span>
        <span class="tag">Última lectura ${escapeHtml(item.lastSeenCompact)}</span>
        <span class="tag">Brecha ${escapeHtml(item.gapPercentDisplay)}</span>
        ${hasErrors ? '<span class="tag tag-error">Revisar datos</span>' : ""}
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

function resetContactSelectorState({ keepOpen = false } = {}) {
  state.contactSelectorOpen = keepOpen;
  state.contactActiveGroup = null;
  state.contactResourceSearch = "";
}

function contactTrustClass(trust) {
  const match = CONTACT_TRUST_OPTIONS.find((option) => option.value === trust);
  return match ? `trust-${match.tone}` : "trust-medio";
}

function contactHierarchyGroups() {
  return resourceGroups().map((entry) => ({
    name: entry.name,
    products: uniqueList(entry.items.map((item) => item.label))
  }));
}

function contactProductsForGroup(group) {
  return contactHierarchyGroups().find((entry) => entry.name === group)?.products || [];
}

function getContactHierarchySelection() {
  const selections = Object.entries(state.contactSelectedRubros)
    .filter(([, products]) => Array.isArray(products))
    .map(([rubro, products]) => ({
      rubro,
      products: uniqueList(products)
    }));
  const rubros = selections.map((selection) => selection.rubro);
  return {
    rubro: rubros[0] || VARIOS_LABEL,
    rubros: rubros.length ? rubros : [VARIOS_LABEL],
    selections,
    products: selections.flatMap((selection) => selection.products),
    productDisplay: buildContactProductDisplay(selections)
  };
}

function contactResolvedSelections(contact) {
  if (Array.isArray(contact.selections) && contact.selections.length) {
    return contact.selections;
  }
  if (contact.resourceId !== "" && contact.resourceId !== null && contact.resourceId !== undefined) {
    const match = resourceEntry(contact.resourceId);
    if (match) {
      return [{
        rubro: match.group || VARIOS_LABEL,
        products: [match.label]
      }];
    }
  }
  return [];
}

function contactResolvedRubros(contact) {
  const selections = contactResolvedSelections(contact);
  if (selections.length) {
    return selections.map((selection) => selection.rubro);
  }
  return Array.isArray(contact.rubros) && contact.rubros.length ? contact.rubros : [contact.rubro || VARIOS_LABEL];
}

function contactResolvedProducts(contact) {
  const selections = contactResolvedSelections(contact);
  if (selections.length) {
    return selections.flatMap((selection) => selection.products);
  }
  return Array.isArray(contact.products) ? contact.products : [];
}

function contactResolvedProductDisplay(contact) {
  const selections = contactResolvedSelections(contact);
  if (selections.length) {
    return buildContactProductDisplay(selections);
  }
  if (contact.productDisplay && contact.productDisplay !== VARIOS_LABEL) {
    return contact.productDisplay;
  }
  if (contact.resourceId !== "" && contact.resourceId !== null && contact.resourceId !== undefined) {
    const match = resourceEntry(contact.resourceId);
    if (match) {
      return `${match.group} · ${match.label}`;
    }
  }
  return contact.productDisplay || contact.product || VARIOS_LABEL;
}

function resetContactHierarchySelection() {
  state.contactSelectedRubros = {};
  state.contactActiveGroup = null;
  state.contactResourceSearch = "";
  state.contactSelectorOpen = false;
}

function clearContactHierarchySelection(keepOpen = false) {
  state.contactSelectedRubros = {};
  state.contactActiveGroup = null;
  state.contactResourceSearch = "";
  state.contactSelectorOpen = keepOpen;
}

function contactSelectionTagsMarkup() {
  const selection = getContactHierarchySelection();
  if (!selection.selections.length) {
    return `<span class="selector-tag">${VARIOS_LABEL}</span>`;
  }
  return selection.selections.map((item) => {
    if (!item.products.length) {
      return `<span class="selector-tag">${escapeHtml(`${item.rubro} · ${VARIOS_LABEL}`)}</span>`;
    }
    return [
      `<span class="selector-tag">${escapeHtml(item.rubro)}</span>`,
      ...item.products.map((product) => `<span class="selector-tag">${escapeHtml(product)}</span>`)
    ].join("");
  }).join("");
}

function contactSelectionSummary() {
  const selection = getContactHierarchySelection();
  const rubroCount = selection.selections.length;
  const productCount = selection.selections.reduce((total, item) => total + item.products.length, 0);
  return {
    title: selection.productDisplay,
    subtitle: rubroCount === 0
      ? "Sin selección específica"
      : `${rubroCount} rubro${rubroCount === 1 ? "" : "s"} · ${productCount ? `${productCount} producto${productCount === 1 ? "" : "s"}` : VARIOS_LABEL}`
  };
}

function contactTypeSelectionSummary() {
  return { title: state.contactDraft.type };
}

function contactCrumbsMarkup() {
  if (!state.contactActiveGroup) {
    return `<span class="selector-tag">Rubros</span>`;
  }
  return [
    `<span class="selector-tag">Rubro</span>`,
    `<span class="selector-tag">${escapeHtml(state.contactActiveGroup)}</span>`,
    `<span class="selector-tag">Productos</span>`
  ].join("");
}

function focusContactSelectorSearch() {
  window.requestAnimationFrame(() => {
    const input = byId("contactResourceSearch");
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

function contactTypeOptionsMarkup() {
  const options = CONTACT_TYPE_OPTIONS.filter((option) => option !== state.contactDraft.type);
  if (!options.length) {
    return `<div class="selector-empty">No hay otras opciones disponibles.</div>`;
  }
  return options.map((option) => `
    <button class="selector-option" type="button" data-contact-action="select-type" data-contact-type="${escapeHtml(option)}">
      <div class="selector-option-main">
        <span>${escapeHtml(option)}</span>
      </div>
    </button>
  `).join("");
}

function contactSelectorOptionsMarkup() {
  const normalizedQuery = normalizeSearch(state.contactResourceSearch);

  if (!state.contactActiveGroup) {
    const options = [];
    if (!normalizedQuery || normalizeSearch(VARIOS_LABEL).includes(normalizedQuery)) {
      options.push({
        rubro: VARIOS_LABEL,
        helper: "General",
        active: !Object.keys(state.contactSelectedRubros).length
      });
    }

    contactHierarchyGroups().forEach((entry) => {
      const matchesByName = !normalizedQuery || normalizeSearch(entry.name).includes(normalizedQuery);
      const matchedProducts = !normalizedQuery
        ? entry.products
        : entry.products.filter((product) => normalizeSearch([entry.name, product].join(" ")).includes(normalizedQuery));
      if (!normalizedQuery || matchesByName || matchedProducts.length) {
        options.push({
          rubro: entry.name,
          helper: state.contactSelectedRubros[entry.name] ? "Seleccionado" : `${entry.products.length} productos`,
          active: Boolean(state.contactSelectedRubros[entry.name])
        });
      }
    });

    if (!options.length) {
      return `<div class="selector-empty">No hay rubros que coincidan con la búsqueda.</div>`;
    }

    return options.map((option) => `
      <button class="selector-option${option.active ? " active" : ""}" type="button" data-contact-action="open-group" data-resource-group="${escapeHtml(option.rubro)}">
        <div class="selector-option-main">
          <span>${escapeHtml(option.rubro)}</span>
        </div>
        <small>${escapeHtml(option.helper)}</small>
      </button>
    `).join("");
  }

  const activeProducts = state.contactSelectedRubros[state.contactActiveGroup] || [];
  const products = [VARIOS_LABEL, ...contactProductsForGroup(state.contactActiveGroup)]
    .filter((product) => !normalizedQuery || normalizeSearch(product).includes(normalizedQuery));

  if (!products.length) {
    return `<div class="selector-empty">No hay productos que coincidan con la búsqueda.</div>`;
  }

  return products.map((product) => {
    const active = product === VARIOS_LABEL ? activeProducts.length === 0 : activeProducts.includes(product);
    const label = product === VARIOS_LABEL ? "Todos los productos del rubro" : "Producto";
    return `
      <button class="selector-option${active ? " active" : ""}" type="button" data-contact-action="select-product" data-product-name="${escapeHtml(product)}">
        <div class="selector-option-main">
          <span>${escapeHtml(product)}</span>
        </div>
        <small>${escapeHtml(label)}</small>
      </button>
    `;
  }).join("");
}

function latestContactHistory(contact) {
  return Array.isArray(contact.history) && contact.history.length ? contact.history[0] : null;
}

function contactEditorMarkup() {
  const draft = state.contactDraft;
  const selectorSummary = contactSelectionSummary();
  const typeSummary = contactTypeSelectionSummary();
  return `
    <div class="editor-card">
      <div class="summary-top">
        ${letterAvatarMarkup(draft.name || "C", "C")}
        <div class="summary-title">
          <div class="summary-name">${escapeHtml(draft.name || "Nuevo contacto")}</div>
          <div class="summary-meta">${escapeHtml(draft.type)} · ${escapeHtml(selectorSummary.title)}</div>
        </div>
        <span class="badge ${contactTrustClass(draft.trust)}">${escapeHtml(draft.trust)}</span>
      </div>

      <div class="input-group">
        <label for="contactName">Nombre del contacto</label>
        <input id="contactName" class="styled-input" data-contact-field="name" type="text" value="${escapeHtml(draft.name)}" placeholder="Ingrese el nombre de la empresa" />
      </div>

      <div class="input-group">
        <label>Tipo de contacto</label>
        <div class="hierarchy-selector${state.contactTypeSelectorOpen ? " open" : ""}" id="contactTypeSelector">
          <button type="button" class="selector-summary" data-contact-action="toggle-type-selector">
            <div class="selector-summary-main">
              <div class="selector-title">${escapeHtml(typeSummary.title)}</div>
            </div>
            <div class="selector-chevron">${state.contactTypeSelectorOpen ? "▲" : "▼"}</div>
          </button>
          <div class="selector-panel">
            <div class="selector-list">${contactTypeOptionsMarkup()}</div>
          </div>
        </div>
      </div>

      <div class="input-group">
        <label>Producto / Rubro</label>
        <div class="hierarchy-selector${state.contactSelectorOpen ? " open" : ""}" id="contactResourceSelector">
          <button type="button" class="selector-summary" data-contact-action="toggle-selector">
            <div class="selector-summary-main">
              <div class="selector-title">${escapeHtml(selectorSummary.title)}</div>
              <div class="selector-subtitle">${escapeHtml(selectorSummary.subtitle)}</div>
            </div>
            <div class="selector-chevron">${state.contactSelectorOpen ? "▲" : "▼"}</div>
          </button>
          <div class="selector-tags">${contactSelectionTagsMarkup()}</div>
          <div class="selector-panel">
            <input id="contactResourceSearch" class="selector-search" data-contact-field="resource-search" type="text" value="${escapeHtml(state.contactResourceSearch)}" placeholder="Buscar rubro o producto..." />
            <div class="selector-crumbs">${contactCrumbsMarkup()}</div>
            <div class="selector-actions">
              <button type="button" class="selector-action-btn" data-contact-action="clear-selection">${VARIOS_LABEL}</button>
              ${state.contactActiveGroup ? '<button type="button" class="selector-action-btn" data-contact-action="back-groups">Agregar rubro</button>' : ""}
              ${state.contactActiveGroup ? '<button type="button" class="selector-action-btn" data-contact-action="remove-rubro">Quitar rubro</button>' : ""}
            </div>
            <div class="selector-list">${contactSelectorOptionsMarkup()}</div>
          </div>
        </div>
      </div>

      <div class="input-group">
        <label for="contactPerception">Percepción</label>
        <textarea id="contactPerception" class="styled-input" data-contact-field="perception" placeholder="Describa a la empresa">${escapeHtml(draft.perception)}</textarea>
      </div>

      <div class="input-group">
        <label for="contactNotes">Notas adicionales</label>
        <textarea id="contactNotes" class="styled-input" data-contact-field="notes" placeholder="Precios acordados, condiciones, detalles importantes...">${escapeHtml(draft.notes)}</textarea>
      </div>

      <div class="input-group">
        <label>Nivel de confianza</label>
        <div class="trust-options">
          ${CONTACT_TRUST_OPTIONS.map((option) => `
            <button class="trust-opt ${escapeHtml(option.tone)}${draft.trust === option.value ? " selected" : ""}" type="button" data-contact-action="select-trust" data-trust="${escapeHtml(option.value)}">${escapeHtml(option.value)}</button>
          `).join("")}
        </div>
      </div>

      <div class="editor-actions">
        <button class="save-btn" type="button" data-contact-action="save-contact">Guardar contacto</button>
      </div>
    </div>
  `;
}

function filteredContacts() {
  const query = normalizeSearch(state.contactSearch);
  return state.contacts.filter((contact) => {
    const typeMatch = state.contactTypeFilter === "todos" || contact.type === state.contactTypeFilter;
    const trustMatch = state.contactTrustFilter === "todos" || contact.trust === state.contactTrustFilter;
    const rubros = contactResolvedRubros(contact);
    const matchRubro = state.contactRubroFilter === "todos" || rubros.includes(state.contactRubroFilter);
    if (!typeMatch || !trustMatch || !matchRubro) return false;
    if (!query) return true;
    const searchable = [
      contact.name,
      contact.type,
      ...rubros,
      contactResolvedProductDisplay(contact),
      ...contactResolvedProducts(contact),
      contact.perception,
      contact.notes,
      ...(contact.history || []).map((entry) => [
        entry.summary,
        entry.note,
        ...(entry.messages || []).map((message) => message.text)
      ].join(" "))
    ].filter(Boolean).join(" ");
    return normalizeSearch(searchable).includes(query);
  });
}

function contactCardMarkup(contact) {
  const notesMarkup = contact.notes
    ? `<div class="card-notes register-card-notes"><div class="card-notes-label">Notas</div>${escapeHtml(contact.notes)}</div>`
    : "";
  const latestHistory = latestContactHistory(contact);
  const historyMarkup = latestHistory
    ? `
      <div class="history-preview">
        <div class="history-preview-head">
          <div class="history-preview-title">Última interacción</div>
          <div class="history-preview-date">${escapeHtml(latestHistory.date || "")}</div>
        </div>
        <div class="history-preview-body">${escapeHtml(latestHistory.summary || "")}</div>
      </div>
    `
    : "";
  return `
    <article class="contact-card register-contact-card" data-contact-id="${escapeHtml(contact.id)}">
      <div class="card-top">
        ${letterAvatarMarkup(contact.name, "C")}
        <div class="card-title">
          <div class="contact-name">${escapeHtml(contact.name)}</div>
          <div class="contact-meta">${escapeHtml([contact.type, contactResolvedProductDisplay(contact)].join(" · "))}</div>
        </div>
        <span class="badge ${contactTrustClass(contact.trust)}">${escapeHtml(contact.trust)}</span>
      </div>
      <hr class="card-divider" />
      <div class="card-perception">${escapeHtml(contact.perception || "Sin observaciones cargadas todavía.")}</div>
      ${notesMarkup}
      ${historyMarkup}
      <div class="card-footer">
        <span class="card-date">Registrado: ${escapeHtml(contact.date || formatContactDate(contact.createdAt))}</span>
        <div class="card-actions">
          <button class="manage-btn" type="button" data-contact-action="open-history" data-contact-id="${escapeHtml(contact.id)}">Historial${contact.history?.length ? ` (${contact.history.length})` : ""}</button>
          <button class="delete-btn" type="button" data-contact-action="delete-contact" data-contact-id="${escapeHtml(contact.id)}">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

function renderContactTypeFilters() {
  const container = byId("contactTypeFilters");
  if (!container) return;
  container.innerHTML = CONTACT_TYPE_FILTER_OPTIONS.map((option) => `
    <button class="filter-btn${state.contactTypeFilter === option.value ? " active" : ""}" data-contact-filter-group="type" data-contact-filter="${escapeHtml(option.value)}" type="button">${escapeHtml(option.label)}</button>
  `).join("");
}

function renderContactTrustFilters() {
  const container = byId("contactTrustFilters");
  if (!container) return;
  container.innerHTML = CONTACT_TRUST_FILTER_OPTIONS.map((option) => `
    <button class="filter-btn${state.contactTrustFilter === option.value ? " active" : ""}" data-contact-filter-group="trust" data-contact-filter="${escapeHtml(option.value)}" type="button">${escapeHtml(option.label)}</button>
  `).join("");
}

function renderContactRubroFilters() {
  const container = byId("contactRubroFilters");
  if (!container) return;
  const options = ["todos", ...contactHierarchyGroups().map((entry) => entry.name), VARIOS_LABEL];
  const uniqueOptions = uniqueList(options);
  container.innerHTML = uniqueOptions.map((option) => {
    const label = option === "todos" ? "Todos los rubros" : option;
    return `<button class="filter-btn${state.contactRubroFilter === option ? " active" : ""}" data-contact-filter-group="rubro" data-contact-filter="${escapeHtml(option)}" type="button">${escapeHtml(label)}</button>`;
  }).join("");
}

function renderContactFilters() {
  renderContactTypeFilters();
  renderContactTrustFilters();
  renderContactRubroFilters();
}

function renderContactStats() {
  const container = byId("contactStats");
  const countLabel = byId("contactCountLabel");
  if (!container) return;
  const total = state.contacts.length;
  const providers = state.contacts.filter((contact) => contact.type === "Proveedor").length;
  const trustHigh = state.contacts.filter((contact) => contact.trust === "Alto").length;
  if (countLabel) {
    countLabel.textContent = `${total} registro${total === 1 ? "" : "s"}`;
  }
  container.innerHTML = `
    <div class="stat-pill">Total <span>${total}</span></div>
    <div class="stat-pill">Proveedores <span>${providers}</span></div>
    <div class="stat-pill">Confianza alta <span>${trustHigh}</span></div>
  `;
}

function renderContactEditor() {
  const container = byId("contactEditorContainer");
  if (!container) return;
  container.innerHTML = contactEditorMarkup();
}

function renderContactList() {
  const container = byId("contactsRegisterList");
  const countInfo = byId("contactCountInfo");
  if (!container || !countInfo) return;
  const filtered = filteredContacts();

  if (!state.contacts.length) {
    countInfo.textContent = "";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◈</div>
        <div class="empty-text">Aún no hay contactos registrados.</div>
      </div>
    `;
    return;
  }

  if (!filtered.length) {
    countInfo.textContent = "0 resultados";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◈</div>
        <div class="empty-text">No se encontraron contactos<br>con los filtros actuales.</div>
      </div>
    `;
    return;
  }

  countInfo.textContent = filtered.length < state.contacts.length ? `${filtered.length} de ${state.contacts.length} contactos` : "";
  container.innerHTML = filtered.map(contactCardMarkup).join("");
}

function findContactById(contactId) {
  return state.contacts.find((contact) => contact.id === contactId) || null;
}

function renderHistoryList() {
  const list = byId("historyList");
  const contact = state.currentHistoryContactId ? findContactById(state.currentHistoryContactId) : null;
  if (!list) return;
  if (!contact) {
    list.innerHTML = "";
    return;
  }
  if (!contact.history?.length) {
    list.innerHTML = `<div class="selector-empty">Todavía no hay interacciones cargadas para este contacto.</div>`;
    return;
  }

  list.innerHTML = contact.history.map((entry) => {
    const chatMarkup = entry.messages?.length
      ? `
        <div class="history-chat">
          ${entry.messages.map((message) => `
            <div class="chat-message ${message.speaker}">
              ${escapeHtml(message.text)}
              ${message.time ? `<span class="chat-meta">${escapeHtml(message.speaker === "me" ? "Tu mensaje · " : "Mensaje recibido · ")}${escapeHtml(message.time)}</span>` : ""}
            </div>
          `).join("")}
        </div>
      `
      : "";
    return `
      <div class="history-item">
        <div class="history-item-head">
          <div class="history-item-title">${escapeHtml(entry.summary)}</div>
          <div class="history-item-date">${escapeHtml(entry.date)}</div>
        </div>
        ${entry.note ? `<div class="history-item-body">${escapeHtml(entry.note)}</div>` : ""}
        ${chatMarkup}
        <div class="history-item-meta">
          <span class="history-tag">${entry.messages?.length ? `${entry.messages.length} mensaje${entry.messages.length === 1 ? "" : "s"}` : "Nota manual"}</span>
          <button class="history-delete" type="button" data-contact-action="delete-history-entry" data-history-id="${escapeHtml(entry.id)}">Eliminar</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderHistoryModal() {
  const modal = byId("historyModal");
  const title = byId("historyModalTitle");
  const subtitle = byId("historyModalSubtitle");
  if (!modal || !title || !subtitle) return;
  const contact = state.currentHistoryContactId ? findContactById(state.currentHistoryContactId) : null;
  modal.classList.toggle("visible", Boolean(contact));
  if (!contact) return;
  title.textContent = `Historial de ${contact.name}`;
  subtitle.textContent = "Agregá nuevas interacciones sin tocar la ficha base del contacto. Podés pegar conversaciones completas y se convierten en burbujas legibles.";
  renderHistoryList();
}

function clearHistoryForm() {
  const dateInput = byId("historyDateInput");
  const noteInput = byId("historyNoteInput");
  const conversationInput = byId("historyConversationInput");
  if (dateInput) dateInput.value = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  if (noteInput) noteInput.value = "";
  if (conversationInput) conversationInput.value = "";
}

function openHistoryModal(contactId) {
  state.currentHistoryContactId = contactId;
  clearHistoryForm();
  renderHistoryModal();
}

function closeHistoryModal() {
  state.currentHistoryContactId = null;
  renderHistoryModal();
}

function buildHistorySummary(messages, note) {
  if (messages?.length) {
    const firstMessage = messages.find((message) => message.speaker === "contact") || messages[0];
    return `${firstMessage.text.slice(0, 92)}${firstMessage.text.length > 92 ? "…" : ""}`;
  }
  if (note) {
    return `${note.slice(0, 92)}${note.length > 92 ? "…" : ""}`;
  }
  return "";
}

function extractChatTimestamp(line) {
  const normalized = String(line || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/días/gi, "dias");

  const simpleMatch = normalized.match(/^(just now|today|yesterday|ayer)$/i);
  if (simpleMatch) return simpleMatch[1];

  const englishMatch = normalized.match(/((?:about\s+)?(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago)$/i);
  if (englishMatch) {
    const value = Number(englishMatch[2]);
    const unit = englishMatch[3].toLowerCase();
    if (unit.startsWith("year") && value > 5) return null;
    return englishMatch[1];
  }

  const spanishMatch = normalized.match(/((?:hace\s+)(?:unos?\s+)?((?:\d+)|un|una)\s+(minuto|minutos|hora|horas|dia|dias|semana|semanas|mes|meses|año|años))$/i);
  if (spanishMatch) {
    const rawValue = spanishMatch[2].toLowerCase();
    const value = rawValue === "un" || rawValue === "una" ? 1 : Number(rawValue);
    const unit = spanishMatch[3].toLowerCase();
    if ((unit === "año" || unit === "años") && value > 5) return null;
    return spanishMatch[1];
  }

  return null;
}

function parseChatHeader(line) {
  const normalizedLine = String(line || "").trim().replace(/\s+/g, " ");
  const time = extractChatTimestamp(normalizedLine);
  if (!time) return null;
  const prefix = normalizedLine.slice(0, normalizedLine.length - time.length).trim();
  return { speaker: prefix ? "contact" : "me", time };
}

function parseConversationText(text) {
  const normalized = String(text || "").replace(/\r/g, "").trim();
  if (!normalized) return [];
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const messages = [];
  let index = 0;

  while (index < lines.length) {
    const header = parseChatHeader(lines[index]);
    if (!header) {
      index += 1;
      continue;
    }

    index += 1;
    const content = [];
    while (index < lines.length && !parseChatHeader(lines[index])) {
      content.push(lines[index]);
      index += 1;
    }

    if (content.length) {
      messages.push({
        speaker: header.speaker,
        time: header.time,
        text: content.join("\n")
      });
    }
  }

  return messages;
}

function saveHistoryEntry() {
  const contact = state.currentHistoryContactId ? findContactById(state.currentHistoryContactId) : null;
  if (!contact) return;

  const date = String(byId("historyDateInput")?.value || "").trim()
    || new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  const note = String(byId("historyNoteInput")?.value || "").trim();
  const conversationText = String(byId("historyConversationInput")?.value || "").trim();
  const parsedMessages = conversationText ? parseConversationText(conversationText) : [];
  const summary = buildHistorySummary(parsedMessages, note);

  if (!summary && !note && !parsedMessages.length) {
    showToast("Cargá un resumen, una nota o pegá una conversación antes de guardar", "error");
    return;
  }

  contact.history = contact.history || [];
  contact.history.unshift({
    id: `history-${Date.now()}`,
    date,
    summary: summary || "Interacción guardada",
    note,
    messages: parsedMessages
  });

  persistContacts();
  renderContactList();
  renderHistoryList();
  clearHistoryForm();
  showToast("Interacción guardada");
}

function deleteHistoryEntry(entryId) {
  const contact = state.currentHistoryContactId ? findContactById(state.currentHistoryContactId) : null;
  if (!contact) return;
  contact.history = (contact.history || []).filter((entry) => entry.id !== entryId);
  persistContacts();
  renderContactList();
  renderHistoryList();
  showToast("Interacción eliminada");
}

function renderContactView() {
  renderContactStats();
  renderContactEditor();
  renderContactFilters();
  renderContactList();
  renderHistoryModal();
}

function saveContact() {
  const draft = {
    ...state.contactDraft,
    name: state.contactDraft.name.trim(),
    perception: state.contactDraft.perception.trim(),
    notes: state.contactDraft.notes.trim()
  };
  if (!draft.name || !draft.perception) {
    showToast("Completá el nombre y la percepción antes de guardar", "error");
    return;
  }

  const hierarchySelection = getContactHierarchySelection();
  state.contacts.unshift(normalizeContactRecord({
    ...draft,
    ...hierarchySelection,
    history: [],
    date: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
  }));
  persistContacts();
  state.contactDraft = emptyContactDraft();
  state.contactTypeSelectorOpen = false;
  clearContactHierarchySelection(false);
  renderContactView();
  showToast("Contacto guardado");
}

function deleteContact(contactId) {
  state.contacts = state.contacts.filter((contact) => contact.id !== contactId);
  if (state.currentHistoryContactId === contactId) {
    state.currentHistoryContactId = null;
  }
  persistContacts();
  renderContactView();
  showToast("Contacto eliminado");
}

function handleContactMutation(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionTarget = target.closest("[data-contact-action]");
  if (actionTarget?.dataset.contactAction === "toggle-selector") {
    event.preventDefault();
    event.stopPropagation();
    state.contactSelectorOpen = !state.contactSelectorOpen;
    state.contactTypeSelectorOpen = false;
    renderContactEditor();
    if (state.contactSelectorOpen) {
      focusContactSelectorSearch();
    } else {
      resetContactSelectorState();
      renderContactEditor();
    }
    return;
  }

  if (actionTarget?.dataset.contactAction === "toggle-type-selector") {
    event.preventDefault();
    event.stopPropagation();
    state.contactTypeSelectorOpen = !state.contactTypeSelectorOpen;
    state.contactSelectorOpen = false;
    renderContactEditor();
    return;
  }

  if (actionTarget?.dataset.contactAction === "select-type") {
    event.preventDefault();
    event.stopPropagation();
    state.contactDraft.type = actionTarget.dataset.contactType || "Proveedor";
    state.contactTypeSelectorOpen = false;
    renderContactEditor();
    return;
  }

  if (actionTarget?.dataset.contactAction === "clear-selection") {
    event.preventDefault();
    event.stopPropagation();
    clearContactHierarchySelection(true);
    renderContactEditor();
    focusContactSelectorSearch();
    return;
  }

  if (actionTarget?.dataset.contactAction === "back-groups") {
    event.preventDefault();
    event.stopPropagation();
    state.contactActiveGroup = null;
    state.contactResourceSearch = "";
    renderContactEditor();
    focusContactSelectorSearch();
    return;
  }

  if (actionTarget?.dataset.contactAction === "remove-rubro") {
    event.preventDefault();
    event.stopPropagation();
    if (state.contactActiveGroup) {
      delete state.contactSelectedRubros[state.contactActiveGroup];
      state.contactActiveGroup = null;
      state.contactResourceSearch = "";
      renderContactEditor();
    }
    return;
  }

  if (actionTarget?.dataset.contactAction === "open-group") {
    event.preventDefault();
    event.stopPropagation();
    const nextGroup = actionTarget.dataset.resourceGroup || null;
    if (nextGroup === VARIOS_LABEL) {
      clearContactHierarchySelection(false);
      renderContactEditor();
      return;
    }
    if (!state.contactSelectedRubros[nextGroup]) {
      state.contactSelectedRubros[nextGroup] = [];
    }
    state.contactActiveGroup = nextGroup;
    state.contactResourceSearch = "";
    renderContactEditor();
    focusContactSelectorSearch();
    return;
  }

  if (actionTarget?.dataset.contactAction === "select-product") {
    event.preventDefault();
    event.stopPropagation();
    const product = actionTarget.dataset.productName || "";
    const group = state.contactActiveGroup;
    if (!group) return;
    const currentProducts = state.contactSelectedRubros[group] || [];
    if (product === VARIOS_LABEL) {
      state.contactSelectedRubros[group] = [];
    } else if (currentProducts.includes(product)) {
      state.contactSelectedRubros[group] = currentProducts.filter((item) => item !== product);
    } else {
      state.contactSelectedRubros[group] = [...currentProducts, product];
    }
    renderContactEditor();
    focusContactSelectorSearch();
    return;
  }

  if (actionTarget?.dataset.contactAction === "select-trust") {
    event.preventDefault();
    event.stopPropagation();
    state.contactDraft.trust = actionTarget.dataset.trust || "Medio";
    renderContactEditor();
    return;
  }

  if (actionTarget?.dataset.contactAction === "save-contact") {
    event.preventDefault();
    saveContact();
    return;
  }

  if (actionTarget?.dataset.contactAction === "delete-contact") {
    event.preventDefault();
    const contactId = actionTarget.dataset.contactId;
    if (contactId) {
      deleteContact(contactId);
    }
    return;
  }

  if (actionTarget?.dataset.contactAction === "open-history") {
    event.preventDefault();
    const contactId = actionTarget.dataset.contactId;
    if (contactId) {
      openHistoryModal(contactId);
    }
    return;
  }

  if (actionTarget?.dataset.contactAction === "close-history-modal") {
    event.preventDefault();
    closeHistoryModal();
    return;
  }

  if (actionTarget?.dataset.contactAction === "clear-history-form") {
    event.preventDefault();
    clearHistoryForm();
    return;
  }

  if (actionTarget?.dataset.contactAction === "save-history-entry") {
    event.preventDefault();
    saveHistoryEntry();
    return;
  }

  if (actionTarget?.dataset.contactAction === "delete-history-entry") {
    event.preventDefault();
    const historyId = actionTarget.dataset.historyId;
    if (historyId) {
      deleteHistoryEntry(historyId);
    }
    return;
  }

  if (event.type === "click") {
    return;
  }

  const field = target.dataset.contactField;
  if (!field) return;
  if (field === "resource-search") {
    state.contactResourceSearch = target.value;
    renderContactEditor();
    focusContactSelectorSearch();
    return;
  }
  state.contactDraft[field] = target.value;
}

function renderAll() {
  ensureSelectedAlert();
  renderActiveView();
  renderThemeToggle();
  renderHeader();
  renderUpdateModal();
  renderMarketHealthBanner();
  renderSelectedRuntime();
  renderEditor();
  renderChannels();
  renderFilterButtons();
  renderAlertList();
  renderEvents();
  syncCalculatorInputs();
  recalculateCalculator();
  renderContactView();
  renderOnboarding();
}

function currentAlertIndex() {
  return state.draft.alerts.findIndex((item) => item.id === state.selectedAlertId);
}

function updateEditorDecoration() {
  const alert = selectedAlert();
  if (!alert) return;
  const maxGroup = byId("editorTargetMaxGroup");
  if (maxGroup) {
    maxGroup.classList.toggle("hidden", editorConditionValue(alert.condition) !== "between");
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
    state.conditionSelectorOpen = false;
    renderEditor();
    if (state.resourceSelectorOpen) {
      focusResourceSearch();
    } else {
      resetResourceSelectorState();
      renderEditor();
    }
    return;
  }

  if (actionTarget?.dataset.action === "toggle-condition-selector") {
    event.preventDefault();
    event.stopPropagation();
    state.conditionSelectorOpen = !state.conditionSelectorOpen;
    state.resourceSelectorOpen = false;
    renderEditor();
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
    resetConditionSelectorState();
    setDirty(true);
    renderSelectedRuntime();
    renderEditor();
    renderAlertList();
    return;
  }

  if (actionTarget?.dataset.action === "select-condition") {
    event.preventDefault();
    event.stopPropagation();
    alert.condition = actionTarget.dataset.condition || "<";
    resetConditionSelectorState();
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
    showToast(error.message, "error");
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
    showToast(error.message, "error");
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
    showToast(error.message, "error");
  }
}

async function checkForUpdates(manual = false) {
  try {
    const nextState = await callDesktop("checkForUpdates");
    state.updates = {
      ...state.updates,
      ...(nextState || {})
    };
    renderHeader();
    renderUpdateModal();
    if (manual && state.updates.status === "up-to-date") {
      showToast("Ya tenés la última versión");
    }
    if (manual && state.updates.status === "error") {
      showToast(state.updates.error || "No se pudo revisar updates", "error");
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function runUpdatePrimaryAction() {
  try {
    const nextState = await callDesktop("runUpdatePrimaryAction");
    state.updates = {
      ...state.updates,
      ...(nextState || {})
    };
    renderHeader();
    renderUpdateModal();
    if (state.updates.platform === "darwin" && state.updates.downloadUrl) {
      showToast("Descarga abierta en GitHub");
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function dismissUpdatePrompt() {
  try {
    const nextState = await callDesktop("dismissUpdatePrompt");
    state.updates = {
      ...state.updates,
      ...(nextState || {})
    };
    renderUpdateModal();
  } catch (error) {
    showToast(error.message, "error");
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
    condition: "<",
    targetPrice: 0.37,
    targetPriceMax: "",
    enabled: true,
    repeatWhileMatched: true,
    notificationKindOverride: ""
  });
  state.selectedAlertId = state.draft.alerts[0].id;
  resetResourceSelectorState();
  resetConditionSelectorState();
  setDirty(true);
  renderAll();
}

function removeSelectedAlert() {
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
    if (!state.dirty) {
      syncDraftFromDashboard(dashboard);
      renderAll();
    } else {
      state.dashboard = dashboard;
      state.updates = {
        ...state.updates,
        ...(dashboard.updates || {})
      };
      state.draft.config.scanEnabled = dashboard.config?.scanEnabled !== false;
      renderHeader();
      renderUpdateModal();
      renderMarketHealthBanner();
      renderOnboarding();
      renderSelectedRuntime();
      renderAlertList();
      renderEvents();
    }
    const nextWarningSignature = warningSignature(dashboard.warnings);
    if (dashboard.warnings?.length && nextWarningSignature !== state.warningSignature) {
      state.warningSignature = nextWarningSignature;
      showToast(
        dashboard.warnings.length === 1
          ? "Se omitió 1 alerta guardada porque tenía datos inválidos."
          : `Se omitieron ${dashboard.warnings.length} alertas guardadas porque tenían datos inválidos.`,
        "error"
      );
      return;
    }
    if (!dashboard.warnings?.length) {
      state.warningSignature = "";
    }
    if (!quiet) showToast("Panel actualizado");
  } catch (error) {
    showToast(error.message, "error");
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
  window.simcoDesktop?.onAlertTriggered?.((payload) => {
    showLiveAlert(payload);
  });
  window.simcoDesktop?.onUpdateState?.((payload) => {
    state.updates = {
      ...state.updates,
      ...(payload || {})
    };
    renderHeader();
    renderUpdateModal();
    renderOnboarding();
  });
  byId("themeToggleButton").addEventListener("click", () => {
    applyTheme(state.theme === "light" ? "dark" : "light");
  });
  byId("tab-mercado").addEventListener("click", () => switchView("mercado"));
  byId("tab-calculadora").addEventListener("click", () => switchView("calculadora"));
  byId("tab-registro").addEventListener("click", () => switchView("registro"));
  byId("scanNowButton").addEventListener("click", scanNow);
  byId("checkUpdatesButton").addEventListener("click", () => checkForUpdates(true));
  byId("scanToggleButton").addEventListener("click", toggleScanEnabled);
  byId("saveButton").addEventListener("click", saveConfig);
  byId("resetButton").addEventListener("click", discardDraft);
  byId("addAlertButton").addEventListener("click", addAlert);
  byId("updatePrimaryButton").addEventListener("click", runUpdatePrimaryAction);
  byId("updateDismissButton").addEventListener("click", dismissUpdatePrompt);
  byId("onboardingSkipButton").addEventListener("click", () => {
    completeOnboarding();
    renderOnboarding();
  });
  byId("onboardingBackButton").addEventListener("click", () => {
    state.onboardingStep = Math.max(0, state.onboardingStep - 1);
    renderOnboarding();
  });
  byId("onboardingNextButton").addEventListener("click", () => {
    const step = ONBOARDING_STEPS[state.onboardingStep];
    if (step?.finalAction) {
      completeOnboarding();
      switchView("mercado");
      if (!state.draft.alerts.length) {
        addAlert();
      } else {
        renderOnboarding();
      }
      return;
    }
    state.onboardingStep = Math.min(ONBOARDING_STEPS.length - 1, state.onboardingStep + 1);
    renderOnboarding();
  });
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
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const resourceSelector = byId("editorResourceSelector");
    const conditionSelector = byId("editorConditionSelector");
    const contactSelector = byId("contactResourceSelector");
    const contactTypeSelector = byId("contactTypeSelector");
    let shouldRender = false;
    if (state.resourceSelectorOpen && resourceSelector && !resourceSelector.contains(target)) {
      resetResourceSelectorState();
      shouldRender = true;
    }
    if (state.conditionSelectorOpen && conditionSelector && !conditionSelector.contains(target)) {
      resetConditionSelectorState();
      shouldRender = true;
    }
    if (state.contactSelectorOpen && contactSelector && !contactSelector.contains(target)) {
      resetContactSelectorState();
      shouldRender = true;
    }
    if (state.contactTypeSelectorOpen && contactTypeSelector && !contactTypeSelector.contains(target)) {
      state.contactTypeSelectorOpen = false;
      shouldRender = true;
    }
    if (shouldRender) {
      renderEditor();
      renderContactEditor();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    let shouldRender = false;
    if (state.resourceSelectorOpen) {
      resetResourceSelectorState();
      shouldRender = true;
    }
    if (state.conditionSelectorOpen) {
      resetConditionSelectorState();
      shouldRender = true;
    }
    if (state.contactSelectorOpen) {
      resetContactSelectorState();
      shouldRender = true;
    }
    if (state.contactTypeSelectorOpen) {
      state.contactTypeSelectorOpen = false;
      shouldRender = true;
    }
    if (state.currentHistoryContactId) {
      closeHistoryModal();
    }
    if (shouldRender) {
      renderEditor();
      renderContactEditor();
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

  byId("contactSearchInput").addEventListener("input", (event) => {
    state.contactSearch = event.target.value;
    renderContactList();
  });

  ["contactTypeFilters", "contactTrustFilters", "contactRubroFilters"].forEach((id) => {
    byId(id).addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("[data-contact-filter]");
      if (!(button instanceof HTMLElement)) return;
      const value = button.dataset.contactFilter || "todos";
      const group = button.dataset.contactFilterGroup || "type";
      if (group === "type") state.contactTypeFilter = value;
      if (group === "trust") state.contactTrustFilter = value;
      if (group === "rubro") state.contactRubroFilter = value;
      renderContactFilters();
      renderContactList();
    });
  });

  byId("contactEditorContainer").addEventListener("input", handleContactMutation);
  byId("contactEditorContainer").addEventListener("change", handleContactMutation);
  byId("contactEditorContainer").addEventListener("click", handleContactMutation);
  byId("contactsRegisterList").addEventListener("click", handleContactMutation);
  byId("historyModal").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "historyModal") {
      closeHistoryModal();
      return;
    }
    handleContactMutation(event);
  });
  byId("updateModal").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "updateModal") {
      dismissUpdatePrompt();
    }
  });
  byId("onboardingModal").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "onboardingModal") {
      completeOnboarding();
      renderOnboarding();
    }
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
  document.body.dataset.platform = state.platform;
  applyTheme(state.theme);
  bindStaticUi();
  try {
    const updateState = await callDesktop("getUpdateState");
    state.updates = {
      ...state.updates,
      ...(updateState || {})
    };
  } catch (error) {
    // The desktop API is optional during development previews.
  }
  renderActiveView();
  syncCalculatorInputs();
  recalculateCalculator();
  const dashboardPromise = loadDashboard({ quiet: true });
  await Promise.all([dashboardPromise, runSplashScreen()]);
  await runVitoIntro();
  if (shouldShowOnboarding()) {
    openOnboarding();
    renderOnboarding();
  }
  startAutoRefresh();
}

window.addEventListener("DOMContentLoaded", boot);
