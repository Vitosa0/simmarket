const VIEW_STORAGE_KEY = "simco-desktop-view";
const CALC_STORAGE_KEY = "simco-desktop-calculator";
const THEME_STORAGE_KEY = "simco-desktop-theme";
const LANGUAGE_STORAGE_KEY = "simco-desktop-language";
const CONTACTS_STORAGE_KEY = "simco-desktop-contacts";
const EXECUTIVE_STORAGE_KEY = "simco-desktop-executive-intel";
const CONTACT_IMPORT_BATCHES_STORAGE_KEY = "simco-desktop-contact-import-batches";
const ACTIVE_REALM_STORAGE_KEY = "simco-desktop-active-realm";
const REALM_LOCAL_MIGRATION_STORAGE_KEY = "simco-desktop-realm-local-migration-v1";
const ONBOARDING_STORAGE_KEY = "simco-desktop-onboarding-completed";
const NOTIFICATIONS_SEEN_STORAGE_KEY = "simco-desktop-last-seen-event";
const PORTFOLIO_VIEW_MODE_STORAGE_KEY = "simco-desktop-portfolio-view-mode";
const PORTFOLIO_CHART_RANGE_STORAGE_KEY = "simco-desktop-portfolio-chart-range";
const CONTACTS_PER_PAGE = 4;
const ALERTS_PER_PAGE = 5;
const PORTFOLIO_GROUPS_PER_PAGE = 8;
const PORTFOLIO_FEE_RATE = 0.04;
const PORTFOLIO_CHART_RANGE_OPTIONS = [7, 14, 30];
const CALC_TARGET_PCTS = [2, 5, 10, 15, 20, 25, 30, 50];
const CALC_TRANSPORT_UNIT_OPTIONS = ["0", "0.1", "0.2", "0.5", "1", "2", "5", "10", "1000"];
const PORTFOLIO_IMPORT_QUALITY_OPTIONS = Array.from({ length: 13 }, (_item, index) => index);
const VARIOS_LABEL = "Varios";
const VARIOS_LABEL_EN = "Miscellaneous";
const REALM_OPTIONS = [
  {
    id: 0,
    key: "magnates",
    labelEs: "Magnates",
    labelEn: "Magnates",
    icon: "../assets/realms/magnates.png"
  },
  {
    id: 1,
    key: "entrepreneurs",
    labelEs: "Emprendedores",
    labelEn: "Entrepreneurs",
    icon: "../assets/realms/entrepreneurs.png"
  }
];

function storedActiveRealmId() {
  return normalizeRealmId(localStorage.getItem(ACTIVE_REALM_STORAGE_KEY));
}

function realmScopedStorageKey(baseKey, realmId = storedActiveRealmId()) {
  return `${baseKey}:realm:${normalizeRealmId(realmId)}`;
}

function realmContactsStorageKey(realmId = storedActiveRealmId()) {
  return realmScopedStorageKey(CONTACTS_STORAGE_KEY, realmId);
}

function realmCalculatorStorageKey(realmId = storedActiveRealmId()) {
  return realmScopedStorageKey(CALC_STORAGE_KEY, realmId);
}

function realmContactImportBatchesStorageKey(realmId = storedActiveRealmId()) {
  return realmScopedStorageKey(CONTACT_IMPORT_BATCHES_STORAGE_KEY, realmId);
}

function storageKeyExists(key) {
  return localStorage.getItem(key) !== null;
}

const CONTACT_TYPE_OPTIONS = ["Proveedor", "Cliente", "Desconocido", "Social", "Socio"];
const CONTACT_TRUST_OPTIONS = [
  { value: "Alto", tone: "alto" },
  { value: "Medio", tone: "medio" },
  { value: "Bajo", tone: "bajo" },
  { value: "Neutro", tone: "neutro" }
];
const EXECUTIVE_ROLE_META = {
  mgmt: { labelEs: "Operaciones", labelEn: "Operations", short: "COO", accent: "gold" },
  acct: { labelEs: "Finanzas", labelEn: "Finance", short: "CFO", accent: "emerald" },
  comm: { labelEs: "Comercial", labelEn: "Commercial", short: "CMO", accent: "blue" },
  tech: { labelEs: "Tecnología", labelEn: "Technology", short: "CTO", accent: "crimson" }
};
const EXECUTIVE_BAND_META = {
  elite: { labelEs: "Calibre élite", labelEn: "Elite caliber", copyEs: "Patrón muy fuerte en la base observada.", copyEn: "Very strong pattern in the observed base." },
  alto: { labelEs: "Alta señal", labelEn: "High signal", copyEs: "Perfil consistente para decisiones exigentes.", copyEn: "Consistent profile for demanding decisions." },
  solido: { labelEs: "Base sólida", labelEn: "Solid base", copyEs: "Señal estable y aprovechable.", copyEn: "Stable signal with practical value." },
  desarrollo: { labelEs: "Potencial en desarrollo", labelEn: "Developing potential", copyEs: "Puede servir con una lectura más cuidadosa.", copyEn: "Useful with a more careful read." },
  riesgoso: { labelEs: "Lectura incierta", labelEn: "Uncertain read", copyEs: "Conviene validar antes de mover fichas.", copyEn: "Best validated before making a move." }
};
const EXECUTIVE_CONFIDENCE_META = {
  exacta: { labelEs: "Coincidencia exacta", labelEn: "Exact match", min: 0.96 },
  muyAlta: { labelEs: "Coincidencia muy alta", labelEn: "Very high match", min: 0.8 },
  alta: { labelEs: "Coincidencia alta", labelEn: "High match", min: 0.64 },
  media: { labelEs: "Coincidencia útil", labelEn: "Useful match", min: 0.44 },
  baja: { labelEs: "Coincidencia exploratoria", labelEn: "Exploratory match", min: 0 }
};
const GROUP_TRANSLATIONS = {
  Agricultura: { en: "Agriculture" },
  Alimento: { en: "Food" },
  "Construcción": { en: "Construction" },
  Moda: { en: "Fashion" },
  "Energía": { en: "Energy" },
  "Electrónica": { en: "Electronics" },
  Automotor: { en: "Automotive" },
  Aeroespacial: { en: "Aerospace" },
  Recursos: { en: "Resources" },
  "Investigación": { en: "Research" },
  Estacional: { en: "Seasonal" },
  Varios: { en: "Miscellaneous" }
};
const I18N = {
  es: {
    tabMercado: "Mercado",
    tabCalculadora: "Calculadora",
    tabCartera: "Cartera",
    tabEjecutivos: "Ejecutivos",
    tabRegistro: "Registro",
    toggleThemeLight: "Activar modo claro",
    toggleThemeDark: "Activar modo oscuro",
    languageButton: "EN",
    statsMonitor: "Monitor",
    statsAlerts: "Alertas",
    statsInZone: "En zona",
    statsLastReview: "Última revisión",
    noData: "Sin datos",
    scanMarket: "Escanear mercado",
    checkUpdates: "Buscar actualizaciones",
    saveChanges: "Guardar cambios",
    savePendingChanges: "Guardar cambios pendientes",
    discard: "Descartar",
    startScan: "Iniciar escaneo",
    stopScan: "Parar escaneo",
    viewMercadoTitle: "ALERTAS DE MERCADO",
    viewCalculadoraTitle: "CALCULADORA DE COSTOS",
    viewCarteraTitle: "CARTERA DE INVENTARIO",
    viewEjecutivosTitle: "RADAR DE EJECUTIVOS",
    viewRegistroTitle: "REGISTRO DE CONTACTOS",
    sectionCurrentReading: "Lectura actual",
    sectionEditAlert: "Editar alerta",
    sectionChannels: "Canales de aviso",
    sectionThanks: "Agradecimientos",
    thanksTitle: "Gracias por la inspiración y las referencias.",
    thanksCopy: "Muchos conceptos de esta app nacieron mirando el trabajo de estas dos páginas.",
    openSite: "Abrir sitio",
    sectionWatchedMarket: "Mercado vigilado",
    searchNameOrAsset: "Buscar por nombre o activo",
    filterAll: "Todas",
    filterBuy: "Compra",
    filterSell: "Venta",
    filterMatch: "En zona",
    filterDisabled: "Pausadas",
    newAlert: "Nueva alerta",
    sectionPurchaseParams: "Parámetros de compra",
    newCalculation: "Nuevo cálculo",
    labelProduct: "Producto",
    optionalAutofill: "opcional, autorrellena transporte",
    noProductSelected: "Sin producto seleccionado",
    productAutofillCopy: "Usalo para traer las unidades de transporte del activo.",
    searchGroupOrAsset: "Buscar rubro o activo",
    searchAssetByNameId: "Buscar activo por nombre o ID",
    labelCostPerUnit: "Costo por unidad",
    labelQuantity: "Cantidad",
    unitsLabel: "unidades",
    labelTransportPrice: "Transporte",
    transportUnitPrice: "precio unitario",
    labelUnitsPerUnit: "Unidades/u",
    sectionPriceCheck: "Verificador de precio",
    labelSellCheck: "Precio al que pensás vender",
    perUnit: "por unidad",
    deleteCalculation: "Eliminar cálculo",
    calcPage: "Cálculo {current} de {total}",
    calcEmpty: "Ingresá el precio de compra<br />para ver los cálculos",
    breakEvenTitle: "Precio mínimo de venta (breakeven)",
    baseCost: "Costo base",
    sellFee: "Fee 4%",
    freightPerUnit: "Transporte/u",
    totalInvestment: "Inversión total",
    totalFee: "Fee total",
    totalFreight: "Transporte total",
    profitTargets: "Objetivos de ganancia",
    targetPriceResult: "Resultado de tu precio objetivo",
    enterPrice: "Ingresá un precio",
    portfolioSelected: "Posición seleccionada",
    portfolioEntry: "Cargar posición",
    portfolioOverview: "Resumen de cartera",
    portfolioHoldings: "Posiciones cargadas",
    portfolioSearch: "Buscar producto en cartera",
    portfolioRefresh: "Actualizar precios",
    portfolioNew: "Nueva posición",
    portfolioImport: "Importar desde texto",
    portfolioFilterAll: "Todas",
    portfolioFilterGain: "Ganancia",
    portfolioFilterLoss: "Pérdida",
    newContact: "Nuevo contacto",
    contactArchive: "Archivo de contactos",
    recordsCount: "{count} registros",
    searchContact: "Buscar contacto...",
    executiveBase: "Base de lectura",
    executiveEntry: "Entrada de feedback",
    executiveFeedback: "Feedback del candidato",
    executiveFeedbackPlaceholder: "Pegá el feedback completo del candidato para abrir el radar.",
    analyzeProfile: "Analizar perfil",
    clear: "Limpiar",
    howToRead: "Cómo leerlo",
    executiveGuide1: "1. Pegás el feedback del candidato tal como aparece en el juego.",
    executiveGuide2: "2. El radar compara el texto con los patrones locales ya mapeados.",
    executiveGuide3: "3. El rol sugerido sale del vector más alto entre COO, CFO, CMO y CTO.",
    executiveRadar: "Radar ejecutivo",
    historyTitle: "Historial del contacto",
    historySubtitle: "Pegá una conversación o cargá una interacción manual. Cada entrada queda guardada dentro del contacto y puede editarse agregando nuevas interacciones cuando quieras.",
    newInteraction: "Nueva interacción",
    date: "Fecha",
    datePlaceholder: "Ej: 21 days ago o 29 de mar de 2026",
    note: "Nota",
    notePlaceholder: "Escribí tus observaciones",
    pasteConversation: "Pegar conversación",
    pasteConversationPlaceholder: "Pegá el chat copiado tal como sale del juego y se separará en mensajes.",
    clearForm: "Limpiar",
    saveInteraction: "Guardar interacción",
    savedHistory: "Historial guardado",
    close: "Cerrar",
    notificationsTitle: "NOTIFICACIONES",
    notificationsSubtitle: "Resumen reciente de disparos, salidas de zona y errores del monitor.",
    clearInbox: "Limpiar casilla",
    checkingUpdates: "Buscando actualizaciones",
    notNow: "Ahora no",
    download: "Descargar",
    onboardingStep: "Primer recorrido",
    onboardingSkip: "Saltar",
    onboardingBack: "Atrás",
    onboardingNext: "Siguiente",
    onboardingCreateAlert: "Crear primera alerta"
  },
  en: {
    tabMercado: "Market",
    tabCalculadora: "Calculator",
    tabCartera: "Portfolio",
    tabEjecutivos: "Executives",
    tabRegistro: "Registry",
    toggleThemeLight: "Enable light mode",
    toggleThemeDark: "Enable dark mode",
    languageButton: "ES",
    statsMonitor: "Monitor",
    statsAlerts: "Alerts",
    statsInZone: "In zone",
    statsLastReview: "Last review",
    noData: "No data",
    scanMarket: "Scan market",
    checkUpdates: "Check for updates",
    saveChanges: "Save changes",
    savePendingChanges: "Save pending changes",
    discard: "Discard",
    startScan: "Start scan",
    stopScan: "Stop scan",
    viewMercadoTitle: "MARKET ALERTS",
    viewCalculadoraTitle: "COST CALCULATOR",
    viewCarteraTitle: "INVENTORY PORTFOLIO",
    viewEjecutivosTitle: "EXECUTIVE RADAR",
    viewRegistroTitle: "CONTACT REGISTRY",
    sectionCurrentReading: "Current reading",
    sectionEditAlert: "Edit alert",
    sectionChannels: "Notification channels",
    sectionThanks: "Credits",
    thanksTitle: "Thanks for the inspiration and references.",
    thanksCopy: "Many concepts in this app were born from studying the work of these two sites.",
    openSite: "Open site",
    sectionWatchedMarket: "Watched market",
    searchNameOrAsset: "Search by name or asset",
    filterAll: "All",
    filterBuy: "Buy",
    filterSell: "Sell",
    filterMatch: "In zone",
    filterDisabled: "Paused",
    newAlert: "New alert",
    sectionPurchaseParams: "Purchase parameters",
    newCalculation: "New calculation",
    labelProduct: "Product",
    optionalAutofill: "optional, auto-fills transport",
    noProductSelected: "No product selected",
    productAutofillCopy: "Use it to bring the asset transport units automatically.",
    searchGroupOrAsset: "Search group or asset",
    searchAssetByNameId: "Search asset by name or ID",
    labelCostPerUnit: "Cost per unit",
    labelQuantity: "Quantity",
    unitsLabel: "units",
    labelTransportPrice: "Transport",
    transportUnitPrice: "unit price",
    labelUnitsPerUnit: "Units/u",
    sectionPriceCheck: "Price checker",
    labelSellCheck: "Planned sell price",
    perUnit: "per unit",
    deleteCalculation: "Delete calculation",
    calcPage: "Calculation {current} of {total}",
    calcEmpty: "Enter the purchase price<br />to see the calculations",
    breakEvenTitle: "Minimum selling price (breakeven)",
    baseCost: "Base cost",
    sellFee: "4% fee",
    freightPerUnit: "Freight/u",
    totalInvestment: "Total investment",
    totalFee: "Total fee",
    totalFreight: "Total freight",
    profitTargets: "Profit targets",
    targetPriceResult: "Result for your target price",
    enterPrice: "Enter a price",
    portfolioSelected: "Selected position",
    portfolioEntry: "Position input",
    portfolioOverview: "Portfolio overview",
    portfolioHoldings: "Loaded positions",
    portfolioSearch: "Search product in portfolio",
    portfolioRefresh: "Refresh prices",
    portfolioNew: "New position",
    portfolioImport: "Import from text",
    portfolioFilterAll: "All",
    portfolioFilterGain: "Profit",
    portfolioFilterLoss: "Loss",
    newContact: "New contact",
    contactArchive: "Contact archive",
    recordsCount: "{count} records",
    searchContact: "Search contact...",
    executiveBase: "Reading base",
    executiveEntry: "Feedback input",
    executiveFeedback: "Candidate feedback",
    executiveFeedbackPlaceholder: "Paste the full candidate feedback to open the radar.",
    analyzeProfile: "Analyze profile",
    clear: "Clear",
    howToRead: "How to read it",
    executiveGuide1: "1. Paste the candidate feedback exactly as it appears in the game.",
    executiveGuide2: "2. The radar compares that text against the mapped local patterns.",
    executiveGuide3: "3. The suggested role comes from the strongest vector among COO, CFO, CMO, and CTO.",
    executiveRadar: "Executive radar",
    historyTitle: "Contact history",
    historySubtitle: "Paste a conversation or load a manual interaction. Each entry stays saved inside the contact and can be extended with new interactions whenever you want.",
    newInteraction: "New interaction",
    date: "Date",
    datePlaceholder: "Ex: 21 days ago or Mar 29, 2026",
    note: "Note",
    notePlaceholder: "Write your notes",
    pasteConversation: "Paste conversation",
    pasteConversationPlaceholder: "Paste the copied chat exactly as it appears in the game and it will be split into messages.",
    clearForm: "Clear",
    saveInteraction: "Save interaction",
    savedHistory: "Saved history",
    close: "Close",
    notificationsTitle: "NOTIFICATIONS",
    notificationsSubtitle: "Recent summary of triggers, exits from zone, and monitor errors.",
    clearInbox: "Clear inbox",
    checkingUpdates: "Checking for updates",
    notNow: "Not now",
    download: "Download",
    onboardingStep: "First tour",
    onboardingSkip: "Skip",
    onboardingBack: "Back",
    onboardingNext: "Next",
    onboardingCreateAlert: "Create first alert"
  }
};

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(String(svg || "").trim())}`;
}

const CONTACT_TYPE_ICON_SVG = {
  Proveedor: `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="96" fill="#141412" stroke="#c9a84c" stroke-width="3" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(201,168,76,0.12)" stroke-width="1.5" />
      <rect x="44" y="58" width="14" height="46" rx="2" fill="none" stroke="#c9a84c" stroke-width="3" />
      <path d="M51 55 C49 48 55 42 51 36" fill="none" stroke="#c9a84c" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
      <path d="M54 52 C52 45 57 40 54 34" fill="none" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round" opacity="0.25" />
      <polyline points="36,104 56,76 76,104 96,76 116,104 136,76 156,104 164,104" fill="none" stroke="#c9a84c" stroke-width="3" stroke-linejoin="round" />
      <rect x="36" y="104" width="128" height="54" rx="2" fill="rgba(201,168,76,0.06)" stroke="#c9a84c" stroke-width="3" />
      <rect x="50" y="116" width="20" height="16" rx="1.5" fill="rgba(201,168,76,0.22)" stroke="#c9a84c" stroke-width="2" />
      <rect x="90" y="116" width="20" height="16" rx="1.5" fill="rgba(201,168,76,0.22)" stroke="#c9a84c" stroke-width="2" />
      <rect x="130" y="116" width="20" height="16" rx="1.5" fill="rgba(201,168,76,0.22)" stroke="#c9a84c" stroke-width="2" />
      <rect x="88" y="134" width="24" height="24" rx="1.5" fill="rgba(201,168,76,0.12)" stroke="#c9a84c" stroke-width="2" />
    </svg>
  `,
  Cliente: `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="96" fill="#141412" stroke="#4ade80" stroke-width="3" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(74,222,128,0.12)" stroke-width="1.5" />
      <path d="M46 46 L128 46 L158 84 L128 154 L46 154 Z" fill="rgba(74,222,128,0.08)" stroke="#4ade80" stroke-width="3.5" stroke-linejoin="round" />
      <circle cx="66" cy="68" r="10" fill="#141412" stroke="#4ade80" stroke-width="3" />
      <line x1="76" y1="94" x2="138" y2="94" stroke="#4ade80" stroke-width="4" stroke-linecap="round" />
      <line x1="76" y1="112" x2="130" y2="112" stroke="#4ade80" stroke-width="4" stroke-linecap="round" opacity="0.55" />
      <line x1="76" y1="130" x2="118" y2="130" stroke="#4ade80" stroke-width="4" stroke-linecap="round" opacity="0.28" />
    </svg>
  `,
  Desconocido: `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="96" fill="#141412" stroke="rgba(244,240,230,0.35)" stroke-width="3" stroke-dasharray="14 9" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(244,240,230,0.07)" stroke-width="1.5" />
      <circle cx="100" cy="70" r="26" fill="rgba(244,240,230,0.04)" stroke="rgba(244,240,230,0.32)" stroke-width="3" stroke-dasharray="8 7" />
      <path d="M42 152 C42 114 158 114 158 152" fill="none" stroke="rgba(244,240,230,0.32)" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round" />
      <path d="M86 60 C86 48 114 48 114 64 C114 74 100 76 100 86" fill="none" stroke="rgba(244,240,230,0.75)" stroke-width="5.5" stroke-linecap="round" />
      <circle cx="100" cy="96" r="4.5" fill="rgba(244,240,230,0.75)" />
    </svg>
  `,
  Social: `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="96" fill="#141412" stroke="#60a5fa" stroke-width="3" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(96,165,250,0.12)" stroke-width="1.5" />
      <circle cx="58" cy="76" r="18" fill="rgba(96,165,250,0.06)" stroke="#60a5fa" stroke-width="2.5" opacity="0.6" />
      <path d="M22 140 C22 110 82 106 82 106" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
      <circle cx="142" cy="76" r="18" fill="rgba(96,165,250,0.06)" stroke="#60a5fa" stroke-width="2.5" opacity="0.6" />
      <path d="M178 140 C178 110 118 106 118 106" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
      <circle cx="100" cy="70" r="24" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" stroke-width="3.5" />
      <path d="M46 148 C46 112 154 112 154 148" fill="none" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round" />
    </svg>
  `,
  Socio: `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="96" fill="#141412" stroke="#c9a84c" stroke-width="3" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(201,168,76,0.12)" stroke-width="1.5" />
      <circle cx="78" cy="100" r="40" fill="rgba(201,168,76,0.07)" stroke="#c9a84c" stroke-width="3" />
      <circle cx="122" cy="100" r="40" fill="rgba(201,168,76,0.07)" stroke="#c9a84c" stroke-width="3" />
      <path d="M100 62.8 C113 71 113 129 100 137.2 C87 129 87 71 100 62.8 Z" fill="rgba(201,168,76,0.28)" />
      <circle cx="100" cy="100" r="7" fill="#c9a84c" />
    </svg>
  `
};
const CONTACT_TYPE_ICON_DATA_URI = Object.fromEntries(
  Object.entries(CONTACT_TYPE_ICON_SVG).map(([key, svg]) => [key, svgDataUri(svg)])
);
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

const initialLocalRealmId = storedActiveRealmId();
const initialCalculatorBook = loadCalculatorBook(initialLocalRealmId, { migrateLegacy: false });
const initialExecutiveState = loadExecutiveState();

const state = {
  dashboard: null,
  resourceCatalogCache: [],
  draft: {
    alerts: [],
    channels: {},
    config: {}
  },
  realmProfiles: {},
  localRealmId: initialLocalRealmId,
  localRealmStateSynced: false,
  realmSwitching: false,
  selectedAlertId: null,
  filter: "all",
  search: "",
  alertPage: 1,
  resourceSearch: "",
  resourceSelectorOpen: false,
  resourceActiveGroup: null,
  conditionSelectorOpen: false,
  portfolioHoldings: [],
  selectedPortfolioId: null,
  selectedPortfolioGroupKey: null,
  portfolioDraft: emptyPortfolioDraft(),
  portfolioDirty: false,
  portfolioSearch: "",
  portfolioFilter: "all",
  portfolioPage: 1,
  portfolioExpandedKeys: [],
  portfolioResourceSelectorOpen: false,
  portfolioResourceSearch: "",
  portfolioResourceActiveGroup: null,
  portfolioResourceMetaCache: {},
  portfolioResourceMetaPending: {},
  portfolioImportText: "",
  portfolioImportRows: [],
  portfolioValuationMode: localStorage.getItem(PORTFOLIO_VIEW_MODE_STORAGE_KEY) === "net" ? "net" : "gross",
  portfolioChartRange: PORTFOLIO_CHART_RANGE_OPTIONS.includes(Number(localStorage.getItem(PORTFOLIO_CHART_RANGE_STORAGE_KEY)))
    ? Number(localStorage.getItem(PORTFOLIO_CHART_RANGE_STORAGE_KEY))
    : 30,
  portfolioChartSelectedTime: "",
  portfolioChartHoverTime: "",
  contacts: loadContacts(initialLocalRealmId, { migrateLegacy: false }),
  contactSearch: "",
  contactTypeFilter: "todos",
  contactTrustFilter: "todos",
  contactRubroFilter: "todos",
  contactPage: 1,
  contactDraft: emptyContactDraft(),
  contactSelectorOpen: false,
  contactTypeSelectorOpen: false,
  calculatorResourceSelectorOpen: false,
  calculatorResourceSearch: "",
  calculatorResourceActiveGroup: null,
  calculatorUnitsSelectorOpen: false,
  contactActiveGroup: null,
  contactResourceSearch: "",
  contactSelectedRubros: {},
  currentHistoryContactId: null,
  notificationsOpen: false,
  notificationsUnread: false,
  notificationsLastSeen: localStorage.getItem(NOTIFICATIONS_SEEN_STORAGE_KEY) || "",
  resourceManualMode: false,
  platform: window.simcoDesktop?.platform || "unknown",
  activeView: localStorage.getItem(VIEW_STORAGE_KEY) || "mercado",
  theme: localStorage.getItem(THEME_STORAGE_KEY) || "dark",
  language: localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "es",
  calculatorBook: initialCalculatorBook,
  calculator: activeCalculatorFromBook(initialCalculatorBook),
  executive: initialExecutiveState,
  updates: {
    platform: window.simcoDesktop?.platform || "unknown",
    strategy: "manual",
    currentVersion: window.simcoDesktop?.appVersion || "",
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

const byId = (id) => document.getElementById(id);

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function localeCode() {
  return state.language === "en" ? "en" : "es";
}

function numberLocale() {
  return state.language === "en" ? "en-US" : "es-AR";
}

function t(key, params = {}) {
  const bundle = I18N[localeCode()] || I18N.es;
  const fallback = I18N.es[key] || key;
  return String(bundle[key] || fallback).replace(/\{(\w+)\}/g, (_match, token) => {
    return Object.prototype.hasOwnProperty.call(params, token) ? String(params[token]) : "";
  });
}

function langText(esText, enText) {
  return state.language === "en" ? enText : esText;
}

function onboardingSteps() {
  return [
    {
      title: langText("Bienvenido a SimMarket", "Welcome to SimMarket"),
      body: langText(
        "La app está pensada para que vigiles el mercado, armes alertas y tomes decisiones de compra o venta desde un solo panel.",
        "The app is designed so you can watch the market, build alerts, and make buy or sell decisions from a single panel."
      ),
      points: state.language === "en"
        ? [
            "You track assets by group and by their current lowest price.",
            "Alerts enter the zone when the price meets your rule.",
            "You do not need to touch files or JSON manually."
          ]
        : [
            "Seguís activos por rubro y por su precio mínimo actual.",
            "Las alertas entran en zona cuando el precio cumple tu regla.",
            "No necesitás tocar archivos ni JSON manuales."
          ]
    },
    {
      title: langText("Creá tu primera alerta", "Create your first alert"),
      body: langText(
        "Empezá por el botón Nueva alerta. Elegí activo, tipo de alerta y precio gatillo.",
        "Start with the New alert button. Choose the asset, alert type, and trigger price."
      ),
      points: state.language === "en"
        ? [
            "Lower than: buy zone.",
            "Higher than: sell zone.",
            "Between two prices: range monitoring."
          ]
        : [
            "Menor que: zona de compra.",
            "Mayor que: zona de venta.",
            "Entre dos precios: vigilancia por rango."
          ]
    },
    {
      title: langText("Probá el mercado al instante", "Try the market right away"),
      body: langText(
        "Usá Iniciar escaneo para traer el primer ticker completo y, desde ahí, dejar el monitoreo corriendo cada 5 minutos.",
        "Use Start scan to pull the first full ticker and, from there, leave monitoring running every 5 minutes."
      ),
      points: state.language === "en"
        ? [
            "If the market is limited, SimMarket will tell you.",
            "Notifications appear when an alert enters the zone.",
            "You can pause or resume automatic scanning whenever you want."
          ]
        : [
            "Si el mercado está limitado, SimMarket te lo va a indicar.",
            "Las notificaciones salen cuando una alerta entra en zona.",
            "Podés pausar o reanudar el escaneo automático cuando quieras."
          ],
      finalAction: true
    }
  ];
}

function currentThemeToggleLabel() {
  return state.theme === "light" ? t("toggleThemeDark") : t("toggleThemeLight");
}

function toggleLanguage(nextLanguage) {
  state.language = nextLanguage === "en" ? "en" : "es";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
}

function contactTypeLabel(type, plural = false) {
  const labels = {
    Proveedor: { es: plural ? "Proveedores" : "Proveedor", en: plural ? "Suppliers" : "Supplier" },
    Cliente: { es: plural ? "Clientes" : "Cliente", en: plural ? "Customers" : "Customer" },
    Desconocido: { es: plural ? "Desconocidos" : "Desconocido", en: plural ? "Unknown contacts" : "Unknown" },
    Social: { es: "Social", en: "Social" },
    Socio: { es: plural ? "Socios" : "Socio", en: plural ? "Partners" : "Partner" }
  };
  const entry = labels[type] || labels.Proveedor;
  return state.language === "en" ? entry.en : entry.es;
}

function contactTrustLabel(value, plural = false) {
  const labels = {
    Alto: { es: plural ? "Alta" : "Alta", en: plural ? "High" : "High" },
    Medio: { es: plural ? "Media" : "Media", en: plural ? "Medium" : "Medium" },
    Bajo: { es: plural ? "Baja" : "Baja", en: plural ? "Low" : "Low" },
    Neutro: { es: "Neutro", en: "Neutral" }
  };
  const entry = labels[value] || labels.Neutro;
  return state.language === "en" ? entry.en : entry.es;
}

function executiveRoleMeta(roleKey) {
  const meta = EXECUTIVE_ROLE_META[roleKey] || EXECUTIVE_ROLE_META.mgmt;
  return {
    ...meta,
    label: state.language === "en" ? meta.labelEn : meta.labelEs
  };
}

function executiveBandMeta(bandKey) {
  const meta = EXECUTIVE_BAND_META[bandKey] || EXECUTIVE_BAND_META.riesgoso;
  return {
    ...meta,
    label: state.language === "en" ? meta.labelEn : meta.labelEs,
    copy: state.language === "en" ? meta.copyEn : meta.copyEs
  };
}

function displayConfidenceMeta(score) {
  const meta = executiveConfidenceMeta(score);
  return {
    ...meta,
    label: state.language === "en" ? meta.labelEn : meta.labelEs
  };
}

function displayGroupName(value) {
  if (!value) return state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL;
  const translation = GROUP_TRANSLATIONS[value];
  if (translation) {
    return state.language === "en" ? translation.en : value;
  }
  if (value === VARIOS_LABEL_EN || value === VARIOS_LABEL) {
    return state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL;
  }
  return value;
}

function localizedProductName(value) {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  const match = resourceCatalog().find((item) => item.label === raw || item.apiName === raw || item.labelEn === raw);
  return match ? catalogItemLabel(match) : raw;
}

function catalogItemLabel(item) {
  if (!item) return "";
  return state.language === "en"
    ? String(item.labelEn || item.apiName || item.label || "").trim()
    : String(item.label || item.labelEs || item.apiName || "").trim();
}

function catalogItemGroup(item) {
  if (!item) return state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL;
  if (state.language === "en") {
    return String(item.groupEn || displayGroupName(item.group) || VARIOS_LABEL_EN).trim();
  }
  return String(item.group || VARIOS_LABEL).trim();
}

function createCalculatorPageId() {
  return `calc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyCalculatorState(id = createCalculatorPageId()) {
  return {
    id,
    resourceId: "",
    buyPrice: "",
    quantity: "",
    transportPrice: "",
    transportUnits: "0",
    sellCheck: ""
  };
}

function normalizeCalculatorState(saved, fallbackId = createCalculatorPageId()) {
  const normalized = emptyCalculatorState(String(saved?.id || fallbackId));
  return {
    ...normalized,
    resourceId: saved?.resourceId === "" || saved?.resourceId === null || saved?.resourceId === undefined
      ? ""
      : Number(saved?.resourceId),
    buyPrice: saved?.buyPrice ?? "",
    quantity: saved?.quantity ?? "",
    transportPrice: saved?.transportPrice ?? "",
    transportUnits: String(saved?.transportUnits ?? "0"),
    sellCheck: saved?.sellCheck ?? ""
  };
}

function migrateRealmLocalDataIfNeeded(realmId) {
  const normalizedRealmId = normalizeRealmId(realmId);
  if (localStorage.getItem(REALM_LOCAL_MIGRATION_STORAGE_KEY) === "true") return;

  const calculatorKey = realmCalculatorStorageKey(normalizedRealmId);
  if (!storageKeyExists(calculatorKey) && storageKeyExists(CALC_STORAGE_KEY)) {
    localStorage.setItem(calculatorKey, localStorage.getItem(CALC_STORAGE_KEY) || "{}");
  }

  const contactsKey = realmContactsStorageKey(normalizedRealmId);
  if (!storageKeyExists(contactsKey)) {
    let contacts = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(CONTACTS_STORAGE_KEY) || "[]");
      contacts = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      contacts = [];
    }
    contacts = applyImportedContactBatches(contacts, normalizedRealmId);
    localStorage.setItem(contactsKey, JSON.stringify(contacts));
  }

  const contactBatchesKey = realmContactImportBatchesStorageKey(normalizedRealmId);
  if (!storageKeyExists(contactBatchesKey) && storageKeyExists(CONTACT_IMPORT_BATCHES_STORAGE_KEY)) {
    localStorage.setItem(contactBatchesKey, localStorage.getItem(CONTACT_IMPORT_BATCHES_STORAGE_KEY) || "[]");
  }

  localStorage.setItem(REALM_LOCAL_MIGRATION_STORAGE_KEY, "true");
}

function loadCalculatorBook(realmId = storedActiveRealmId(), { migrateLegacy = true } = {}) {
  const normalizedRealmId = normalizeRealmId(realmId);
  if (migrateLegacy) {
    migrateRealmLocalDataIfNeeded(normalizedRealmId);
  }
  const storageKey = realmCalculatorStorageKey(normalizedRealmId);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (Array.isArray(saved?.pages) && saved.pages.length) {
      const pages = saved.pages.map((page, index) => normalizeCalculatorState(page, `calc-${index + 1}`));
      const activeId = pages.some((page) => page.id === saved.activeId)
        ? saved.activeId
        : pages[0].id;
      return { activeId, pages };
    }
    return {
      activeId: "calc-1",
      pages: [normalizeCalculatorState(saved, "calc-1")]
    };
  } catch (error) {
    return {
      activeId: "calc-1",
      pages: [emptyCalculatorState("calc-1")]
    };
  }
}

function activeCalculatorFromBook(book) {
  if (!book?.pages?.length) {
    return emptyCalculatorState("calc-1");
  }
  const active = book.pages.find((page) => page.id === book.activeId);
  if (active) return active;
  book.activeId = book.pages[0].id;
  return book.pages[0];
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

function emptyExecutiveState() {
  return {
    feedback: "",
    lastQuery: "",
    analysis: null
  };
}

function loadExecutiveState() {
  try {
    const saved = JSON.parse(localStorage.getItem(EXECUTIVE_STORAGE_KEY) || "{}");
    return {
      ...emptyExecutiveState(),
      feedback: String(saved.feedback || ""),
      lastQuery: String(saved.lastQuery || ""),
      analysis: null
    };
  } catch (error) {
    return emptyExecutiveState();
  }
}

function uniqueList(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeContactHistory(contact) {
  if (!Array.isArray(contact.history)) return [];
  return contact.history.map((entry, index) => ({
    id: entry.id || `history-${Date.now()}-${index}`,
    date: String(entry.date || contact.date || "").trim(),
    summary: String(entry.summary || langText("Interacción guardada", "Saved interaction")).trim(),
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

function importedContactBatches() {
  const batches = Array.isArray(window.SIMMARKET_CONTACT_IMPORT_BATCHES)
    ? window.SIMMARKET_CONTACT_IMPORT_BATCHES
    : [];
  return batches.filter((batch) => batch && batch.id && Array.isArray(batch.contacts));
}

function readAppliedContactImportBatches(realmId = storedActiveRealmId()) {
  try {
    const parsed = JSON.parse(localStorage.getItem(realmContactImportBatchesStorageKey(realmId)) || "[]");
    return uniqueList(parsed);
  } catch (error) {
    return [];
  }
}

function writeAppliedContactImportBatches(batchIds, realmId = storedActiveRealmId()) {
  localStorage.setItem(realmContactImportBatchesStorageKey(realmId), JSON.stringify(uniqueList(batchIds)));
}

function mergeDistinctText(existingValue, importedValue) {
  const existing = String(existingValue || "").trim();
  const imported = String(importedValue || "").trim();
  if (!existing) return imported;
  if (!imported) return existing;
  const existingKey = normalizeSearch(existing);
  const importedKey = normalizeSearch(imported);
  if (!existingKey) return imported;
  if (!importedKey) return existing;
  if (existingKey === importedKey || existingKey.includes(importedKey)) return existing;
  if (importedKey.includes(existingKey)) return imported;
  return `${existing}\n\n${imported}`;
}

function trustScore(value) {
  if (value === "Alto") return 4;
  if (value === "Medio") return 3;
  if (value === "Neutro") return 2;
  if (value === "Bajo") return 1;
  return 0;
}

function mergeContactTrust(existingTrust, importedTrust) {
  return trustScore(importedTrust) > trustScore(existingTrust) ? importedTrust : existingTrust;
}

function mergeContactType(existingType, importedType) {
  if (!CONTACT_TYPE_OPTIONS.includes(importedType)) {
    return CONTACT_TYPE_OPTIONS.includes(existingType) ? existingType : "Proveedor";
  }
  if (!CONTACT_TYPE_OPTIONS.includes(existingType)) return importedType;
  if (existingType === importedType) return existingType;
  if (existingType === "Socio" || importedType === "Socio") return "Socio";
  const genericTypes = new Set(["Social", "Desconocido"]);
  if (genericTypes.has(existingType) && !genericTypes.has(importedType)) return importedType;
  return existingType;
}

function normalizeImportedHistoryEntry(entry, fallbackDate = "") {
  const conversationText = String(entry?.conversationText || entry?.conversation || "").trim();
  const messages = conversationText ? parseConversationText(conversationText) : [];
  const note = String(entry?.note || "").trim();
  const summary = String(entry?.summary || "").trim() || buildHistorySummary(messages, note) || langText("Interacción importada", "Imported interaction");
  return {
    id: entry?.id || `history-import-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    date: String(entry?.date || fallbackDate || "").trim(),
    summary,
    note,
    messages
  };
}

function historyEntrySignature(entry) {
  return normalizeSearch([
    entry?.date,
    entry?.summary,
    entry?.note,
    ...(entry?.messages || []).map((message) => `${message.speaker}|${message.time}|${message.text}`)
  ].join(" || "));
}

function mergeContactSelections(existingSelections, importedSelections) {
  const merged = new Map();
  [...(Array.isArray(existingSelections) ? existingSelections : []), ...(Array.isArray(importedSelections) ? importedSelections : [])]
    .forEach((selection) => {
      if (!selection?.rubro) return;
      const rubro = String(selection.rubro || "").trim();
      if (!rubro) return;
      const currentProducts = merged.get(rubro) || [];
      merged.set(rubro, uniqueList([...currentProducts, ...(Array.isArray(selection.products) ? selection.products : [])]));
    });
  return Array.from(merged.entries()).map(([rubro, products]) => ({ rubro, products }));
}

function normalizeImportedContactSeed(contact) {
  return normalizeContactRecord({
    ...contact,
    history: (Array.isArray(contact.history) ? contact.history : []).map((entry) => normalizeImportedHistoryEntry(entry, contact.date))
  });
}

function mergeImportedContactRecord(existingContact, importedContact) {
  const existingHistory = Array.isArray(existingContact.history) ? existingContact.history : [];
  const importedHistory = Array.isArray(importedContact.history) ? importedContact.history : [];
  const seenHistory = new Set(existingHistory.map(historyEntrySignature));
  const mergedHistory = [...existingHistory];
  importedHistory.forEach((entry) => {
    const signature = historyEntrySignature(entry);
    if (seenHistory.has(signature)) return;
    seenHistory.add(signature);
    mergedHistory.unshift(entry);
  });

  return normalizeContactRecord({
    ...existingContact,
    type: mergeContactType(existingContact.type, importedContact.type),
    trust: mergeContactTrust(existingContact.trust, importedContact.trust),
    perception: mergeDistinctText(existingContact.perception, importedContact.perception),
    notes: mergeDistinctText(existingContact.notes, importedContact.notes),
    selections: mergeContactSelections(existingContact.selections, importedContact.selections),
    history: mergedHistory,
    date: existingContact.date || importedContact.date,
    createdAt: existingContact.createdAt || importedContact.createdAt
  });
}

function applyImportedContactBatches(savedContacts, realmId = storedActiveRealmId()) {
  const batches = importedContactBatches();
  if (!batches.length) return savedContacts;

  const normalizedRealmId = normalizeRealmId(realmId);
  const applied = new Set(readAppliedContactImportBatches(normalizedRealmId));
  let changed = false;
  let contacts = savedContacts.map(normalizeContactRecord).filter((contact) => contact.name);

  batches.forEach((batch) => {
    if (applied.has(batch.id)) return;
    batch.contacts.forEach((seed) => {
      const imported = normalizeImportedContactSeed(seed);
      if (!imported.name) return;
      const existingIndex = contacts.findIndex((contact) => normalizeSearch(contact.name) === normalizeSearch(imported.name));
      if (existingIndex === -1) {
        contacts.unshift(imported);
      } else {
        contacts[existingIndex] = mergeImportedContactRecord(contacts[existingIndex], imported);
      }
      changed = true;
    });
    applied.add(batch.id);
  });

  if (changed) {
    localStorage.setItem(realmContactsStorageKey(normalizedRealmId), JSON.stringify(contacts));
    writeAppliedContactImportBatches([...applied], normalizedRealmId);
  }

  return contacts;
}

function loadContacts(realmId = storedActiveRealmId(), { migrateLegacy = true } = {}) {
  const normalizedRealmId = normalizeRealmId(realmId);
  if (migrateLegacy) {
    migrateRealmLocalDataIfNeeded(normalizedRealmId);
  }
  const storageKey = realmContactsStorageKey(normalizedRealmId);
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
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

function emptyPortfolioDraft() {
  return {
    id: "",
    resourceId: "",
    quality: "0",
    quantity: "",
    buyPrice: "",
    createdAt: ""
  };
}

function normalizePortfolioValuationMode(value) {
  return value === "net" ? "net" : "gross";
}

function normalizePortfolioChartRange(value) {
  const numericValue = Number(value);
  return PORTFOLIO_CHART_RANGE_OPTIONS.includes(numericValue) ? numericValue : 30;
}

function persistPortfolioViewPreferences() {
  localStorage.setItem(PORTFOLIO_VIEW_MODE_STORAGE_KEY, normalizePortfolioValuationMode(state.portfolioValuationMode));
  localStorage.setItem(PORTFOLIO_CHART_RANGE_STORAGE_KEY, String(normalizePortfolioChartRange(state.portfolioChartRange)));
}

function normalizeSearch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function executiveDataset() {
  const fallback = {
    generatedAt: "",
    summary: {
      profileCount: 0,
      sampleCount: 0,
      salaryMin: null,
      salaryMax: null
    },
    profiles: []
  };
  const data = window.EXECUTIVE_INTEL_DATA;
  return data && Array.isArray(data.profiles) ? data : fallback;
}

function executiveProfiles() {
  return executiveDataset().profiles || [];
}

function executiveNeedsRefresh() {
  return normalizeSearch(state.executive.feedback) !== normalizeSearch(state.executive.lastQuery);
}

function persistExecutiveState() {
  localStorage.setItem(
    EXECUTIVE_STORAGE_KEY,
    JSON.stringify({
      feedback: state.executive.feedback,
      lastQuery: state.executive.lastQuery
    })
  );
}

function executiveTrigrams(value) {
  const input = normalizeSearch(value).replace(/\s+/g, " ");
  if (!input) return [];
  if (input.length <= 3) return [input];
  const grams = [];
  for (let index = 0; index < input.length - 2; index += 1) {
    grams.push(input.slice(index, index + 3));
  }
  return grams;
}

function executiveDiceCoefficient(leftValue, rightValue) {
  const left = executiveTrigrams(leftValue);
  const right = executiveTrigrams(rightValue);
  if (!left.length || !right.length) return 0;
  const rightCounts = new Map();
  right.forEach((gram) => {
    rightCounts.set(gram, (rightCounts.get(gram) || 0) + 1);
  });
  let matches = 0;
  left.forEach((gram) => {
    const count = rightCounts.get(gram) || 0;
    if (count > 0) {
      matches += 1;
      rightCounts.set(gram, count - 1);
    }
  });
  return (2 * matches) / (left.length + right.length);
}

function executiveTokenMetrics(queryTokens, profileTokens) {
  const querySet = new Set(queryTokens.filter((token) => token.length > 1));
  const profileSet = new Set(profileTokens.filter((token) => token.length > 1));
  if (!querySet.size || !profileSet.size) {
    return {
      recall: 0,
      jaccard: 0
    };
  }
  let overlap = 0;
  querySet.forEach((token) => {
    if (profileSet.has(token)) overlap += 1;
  });
  const union = new Set([...querySet, ...profileSet]).size || 1;
  return {
    recall: overlap / querySet.size,
    jaccard: overlap / union
  };
}

function executiveMatchScore(query, profile) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 0;
  if (normalizedQuery === profile.normalized) return 1;
  const tokenMetrics = executiveTokenMetrics(normalizedQuery.split(" "), profile.tokens || []);
  const substringScore = profile.normalized.includes(normalizedQuery)
    ? Math.min(1, 0.72 + (normalizedQuery.length / Math.max(profile.normalized.length, 1)) * 0.28)
    : 0;
  const diceScore = executiveDiceCoefficient(normalizedQuery, profile.normalized);
  const prefixScore = profile.normalized.startsWith(normalizedQuery.slice(0, Math.min(18, normalizedQuery.length))) ? 0.18 : 0;
  return Math.max(
    substringScore * 0.5
      + tokenMetrics.recall * 0.28
      + tokenMetrics.jaccard * 0.12
      + diceScore * 0.1
      + prefixScore,
    substringScore ? 0.52 : 0
  );
}

function executiveConfidenceMeta(score) {
  return Object.values(EXECUTIVE_CONFIDENCE_META).find((item) => score >= item.min) || EXECUTIVE_CONFIDENCE_META.baja;
}

function executiveAverageSkills(rows) {
  if (!rows.length) {
    return { mgmt: 0, acct: 0, comm: 0, tech: 0, avgSkill: 0 };
  }
  const sums = rows.reduce((accumulator, row) => ({
    mgmt: accumulator.mgmt + Number(row.mgmt || 0),
    acct: accumulator.acct + Number(row.acct || 0),
    comm: accumulator.comm + Number(row.comm || 0),
    tech: accumulator.tech + Number(row.tech || 0)
  }), { mgmt: 0, acct: 0, comm: 0, tech: 0 });
  const count = rows.length || 1;
  const averaged = {
    mgmt: sums.mgmt / count,
    acct: sums.acct / count,
    comm: sums.comm / count,
    tech: sums.tech / count
  };
  return {
    ...averaged,
    avgSkill: (averaged.mgmt + averaged.acct + averaged.comm + averaged.tech) / 4
  };
}

function executiveDominantRoleFromSkills(skills) {
  return Object.entries(EXECUTIVE_ROLE_META)
    .map(([key, meta]) => ({ key, meta, value: Number(skills?.[key] || 0) }))
    .sort((left, right) => right.value - left.value)[0] || { key: "mgmt", meta: EXECUTIVE_ROLE_META.mgmt, value: 0 };
}

function executiveRoleAccentClass(roleKey) {
  return `executive-accent-${executiveRoleMeta(roleKey).accent}`;
}

function executiveSkillCardsMarkup(skills) {
  return Object.entries(EXECUTIVE_ROLE_META).map(([key, meta]) => {
    const value = Number(skills?.[key] || 0);
    const width = Math.max(8, Math.min(100, (value / 3) * 100));
    return `
      <article class="executive-skill-card ${executiveRoleAccentClass(key)}">
        <div class="executive-skill-head">
          <span class="executive-skill-name">${escapeHtml(meta.label)}</span>
          <span class="executive-skill-value">${value.toFixed(2)}</span>
        </div>
        <div class="executive-skill-bar">
          <span class="executive-skill-fill" style="width:${width}%"></span>
        </div>
        <div class="executive-skill-source">${escapeHtml(meta.short)}</div>
      </article>
    `;
  }).join("");
}

function executiveSampleRowsMarkup(rows) {
  if (!rows.length) {
    return `<div class="selector-empty">${escapeHtml(langText("Todavía no hay referencias salariales para este feedback.", "There are no salary references for this feedback yet."))}</div>`;
  }
  return rows.map((row) => {
    const dominant = executiveDominantRoleFromSkills(row);
    return `
      <div class="executive-sample-row">
        <div>
          <div class="executive-sample-salary">$${Number(row.salary).toLocaleString(numberLocale())}</div>
          <div class="executive-sample-role">${escapeHtml(dominant.meta.label)} · ${dominant.value.toFixed(0)} pts</div>
        </div>
        <div class="executive-sample-chips">
          <span class="tag">${state.language === "en" ? "Ops" : "O"} ${Number(row.mgmt || 0).toFixed(0)}</span>
          <span class="tag">${state.language === "en" ? "Fin" : "F"} ${Number(row.acct || 0).toFixed(0)}</span>
          <span class="tag">${state.language === "en" ? "Com" : "C"} ${Number(row.comm || 0).toFixed(0)}</span>
          <span class="tag">${state.language === "en" ? "Tech" : "T"} ${Number(row.tech || 0).toFixed(0)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function executiveAlternativesMarkup(items) {
  if (!items.length) {
    return `<div class="selector-empty">${escapeHtml(langText("No hay alternativas cercanas para comparar.", "There are no close alternatives to compare."))}</div>`;
  }
  return items.map((item) => {
    const roleMeta = executiveRoleMeta(item.profile.dominantRole);
    return `
      <article class="executive-alt-card">
        <div class="executive-alt-head">
          <div class="executive-alt-role">${escapeHtml(roleMeta.label)}</div>
          <div class="executive-alt-score">${Math.round(item.score * 100)}%</div>
        </div>
        <div class="executive-alt-copy">${escapeHtml(item.profile.feedback)}</div>
      </article>
    `;
  }).join("");
}

function executiveAnalysisBand(analysis) {
  return executiveBandMeta(analysis?.bandKey || analysis?.best?.band || "riesgoso");
}

function executiveAnalysisConfidence(analysis) {
  return displayConfidenceMeta(Number(analysis?.score || 0));
}

function analyzeExecutiveQuery(feedbackText) {
  const normalizedQuery = normalizeSearch(feedbackText);
  if (!normalizedQuery || normalizedQuery.length < 12) {
    return null;
  }
  const ranked = executiveProfiles()
    .map((profile) => ({ profile, score: executiveMatchScore(normalizedQuery, profile) }))
    .filter((item) => item.score >= 0.18)
    .sort((left, right) => right.score - left.score);
  if (!ranked.length) {
    return {
      type: "no-match",
      query: feedbackText,
      totalMatches: 0
    };
  }
  const primary = ranked[0];
  const role = executiveDominantRoleFromSkills(primary.profile.skills);
  return {
    type: "match",
    query: feedbackText,
    totalMatches: ranked.length,
    score: primary.score,
    confidence: displayConfidenceMeta(primary.score),
    best: primary.profile,
    alternatives: ranked.slice(1, 5),
    displaySkills: primary.profile.skills,
    displayRole: role,
    bandKey: primary.profile.band
  };
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (Number.isInteger(number)) return String(number);
  if (Math.abs(number) >= 100) return number.toFixed(2).replace(/\.?0+$/, "");
  return number.toFixed(3).replace(/\.?0+$/, "");
}

function qualityLabel(value) {
  const quality = Number(value);
  return `Q${Number.isInteger(quality) && quality >= 0 ? quality : 0}`;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "—";
  const number = Number(value);
  const maxFractionDigits = Math.abs(number) >= 100 ? 2 : 5;
  return `$${number.toLocaleString(numberLocale(), { minimumFractionDigits: 0, maximumFractionDigits: maxFractionDigits })}`;
}

function finiteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatShortDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)?.[0] || raw;
  const date = new Date(`${dateOnly}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat(state.language === "en" ? "en-US" : "es-AR", {
    day: "numeric",
    month: "short"
  }).format(date);
}

function formatPortfolioChartDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  const parts = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (parts) {
    const [, year, month, day] = parts;
    return state.language === "en" ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat(state.language === "en" ? "en-US" : "es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatPortfolioChartScaleCurrency(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const rounded = Math.abs(number) >= 5_000_000
    ? Math.round(number / 100_000) * 100_000
    : number;
  return formatCurrency(rounded);
}

function parseLocaleDecimal(value) {
  const raw = String(value ?? "").trim().replace(/\s+/g, "");
  if (!raw) return Number.NaN;
  const commaCount = (raw.match(/,/g) || []).length;
  const dotCount = (raw.match(/\./g) || []).length;
  let normalized = raw;
  if (commaCount > 0 && dotCount > 0) {
    if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = raw.replace(/,/g, "");
    }
  } else if (commaCount > 1) {
    normalized = raw.replace(/,/g, "");
  } else if (dotCount > 1) {
    normalized = raw.replace(/\./g, "");
  } else if (commaCount === 1) {
    normalized = raw.replace(",", ".");
  }
  return Number(normalized);
}

function parseIntegerInput(value) {
  const digits = String(value ?? "").replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return Number.NaN;
  return Number(digits);
}

function formatDateTime(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString(numberLocale());
}

function formatCompactReading(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const datePart = date.toLocaleDateString(numberLocale(), {
    month: "numeric",
    day: "numeric",
    year: "2-digit"
  });
  const timePart = date.toLocaleTimeString(numberLocale(), {
    hour: "numeric",
    minute: "2-digit",
    hour12: state.language === "en"
  });
  return `${datePart} · ${timePart}`;
}

function formatContactDate(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(numberLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatHeaderTime(raw) {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString(numberLocale(), { hour: "2-digit", minute: "2-digit", hour12: state.language === "en" });
}

function themeToggleMarkup() {
  return `
    <span class="orbital-shell">
      <span class="space-disc" aria-hidden="true">
        <span class="orbit one">
          <span class="orbit-rotor">
            <span class="planet small"></span>
          </span>
        </span>
        <span class="orbit two">
          <span class="orbit-rotor">
            <span class="planet large"></span>
          </span>
        </span>
      </span>
      <span class="celestial-core celestial-sun" aria-hidden="true"></span>
      <span class="celestial-core celestial-moon" aria-hidden="true"></span>
    </span>
  `;
}

function applyTheme(theme = state.theme) {
  document.body.classList.add("theme-switching");
  state.theme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = state.theme;
  localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  renderThemeToggle();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove("theme-switching");
    });
  });
}

function renderThemeToggle() {
  const button = byId("themeToggleButton");
  const icon = byId("themeToggleIcon");
  if (!button || !icon) return;
  button.dataset.theme = state.theme;
  button.setAttribute("aria-label", currentThemeToggleLabel());
  button.setAttribute("title", currentThemeToggleLabel());
  if (!icon.firstElementChild) {
    icon.innerHTML = themeToggleMarkup();
  }
}

function renderLanguageToggle() {
  const button = byId("languageToggleButton");
  if (!button) return;
  button.textContent = t("languageButton");
  button.dataset.language = state.language;
  button.setAttribute("aria-label", langText("Cambiar idioma a inglés", "Switch language to Spanish"));
  button.setAttribute("title", langText("Cambiar idioma a inglés", "Switch language to Spanish"));
}

function normalizeRealmId(value) {
  const numericValue = Number(value);
  return REALM_OPTIONS.some((realm) => Number(realm.id) === numericValue) ? numericValue : 0;
}

function realmOption(realmId = state.draft?.config?.realmId) {
  const normalizedRealmId = normalizeRealmId(realmId);
  return REALM_OPTIONS.find((realm) => Number(realm.id) === normalizedRealmId) || REALM_OPTIONS[0];
}

function nextRealmOption() {
  const currentIndex = REALM_OPTIONS.findIndex((realm) => Number(realm.id) === normalizeRealmId(state.draft?.config?.realmId));
  return REALM_OPTIONS[(currentIndex + 1 + REALM_OPTIONS.length) % REALM_OPTIONS.length] || REALM_OPTIONS[0];
}

function localizedRealmLabel(realm = realmOption()) {
  return state.language === "en" ? realm.labelEn : realm.labelEs;
}

function renderRealmToggle() {
  const button = byId("realmToggleButton");
  const icon = byId("realmToggleIcon");
  if (!button || !icon) return;
  const current = realmOption();
  const next = nextRealmOption();
  const currentLabel = localizedRealmLabel(current);
  const nextLabel = localizedRealmLabel(next);
  button.dataset.realm = current.key;
  button.dataset.realmId = String(current.id);
  button.disabled = false;
  button.setAttribute("aria-disabled", state.realmSwitching ? "true" : "false");
  button.classList.toggle("is-loading", Boolean(state.realmSwitching));
  button.setAttribute("aria-label", langText(`Servidor actual: ${currentLabel}. Cambiar a ${nextLabel}.`, `Current server: ${currentLabel}. Switch to ${nextLabel}.`));
  button.setAttribute("title", langText(`Servidor: ${currentLabel}. Tocar para cambiar a ${nextLabel}.`, `Server: ${currentLabel}. Click to switch to ${nextLabel}.`));
  icon.src = current.icon;
  icon.alt = currentLabel;
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
    errors.resourceId = langText("Elegí un activo válido.", "Choose a valid asset.");
  }
  const qualityRaw = String(alert.quality ?? "").trim();
  const quality = Number(qualityRaw);
  if (!qualityRaw.length || !Number.isInteger(quality) || quality < 0 || quality > 12) {
    errors.quality = langText("La calidad tiene que estar entre Q0 y Q12.", "Quality must be between Q0 and Q12.");
  }
  const targetPriceRaw = String(alert.targetPrice ?? "").trim();
  if (!targetPriceRaw.length || !Number.isFinite(Number(targetPriceRaw))) {
    errors.targetPrice = langText("Cargá un precio gatillo válido.", "Enter a valid trigger price.");
  }
  if (editorConditionValue(alert.condition) === "between") {
    const targetPriceMaxRaw = String(alert.targetPriceMax ?? "").trim();
    if (!targetPriceMaxRaw.length || !Number.isFinite(Number(targetPriceMaxRaw))) {
      errors.targetPriceMax = langText("Cargá el precio máximo del rango.", "Enter the range maximum price.");
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

async function callDesktop(method, payload) {
  if (!window.simcoDesktop?.[method]) {
    throw new Error(langText("La API de escritorio no está disponible.", "The desktop API is not available."));
  }
  return window.simcoDesktop[method](payload);
}

async function openSupporterUrl(url) {
  if (!url) return;
  try {
    await callDesktop("openExternalUrl", url);
  } catch (error) {
    showToast(langText("No se pudo abrir el enlace externo.", "The external link could not be opened."), "warn");
  }
}

function persistContacts() {
  localStorage.setItem(realmContactsStorageKey(state.localRealmId), JSON.stringify(state.contacts));
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
  if (Array.isArray(state.dashboard?.resourceCatalog) && state.dashboard.resourceCatalog.length) {
    return state.dashboard.resourceCatalog;
  }
  return Array.isArray(state.resourceCatalogCache) ? state.resourceCatalogCache : [];
}

function cacheResourceCatalog(items) {
  if (!Array.isArray(items) || !items.length) return;
  state.resourceCatalogCache = items.map((item) => ({
    ...item,
    id: Number(item.id),
    transportUnits: Number(item.transportUnits || 0)
  }));
}

function resourceEntry(resourceId) {
  return resourceCatalog().find((item) => Number(item.id) === Number(resourceId)) || null;
}

function resourceLabel(resourceId) {
  if (resourceId === "" || resourceId === null || resourceId === undefined) return state.language === "en" ? "No asset" : "Sin activo";
  const entry = resourceEntry(resourceId);
  return catalogItemLabel(entry) || (state.language === "en" ? `Resource ${resourceId}` : `Recurso ${resourceId}`);
}

function resourceChoice(alert) {
  const match = resourceEntry(alert.resourceId);
  return match ? String(match.id) : "custom";
}

function resourceSearchTokens(item) {
  return normalizeSearch([item.group, item.groupEn, item.label, item.labelEn, item.apiName, item.id].filter(Boolean).join(" "));
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
    const groupKey = item.groupKey || item.group || VARIOS_LABEL;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(item);
  });
  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    name: catalogItemGroup(items[0]),
    items
  }));
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
  const items = resourceCatalog().filter((item) => (item.groupKey || item.group) === group);
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
    return `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Groups" : "Rubros")}</span>`;
  }
  return [
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Group" : "Rubro")}</span>`,
    `<span class="selector-tag">${escapeHtml(resourceGroups().find((entry) => entry.key === state.resourceActiveGroup)?.name || displayGroupName(state.resourceActiveGroup))}</span>`,
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Assets" : "Activos")}</span>`
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
  if (Object.prototype.hasOwnProperty.call(item || {}, "resourceId") && (item?.resourceId === "" || item?.resourceId === null || item?.resourceId === undefined)) {
    return `<div class="avatar"></div>`;
  }
  return `<div class="avatar">${escapeHtml((item.resourceName || item.label || fallback).slice(0, 1))}</div>`;
}

function letterAvatarMarkup(label, fallback = "C") {
  const safeLabel = String(label || "").trim();
  const letter = safeLabel ? safeLabel.charAt(0).toUpperCase() : fallback;
  return `<div class="avatar">${escapeHtml(letter)}</div>`;
}

function contactTypeIconMarkup(type, size = "md") {
  const normalizedType = CONTACT_TYPE_OPTIONS.includes(type) ? type : "Proveedor";
  const normalizedSize = ["sm", "md", "lg"].includes(size) ? size : "md";
  const iconUri = CONTACT_TYPE_ICON_DATA_URI[normalizedType] || CONTACT_TYPE_ICON_DATA_URI.Proveedor;
  return `<span class="contact-type-icon contact-type-icon-${normalizedSize}" aria-hidden="true"><img class="contact-type-icon-image" src="${iconUri}" alt="" draggable="false" /></span>`;
}

function calculatorSelectedResource() {
  return resourceEntry(state.calculator?.resourceId) || null;
}

function formatTransportUnitsValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  if (Number.isInteger(number)) return String(number);
  if (Math.abs(number) >= 100) return number.toFixed(2).replace(/\.?0+$/, "");
  return number.toFixed(3).replace(/\.?0+$/, "");
}

function calculatorTransportUnitsValue() {
  const raw = String(state.calculator.transportUnits ?? "").trim();
  if (!raw.length) return "0";
  const parsed = parseLocaleDecimal(raw);
  return Number.isFinite(parsed) ? formatTransportUnitsValue(parsed) : raw;
}

function calculatorProductSummary() {
  const item = calculatorSelectedResource();
  if (!item) {
    return {
      title: t("noProductSelected"),
      subtitle: t("productAutofillCopy")
    };
  }
  const transport = formatTransportUnitsValue(item.transportUnits || 0);
  return {
    title: catalogItemLabel(item),
    subtitle: `${catalogItemGroup(item)} · ${transport} ${state.language === "en" ? "transport/u" : "transporte/u"}`
  };
}

function calculatorProductCrumbsMarkup() {
  if (!state.calculatorResourceActiveGroup) {
    return `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Groups" : "Rubros")}</span>`;
  }
  return [
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Group" : "Rubro")}</span>`,
    `<span class="selector-tag">${escapeHtml(resourceGroups().find((entry) => entry.key === state.calculatorResourceActiveGroup)?.name || displayGroupName(state.calculatorResourceActiveGroup))}</span>`,
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Assets" : "Activos")}</span>`
  ].join("");
}

function resetCalculatorResourceSelectorState({ keepOpen = false } = {}) {
  state.calculatorResourceSearch = "";
  state.calculatorResourceSelectorOpen = keepOpen;
  state.calculatorResourceActiveGroup = null;
}

function focusCalculatorResourceSearch() {
  window.requestAnimationFrame(() => {
    const input = byId("calcProductSearch");
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

function calculatorResourceSelectorOptionsMarkup() {
  if (!state.calculatorResourceActiveGroup) {
    const groups = filteredGroupsByQuery(state.calculatorResourceSearch);
    if (!groups.length) {
      return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No groups match the search." : "No hay rubros que coincidan con la búsqueda.")}</div>`;
    }
    return groups.map((entry) => {
      const totalItems = entry.items?.length || 0;
      const visibleItems = entry.visibleCount ?? totalItems;
      const helper = totalItems === visibleItems
        ? `${totalItems} ${state.language === "en" ? `asset${totalItems === 1 ? "" : "s"}` : `activo${totalItems === 1 ? "" : "s"}`}`
        : state.language === "en"
          ? `${visibleItems} of ${totalItems} assets`
          : `${visibleItems} de ${totalItems} activos`;
      return `
        <button class="selector-option" type="button" data-calc-product-action="open-group" data-resource-group="${escapeHtml(entry.key)}">
          <div class="selector-option-main">
            <span>${escapeHtml(entry.name)}</span>
          </div>
          <small>${escapeHtml(helper)}</small>
        </button>
      `;
    }).join("");
  }

  const items = filteredResourcesForGroup(state.calculatorResourceActiveGroup, state.calculatorResourceSearch);
  if (!items.length) {
    return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No assets match the search." : "No hay activos que coincidan con la búsqueda.")}</div>`;
  }

  return items.map((item) => {
    const active = Number(item.id) === Number(state.calculator.resourceId);
    return `
      <button class="selector-option${active ? " active" : ""}" type="button" data-calc-product-action="select-product" data-resource-id="${item.id}">
        <div class="selector-option-main">
          ${avatarMarkup({ resourceId: item.id, resourceName: catalogItemLabel(item), logoUrl: item.logoUrl }, "A")}
          <span>${escapeHtml(catalogItemLabel(item))}</span>
        </div>
        <small>${escapeHtml(item.apiName)} · ${formatTransportUnitsValue(item.transportUnits || 0)} ${escapeHtml(state.language === "en" ? "transport/u" : "transporte/u")}</small>
      </button>
    `;
  }).join("");
}

function renderCalculatorResourceSelector() {
  const selector = byId("calcProductSelector");
  const summary = byId("calcProductSummary");
  const subtitle = byId("calcProductSubtitle");
  const chevron = byId("calcProductChevron");
  const crumbs = byId("calcProductCrumbs");
  const actions = byId("calcProductActions");
  const options = byId("calcProductOptions");
  const input = byId("calcProductSearch");
  if (!selector || !summary || !subtitle || !chevron || !crumbs || !actions || !options || !input) return;
  const summaryState = calculatorProductSummary();
  const visibleGroups = filteredGroupsByQuery(state.calculatorResourceSearch).length;
  const visibleItems = state.calculatorResourceActiveGroup
    ? filteredResourcesForGroup(state.calculatorResourceActiveGroup, state.calculatorResourceSearch).length
    : visibleGroups;
  selector.classList.toggle("open", state.calculatorResourceSelectorOpen);
  summary.textContent = summaryState.title;
  subtitle.textContent = summaryState.subtitle;
  chevron.textContent = state.calculatorResourceSelectorOpen ? "▲" : "▼";
  input.value = state.calculatorResourceSearch;
  input.placeholder = state.calculatorResourceActiveGroup ? t("searchAssetByNameId") : t("searchGroupOrAsset");
  crumbs.innerHTML = `${calculatorProductCrumbsMarkup()}<span class="selector-tag">${visibleItems} ${escapeHtml(state.language === "en" ? "visible" : "visibles")}</span>`;
  actions.innerHTML = [
    state.calculatorResourceActiveGroup ? `<button type="button" class="selector-action-btn" data-calc-product-action="back-groups">${escapeHtml(state.language === "en" ? "Back to groups" : "Volver a rubros")}</button>` : "",
    state.calculator.resourceId !== "" ? `<button type="button" class="selector-action-btn" data-calc-product-action="clear-product">${escapeHtml(state.language === "en" ? "Clear product" : "Quitar producto")}</button>` : ""
  ].filter(Boolean).join("");
  options.innerHTML = calculatorResourceSelectorOptionsMarkup();
}

function calculatorUnitsSummary() {
  return calculatorTransportUnitsValue();
}

function calculatorUnitOptionsMarkup() {
  const current = calculatorUnitsSummary();
  const options = CALC_TRANSPORT_UNIT_OPTIONS.filter((option) => option !== current);
  if (!options.length) {
    return `<div class="selector-empty">${escapeHtml(langText("No hay otras unidades disponibles.", "There are no other units available."))}</div>`;
  }
  return options.map((option) => `
    <button class="selector-option" type="button" data-calc-action="select-transport-units" data-calc-unit="${escapeHtml(option)}">
      <div class="selector-option-main">
        <span>${escapeHtml(option)}</span>
      </div>
    </button>
  `).join("");
}

function renderCalculatorUnitsSelector() {
  const selector = byId("calcUnitsSelector");
  const summary = byId("calcUnitsSummary");
  const list = byId("calcUnitsOptions");
  const chevron = byId("calcUnitsChevron");
  const hiddenInput = byId("calc-transport-units");
  if (!selector || !summary || !list || !chevron || !hiddenInput) return;
  selector.classList.toggle("open", state.calculatorUnitsSelectorOpen);
  summary.textContent = calculatorUnitsSummary();
  list.innerHTML = calculatorUnitOptionsMarkup();
  chevron.textContent = state.calculatorUnitsSelectorOpen ? "▲" : "▼";
  hiddenInput.value = calculatorUnitsSummary();
}

function calculatorPageIndex() {
  const index = state.calculatorBook.pages.findIndex((page) => page.id === state.calculator?.id);
  return index >= 0 ? index : 0;
}

function compactPaginationItems(totalPages, currentPage) {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, index) => ({ type: "page", page: index + 1 }));
  }
  if (currentPage <= 4) {
    return [
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "page", page: 4 },
      { type: "page", page: 5 },
      { type: "page", page: 6 },
      { type: "ellipsis", key: "ellipsis-end" },
      { type: "page", page: totalPages }
    ];
  }
  if (currentPage >= totalPages - 3) {
    return [
      { type: "page", page: 1 },
      { type: "ellipsis", key: "ellipsis-start" },
      { type: "page", page: totalPages - 5 },
      { type: "page", page: totalPages - 4 },
      { type: "page", page: totalPages - 3 },
      { type: "page", page: totalPages - 2 },
      { type: "page", page: totalPages - 1 },
      { type: "page", page: totalPages }
    ];
  }
  return [
    { type: "page", page: 1 },
    { type: "ellipsis", key: `ellipsis-left-${currentPage}` },
    { type: "page", page: currentPage - 1 },
    { type: "page", page: currentPage },
    { type: "page", page: currentPage + 1 },
    { type: "ellipsis", key: `ellipsis-right-${currentPage}` },
    { type: "page", page: totalPages }
  ];
}

function paginationMarkup(totalPages, currentPage, scope = "contact") {
  if (totalPages <= 1) return "";
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const pageButtons = compactPaginationItems(totalPages, currentPage).map((item) => {
    if (item.type === "ellipsis") {
      return `<span class="pagination-ellipsis">…</span>`;
    }
    return `
      <button class="pagination-btn${item.page === currentPage ? " active" : ""}" type="button" data-pagination-scope="${scope}" data-page="${item.page}">
        ${item.page}
      </button>
    `;
  }).join("");
  return `
    <button class="pagination-btn nav" type="button" data-pagination-scope="${scope}" data-page-nav="prev"${prevDisabled ? " disabled" : ""}>${escapeHtml(langText("Anterior", "Previous"))}</button>
    <div class="pagination-pages">${pageButtons}</div>
    <button class="pagination-btn nav" type="button" data-pagination-scope="${scope}" data-page-nav="next"${nextDisabled ? " disabled" : ""}>${escapeHtml(langText("Siguiente", "Next"))}</button>
  `;
}

function renderCalculatorPages() {
  const label = byId("calcPageLabel");
  const pagination = byId("calcWorkspacePagination");
  if (!label || !pagination) return;
  const index = calculatorPageIndex();
  const total = state.calculatorBook.pages.length || 1;
  label.textContent = `Cálculo ${index + 1} de ${total}`;
  pagination.innerHTML = paginationMarkup(total, index + 1, "calc");
}

function setActiveCalculatorPage(pageId) {
  const page = state.calculatorBook.pages.find((item) => item.id === pageId);
  if (!page) return;
  state.calculator = page;
  state.calculatorBook.activeId = page.id;
  resetCalculatorResourceSelectorState();
  state.calculatorUnitsSelectorOpen = false;
  persistCalculatorState();
  renderCalculatorPages();
  syncCalculatorInputs();
  recalculateCalculator();
}

function addCalculatorPage() {
  const nextPage = emptyCalculatorState();
  state.calculatorBook.pages.push(nextPage);
  state.calculator = nextPage;
  state.calculatorBook.activeId = nextPage.id;
  resetCalculatorResourceSelectorState();
  state.calculatorUnitsSelectorOpen = false;
  persistCalculatorState();
  renderCalculatorPages();
  syncCalculatorInputs();
  recalculateCalculator();
  showToast(langText("Nuevo cálculo creado", "New calculation created"));
}

function deleteActiveCalculatorPage() {
  if (state.calculatorBook.pages.length <= 1) {
    const cleared = emptyCalculatorState(state.calculator?.id || "calc-1");
    state.calculatorBook.pages = [cleared];
    state.calculatorBook.activeId = cleared.id;
    state.calculator = cleared;
    resetCalculatorResourceSelectorState();
    state.calculatorUnitsSelectorOpen = false;
    persistCalculatorState();
    syncCalculatorInputs();
    recalculateCalculator();
    showToast(langText("Cálculo eliminado", "Calculation deleted"));
    return;
  }
  const index = calculatorPageIndex();
  state.calculatorBook.pages.splice(index, 1);
  const nextIndex = Math.max(0, index - 1);
  const nextPage = state.calculatorBook.pages[nextIndex];
  state.calculator = nextPage;
  state.calculatorBook.activeId = nextPage.id;
  resetCalculatorResourceSelectorState();
  state.calculatorUnitsSelectorOpen = false;
  persistCalculatorState();
  syncCalculatorInputs();
  recalculateCalculator();
  showToast(langText("Cálculo eliminado", "Calculation deleted"));
}

function applyCalculatorProductSelection(resourceId) {
  const resource = resourceEntry(resourceId);
  if (!resource) return;
  state.calculator.resourceId = Number(resource.id);
  state.calculator.transportUnits = formatTransportUnitsValue(resource.transportUnits || 0);
  resetCalculatorResourceSelectorState();
  persistCalculatorState();
  syncCalculatorInputs();
  recalculateCalculator();
}

function portfolioHoldingKey(resourceId, quality) {
  return `${Number(resourceId || 0)}:${Number(quality || 0)}`;
}

function portfolioGroupKey(resourceId) {
  return `portfolio-resource-${Number(resourceId || 0)}`;
}

function portfolioModeIsNet() {
  return normalizePortfolioValuationMode(state.portfolioValuationMode) === "net";
}

function portfolioViewModeLabel() {
  return portfolioModeIsNet()
    ? langText("Venta neta", "Net sale")
    : langText("Mercado bruto", "Gross market");
}

function portfolioMetricValue(entry, metric) {
  if (!entry) return null;
  const prefix = portfolioModeIsNet() ? "net" : "gross";
  const key = `${prefix}${metric}`;
  return entry[key];
}

function portfolioMetricCoverageFlag(entry) {
  return portfolioModeIsNet()
    ? Boolean(entry?.missingNetPrice)
    : Boolean(entry?.missingPrice);
}

function portfolioCoverageRatio(entries = []) {
  if (!Array.isArray(entries) || !entries.length) return 0;
  const pricedCount = entries.filter((entry) => !portfolioMetricCoverageFlag(entry)).length;
  return (pricedCount / entries.length) * 100;
}

function portfolioTransportPrice() {
  return finiteNumber(state.dashboard?.portfolio?.summary?.transportPrice);
}

function portfolioFeeRate() {
  return finiteNumber(state.dashboard?.portfolio?.summary?.feeRate) ?? PORTFOLIO_FEE_RATE;
}

function portfolioResourceMeta(resourceId) {
  return state.portfolioResourceMetaCache[String(resourceId)]?.data || null;
}

function portfolioResourceMetaError(resourceId) {
  return state.portfolioResourceMetaCache[String(resourceId)]?.error || "";
}

function portfolioResourceMetaLoading(resourceId) {
  return Boolean(state.portfolioResourceMetaPending[String(resourceId)]);
}

function portfolioDraftResourceMeta() {
  return portfolioResourceMeta(state.portfolioDraft.resourceId);
}

function portfolioQualityOptionsForResource(resourceId, extraQuality = null) {
  const metaState = state.portfolioResourceMetaCache[String(resourceId)] || null;
  const meta = metaState?.data || null;
  const baseOptions = Array.isArray(meta?.availableQualities) && meta.availableQualities.length
    ? [...meta.availableQualities]
    : (metaState?.error ? [...PORTFOLIO_IMPORT_QUALITY_OPTIONS] : [0]);
  const normalizedExtraQuality = parseIntegerInput(extraQuality);
  if (Number.isInteger(normalizedExtraQuality) && normalizedExtraQuality >= 0 && normalizedExtraQuality <= 12 && !baseOptions.includes(normalizedExtraQuality)) {
    baseOptions.push(normalizedExtraQuality);
  }
  return [...new Set(baseOptions)]
    .filter((quality) => Number.isInteger(quality) && quality >= 0 && quality <= 12)
    .sort((left, right) => left - right);
}

function portfolioImportApplyResourceMeta(resourceId) {
  const meta = portfolioResourceMeta(resourceId);
  if (!meta) return;
  if (!meta.supportsQualitySelection) {
    state.portfolioImportRows = state.portfolioImportRows.map((row) => (
      Number(row.resourceId) === Number(resourceId)
        ? { ...row, quality: String(meta.fixedQuality ?? 0) }
        : row
    ));
  }
}

async function ensurePortfolioResourceMeta(resourceId, { allowNetwork = true, force = false, silent = true } = {}) {
  const numericResourceId = Number(resourceId);
  if (!Number.isFinite(numericResourceId) || numericResourceId <= 0) return null;
  const cacheKey = String(numericResourceId);
  if (!force && state.portfolioResourceMetaCache[cacheKey]?.data) {
    return state.portfolioResourceMetaCache[cacheKey].data;
  }
  if (state.portfolioResourceMetaPending[cacheKey]) {
    return null;
  }

  state.portfolioResourceMetaPending = {
    ...state.portfolioResourceMetaPending,
    [cacheKey]: true
  };
  renderPortfolioEditor();
  renderPortfolioImport();

  try {
    const meta = await callDesktop("getPortfolioResourceMeta", { resourceId: numericResourceId, allowNetwork });
    state.portfolioResourceMetaCache = {
      ...state.portfolioResourceMetaCache,
      [cacheKey]: { data: meta, error: "" }
    };

    if (Number(state.portfolioDraft.resourceId) === numericResourceId) {
      const draftQuality = parseIntegerInput(state.portfolioDraft.quality);
      const allowedQualities = portfolioQualityOptionsForResource(numericResourceId, draftQuality);
      if (!allowedQualities.includes(draftQuality)) {
        state.portfolioDraft.quality = String(meta?.fixedQuality ?? allowedQualities[0] ?? 0);
      } else if (!meta?.supportsQualitySelection) {
        state.portfolioDraft.quality = String(meta?.fixedQuality ?? draftQuality ?? 0);
      }
    }

    portfolioImportApplyResourceMeta(numericResourceId);
    return meta;
  } catch (error) {
    state.portfolioResourceMetaCache = {
      ...state.portfolioResourceMetaCache,
      [cacheKey]: { data: null, error: error.message || String(error || "") }
    };
    if (!silent) {
      showToast(error.message || langText("No se pudo leer la metadata del producto.", "Could not load the product metadata."), "warn");
    }
    return null;
  } finally {
    const { [cacheKey]: _discarded, ...restPending } = state.portfolioResourceMetaPending;
    state.portfolioResourceMetaPending = restPending;
    renderPortfolioEditor();
    renderPortfolioImport();
  }
}

function canonicalizePortfolioHoldings(holdings = []) {
  const buckets = new Map();
  const order = [];
  (Array.isArray(holdings) ? holdings : []).forEach((rawHolding) => {
    const resourceId = Number(rawHolding?.resourceId);
    const quality = parseIntegerInput(rawHolding?.quality);
    const quantity = parseIntegerInput(rawHolding?.quantity);
    const buyPrice = Number(rawHolding?.buyPrice);
    if (!Number.isFinite(resourceId) || resourceId <= 0) return;
    if (!Number.isInteger(quality) || quality < 0 || quality > 12) return;
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(buyPrice) || buyPrice < 0) return;

    const key = portfolioHoldingKey(resourceId, quality);
    if (!buckets.has(key)) {
      buckets.set(key, {
        id: String(rawHolding?.id || newPortfolioHoldingId()),
        resourceId,
        quality,
        quantity: 0,
        invested: 0,
        createdAt: String(rawHolding?.createdAt || new Date().toISOString())
      });
      order.push(key);
    }
    const bucket = buckets.get(key);
    bucket.quantity += quantity;
    bucket.invested += quantity * buyPrice;
  });

  return order.map((key) => {
    const bucket = buckets.get(key);
    return {
      id: bucket.id,
      resourceId: bucket.resourceId,
      quality: bucket.quality,
      quantity: bucket.quantity,
      buyPrice: bucket.quantity > 0 ? bucket.invested / bucket.quantity : 0,
      createdAt: bucket.createdAt
    };
  });
}

function portfolioPositions() {
  return Array.isArray(state.dashboard?.portfolio?.positions) ? state.dashboard.portfolio.positions : [];
}

function portfolioPositionById(holdingId) {
  return portfolioPositions().find((item) => String(item.id) === String(holdingId)) || null;
}

function newPortfolioHoldingId() {
  return `holding-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function resetPortfolioResourceSelectorState({ keepOpen = false } = {}) {
  state.portfolioResourceSelectorOpen = keepOpen;
  state.portfolioResourceSearch = "";
  state.portfolioResourceActiveGroup = null;
}

function selectedPortfolioHolding() {
  return state.portfolioHoldings.find((item) => String(item.id) === String(state.selectedPortfolioId)) || null;
}

function portfolioRuntimeByKey() {
  const runtime = new Map();
  portfolioPositions().forEach((item) => {
    const resourceId = Number(item?.resourceId);
    const quality = parseIntegerInput(item?.quality);
    if (!Number.isFinite(resourceId) || resourceId <= 0) return;
    if (!Number.isInteger(quality) || quality < 0 || quality > 12) return;
    const key = portfolioHoldingKey(resourceId, quality);
    if (!runtime.has(key)) {
      runtime.set(key, {
        grossCurrentValue: 0,
        netCurrentValue: 0,
        invested: 0,
        quantity: 0,
        grossPricedQuantity: 0,
        netPricedQuantity: 0,
        grossPriceSum: 0,
        grossPriceWeight: 0,
        netPriceSum: 0,
        netPriceWeight: 0,
        priceSourceTime: "",
        resourceName: item?.resourceName || "",
        groupName: item?.groupName || "",
        logoUrl: item?.logoUrl || "",
        transportUnits: Number(item?.transportUnits || 0),
        transportPrice: finiteNumber(item?.transportPrice),
        missingPrice: true,
        missingNetPrice: true
      });
    }
    const bucket = runtime.get(key);
    const quantity = Number(item?.quantity || 0);
    const invested = Number(item?.invested || 0);
    const grossCurrentValue = finiteNumber(item?.grossCurrentValue);
    const grossCurrentPrice = finiteNumber(item?.grossCurrentPrice);
    const netCurrentValue = finiteNumber(item?.netCurrentValue);
    const netCurrentPrice = finiteNumber(item?.netCurrentPrice);
    bucket.quantity += Number.isFinite(quantity) ? quantity : 0;
    bucket.invested += Number.isFinite(invested) ? invested : 0;
    if (!Number.isFinite(bucket.transportPrice)) {
      bucket.transportPrice = finiteNumber(item?.transportPrice);
    }
    if (!bucket.transportUnits) {
      bucket.transportUnits = Number(item?.transportUnits || 0);
    }
    if (Number.isFinite(grossCurrentValue)) {
      bucket.grossCurrentValue += grossCurrentValue;
      bucket.missingPrice = false;
    }
    if (Number.isFinite(netCurrentValue)) {
      bucket.netCurrentValue += netCurrentValue;
      bucket.missingNetPrice = false;
    }
    if (Number.isFinite(grossCurrentPrice) && Number.isFinite(quantity) && quantity > 0) {
      bucket.grossPricedQuantity += quantity;
      bucket.grossPriceSum += grossCurrentPrice * quantity;
      bucket.grossPriceWeight += quantity;
      bucket.priceSourceTime = String(item?.priceSourceTime || bucket.priceSourceTime || "");
    }
    if (Number.isFinite(netCurrentPrice) && Number.isFinite(quantity) && quantity > 0) {
      bucket.netPricedQuantity += quantity;
      bucket.netPriceSum += netCurrentPrice * quantity;
      bucket.netPriceWeight += quantity;
      bucket.priceSourceTime = String(item?.priceSourceTime || bucket.priceSourceTime || "");
    }
  });
  return runtime;
}

function populatePortfolioDraft(holding) {
  if (!holding) {
    state.portfolioDraft = emptyPortfolioDraft();
    state.portfolioDirty = false;
    resetPortfolioResourceSelectorState();
    return;
  }
  state.portfolioDraft = {
    id: String(holding.id || ""),
    resourceId: holding.resourceId === "" || holding.resourceId === null || holding.resourceId === undefined ? "" : String(holding.resourceId),
    quality: String(holding.quality ?? 0),
    quantity: String(holding.quantity ?? ""),
    buyPrice: String(holding.buyPrice ?? ""),
    createdAt: String(holding.createdAt || "")
  };
  state.portfolioDirty = false;
  resetPortfolioResourceSelectorState();
  if (Number(holding.resourceId) > 0) {
    ensurePortfolioResourceMeta(holding.resourceId, { allowNetwork: true, silent: true }).catch(() => {});
  }
}

function syncPortfolioStateFromDashboard(dashboard) {
  const nextHoldings = canonicalizePortfolioHoldings(clone(dashboard?.config?.portfolio || []));
  const selectedStillExists = nextHoldings.some((item) => String(item.id) === String(state.selectedPortfolioId));
  const selectedGroupStillExists = nextHoldings.some((item) => portfolioGroupKey(item.resourceId) === state.selectedPortfolioGroupKey);
  state.portfolioHoldings = nextHoldings;
  if (!selectedStillExists) {
    state.selectedPortfolioId = null;
  }
  if (!selectedGroupStillExists) {
    state.selectedPortfolioGroupKey = nextHoldings[0] ? portfolioGroupKey(nextHoldings[0].resourceId) : null;
  }
  if (!state.portfolioDirty) {
    const selected = nextHoldings.find((item) => String(item.id) === String(state.selectedPortfolioId)) || null;
    if (selected) {
      state.selectedPortfolioId = selected.id;
      state.selectedPortfolioGroupKey = portfolioGroupKey(selected.resourceId);
    }
    populatePortfolioDraft(selected);
  }
}

function portfolioMergedHolding(holding = selectedPortfolioHolding()) {
  if (!holding) return null;
  const runtime = portfolioRuntimeByKey().get(portfolioHoldingKey(holding.resourceId, holding.quality)) || {};
  const resource = resourceEntry(holding.resourceId);
  const resourceId = Number(holding.resourceId || runtime.resourceId || 0);
  const quantity = Number(holding.quantity || 0);
  const buyPrice = Number(holding.buyPrice || 0);
  const invested = quantity * buyPrice;
  const grossCurrentPrice = runtime.grossPriceWeight > 0 ? runtime.grossPriceSum / runtime.grossPriceWeight : null;
  const grossCurrentValue = Number.isFinite(grossCurrentPrice) ? grossCurrentPrice * quantity : null;
  const grossPnl = Number.isFinite(grossCurrentValue) ? grossCurrentValue - invested : null;
  const grossPnlPct = invested > 0 && Number.isFinite(grossPnl) ? (grossPnl / invested) * 100 : null;
  const netCurrentPrice = runtime.netPriceWeight > 0 ? runtime.netPriceSum / runtime.netPriceWeight : null;
  const netCurrentValue = Number.isFinite(netCurrentPrice) ? netCurrentPrice * quantity : null;
  const netPnl = Number.isFinite(netCurrentValue) ? netCurrentValue - invested : null;
  const netPnlPct = invested > 0 && Number.isFinite(netPnl) ? (netPnl / invested) * 100 : null;
  return {
    ...holding,
    resourceId,
    resourceName: runtime.resourceName || resourceLabel(resourceId),
    groupName: runtime.groupName || catalogItemGroup(resource),
    logoUrl: runtime.logoUrl || resource?.logoUrl || "",
    quantity,
    buyPrice,
    invested,
    transportUnits: Number(runtime.transportUnits || resource?.transportUnits || 0),
    transportPrice: finiteNumber(runtime.transportPrice),
    grossCurrentPrice,
    grossCurrentValue,
    grossPnl,
    grossPnlPct,
    netCurrentPrice,
    netCurrentValue,
    netPnl,
    netPnlPct,
    currentPrice: grossCurrentPrice,
    currentValue: grossCurrentValue,
    pnl: grossPnl,
    pnlPct: grossPnlPct,
    priceSourceTime: runtime.priceSourceTime || "",
    missingPrice: runtime.missingPrice ?? !Number.isFinite(grossCurrentPrice),
    missingNetPrice: runtime.missingNetPrice ?? !Number.isFinite(netCurrentPrice)
  };
}

function portfolioDisplayPositions() {
  return canonicalizePortfolioHoldings(state.portfolioHoldings).map((holding) => portfolioMergedHolding(holding)).filter(Boolean);
}

function portfolioDisplayCurrentUnit(entry) {
  const currentPrice = portfolioMetricValue(entry, "CurrentPrice");
  if (Number.isFinite(currentPrice)) return formatCurrency(currentPrice);
  const pricedQualityCount = portfolioModeIsNet()
    ? Number(entry?.netPricedQualityCount || 0)
    : Number(entry?.grossPricedQualityCount || 0);
  if (pricedQualityCount > 0 && Number(entry?.qualityCount || 0) > pricedQualityCount) {
    return langText("Mixto", "Mixed");
  }
  return "—";
}

function portfolioResultLabel(entry) {
  const pnl = portfolioMetricValue(entry, "Pnl");
  const pnlPct = portfolioMetricValue(entry, "PnlPct");
  if (!Number.isFinite(pnl)) {
    return langText("Sin precio", "No price");
  }
  const pct = Number.isFinite(pnlPct)
    ? ` · ${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`
    : "";
  return `${formatCurrency(pnl)}${pct}`;
}

function portfolioGroupedPositions() {
  const groups = new Map();
  portfolioDisplayPositions().forEach((position) => {
    const key = portfolioGroupKey(position.resourceId);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        resourceId: position.resourceId,
        resourceName: position.resourceName,
        groupName: position.groupName,
        logoUrl: position.logoUrl,
        quantity: 0,
        invested: 0,
        grossPricedInvested: 0,
        grossCurrentValue: 0,
        netPricedInvested: 0,
        netCurrentValue: 0,
        priceSourceTime: position.priceSourceTime || "",
        qualityCount: 0,
        grossPricedQualityCount: 0,
        netPricedQualityCount: 0,
        qualities: []
      });
    }
    const group = groups.get(key);
    group.quantity += Number(position.quantity || 0);
    group.invested += Number(position.invested || 0);
    group.qualityCount += 1;
    group.qualities.push(position);
    if (Number.isFinite(position.grossCurrentValue)) {
      group.grossCurrentValue += position.grossCurrentValue;
      group.grossPricedInvested += Number(position.invested || 0);
      group.grossPricedQualityCount += 1;
      if (!group.priceSourceTime && position.priceSourceTime) {
        group.priceSourceTime = position.priceSourceTime;
      }
    }
    if (Number.isFinite(position.netCurrentValue)) {
      group.netCurrentValue += position.netCurrentValue;
      group.netPricedInvested += Number(position.invested || 0);
      group.netPricedQualityCount += 1;
      if (!group.priceSourceTime && position.priceSourceTime) {
        group.priceSourceTime = position.priceSourceTime;
      }
    }
  });

  return Array.from(groups.values()).map((group) => {
    const quantity = Number(group.quantity || 0);
    const invested = Number(group.invested || 0);
    const buyPrice = quantity > 0 ? invested / quantity : 0;
    const grossCurrentPrice = group.grossPricedQualityCount === group.qualityCount && quantity > 0
      ? group.grossCurrentValue / quantity
      : null;
    const grossPnl = group.grossPricedQualityCount > 0 ? group.grossCurrentValue - group.grossPricedInvested : null;
    const grossPnlPct = group.grossPricedInvested > 0 && Number.isFinite(grossPnl)
      ? (grossPnl / group.grossPricedInvested) * 100
      : null;
    const netCurrentPrice = group.netPricedQualityCount === group.qualityCount && quantity > 0
      ? group.netCurrentValue / quantity
      : null;
    const netPnl = group.netPricedQualityCount > 0 ? group.netCurrentValue - group.netPricedInvested : null;
    const netPnlPct = group.netPricedInvested > 0 && Number.isFinite(netPnl)
      ? (netPnl / group.netPricedInvested) * 100
      : null;
    return {
      ...group,
      qualities: [...group.qualities].sort((left, right) => Number(left.quality || 0) - Number(right.quality || 0)),
      buyPrice,
      grossCurrentPrice,
      grossPnl,
      grossPnlPct,
      netCurrentPrice,
      netPnl,
      netPnlPct,
      currentPrice: grossCurrentPrice,
      currentValue: group.grossCurrentValue,
      pnl: grossPnl,
      pnlPct: grossPnlPct,
      pricedInvested: group.grossPricedInvested,
      pricedQualityCount: group.grossPricedQualityCount,
      missingPrice: group.grossPricedQualityCount !== group.qualityCount,
      missingNetPrice: group.netPricedQualityCount !== group.qualityCount
    };
  });
}

function portfolioSelectedGroup() {
  const groups = portfolioGroupedPositions();
  if (!groups.length) return null;
  const selectedPosition = selectedPortfolioHolding();
  if (selectedPosition) {
    return groups.find((group) => group.key === portfolioGroupKey(selectedPosition.resourceId)) || groups[0];
  }
  if (state.selectedPortfolioGroupKey) {
    return groups.find((group) => group.key === state.selectedPortfolioGroupKey) || groups[0];
  }
  return groups[0];
}

function ensurePortfolioSelection() {
  const positions = portfolioDisplayPositions();
  const groups = portfolioGroupedPositions();
  if (state.selectedPortfolioId && !positions.some((item) => String(item.id) === String(state.selectedPortfolioId))) {
    state.selectedPortfolioId = null;
  }
  if (state.selectedPortfolioGroupKey && !groups.some((item) => item.key === state.selectedPortfolioGroupKey)) {
    state.selectedPortfolioGroupKey = null;
  }
  if (!state.selectedPortfolioGroupKey && groups.length) {
    state.selectedPortfolioGroupKey = groups[0].key;
  }
  if (state.selectedPortfolioId) {
    const selected = positions.find((item) => String(item.id) === String(state.selectedPortfolioId));
    if (selected) {
      state.selectedPortfolioGroupKey = portfolioGroupKey(selected.resourceId);
    }
  }
}

function filteredPortfolioGroups() {
  const query = normalizeSearch(state.portfolioSearch);
  const groups = portfolioGroupedPositions().filter((group) => {
    const activePnl = portfolioMetricValue(group, "Pnl");
    if (state.portfolioFilter === "gain") return Number(activePnl || 0) > 0;
    if (state.portfolioFilter === "loss") return Number(activePnl || 0) < 0;
    return true;
  });
  if (!query) return groups;
  return groups.filter((group) => normalizeSearch([
    group.resourceName,
    group.groupName,
    group.resourceId,
    ...group.qualities.map((quality) => qualityLabel(quality.quality))
  ].join(" ")).includes(query));
}

function filteredPortfolioResourceCatalog(query = state.portfolioResourceSearch) {
  const normalized = normalizeSearch(query);
  if (!normalized) return resourceCatalog();
  return resourceCatalog().filter((item) => resourceSearchTokens(item).includes(normalized));
}

function filteredPortfolioResourceGroups() {
  const grouped = new Map();
  resourceCatalog().forEach((item) => {
    const key = item.groupKey || item.group || VARIOS_LABEL;
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        name: catalogItemGroup(item),
        items: []
      });
    }
    grouped.get(key).items.push(item);
  });
  const filtered = filteredPortfolioResourceCatalog();
  return [...grouped.values()]
    .map((entry) => {
      const matchedItems = entry.items.filter((item) => filtered.some((filteredItem) => Number(filteredItem.id) === Number(item.id)));
      return {
        ...entry,
        visibleCount: matchedItems.length,
        matchedItems
      };
    })
    .filter((entry) => entry.visibleCount > 0);
}

function filteredPortfolioResourcesInActiveGroup() {
  const group = state.portfolioResourceActiveGroup;
  if (!group) return [];
  return filteredPortfolioResourceCatalog().filter((item) => (item.groupKey || item.group) === group);
}

function portfolioResourceSelectionSummary() {
  const selected = resourceEntry(state.portfolioDraft.resourceId);
  if (!selected) {
    return {
      title: t("noProductSelected"),
      subtitle: t("productAutofillCopy")
    };
  }
  return {
    title: catalogItemLabel(selected),
    subtitle: `${catalogItemGroup(selected)} · ${selected.apiName} · ID ${selected.id}`
  };
}

function portfolioResourceCrumbsMarkup() {
  if (!state.portfolioResourceActiveGroup) {
    return `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Groups" : "Rubros")}</span>`;
  }
  return [
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Group" : "Rubro")}</span>`,
    `<span class="selector-tag">${escapeHtml(resourceGroups().find((entry) => entry.key === state.portfolioResourceActiveGroup)?.name || displayGroupName(state.portfolioResourceActiveGroup))}</span>`,
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Assets" : "Activos")}</span>`
  ].join("");
}

function portfolioResourceSelectorOptionsMarkup() {
  if (!state.portfolioResourceActiveGroup) {
    const groups = filteredPortfolioResourceGroups();
    if (!groups.length) {
      return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No groups match the search." : "No hay rubros que coincidan con la búsqueda.")}</div>`;
    }
    return groups.map((entry) => `
      <button class="selector-option" type="button" data-portfolio-action="open-group" data-resource-group="${escapeHtml(entry.key)}">
        <div class="selector-option-main">
          ${avatarMarkup({ resourceName: entry.name, logoUrl: entry.items[0]?.logoUrl }, "R")}
          <span>${escapeHtml(entry.name)}</span>
        </div>
        <small>${escapeHtml(state.language === "en" ? `${entry.visibleCount} asset${entry.visibleCount === 1 ? "" : "s"}` : `${entry.visibleCount} activos`)}</small>
      </button>
    `).join("");
  }

  const items = filteredPortfolioResourcesInActiveGroup();
  if (!items.length) {
    return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No assets match the search." : "No hay activos que coincidan con la búsqueda.")}</div>`;
  }

  return items.map((item) => `
    <button class="selector-option${Number(item.id) === Number(state.portfolioDraft.resourceId) ? " active" : ""}" type="button" data-portfolio-action="select-resource" data-resource-id="${item.id}">
      <div class="selector-option-main">
        ${avatarMarkup({ resourceId: item.id, resourceName: catalogItemLabel(item), logoUrl: item.logoUrl }, "A")}
        <span>${escapeHtml(catalogItemLabel(item))}</span>
      </div>
      <small>${escapeHtml(item.apiName)} · ID ${item.id}</small>
    </button>
  `).join("");
}

function focusPortfolioResourceSearch() {
  window.requestAnimationFrame(() => {
    const input = byId("portfolioResourceSearch");
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

async function applyPortfolioProductSelection(resourceId) {
  const resource = resourceEntry(resourceId);
  if (!resource) return;
  state.portfolioDraft.resourceId = String(resource.id);
  state.portfolioDraft.quality = "0";
  state.portfolioDirty = true;
  resetPortfolioResourceSelectorState();
  renderPortfolioView();
  await ensurePortfolioResourceMeta(resource.id, { allowNetwork: true, silent: true });
  renderPortfolioView();
}

function normalizePortfolioDraftOrThrow() {
  const resourceId = Number(state.portfolioDraft.resourceId);
  const quality = parseIntegerInput(state.portfolioDraft.quality);
  const quantity = parseIntegerInput(state.portfolioDraft.quantity);
  const buyPrice = parseLocaleDecimal(state.portfolioDraft.buyPrice);

  if (!Number.isFinite(resourceId) || resourceId <= 0) {
    throw new Error(langText("Seleccioná un producto para la posición.", "Select a product for the position."));
  }
  if (!Number.isInteger(quality) || quality < 0 || quality > 12) {
    throw new Error(langText("La calidad debe estar entre Q0 y Q12.", "Quality must be between Q0 and Q12."));
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(langText("La cantidad debe ser mayor a 0.", "Quantity must be greater than 0."));
  }
  if (!Number.isFinite(buyPrice) || buyPrice < 0) {
    throw new Error(langText("Ingresá un precio de compra válido.", "Enter a valid purchase price."));
  }

  return {
    id: state.portfolioDraft.id || newPortfolioHoldingId(),
    resourceId,
    quality,
    quantity,
    buyPrice,
    createdAt: state.portfolioDraft.createdAt || new Date().toISOString()
  };
}

function startNewPortfolioDraft() {
  state.selectedPortfolioId = null;
  state.portfolioChartHoverTime = "";
  populatePortfolioDraft(null);
  renderPortfolioView();
}

function portfolioChartToneClass(value) {
  if (!Number.isFinite(value) || value === 0) return "";
  return value > 0 ? "positive" : "negative";
}

function portfolioChartModeValueKey() {
  return portfolioModeIsNet() ? "netValue" : "grossValue";
}

function portfolioVisibleChartPoints(chart) {
  const valueKey = portfolioChartModeValueKey();
  const range = normalizePortfolioChartRange(state.portfolioChartRange);
  const points = (Array.isArray(chart?.points) ? chart.points : [])
    .map((point) => ({
      time: String(point?.time || "").trim(),
      value: finiteNumber(point?.[valueKey])
    }))
    .filter((point) => point.time && Number.isFinite(point.value));
  if (!points.length) return [];
  return points.slice(-Math.min(range, points.length));
}

function selectedPortfolioChartPoint(points = []) {
  if (!Array.isArray(points) || !points.length) return null;
  return points.find((point) => point.time === state.portfolioChartHoverTime)
    || points.find((point) => point.time === state.portfolioChartSelectedTime)
    || points[points.length - 1];
}

function portfolioChartGeometryFromState() {
  const chart = state.dashboard?.portfolio?.chart || null;
  return buildPortfolioChartGeometry(chart);
}

function portfolioChartTimeFromPointer(event, surfaceElement) {
  if (!(event instanceof MouseEvent) || !(surfaceElement instanceof Element)) return "";
  const geometry = portfolioChartGeometryFromState();
  if (!geometry?.points?.length) return "";
  const svg = surfaceElement.closest("svg");
  if (!(svg instanceof SVGElement)) return "";
  const rect = svg.getBoundingClientRect();
  if (!rect.width) return geometry.points[geometry.points.length - 1]?.time || "";
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const chartX = ratio * geometry.width;
  const nearest = geometry.points.reduce((best, point) => {
    if (!best) return point;
    return Math.abs(point.x - chartX) < Math.abs(best.x - chartX) ? point : best;
  }, null);
  return nearest?.time || "";
}

function portfolioChartSmoothPath(points = []) {
  if (!Array.isArray(points) || !points.length) return "";
  if (points.length === 1) {
    return `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }
  if (points.length === 2) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
  }

  let path = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] || next;
    const controlPoint1X = current.x + ((next.x - previous.x) / 6);
    const controlPoint1Y = current.y + ((next.y - previous.y) / 6);
    const controlPoint2X = next.x - ((afterNext.x - current.x) / 6);
    const controlPoint2Y = next.y - ((afterNext.y - current.y) / 6);
    path += ` C${controlPoint1X.toFixed(2)} ${controlPoint1Y.toFixed(2)}, ${controlPoint2X.toFixed(2)} ${controlPoint2Y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }
  return path;
}

function buildPortfolioChartGeometry(chart) {
  const points = portfolioVisibleChartPoints(chart);
  if (!points.length) return null;

  const width = 420;
  const height = 184;
  const plotTop = 18;
  const plotBottom = height - 18;
  const values = points.map((point) => point.value);
  const rawMinValue = Math.min(...values);
  const rawMaxValue = Math.max(...values);
  let minValue = rawMinValue;
  let maxValue = rawMaxValue;
  if (rawMinValue === rawMaxValue) {
    const offset = Math.max(Math.abs(rawMinValue) * 0.03, 1);
    minValue = rawMinValue - offset;
    maxValue = rawMaxValue + offset;
  } else {
    const padding = Math.max((rawMaxValue - rawMinValue) * 0.08, 1);
    minValue = rawMinValue - padding;
    maxValue = rawMaxValue + padding;
  }
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const toY = (value) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    return plotBottom - (ratio * (plotBottom - plotTop));
  };
  const selected = selectedPortfolioChartPoint(points);
  const coordinates = points.map((point, index) => {
    const previousPoint = index > 0 ? points[index - 1] : null;
    const changeFromStart = Math.abs(points[0].value) > 0.000001
      ? ((point.value - points[0].value) / points[0].value) * 100
      : null;
    const changeFromPrevious = previousPoint && Math.abs(previousPoint.value) > 0.000001
      ? ((point.value - previousPoint.value) / previousPoint.value) * 100
      : null;
    return {
      x: stepX * index,
      y: Math.max(plotTop, Math.min(plotBottom, toY(point.value))),
      value: point.value,
      time: point.time,
      active: selected ? point.time === selected.time : index === points.length - 1,
      previousValue: previousPoint?.value ?? null,
      changeFromStart,
      changeFromPrevious,
      fullDateLabel: formatPortfolioChartDate(point.time)
    };
  });
  const linePath = portfolioChartSmoothPath(coordinates);
  const areaPath = `${linePath} L${coordinates[coordinates.length - 1].x.toFixed(2)} ${plotBottom.toFixed(2)} L${coordinates[0].x.toFixed(2)} ${plotBottom.toFixed(2)} Z`;
  const selectedCoordinate = coordinates.find((point) => point.active) || coordinates[coordinates.length - 1];
  const selectedChange = selectedCoordinate.changeFromStart;
  const selectedMove = selectedCoordinate.changeFromPrevious;
  const midValue = rawMinValue + ((rawMaxValue - rawMinValue) / 2);
  const midY = Math.max(plotTop, Math.min(plotBottom, toY(midValue)));
  return {
    width,
    height,
    plotTop,
    plotBottom,
    linePath,
    areaPath,
    points: coordinates,
    selected: selectedCoordinate,
    startLabel: formatShortDate(coordinates[0]?.time),
    endLabel: formatShortDate(coordinates[coordinates.length - 1]?.time),
    selectedChange,
    selectedMove,
    midY,
    minLabel: formatPortfolioChartScaleCurrency(rawMinValue),
    midLabel: formatPortfolioChartScaleCurrency(midValue),
    maxLabel: formatPortfolioChartScaleCurrency(rawMaxValue)
  };
}

function portfolioChartMarkup(chart) {
  const geometry = buildPortfolioChartGeometry(chart);
  if (!geometry) {
    return `
      <div class="portfolio-chart-empty">
        <div class="portfolio-chart-empty-title">${escapeHtml(portfolioModeIsNet() ? langText("Sin curva neta disponible", "No net curve available") : langText("Sin histórico suficiente", "Not enough history"))}</div>
        <div class="portfolio-chart-empty-copy">${escapeHtml(portfolioModeIsNet() ? langText("La vista neta aparece cuando hay precio del activo y del transporte para estimar la venta real.", "The net view appears once both asset and transport prices are available to estimate the real sale.") : langText("La curva se completa cuando haya serie externa disponible para tus posiciones.", "The curve fills in once external history is available for your holdings."))}</div>
      </div>
    `;
  }

  return `
    <div class="portfolio-chart-shell">
      <div class="portfolio-chart-head">
        <div class="portfolio-chart-head-main">
          <span class="portfolio-chart-kicker">${escapeHtml(langText("Valor de la cartera en la fecha marcada", "Portfolio value on the highlighted date"))}</span>
          <strong class="portfolio-chart-active-value">${escapeHtml(formatCurrency(geometry.selected.value))}</strong>
          <span class="portfolio-chart-meta">
            ${escapeHtml(geometry.selected.fullDateLabel)}
            ${Number.isFinite(geometry.selectedMove) ? ` · ${escapeHtml(`${langText("Diario", "Daily")} ${geometry.selectedMove >= 0 ? "+" : ""}${geometry.selectedMove.toFixed(2)}%`)}` : ""}
            ${Number.isFinite(geometry.selectedChange) ? ` · ${escapeHtml(`${langText("Rango", "Range")} ${geometry.selectedChange >= 0 ? "+" : ""}${geometry.selectedChange.toFixed(2)}%`)}` : ""}
          </span>
        </div>
        <div class="portfolio-chart-controls" role="group" aria-label="${escapeHtml(langText("Rango del gráfico", "Chart range"))}">
          ${PORTFOLIO_CHART_RANGE_OPTIONS.map((range) => `
            <button class="chart-range-btn${normalizePortfolioChartRange(state.portfolioChartRange) === range ? " active" : ""}" type="button" data-portfolio-action="set-chart-range" data-chart-range="${range}">
              ${range}D
            </button>
          `).join("")}
        </div>
      </div>
      <div class="portfolio-chart-stage">
        <svg class="portfolio-chart-svg" viewBox="0 0 ${geometry.width} ${geometry.height}" role="img" aria-label="${escapeHtml(langText("Evolución agregada de la cartera", "Aggregated portfolio evolution"))}">
          <defs>
            <linearGradient id="portfolioChartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(86, 192, 122, 0.28)"></stop>
              <stop offset="100%" stop-color="rgba(86, 192, 122, 0.03)"></stop>
            </linearGradient>
            <linearGradient id="portfolioChartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#65d28c"></stop>
              <stop offset="55%" stop-color="#56c07a"></stop>
              <stop offset="100%" stop-color="#f0c95d"></stop>
            </linearGradient>
            <filter id="portfolioChartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.8" result="blur"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="blur"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
          </defs>
          <line class="portfolio-chart-grid" x1="0" y1="${geometry.plotTop}" x2="${geometry.width}" y2="${geometry.plotTop}"></line>
          <line class="portfolio-chart-grid" x1="0" y1="${geometry.midY.toFixed(2)}" x2="${geometry.width}" y2="${geometry.midY.toFixed(2)}"></line>
          <line class="portfolio-chart-grid" x1="0" y1="${geometry.plotBottom}" x2="${geometry.width}" y2="${geometry.plotBottom}"></line>
          <text class="portfolio-chart-label" x="0" y="${Math.max(10, geometry.plotTop - 6)}">${escapeHtml(geometry.maxLabel)}</text>
          <text class="portfolio-chart-label" x="0" y="${Math.max(geometry.plotTop + 10, geometry.midY - 6)}">${escapeHtml(geometry.midLabel)}</text>
          <text class="portfolio-chart-label" x="0" y="${geometry.height - 2}">${escapeHtml(geometry.minLabel)}</text>
          <path class="portfolio-chart-area" d="${geometry.areaPath}"></path>
          <path class="portfolio-chart-line-glow" d="${geometry.linePath}"></path>
          <path class="portfolio-chart-line" d="${geometry.linePath}"></path>
          <line class="portfolio-chart-focus-line" x1="${geometry.selected.x.toFixed(2)}" y1="${geometry.plotTop}" x2="${geometry.selected.x.toFixed(2)}" y2="${geometry.plotBottom.toFixed(2)}"></line>
          <rect class="portfolio-chart-overlay" x="0" y="${geometry.plotTop}" width="${geometry.width}" height="${(geometry.plotBottom - geometry.plotTop).toFixed(2)}" data-portfolio-action="hover-chart-surface"></rect>
          ${geometry.points.map((point) => `
            <circle class="portfolio-chart-point${point.active ? " active" : ""}" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${point.active ? "3.2" : "1.7"}"></circle>
          `).join("")}
        </svg>
      </div>
      <div class="portfolio-chart-foot">
        <span>${escapeHtml(geometry.startLabel)}</span>
        <span>${escapeHtml(geometry.endLabel)}</span>
      </div>
    </div>
  `;
}

function portfolioCurrentUnitHeading() {
  return portfolioModeIsNet()
    ? langText("Neto/u", "Net/u")
    : langText("Actual/u", "Current/u");
}

function portfolioCurrentValueHeading() {
  return portfolioModeIsNet()
    ? langText("Venta neta", "Net sale value")
    : langText("Valor", "Value");
}

function portfolioPnlHeading() {
  return portfolioModeIsNet()
    ? langText("Resultado real", "Real P/L")
    : langText("Resultado", "P/L");
}

function portfolioSelectedCardMarkup() {
  ensurePortfolioSelection();
  const position = portfolioMergedHolding(selectedPortfolioHolding());
  const group = portfolioSelectedGroup();
  if (!position && !group) {
    return `
      <div class="portfolio-empty-state">
        <div class="portfolio-empty-title">${escapeHtml(langText("Sin posiciones cargadas", "No positions loaded"))}</div>
        <div class="portfolio-empty-copy">${escapeHtml(langText("Elegí producto, cantidad y precio de compra para empezar a seguir tu inventario.", "Pick a product, quantity, and purchase price to start tracking your inventory."))}</div>
      </div>
    `;
  }
  if (position) {
    const activePnl = portfolioMetricValue(position, "Pnl");
    const activeCurrentValue = portfolioMetricValue(position, "CurrentValue");
    const transportPrice = finiteNumber(position.transportPrice);
    const transportUnits = Number(position.transportUnits || 0);
    const transportCostPerUnit = Number.isFinite(transportPrice) ? transportUnits * transportPrice : null;
    return `
      <div class="summary-top">
        ${avatarMarkup({ resourceId: position.resourceId, resourceName: position.resourceName, logoUrl: position.logoUrl }, "P")}
        <div class="summary-title">
          <div class="summary-name">${escapeHtml(position.resourceName)}</div>
          <div class="summary-meta">${escapeHtml(position.groupName)} · ${escapeHtml(qualityLabel(position.quality))} · ID ${escapeHtml(position.resourceId)}</div>
        </div>
        <span class="badge ${activePnl > 0 ? "badge-match" : activePnl < 0 ? "badge-error" : "badge-idle"}">${escapeHtml(qualityLabel(position.quality))}</span>
      </div>
      <div class="summary-metrics">
        <div class="metric-box"><span>${escapeHtml(langText("Cantidad", "Quantity"))}</span><strong>${escapeHtml(Number(position.quantity).toLocaleString(numberLocale()))}</strong></div>
        <div class="metric-box"><span>${escapeHtml(langText("Compra/u", "Buy/u"))}</span><strong>${escapeHtml(formatCurrency(position.buyPrice))}</strong></div>
        <div class="metric-box"><span>${escapeHtml(portfolioCurrentUnitHeading())}</span><strong>${escapeHtml(portfolioDisplayCurrentUnit(position))}</strong></div>
      </div>
      <div class="summary-line"><strong>${escapeHtml(langText("Invertido:", "Invested:"))}</strong> ${escapeHtml(formatCurrency(position.invested))}</div>
      <div class="summary-line"><strong>${escapeHtml(portfolioModeIsNet() ? langText("Venta neta estimada:", "Estimated net sale:") : langText("Valor actual:", "Current value:"))}</strong> ${escapeHtml(Number.isFinite(activeCurrentValue) ? formatCurrency(activeCurrentValue) : "—")}</div>
      <div class="summary-line"><strong>${escapeHtml(portfolioModeIsNet() ? langText("Resultado real:", "Real P/L:") : langText("Resultado:", "P/L:"))}</strong> <span class="${portfolioChartToneClass(activePnl)}">${escapeHtml(portfolioResultLabel(position))}</span></div>
      ${portfolioModeIsNet() ? `
        <div class="summary-line"><strong>${escapeHtml(langText("Fee de venta:", "Sell fee:"))}</strong> ${escapeHtml(`${(portfolioFeeRate() * 100).toFixed(0)}%`)}</div>
        <div class="summary-line"><strong>${escapeHtml(langText("Transporte/u:", "Transport/u:"))}</strong> ${escapeHtml(`${formatNumber(transportUnits)} × ${Number.isFinite(transportPrice) ? formatCurrency(transportPrice) : "—"}${Number.isFinite(transportCostPerUnit) ? ` = ${formatCurrency(transportCostPerUnit)}` : ""}`)}</div>
      ` : ""}
      <div class="summary-actions">
        <button class="action-btn action-btn-danger" type="button" data-portfolio-action="delete-group">${escapeHtml(langText("Eliminar producto completo", "Delete full product"))}</button>
      </div>
    `;
  }

  const activePnl = portfolioMetricValue(group, "Pnl");
  const activeCurrentValue = portfolioMetricValue(group, "CurrentValue");
  return `
    <div class="summary-top">
      ${avatarMarkup({ resourceId: group.resourceId, resourceName: group.resourceName, logoUrl: group.logoUrl }, "P")}
      <div class="summary-title">
        <div class="summary-name">${escapeHtml(group.resourceName)}</div>
        <div class="summary-meta">${escapeHtml(group.groupName)} · ${escapeHtml(langText(`${group.qualityCount} calidades`, `${group.qualityCount} qualities`))} · ID ${escapeHtml(group.resourceId)}</div>
      </div>
      <span class="badge ${activePnl > 0 ? "badge-match" : activePnl < 0 ? "badge-error" : "badge-idle"}">${escapeHtml(langText(`${group.qualityCount} Q`, `${group.qualityCount} Q`))}</span>
    </div>
    <div class="summary-metrics">
      <div class="metric-box"><span>${escapeHtml(langText("Cantidad", "Quantity"))}</span><strong>${escapeHtml(Number(group.quantity).toLocaleString(numberLocale()))}</strong></div>
      <div class="metric-box"><span>${escapeHtml(langText("Compra prom/u", "Avg buy/u"))}</span><strong>${escapeHtml(formatCurrency(group.buyPrice))}</strong></div>
      <div class="metric-box"><span>${escapeHtml(portfolioModeIsNet() ? langText("Neto prom/u", "Avg net/u") : langText("Actual prom/u", "Avg current/u"))}</span><strong>${escapeHtml(portfolioDisplayCurrentUnit(group))}</strong></div>
    </div>
    <div class="summary-line"><strong>${escapeHtml(langText("Invertido:", "Invested:"))}</strong> ${escapeHtml(formatCurrency(group.invested))}</div>
    <div class="summary-line"><strong>${escapeHtml(portfolioModeIsNet() ? langText("Venta neta estimada:", "Estimated net sale:") : langText("Valor actual:", "Current value:"))}</strong> ${escapeHtml(Number.isFinite(activeCurrentValue) ? formatCurrency(activeCurrentValue) : "—")}</div>
    <div class="summary-line"><strong>${escapeHtml(portfolioModeIsNet() ? langText("Resultado real:", "Real P/L:") : langText("Resultado:", "P/L:"))}</strong> <span class="${portfolioChartToneClass(activePnl)}">${escapeHtml(portfolioResultLabel(group))}</span></div>
    ${portfolioModeIsNet() ? `<div class="summary-line"><strong>${escapeHtml(langText("Fee + transporte actual:", "Current fee + transport:"))}</strong> ${escapeHtml(langText("Aplicado a todas las calidades con precio disponible.", "Applied to all priced qualities."))}</div>` : ""}
    <div class="summary-actions">
      <button class="action-btn action-btn-danger" type="button" data-portfolio-action="delete-group">${escapeHtml(langText("Eliminar producto completo", "Delete full product"))}</button>
    </div>
  `;
}

function portfolioEditorMarkup() {
  const draft = state.portfolioDraft;
  const selectedResource = resourceEntry(draft.resourceId);
  const selector = portfolioResourceSelectionSummary();
  const visibleItems = state.portfolioResourceActiveGroup
    ? filteredPortfolioResourcesInActiveGroup().length
    : filteredPortfolioResourceGroups().length;
  const resourceMeta = portfolioDraftResourceMeta();
  const qualityOptions = selectedResource
    ? portfolioQualityOptionsForResource(draft.resourceId, draft.quality)
    : [0];
  const fixedQuality = resourceMeta?.fixedQuality ?? qualityOptions[0] ?? 0;
  const resolvedDraftQuality = Number.isInteger(parseIntegerInput(draft.quality))
    ? parseIntegerInput(draft.quality)
    : fixedQuality;
  const resourceMetaError = portfolioResourceMetaError(draft.resourceId);
  const shouldLockQuality = Boolean(selectedResource) && !portfolioResourceMetaLoading(draft.resourceId) && resourceMeta && !resourceMeta.supportsQualitySelection;
  const qualityHint = !selectedResource
    ? ""
    : portfolioResourceMetaLoading(draft.resourceId)
      ? langText("Leyendo calidades del producto…", "Reading product qualities…")
      : (!resourceMeta && resourceMetaError)
        ? langText("No pude validar las calidades en vivo. Te dejo elegir manualmente para no bloquear la carga.", "I could not validate the live qualities. Manual selection is enabled so the entry stays unblocked.")
        : (!resourceMeta)
          ? langText("Todavía no hay metadata suficiente para decidir la calidad.", "There is not enough metadata yet to decide the quality.")
      : resourceMeta?.supportsQualitySelection
        ? langText(`Calidades detectadas: ${qualityOptions.map((quality) => qualityLabel(quality)).join(", ")}`, `Detected qualities: ${qualityOptions.map((quality) => qualityLabel(quality)).join(", ")}`)
        : langText("Este producto trabaja en Q0 según la lectura actual.", "This product is currently operating in Q0.")
          + (resourceMetaError ? ` ${langText("La validación en vivo falló y se conservó la mejor metadata local.", "Live validation failed, so the best local metadata was kept.")}` : "");
  return `
    <div class="editor-card">
      <div class="summary-top">
        ${avatarMarkup({ resourceId: draft.resourceId, resourceName: selectedResource ? catalogItemLabel(selectedResource) : langText("Nueva posición", "New position"), logoUrl: selectedResource?.logoUrl || "" }, "P")}
        <div class="summary-title">
          <div class="summary-name">${escapeHtml(selectedResource ? catalogItemLabel(selectedResource) : langText("Nueva posición", "New position"))}</div>
          <div class="summary-meta">${escapeHtml(selectedResource ? `${catalogItemGroup(selectedResource)} · ${selectedResource.apiName}` : langText("Elegí producto, calidad y precio de compra", "Pick a product, quality, and purchase price"))}</div>
        </div>
      </div>

      <div class="input-group">
        <label>${escapeHtml(langText("Producto", "Product"))}</label>
        <div class="hierarchy-selector${state.portfolioResourceSelectorOpen ? " open" : ""}" id="portfolioResourceSelector">
          <button type="button" class="selector-summary" data-portfolio-action="toggle-selector">
            <div class="selector-summary-main">
              <div class="selector-title">${escapeHtml(selector.title)}</div>
              <div class="selector-subtitle">${escapeHtml(selector.subtitle)}</div>
            </div>
            <div class="selector-chevron">${state.portfolioResourceSelectorOpen ? "▲" : "▼"}</div>
          </button>
          <div class="selector-panel">
            <input id="portfolioResourceSearch" class="selector-search" type="text" value="${escapeHtml(state.portfolioResourceSearch)}" placeholder="${escapeHtml(state.portfolioResourceActiveGroup ? t("searchAssetByNameId") : t("searchGroupOrAsset"))}" />
            <div class="selector-crumbs">${portfolioResourceCrumbsMarkup()}<span class="selector-tag">${escapeHtml(`${visibleItems} ${state.language === "en" ? "visible" : "visibles"}`)}</span></div>
            <div class="selector-actions">
              ${state.portfolioResourceActiveGroup ? `<button type="button" class="selector-action-btn" data-portfolio-action="back-groups">${escapeHtml(state.language === "en" ? "Back to groups" : "Volver a rubros")}</button>` : ""}
              ${draft.resourceId ? `<button type="button" class="selector-action-btn" data-portfolio-action="clear-resource">${escapeHtml(langText("Quitar producto", "Clear product"))}</button>` : ""}
            </div>
            <div class="selector-list">${portfolioResourceSelectorOptionsMarkup()}</div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label for="portfolioQualityInput">${escapeHtml(langText("Calidad (Q)", "Quality (Q)"))}</label>
          <select id="portfolioQualityInput" class="styled-input portfolio-quality-select" data-portfolio-field="quality"${!selectedResource || portfolioResourceMetaLoading(draft.resourceId) || shouldLockQuality ? " disabled" : ""}>
            ${(shouldLockQuality ? [fixedQuality] : qualityOptions).map((quality) => `
              <option value="${quality}"${String(quality) === String(resolvedDraftQuality) ? " selected" : ""}>${escapeHtml(qualityLabel(quality))}</option>
            `).join("")}
          </select>
          ${qualityHint ? `<div class="portfolio-quality-help">${escapeHtml(qualityHint)}</div>` : ""}
        </div>
        <div class="input-group">
          <label for="portfolioQuantityInput">${escapeHtml(langText("Cantidad", "Quantity"))}</label>
          <input id="portfolioQuantityInput" class="styled-input no-spinner" data-portfolio-field="quantity" type="text" inputmode="numeric" value="${escapeHtml(draft.quantity)}" />
        </div>
      </div>

      <div class="input-group">
        <label for="portfolioBuyPriceInput">${escapeHtml(langText("Precio de compra/u", "Purchase price/u"))}</label>
        <input id="portfolioBuyPriceInput" class="styled-input no-spinner" data-portfolio-field="buyPrice" type="text" inputmode="decimal" value="${escapeHtml(draft.buyPrice)}" />
      </div>

      <div class="editor-actions portfolio-editor-actions">
        <button id="portfolioSaveButton" class="save-btn" type="button" data-portfolio-action="save">${escapeHtml(langText("Guardar posición", "Save position"))}</button>
        <button id="portfolioResetButton" class="action-btn action-btn-secondary" type="button" data-portfolio-action="reset">${escapeHtml(langText("Limpiar", "Clear"))}</button>
        ${draft.id ? `<button id="portfolioDeleteButton" class="action-btn action-btn-danger" type="button" data-portfolio-action="delete">${escapeHtml(langText("Eliminar posición", "Delete position"))}</button>` : ""}
      </div>
    </div>
  `;
}

function portfolioResolveResourceFromText(rawName) {
  const normalized = normalizeSearch(rawName);
  if (!normalized) return null;
  const exact = resourceCatalog().find((item) => [
    item.label,
    item.labelEs,
    item.labelEn,
    item.apiName
  ].some((value) => normalizeSearch(value) === normalized));
  if (exact) return exact;
  const partial = resourceCatalog().filter((item) => [
    item.label,
    item.labelEs,
    item.labelEn,
    item.apiName
  ].some((value) => {
    const candidate = normalizeSearch(value);
    return candidate && (candidate.includes(normalized) || normalized.includes(candidate));
  }));
  return partial.length === 1 ? partial[0] : null;
}

function portfolioImportStarCount(value) {
  const matches = String(value || "").match(/[★⭐☆✦✶✸]/g);
  return matches ? matches.length : 0;
}

function portfolioImportQuantityLine(line) {
  const raw = String(line || "").trim();
  if (!raw || raw.includes("$") || raw.includes("%")) return null;
  const stars = portfolioImportStarCount(raw);
  const withoutStars = raw.replace(/[★⭐☆✦✶✸]/g, "").trim();
  const match = withoutStars.match(/^([\d.,]+)\s*(units?)?$/i);
  if (!match) return null;
  const quantity = parseIntegerInput(match[1]);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return {
    quantity,
    quality: stars > 0 ? String(stars) : "",
    isSummary: /units?/i.test(withoutStars)
  };
}

function portfolioImportMoneyValue(line) {
  const match = String(line || "").match(/\$\s*([\d.,]+)/);
  if (!match) return Number.NaN;
  return parseLocaleDecimal(match[1]);
}

function portfolioImportStructuredColumns(line) {
  const raw = String(line || "").trim();
  if (!raw) return [];
  const columns = raw.includes("\t")
    ? raw.split("\t")
    : raw.split(/\s{2,}/);
  return columns.map((value) => String(value || "").trim()).filter(Boolean);
}

function portfolioImportStructuredRow(line, index = 0) {
  const columns = portfolioImportStructuredColumns(line);
  if (columns.length < 3) return null;

  const productCell = columns[0];
  const productMatch = productCell.match(/^(.*?)\s+Q(\d{1,2})$/i);
  if (!productMatch) return null;

  const quality = Number(productMatch[2]);
  if (!Number.isInteger(quality) || quality < 0 || quality > 12) return null;

  const resource = portfolioResolveResourceFromText(productMatch[1]);
  if (!resource) return null;

  const quantity = parseIntegerInput(columns[1]);
  const buyPrice = parseLocaleDecimal(String(columns[2] || "").replace(/^\$/, ""));
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(buyPrice) || buyPrice < 0) {
    return null;
  }

  return {
    id: `import-table-${Date.now()}-${index}-${Math.round(Math.random() * 1000)}`,
    resourceId: resource.id,
    resourceName: catalogItemLabel(resource),
    quality: String(quality),
    quantity,
    buyPrice
  };
}

function parsePortfolioImportRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    throw new Error(langText("Pegá texto antes de importar.", "Paste text before importing."));
  }

  const structuredRows = lines
    .map((line, index) => portfolioImportStructuredRow(line, index))
    .filter(Boolean);
  const looksLikeStructuredPortfolio = lines.some((line) => /\bQ\d{1,2}\b/i.test(line) && /\$\s*[\d.,]+/.test(line));
  if (looksLikeStructuredPortfolio && structuredRows.length) {
    return structuredRows;
  }

  const productName = lines.find((line) => !line.startsWith("$") && !portfolioImportQuantityLine(line));
  const resource = portfolioResolveResourceFromText(productName || "");
  if (!resource) {
    throw new Error(langText("No pude identificar el producto desde el texto pegado.", "I could not identify the product from the pasted text."));
  }

  const rows = [];
  for (let index = 0; index < lines.length; index += 1) {
    const quantityLine = portfolioImportQuantityLine(lines[index]);
    if (!quantityLine || quantityLine.isSummary) continue;

    let buyPrice = Number.NaN;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const nextQuantity = portfolioImportQuantityLine(lines[cursor]);
      if (nextQuantity && !nextQuantity.isSummary) break;
      const money = portfolioImportMoneyValue(lines[cursor]);
      if (Number.isFinite(money)) {
        buyPrice = money;
        break;
      }
    }

    if (!Number.isFinite(buyPrice) || buyPrice < 0) continue;
    rows.push({
      id: `import-${Date.now()}-${index}-${Math.round(Math.random() * 1000)}`,
      resourceId: resource.id,
      resourceName: catalogItemLabel(resource),
      quality: quantityLine.quality,
      quantity: quantityLine.quantity,
      buyPrice
    });
  }

  if (!rows.length) {
    const summaryQuantity = lines.map(portfolioImportQuantityLine).find((item) => item?.isSummary);
    const sourcingLine = lines.find((line) => /sourcing cost/i.test(line));
    const sourcingCost = portfolioImportMoneyValue(sourcingLine);
    if (summaryQuantity && Number.isFinite(sourcingCost) && sourcingCost >= 0) {
      rows.push({
        id: `import-${Date.now()}-summary`,
        resourceId: resource.id,
        resourceName: catalogItemLabel(resource),
        quality: "",
        quantity: summaryQuantity.quantity,
        buyPrice: sourcingCost
      });
    }
  }

  if (!rows.length) {
    throw new Error(langText("No encontré bloques válidos de cantidad y precio para importar.", "I could not find valid quantity and price blocks to import."));
  }

  return rows;
}

function portfolioImportRowsReady() {
  return state.portfolioImportRows.length > 0
    && state.portfolioImportRows.every((row) => {
      const quality = parseIntegerInput(row.quality);
      return Number.isInteger(quality) && quality >= 0 && quality <= 12;
    });
}

function portfolioImportMarkup() {
  const unresolvedCount = state.portfolioImportRows.filter((row) => !Number.isInteger(parseIntegerInput(row.quality))).length;

  return `
    <div class="editor-card portfolio-import-card">
      <div class="input-group">
        <label for="portfolioImportTextarea">${escapeHtml(langText("Pegá el texto de MERCANCÍAS o ESTADÍSTICAS", "Paste the WARES or STATS text"))}</label>
        <textarea id="portfolioImportTextarea" class="styled-input portfolio-import-textarea" placeholder="${escapeHtml(langText("Pegá productos específicos o copiá y pegá todo el texto dentro de Estadísticas para agregar el costo de todos tus productos.", "Paste specific products or copy and paste all text from STATS to add the cost of all your products."))}">${escapeHtml(state.portfolioImportText)}</textarea>
      </div>
      <div class="editor-actions portfolio-import-actions">
        <button class="save-btn" type="button" data-portfolio-action="parse-import">${escapeHtml(langText("Analizar texto", "Analyze text"))}</button>
        <button class="action-btn action-btn-secondary" type="button" data-portfolio-action="clear-import">${escapeHtml(langText("Limpiar importación", "Clear import"))}</button>
        <button class="filter-btn filter-btn-strong" type="button" data-portfolio-action="apply-import"${portfolioImportRowsReady() ? "" : " disabled"}>${escapeHtml(langText("Cargar en cartera", "Load into portfolio"))}</button>
      </div>
      ${state.portfolioImportRows.length ? `
        <div class="portfolio-import-summary ${unresolvedCount ? "warning" : "ok"}">
          ${escapeHtml(unresolvedCount
            ? langText(`${state.portfolioImportRows.length} filas detectadas · ${unresolvedCount} sin calidad`, `${state.portfolioImportRows.length} rows detected · ${unresolvedCount} missing quality`)
            : langText(`${state.portfolioImportRows.length} filas listas para cargar`, `${state.portfolioImportRows.length} rows ready to import`))}
        </div>
        <div class="portfolio-import-preview">
          ${state.portfolioImportRows.map((row) => `
            <div class="portfolio-import-row${Number.isInteger(parseIntegerInput(row.quality)) ? "" : " pending"}">
              <div class="portfolio-import-row-main">
                <strong>${escapeHtml(row.resourceName || resourceLabel(row.resourceId))}</strong>
                <small>${escapeHtml(Number.isInteger(parseIntegerInput(row.quality)) ? qualityLabel(row.quality) : langText("Sin Q", "No Q"))} · ${escapeHtml(Number(row.quantity).toLocaleString(numberLocale()))} ${escapeHtml(langText("unidades", "units"))} · ${escapeHtml(langText("compra", "buy"))} ${escapeHtml(formatCurrency(row.buyPrice))}</small>
              </div>
              <div class="portfolio-import-row-controls">
                <select class="styled-input portfolio-import-quality-select" data-portfolio-import-field="quality" data-import-row-id="${escapeHtml(row.id)}"${(() => {
                  const rowMeta = portfolioResourceMeta(row.resourceId);
                  return (portfolioResourceMetaLoading(row.resourceId) || (rowMeta && !rowMeta.supportsQualitySelection)) ? " disabled" : "";
                })()}>
                  ${(() => {
                    const rowMeta = portfolioResourceMeta(row.resourceId);
                    const rowQualityOptions = rowMeta && !rowMeta.supportsQualitySelection
                      ? [rowMeta.fixedQuality ?? 0]
                      : portfolioQualityOptionsForResource(row.resourceId, row.quality);
                    const rowOptions = [`<option value="">${escapeHtml(langText("Asignar Q", "Assign Q"))}</option>`]
                      .concat(rowQualityOptions.map((value) => `<option value="${value}">${escapeHtml(qualityLabel(value))}</option>`))
                      .join("");
                    return rowOptions.replace(`value="${escapeHtml(row.quality)}"`, `value="${escapeHtml(row.quality)}" selected`);
                  })()}
                </select>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `
        <div class="portfolio-import-empty">${escapeHtml(langText("Todavía no hay filas analizadas.", "There are no parsed rows yet."))}</div>
      `}
    </div>
  `;
}

function portfolioOverviewMarkup() {
  const portfolio = state.dashboard?.portfolio || { chart: null };
  const groups = portfolioGroupedPositions();
  const positions = portfolioDisplayPositions();
  const totalInvested = groups.reduce((sum, item) => sum + Number(item.invested || 0), 0);
  const currentValueKey = portfolioModeIsNet() ? "netCurrentValue" : "grossCurrentValue";
  const pricedInvestedKey = portfolioModeIsNet() ? "netPricedInvested" : "grossPricedInvested";
  const totalCurrentValue = groups.reduce((sum, item) => sum + (Number.isFinite(item?.[currentValueKey]) ? Number(item[currentValueKey]) : 0), 0);
  const totalPricedInvested = groups.reduce((sum, item) => sum + Number(item?.[pricedInvestedKey] || 0), 0);
  const totalPnl = groups.length ? totalCurrentValue - totalPricedInvested : 0;
  const totalPnlPct = totalPricedInvested > 0 ? (totalPnl / totalPricedInvested) * 100 : null;
  const coveragePct = portfolioCoverageRatio(positions);
  const transportPrice = portfolioTransportPrice();
  const feeRate = portfolioFeeRate();
  const chart = portfolio.chart || null;
  const chartLatestValue = portfolioModeIsNet()
    ? finiteNumber(chart?.latestNetValue)
    : finiteNumber(chart?.latestGrossValue);
  return `
    <div class="portfolio-hero-card">
      <div class="portfolio-hero-copy">
        <div class="portfolio-hero-topline">
          <div class="portfolio-hero-kicker">${escapeHtml(portfolioModeIsNet() ? langText("Venta neta estimada", "Estimated net sale") : langText("Inventario valorizado", "Inventory value"))}</div>
          <div class="portfolio-mode-switch" role="group" aria-label="${escapeHtml(langText("Modo de valuación", "Valuation mode"))}">
            <button class="portfolio-mode-btn${!portfolioModeIsNet() ? " active" : ""}" type="button" data-portfolio-action="set-view-mode" data-portfolio-view="gross">${escapeHtml(langText("Bruto", "Gross"))}</button>
            <button class="portfolio-mode-btn${portfolioModeIsNet() ? " active" : ""}" type="button" data-portfolio-action="set-view-mode" data-portfolio-view="net">${escapeHtml(langText("Neto venta", "Net sale"))}</button>
          </div>
        </div>
        <div class="portfolio-hero-value">${escapeHtml(formatCurrency(totalCurrentValue || 0))}</div>
        <div class="portfolio-hero-trend ${portfolioChartToneClass(totalPnl)}">
          ${escapeHtml(`${formatCurrency(totalPnl)}${Number.isFinite(totalPnlPct) ? ` · ${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%` : ""}`)}
        </div>
        <div class="portfolio-hero-meta">
          ${escapeHtml(langText("Capital invertido", "Invested capital"))}: ${escapeHtml(formatCurrency(totalInvested))}
          ${portfolioModeIsNet() ? ` · ${escapeHtml(langText("Fee", "Fee"))}: ${escapeHtml(`${(feeRate * 100).toFixed(0)}%`)} · ${escapeHtml(langText("Transporte", "Transport"))}: ${escapeHtml(Number.isFinite(transportPrice) ? formatCurrency(transportPrice) : "—")}` : ""}
        </div>
      </div>
      ${portfolioChartMarkup(chart)}
    </div>
    <div class="portfolio-summary-grid">
      <div class="metric-box"><span>${escapeHtml(langText("Productos", "Products"))}</span><strong>${escapeHtml(String(groups.length))}</strong></div>
      <div class="metric-box"><span>${escapeHtml(langText("Calidades", "Qualities"))}</span><strong>${escapeHtml(String(positions.length))}</strong></div>
      ${portfolioModeIsNet() ? "" : `<div class="metric-box"><span>${escapeHtml(langText("Unidades totales", "Total units"))}</span><strong>${escapeHtml(positions.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toLocaleString(numberLocale()))}</strong></div>`}
      <div class="metric-box"><span>${escapeHtml(portfolioModeIsNet() ? langText("Resultado real", "Real P/L") : langText("Resultado no realizado", "Unrealized P/L"))}</span><strong class="${portfolioChartToneClass(totalPnl)}">${escapeHtml(formatCurrency(totalPnl))}</strong></div>
      ${portfolioModeIsNet() ? `<div class="metric-box"><span>${escapeHtml(langText("Última salida neta", "Latest net sale"))}</span><strong>${escapeHtml(Number.isFinite(chartLatestValue) ? formatCurrency(chartLatestValue) : "—")}</strong></div>` : ""}
    </div>
  `;
}

function portfolioGroupRowMarkup(group) {
  const expanded = state.portfolioExpandedKeys.includes(group.key);
  const selected = state.selectedPortfolioGroupKey === group.key;
  const pnlClass = portfolioChartToneClass(portfolioMetricValue(group, "Pnl"));
  return `
    <button class="portfolio-row portfolio-group-row${selected ? " selected" : ""}" type="button" data-portfolio-group-key="${escapeHtml(group.key)}">
      <span class="portfolio-cell portfolio-product-cell">
        <span class="portfolio-row-expander" aria-hidden="true">${expanded ? "▾" : "▸"}</span>
        ${avatarMarkup({ resourceId: group.resourceId, resourceName: group.resourceName, logoUrl: group.logoUrl }, "P")}
        <span class="portfolio-product-copy">
          <strong>${escapeHtml(group.resourceName)}</strong>
          <small>${escapeHtml(group.groupName)} · ${escapeHtml(langText(`${group.qualityCount} calidades`, `${group.qualityCount} qualities`))} · ID ${escapeHtml(group.resourceId)}</small>
        </span>
      </span>
      <span class="portfolio-cell">${escapeHtml(Number(group.quantity).toLocaleString(numberLocale()))}</span>
      <span class="portfolio-cell">${escapeHtml(formatCurrency(group.buyPrice))}</span>
      <span class="portfolio-cell">${escapeHtml(portfolioDisplayCurrentUnit(group))}</span>
      <span class="portfolio-cell">${escapeHtml(formatCurrency(group.invested))}</span>
      <span class="portfolio-cell">${escapeHtml(Number.isFinite(portfolioMetricValue(group, "CurrentValue")) ? formatCurrency(portfolioMetricValue(group, "CurrentValue")) : "—")}</span>
      <span class="portfolio-cell portfolio-result-cell ${pnlClass}">${escapeHtml(portfolioResultLabel(group))}</span>
    </button>
  `;
}

function portfolioQualityRowMarkup(position, groupKey) {
  const selected = String(position.id) === String(state.selectedPortfolioId);
  const pnlClass = portfolioChartToneClass(portfolioMetricValue(position, "Pnl"));
  return `
    <button class="portfolio-row portfolio-quality-row${selected ? " selected" : ""}" type="button" data-portfolio-id="${escapeHtml(position.id)}" data-portfolio-group-key="${escapeHtml(groupKey)}">
      <span class="portfolio-cell portfolio-product-cell">
        <span class="portfolio-quality-indent" aria-hidden="true"></span>
        <span class="portfolio-quality-pill">${escapeHtml(qualityLabel(position.quality))}</span>
        <span class="portfolio-product-copy">
          <strong>${escapeHtml(position.resourceName)}</strong>
          <small>${escapeHtml(langText("Vista agrupada por calidad", "Grouped by quality"))}</small>
        </span>
      </span>
      <span class="portfolio-cell">${escapeHtml(Number(position.quantity).toLocaleString(numberLocale()))}</span>
      <span class="portfolio-cell">${escapeHtml(formatCurrency(position.buyPrice))}</span>
      <span class="portfolio-cell">${escapeHtml(portfolioDisplayCurrentUnit(position))}</span>
      <span class="portfolio-cell">${escapeHtml(formatCurrency(position.invested))}</span>
      <span class="portfolio-cell">${escapeHtml(Number.isFinite(portfolioMetricValue(position, "CurrentValue")) ? formatCurrency(portfolioMetricValue(position, "CurrentValue")) : "—")}</span>
      <span class="portfolio-cell portfolio-result-cell ${pnlClass}">${escapeHtml(portfolioResultLabel(position))}</span>
    </button>
  `;
}

function renderPortfolioSelectedCard() {
  const node = byId("portfolioSelectedCard");
  if (!node) return;
  node.innerHTML = portfolioSelectedCardMarkup();
}

function renderPortfolioEditor() {
  const node = byId("portfolioEditorContainer");
  if (!node) return;
  node.innerHTML = portfolioEditorMarkup();
}

function renderPortfolioImport() {
  const node = byId("portfolioImportContainer");
  if (!node) return;
  node.innerHTML = portfolioImportMarkup();
}

function renderPortfolioOverview() {
  const node = byId("portfolioOverview");
  if (!node) return;
  node.innerHTML = portfolioOverviewMarkup();
}

function portfolioPageCount(totalItems = filteredPortfolioGroups().length) {
  return Math.max(1, Math.ceil(totalItems / PORTFOLIO_GROUPS_PER_PAGE));
}

function clampPortfolioPage(totalItems = filteredPortfolioGroups().length) {
  state.portfolioPage = Math.min(Math.max(1, state.portfolioPage), portfolioPageCount(totalItems));
}

function renderPortfolioFilterButtons() {
  [
    ["portfolioFilterAllButton", "all"],
    ["portfolioFilterGainButton", "gain"],
    ["portfolioFilterLossButton", "loss"]
  ].forEach(([id, value]) => {
    byId(id)?.classList.toggle("active", state.portfolioFilter === value);
  });
}

function renderPortfolioList() {
  const list = byId("portfolioList");
  const info = byId("portfolioResultsInfo");
  const pagination = byId("portfolioPagination");
  if (!list || !info || !pagination) return;
  ensurePortfolioSelection();
  const allGroups = portfolioGroupedPositions();
  const filtered = filteredPortfolioGroups();
  clampPortfolioPage(filtered.length);
  const pageStart = (state.portfolioPage - 1) * PORTFOLIO_GROUPS_PER_PAGE;
  const paged = filtered.slice(pageStart, pageStart + PORTFOLIO_GROUPS_PER_PAGE);
  const qualityCount = filtered.reduce((sum, group) => sum + group.qualityCount, 0);

  info.textContent = allGroups.length
    ? (filtered.length === allGroups.length
      ? langText(`${allGroups.length} productos · ${qualityCount} calidades`, `${allGroups.length} products · ${qualityCount} qualities`)
      : langText(`${filtered.length} de ${allGroups.length} productos · ${qualityCount} calidades visibles`, `${filtered.length} of ${allGroups.length} products · ${qualityCount} visible qualities`))
    : "";

  if (!filtered.length) {
    pagination.innerHTML = "";
    list.innerHTML = `<div class="empty-card">${escapeHtml(allGroups.length ? langText("No hay productos que coincidan con la búsqueda o el filtro.", "No products match the current search or filter.") : langText("Todavía no cargaste productos en cartera.", "You have not added products to the portfolio yet."))}</div>`;
    stabilizePagedListHeight(list, {
      itemSelector: ".portfolio-group-row",
      perPage: PORTFOLIO_GROUPS_PER_PAGE,
      fallbackItemHeight: 72,
      fallbackGap: 0,
      headerSelector: ".portfolio-table-head",
      fallbackHeaderHeight: 44
    });
    return;
  }

  list.innerHTML = `
    <div class="portfolio-table">
      <div class="portfolio-table-head">
        <span>${escapeHtml(langText("Producto", "Product"))}</span>
        <span>${escapeHtml(langText("Cantidad", "Quantity"))}</span>
        <span>${escapeHtml(langText("Compra/u", "Buy/u"))}</span>
        <span>${escapeHtml(portfolioCurrentUnitHeading())}</span>
        <span>${escapeHtml(langText("Invertido", "Invested"))}</span>
        <span>${escapeHtml(portfolioCurrentValueHeading())}</span>
        <span>${escapeHtml(portfolioPnlHeading())}</span>
      </div>
      <div class="portfolio-table-body">
        ${paged.map((group) => `
          <div class="portfolio-group-block">
            ${portfolioGroupRowMarkup(group)}
            ${state.portfolioExpandedKeys.includes(group.key)
              ? group.qualities.map((quality) => portfolioQualityRowMarkup(quality, group.key)).join("")
              : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
  pagination.innerHTML = filtered.length > PORTFOLIO_GROUPS_PER_PAGE
    ? contactPaginationMarkup(filtered.length, state.portfolioPage, PORTFOLIO_GROUPS_PER_PAGE, "portfolio")
    : "";
  stabilizePagedListHeight(list, {
    itemSelector: ".portfolio-group-row",
    perPage: PORTFOLIO_GROUPS_PER_PAGE,
    fallbackItemHeight: 72,
    fallbackGap: 0,
    headerSelector: ".portfolio-table-head",
    fallbackHeaderHeight: 44
  });
}

function renderPortfolioView() {
  ensurePortfolioSelection();
  renderPortfolioSelectedCard();
  renderPortfolioEditor();
  renderPortfolioImport();
  renderPortfolioOverview();
  renderPortfolioFilterButtons();
  renderPortfolioList();
}

function mergeDashboardAfterPortfolioSave(dashboard) {
  syncNotificationState(dashboard);
  state.dashboard = dashboard;
  cacheResourceCatalog(dashboard.resourceCatalog);
  state.updates = {
    ...state.updates,
    ...(dashboard.updates || {})
  };
  syncPortfolioStateFromDashboard(dashboard);
}

async function persistPortfolio(showSuccessMessage = true) {
  state.portfolioHoldings = canonicalizePortfolioHoldings(state.portfolioHoldings);
  const dashboard = await callDesktop("savePortfolio", state.portfolioHoldings);
  mergeDashboardAfterPortfolioSave(dashboard);
  renderAll();
  if (showSuccessMessage) {
    showToast(langText("Cartera guardada", "Portfolio saved"));
  }
}

async function savePortfolioHolding() {
  const normalized = normalizePortfolioDraftOrThrow();
  const remaining = state.portfolioHoldings.filter((item) => String(item.id) !== String(normalized.id) && !(Number(item.resourceId) === normalized.resourceId && Number(item.quality) === normalized.quality));
  state.portfolioHoldings = canonicalizePortfolioHoldings([normalized, ...remaining]);
  const selected = state.portfolioHoldings.find((item) => Number(item.resourceId) === normalized.resourceId && Number(item.quality) === normalized.quality) || normalized;
  state.selectedPortfolioId = selected.id;
  state.selectedPortfolioGroupKey = portfolioGroupKey(selected.resourceId);
  state.portfolioExpandedKeys = uniqueList([portfolioGroupKey(selected.resourceId), ...state.portfolioExpandedKeys]);
  state.portfolioPage = 1;
  state.portfolioDirty = false;
  state.portfolioChartHoverTime = "";
  populatePortfolioDraft(selected);
  await persistPortfolio(true);
}

async function deletePortfolioHolding() {
  const currentId = state.portfolioDraft.id || state.selectedPortfolioId;
  if (!currentId) {
    startNewPortfolioDraft();
    return;
  }
  state.portfolioHoldings = state.portfolioHoldings.filter((item) => String(item.id) !== String(currentId));
  state.selectedPortfolioId = null;
  state.portfolioDirty = false;
  state.portfolioChartHoverTime = "";
  populatePortfolioDraft(null);
  await persistPortfolio(true);
}

async function deletePortfolioGroup() {
  ensurePortfolioSelection();
  const selected = selectedPortfolioHolding();
  const group = portfolioSelectedGroup();
  const resourceId = Number(selected?.resourceId ?? group?.resourceId ?? 0);
  if (!Number.isFinite(resourceId) || resourceId <= 0) {
    startNewPortfolioDraft();
    return;
  }
  const groupKey = portfolioGroupKey(resourceId);
  state.portfolioHoldings = state.portfolioHoldings.filter((item) => Number(item.resourceId) !== resourceId);
  state.selectedPortfolioId = null;
  state.selectedPortfolioGroupKey = null;
  state.portfolioExpandedKeys = state.portfolioExpandedKeys.filter((key) => key !== groupKey);
  state.portfolioDirty = false;
  state.portfolioChartHoverTime = "";
  populatePortfolioDraft(null);
  await persistPortfolio(true);
}

async function applyPortfolioImportRows() {
  if (!portfolioImportRowsReady()) {
    throw new Error(langText("Asigná la calidad de todas las filas antes de cargarlas.", "Assign a quality to every row before loading them."));
  }
  const importedRows = state.portfolioImportRows.map((row) => ({
    id: newPortfolioHoldingId(),
    resourceId: Number(row.resourceId),
    quality: parseIntegerInput(row.quality),
    quantity: parseIntegerInput(row.quantity),
    buyPrice: Number(row.buyPrice),
    createdAt: new Date().toISOString()
  }));

  state.portfolioHoldings = canonicalizePortfolioHoldings([...importedRows, ...state.portfolioHoldings]);
  const firstImported = importedRows[0];
  const selected = state.portfolioHoldings.find((item) => Number(item.resourceId) === firstImported.resourceId && Number(item.quality) === firstImported.quality) || null;
  state.selectedPortfolioId = selected?.id || null;
  state.selectedPortfolioGroupKey = selected ? portfolioGroupKey(selected.resourceId) : state.selectedPortfolioGroupKey;
  state.portfolioExpandedKeys = selected ? uniqueList([portfolioGroupKey(selected.resourceId), ...state.portfolioExpandedKeys]) : state.portfolioExpandedKeys;
  state.portfolioPage = 1;
  state.portfolioChartHoverTime = "";
  state.portfolioImportText = "";
  state.portfolioImportRows = [];
  populatePortfolioDraft(selected);
  await persistPortfolio(true);
}

async function refreshPortfolioPrices() {
  state.portfolioChartHoverTime = "";
  const dashboard = await callDesktop("refreshPortfolio");
  mergeDashboardAfterPortfolioSave(dashboard);
  renderAll();
  showToast(langText("Precios de cartera actualizados", "Portfolio prices refreshed"));
}

function viewMeta(view = state.activeView) {
  if (view === "calculadora") {
    return {
      id: "calculadora",
      title: t("viewCalculadoraTitle"),
      toolbarVisible: false
    };
  }
  if (view === "cartera") {
    return {
      id: "cartera",
      title: t("viewCarteraTitle"),
      toolbarVisible: false
    };
  }
  if (view === "ejecutivos") {
    return {
      id: "ejecutivos",
      title: t("viewEjecutivosTitle"),
      toolbarVisible: false
    };
  }
  if (view === "registro") {
    return {
      id: "registro",
      title: t("viewRegistroTitle"),
      toolbarVisible: false
    };
  }
  return {
    id: "mercado",
    title: t("viewMercadoTitle"),
    toolbarVisible: true
  };
}

function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value;
}

function setPlaceholder(id, value) {
  const node = byId(id);
  if (node) node.setAttribute("placeholder", value);
}

function renderStaticLanguage() {
  document.documentElement.lang = localeCode();
  setText("tab-mercado", t("tabMercado"));
  setText("tab-calculadora", t("tabCalculadora"));
  setText("tab-cartera", t("tabCartera"));
  setText("tab-ejecutivos", t("tabEjecutivos"));
  setText("tab-registro", t("tabRegistro"));
  setText("headerMonitorLabel", t("statsMonitor"));
  setText("headerAlertsLabel", t("statsAlerts"));
  setText("headerInZoneLabel", t("statsInZone"));
  setText("headerLastReviewLabel", t("statsLastReview"));
  setText("scanNowButton", t("scanMarket"));
  setText("checkUpdatesButton", updateButtonLabel());
  setText("saveButton", state.dirty ? t("savePendingChanges") : t("saveChanges"));
  setText("resetButton", t("discard"));
  setText("mercadoCurrentLabel", t("sectionCurrentReading"));
  setText("mercadoEditorLabel", t("sectionEditAlert"));
  setText("mercadoChannelsLabel", t("sectionChannels"));
  setText("channelDesktopTitle", langText("Notificación en esta PC", "Notifications on this PC"));
  setText("channelDesktopCopy", langText("La opción más simple para ver avisos locales.", "The simplest option for local alerts."));
  setText("channelDiscordLabel", "Discord webhook");
  setText("channelTelegramTokenLabel", "Telegram bot token");
  setText("channelTelegramChatLabel", "Telegram chat id");
  setText("supportersLabel", t("sectionThanks"));
  setText("supportersTitle", t("thanksTitle"));
  setText("supportersCopy", t("thanksCopy"));
  setText("supporterCooperNote", t("openSite"));
  setText("supporterSimcoToolsNote", t("openSite"));
  setText("watchedMarketLabel", t("sectionWatchedMarket"));
  setPlaceholder("searchInput", t("searchNameOrAsset"));
  setText("filterAllButton", t("filterAll"));
  setText("filterBuyButton", t("filterBuy"));
  setText("filterSellButton", t("filterSell"));
  setText("filterMatchButton", t("filterMatch"));
  setText("filterDisabledButton", t("filterDisabled"));
  setText("addAlertButton", t("newAlert"));
  setText("calcPurchaseParamsLabel", t("sectionPurchaseParams"));
  setText("calcAddButton", t("newCalculation"));
  setText("calcProductLabel", `${t("labelProduct")} `);
  setText("calcProductOptionalLabel", t("optionalAutofill"));
  setText("calcCostLabel", t("labelCostPerUnit"));
  setText("calcQtyLabel", `${t("labelQuantity")} `);
  setText("calcQtyUnitsLabel", t("unitsLabel"));
  setText("calcTransportLabel", `${t("labelTransportPrice")} `);
  setText("calcTransportPriceHint", t("transportUnitPrice"));
  setText("calcTransportUnitsLabel", t("labelUnitsPerUnit"));
  setText("calcVerifierLabel", t("sectionPriceCheck"));
  setText("calcSellCheckLabel", `${t("labelSellCheck")} `);
  setText("calcSellCheckHint", t("perUnit"));
  setText("calcDeleteButton", t("deleteCalculation"));
  setText("calcBreakevenTitle", t("breakEvenTitle"));
  setText("calcCostBaseLabel", t("baseCost"));
  setText("calcFeeLabel", t("sellFee"));
  setText("calcFreightLabel", t("freightPerUnit"));
  setText("calcInvestmentLabel", t("totalInvestment"));
  setText("calcSummaryFeeLabel", t("totalFee"));
  setText("calcSummaryFreightLabel", t("totalFreight"));
  setText("calcTargetsLabel", t("profitTargets"));
  setText("calcCheckerLabel", t("targetPriceResult"));
  setText("portfolioSelectedLabel", t("portfolioSelected"));
  setText("portfolioEntryLabel", t("portfolioEntry"));
  setText("portfolioImportLabel", t("portfolioImport"));
  setText("portfolioOverviewLabel", t("portfolioOverview"));
  setText("portfolioHoldingsLabel", t("portfolioHoldings"));
  setPlaceholder("portfolioSearchInput", t("portfolioSearch"));
  setText("portfolioFilterAllButton", t("portfolioFilterAll"));
  setText("portfolioFilterGainButton", t("portfolioFilterGain"));
  setText("portfolioFilterLossButton", t("portfolioFilterLoss"));
  setText("portfolioRefreshButton", t("portfolioRefresh"));
  setText("portfolioNewButton", t("portfolioNew"));
  setText("registroNewContactLabel", t("newContact"));
  setText("registroArchiveLabel", t("contactArchive"));
  setPlaceholder("contactSearchInput", t("searchContact"));
  setText("executiveBaseLabel", t("executiveBase"));
  setText("executiveEntryLabel", t("executiveEntry"));
  setText("executiveFeedbackLabel", t("executiveFeedback"));
  setPlaceholder("executiveFeedbackInput", t("executiveFeedbackPlaceholder"));
  setText("executiveAnalyzeButton", t("analyzeProfile"));
  setText("executiveClearButton", t("clear"));
  setText("executiveHowToReadLabel", t("howToRead"));
  setText("executiveGuideLine1", t("executiveGuide1"));
  setText("executiveGuideLine2", t("executiveGuide2"));
  setText("executiveGuideLine3", t("executiveGuide3"));
  setText("executiveRadarLabel", t("executiveRadar"));
  setText("historyModalTitle", t("historyTitle"));
  setText("historyModalSubtitle", t("historySubtitle"));
  setText("historyNewInteractionLabel", t("newInteraction"));
  setText("historyDateLabel", t("date"));
  setPlaceholder("historyDateInput", t("datePlaceholder"));
  setText("historyNoteLabel", t("note"));
  setPlaceholder("historyNoteInput", t("notePlaceholder"));
  setText("historyConversationLabel", t("pasteConversation"));
  setPlaceholder("historyConversationInput", t("pasteConversationPlaceholder"));
  setText("historyClearButton", t("clearForm"));
  setText("historySaveButton", t("saveInteraction"));
  setText("historySavedLabel", t("savedHistory"));
  setText("historyCloseButton", t("close"));
  setText("notificationsModalTitle", t("notificationsTitle"));
  setText("notificationsModalCopy", t("notificationsSubtitle"));
  setText("notificationsCloseButton", t("close"));
  setText("notificationsClearButton", t("clearInbox"));
  setText("updateDismissButton", t("notNow"));
  setText("onboardingStepLabel", t("onboardingStep"));
  setText("onboardingSkipButton", t("onboardingSkip"));
  setText("onboardingBackButton", t("onboardingBack"));
  setText("onboardingTitle", onboardingSteps()[state.onboardingStep]?.title || "");
  setText("onboardingBody", onboardingSteps()[state.onboardingStep]?.body || "");
  byId("onboardingNextButton").textContent = onboardingSteps()[state.onboardingStep]?.finalAction ? t("onboardingCreateAlert") : t("onboardingNext");
  renderLanguageToggle();
  renderRealmToggle();
  renderThemeToggle();
}

function inferActionKey(alert) {
  if (alert.condition === "<=" || alert.condition === "<") return "buy";
  if (alert.condition === ">=" || alert.condition === ">") return "sell";
  if (alert.condition === "between") return "range";
  return "check";
}

function actionLabel(alert) {
  const key = inferActionKey(alert);
  if (key === "buy") return state.language === "en" ? "Buy" : "Compra";
  if (key === "sell") return state.language === "en" ? "Sell" : "Venta";
  if (key === "range") return state.language === "en" ? "Range" : "Rango";
  return state.language === "en" ? "Check" : "Control";
}

function actionBadgeClass(key) {
  if (key === "buy") return "badge-buy";
  if (key === "sell") return "badge-sell";
  if (key === "range") return "badge-range";
  return "badge-idle";
}

function alertChartToneClass(actionKey) {
  if (actionKey === "buy") return "buy";
  if (actionKey === "sell") return "sell";
  return "";
}

function buildAlertSparklineGeometry(chart) {
  const rawPoints = Array.isArray(chart?.points) ? chart.points : [];
  const normalizedPoints = rawPoints
    .map((point) => ({
      price: Number(point?.price),
      time: String(point?.time || "")
    }))
    .filter((point) => Number.isFinite(point.price));

  if (!normalizedPoints.length) return null;

  const points = normalizedPoints.length === 1
    ? [normalizedPoints[0], normalizedPoints[0]]
    : normalizedPoints;

  const width = 184;
  const height = 52;
  const targetValues = [chart?.targetPrice, chart?.targetPriceMax]
    .map(Number)
    .filter(Number.isFinite);
  const seriesValues = points.map((point) => point.price).filter(Number.isFinite);
  const seriesMin = Math.min(...seriesValues);
  const seriesMax = Math.max(...seriesValues);
  let minPrice = seriesMin;
  let maxPrice = seriesMax;

  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
    return null;
  }

  if (minPrice === maxPrice) {
    const offset = Math.max(Math.abs(minPrice) * 0.04, 0.5);
    minPrice -= offset;
    maxPrice += offset;
  } else {
    const range = maxPrice - minPrice;
    const offset = Math.max(range * 0.08, Math.abs(maxPrice || 1) * 0.002, 0.001);
    minPrice -= offset;
    maxPrice += offset;
  }

  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const toY = (value) => {
    const ratio = (value - minPrice) / (maxPrice - minPrice);
    return height - (ratio * height);
  };
  const clampY = (value) => Math.min(height - 4, Math.max(4, value));

  const coordinates = points.map((point, index) => ({
    x: stepX * index,
    y: clampY(toY(point.price)),
    price: point.price,
    time: point.time
  }));

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L${coordinates[coordinates.length - 1].x.toFixed(2)} ${height.toFixed(2)} L${coordinates[0].x.toFixed(2)} ${height.toFixed(2)} Z`;

  return {
    width,
    height,
    linePath,
    areaPath,
    targetLines: targetValues.map((value) => ({
      value,
      y: clampY(toY(value)),
      outOfRange: value < seriesMin || value > seriesMax
    })),
    latest: coordinates[coordinates.length - 1],
    minLabel: formatNumber(seriesMin),
    maxLabel: formatNumber(seriesMax)
  };
}

function alertSparklineMarkup(chart, actionKey) {
  const geometry = buildAlertSparklineGeometry(chart);
  if (!geometry) return "";
  const hasTargetMax = Number.isFinite(Number(chart?.targetPriceMax));
  const hasTarget = Number.isFinite(Number(chart?.targetPrice));
  const targetLabel = hasTargetMax
    ? `${formatNumber(chart?.targetPrice)}-${formatNumber(chart?.targetPriceMax)}`
    : hasTarget
      ? formatNumber(chart?.targetPrice)
      : "";
  return `
    <div class="alert-sparkline-shell ${alertChartToneClass(actionKey)}">
      <div class="alert-sparkline-head">
        <span class="alert-sparkline-kicker">${escapeHtml(langText("Gráfico 10 días", "10-day chart"))}</span>
        <span class="alert-sparkline-target-copy">${targetLabel ? `${escapeHtml(langText("Meta", "Target"))}: ${escapeHtml(targetLabel)}` : ""}</span>
      </div>
      <svg class="alert-sparkline-svg" viewBox="0 0 ${geometry.width} ${geometry.height}" role="img" aria-label="${escapeHtml(langText("Serie compacta de 10 días", "Compact 10-day series"))}">
        <line class="alert-sparkline-grid" x1="0" y1="14" x2="${geometry.width}" y2="14"></line>
        <line class="alert-sparkline-grid" x1="0" y1="28" x2="${geometry.width}" y2="28"></line>
        <line class="alert-sparkline-grid" x1="0" y1="42" x2="${geometry.width}" y2="42"></line>
        ${geometry.targetLines.map((line) => `
          <line class="alert-sparkline-target" x1="0" y1="${line.y.toFixed(2)}" x2="${geometry.width}" y2="${line.y.toFixed(2)}"></line>
        `).join("")}
        <text class="alert-sparkline-label" x="1" y="11">${escapeHtml(geometry.maxLabel)}</text>
        <text class="alert-sparkline-label" x="1" y="50">${escapeHtml(geometry.minLabel)}</text>
        <text class="alert-sparkline-time-label" x="165" y="50">${escapeHtml(langText("hoy", "today"))}</text>
        <path class="alert-sparkline-area" d="${geometry.areaPath}"></path>
        <path class="alert-sparkline-line" d="${geometry.linePath}"></path>
        <circle class="alert-sparkline-dot" cx="${geometry.latest.x.toFixed(2)}" cy="${geometry.latest.y.toFixed(2)}" r="2.2"></circle>
      </svg>
    </div>
  `;
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

function syncRealmScopedLocalState(realmId, { force = false } = {}) {
  const normalizedRealmId = normalizeRealmId(realmId);
  localStorage.setItem(ACTIVE_REALM_STORAGE_KEY, String(normalizedRealmId));
  if (!force && state.localRealmStateSynced && state.localRealmId === normalizedRealmId) return;

  state.localRealmId = normalizedRealmId;
  state.localRealmStateSynced = true;
  state.calculatorBook = loadCalculatorBook(normalizedRealmId, { migrateLegacy: true });
  state.calculator = activeCalculatorFromBook(state.calculatorBook);
  resetCalculatorResourceSelectorState();
  state.calculatorUnitsSelectorOpen = false;

  state.contacts = loadContacts(normalizedRealmId, { migrateLegacy: true });
  state.contactSearch = "";
  state.contactTypeFilter = "todos";
  state.contactTrustFilter = "todos";
  state.contactRubroFilter = "todos";
  state.contactPage = 1;
  state.contactDraft = emptyContactDraft();
  state.contactSelectorOpen = false;
  state.contactTypeSelectorOpen = false;
  state.contactActiveGroup = null;
  state.contactResourceSearch = "";
  state.contactSelectedRubros = {};
  state.currentHistoryContactId = null;
}

function syncDraftFromDashboard(dashboard) {
  syncNotificationState(dashboard);
  state.dashboard = dashboard;
  cacheResourceCatalog(dashboard.resourceCatalog);
  syncPortfolioStateFromDashboard(dashboard);
  const dashboardRealmId = normalizeRealmId(dashboard.config?.activeRealmId ?? dashboard.config?.realmId ?? 0);
  syncRealmScopedLocalState(dashboardRealmId);
  state.updates = {
    ...state.updates,
    ...(dashboard.updates || {})
  };
  state.draft = {
    alerts: clone((dashboard.alerts || []).map(editableAlert)),
    channels: clone(dashboard.config?.channels || {}),
    config: {
      realmId: dashboardRealmId,
      activeRealmId: dashboardRealmId,
      pollSeconds: dashboard.config?.pollSeconds ?? 180,
      scanEnabled: dashboard.config?.scanEnabled !== false
    }
  };
  state.realmProfiles = clone(dashboard.config?.realms || {});
  if (!state.selectedAlertId || !state.draft.alerts.some((item) => item.id === state.selectedAlertId)) {
    state.selectedAlertId = state.draft.alerts[0]?.id || null;
  }
  resetResourceSelectorState();
  resetConditionSelectorState();
  state.resourceManualMode = false;
  setDirty(false);
}

function eventIdentity(item) {
  return String(item?.eventId || `${item?.type || "event"}-${item?.time || ""}-${item?.alertId || item?.label || ""}`);
}

function latestEventIdentity(events) {
  return Array.isArray(events) && events.length ? eventIdentity(events[0]) : "";
}

function markNotificationsSeen(events = state.dashboard?.events) {
  const nextSeen = latestEventIdentity(events);
  state.notificationsLastSeen = nextSeen;
  if (nextSeen) {
    localStorage.setItem(NOTIFICATIONS_SEEN_STORAGE_KEY, nextSeen);
  } else {
    localStorage.removeItem(NOTIFICATIONS_SEEN_STORAGE_KEY);
  }
}

function syncNotificationState(nextDashboard) {
  const nextEvents = Array.isArray(nextDashboard?.events) ? nextDashboard.events : [];
  const latestSeen = latestEventIdentity(nextEvents);
  if (!latestSeen) {
    state.notificationsUnread = false;
    markNotificationsSeen([]);
    return;
  }
  if (state.notificationsOpen) {
    markNotificationsSeen(nextEvents);
    state.notificationsUnread = false;
    return;
  }
  state.notificationsUnread = latestSeen !== state.notificationsLastSeen;
}

function setDirty(nextValue) {
  state.dirty = nextValue;
  const pill = byId("draftStatPill");
  if (pill) {
    pill.innerHTML = nextValue
      ? (state.language === "en" ? "Status <span>Pending</span>" : "Estado <span>Pendiente</span>")
      : (state.language === "en" ? "Status <span>Saved</span>" : "Estado <span>Guardado</span>");
    pill.classList.toggle("attention", nextValue);
  }
  renderSaveButtonState();
}

function renderSaveButtonState() {
  const button = byId("saveButton");
  if (!button) return;
  const validation = draftValidationSummary();
  if (!validation.isValid) {
    button.textContent = validation.invalidCount === 1
      ? (state.language === "en" ? "Fix 1 alert" : "Corregir 1 alerta")
      : (state.language === "en" ? `Fix ${validation.invalidCount} alerts` : `Corregir ${validation.invalidCount} alertas`);
    button.disabled = true;
    return;
  }
  button.disabled = false;
  button.textContent = state.dirty ? t("savePendingChanges") : t("saveChanges");
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
      ? (state.language === "en"
        ? `between ${formatNumber(alert.targetPrice)} and ${formatNumber(alert.targetPriceMax)}`
        : `entre ${formatNumber(alert.targetPrice)} y ${formatNumber(alert.targetPriceMax)}`)
      : formatNumber(alert.targetPrice)),
    triggerSentence: runtime.triggerSentence || (state.language === "en" ? "No reading yet" : "Sin lectura"),
    gapDisplay: runtime.gapDisplay || "-",
    gapPercentDisplay: runtime.gapPercentDisplay || "-",
    gapSentence: runtime.gapSentence || (state.language === "en" ? "There is no reading loaded for this alert yet." : "Todavía no hay una lectura cargada para esta alerta."),
    statusText: runtime.statusText || (alert.enabled ? (state.language === "en" ? "No reading" : "Sin lectura") : (state.language === "en" ? "Paused" : "Pausada")),
    statusTone: runtime.statusTone || (alert.enabled ? "idle" : "muted"),
    lastSeenLocal: runtime.lastSeenLocal || "-",
    lastSeenCompact: formatCompactReading(runtime.lastSeenAt || runtime.sourceTime || ""),
    matched: Boolean(runtime.matched),
    logoUrl: runtime.logoUrl || resourceEntry(alert.resourceId)?.logoUrl || ""
  };
}

function validateDraftPayload() {
  const alerts = state.draft.alerts.map((alert, index) => {
    const fallbackLabel = state.language === "en" ? `Alert ${index + 1}` : `Alerta ${index + 1}`;
    const label = String(alert.label || fallbackLabel).trim() || fallbackLabel;
    const resourceId = Number(alert.resourceId);
    const qualityRaw = String(alert.quality ?? "").trim();
    const quality = Number(qualityRaw);
    const targetRaw = String(alert.targetPrice ?? "").trim();
    if (!Number.isFinite(resourceId) || resourceId <= 0) {
      throw new Error(langText(`La alerta "${label}" tiene un activo inválido.`, `Alert "${label}" has an invalid asset.`));
    }
    if (!qualityRaw.length || !Number.isInteger(quality) || quality < 0 || quality > 12) {
      throw new Error(langText(`Completa una calidad válida entre Q0 y Q12 para "${label}".`, `Enter a valid quality between Q0 and Q12 for "${label}".`));
    }
    if (!targetRaw.length || !Number.isFinite(Number(targetRaw))) {
      throw new Error(langText(`Completa el precio gatillo de "${label}".`, `Enter the trigger price for "${label}".`));
    }
    if (editorConditionValue(alert.condition) === "between") {
      const targetMaxRaw = String(alert.targetPriceMax ?? "").trim();
      if (!targetMaxRaw.length || !Number.isFinite(Number(targetMaxRaw))) {
        throw new Error(langText(`Completa el precio máximo de "${label}".`, `Enter the maximum price for "${label}".`));
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

  const activeRealmId = normalizeRealmId(state.draft.config.activeRealmId ?? state.draft.config.realmId);
  const realms = clone(state.realmProfiles || {});
  REALM_OPTIONS.forEach((realm) => {
    const key = String(realm.id);
    realms[key] = {
      alerts: Array.isArray(realms[key]?.alerts) ? clone(realms[key].alerts) : [],
      portfolio: Array.isArray(realms[key]?.portfolio) ? clone(realms[key].portfolio) : []
    };
  });
  realms[String(activeRealmId)] = {
    alerts: clone(alerts),
    portfolio: clone(state.portfolioHoldings)
  };

  return {
    realmId: activeRealmId,
    activeRealmId,
    pollSeconds: 300,
    scanEnabled: state.draft.config.scanEnabled !== false,
    channels: state.draft.channels,
    alerts,
    portfolio: clone(state.portfolioHoldings),
    realms
  };
}

function draftPayload() {
  return validateDraftPayload();
}

async function persistDraft(showSuccessMessage = true) {
  const dashboard = await callDesktop("saveConfig", draftPayload());
  syncDraftFromDashboard(dashboard);
  renderAll();
  if (showSuccessMessage) showToast(state.language === "en" ? "Changes saved" : "Cambios guardados");
}

function renderActiveView() {
  const active = viewMeta();
  ["mercado", "calculadora", "cartera", "ejecutivos", "registro"].forEach((view) => {
    byId(`view-${view}`)?.classList.toggle("active", active.id === view);
    byId(`tab-${view}`)?.classList.toggle("active", active.id === view);
  });
  byId("marketToolbar").style.display = active.toolbarVisible ? "" : "none";
  byId("viewTitle").textContent = active.title;
  renderCalculatorResourceSelector();
  renderCalculatorUnitsSelector();
  renderPortfolioView();
  renderExecutiveView();
}

function switchView(view) {
  state.activeView = ["mercado", "calculadora", "cartera", "ejecutivos", "registro"].includes(view) ? view : "mercado";
  localStorage.setItem(VIEW_STORAGE_KEY, state.activeView);
  renderActiveView();
}

function renderHeader() {
  const dashboard = state.dashboard;
  if (!dashboard) return;
  byId("headerMonitorStat").textContent = dashboard.monitor?.statusLabel || t("noData");
  byId("headerAlertsStat").textContent = String(dashboard.summary?.enabledAlerts || 0);
  byId("headerOpportunityStat").textContent = String(dashboard.summary?.matchedAlerts || 0);
  byId("headerScanStat").textContent = formatHeaderTime(dashboard.scan?.scannedAt);
  renderSaveButtonState();
  renderScanToggleButton();
  renderUpdateButton();
  renderRealmToggle();
}

function renderScanToggleButton() {
  const button = byId("scanToggleButton");
  if (!button) return;
  const scanEnabled = state.dashboard?.monitor?.scanEnabled !== false;
  button.textContent = scanEnabled ? t("stopScan") : t("startScan");
  button.classList.toggle("action-btn-danger", scanEnabled);
  button.classList.toggle("action-btn-success", !scanEnabled);
}

function updateButtonLabel() {
  const updates = state.updates;
  if (updates.checking) return state.language === "en" ? "Checking for updates" : "Buscando actualizaciones";
  if (updates.downloaded) return state.language === "en" ? "Install update" : "Instalar actualización";
  if (updates.downloading) return state.language === "en" ? `Downloading ${Math.round(updates.progress || 0)}%` : `Descargando actualización ${Math.round(updates.progress || 0)}%`;
  if (updates.available) return state.language === "en" ? "Download update" : "Descargar actualización";
  return t("checkUpdates");
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
  if (updates.error) return state.language === "en" ? "Could not check for updates" : "No se pudieron revisar las actualizaciones";
  if (updates.downloaded) return state.language === "en" ? "Update ready to install" : "Actualización lista para instalar";
  if (updates.downloading) return state.language === "en" ? "Downloading update" : "Descargando actualización";
  if (updates.available) return state.language === "en" ? "An update is available" : "Hay una actualización disponible";
  if (updates.checking) return state.language === "en" ? "Checking for updates" : "Buscando actualizaciones";
  return state.language === "en" ? "SimMarket up to date" : "SimMarket actualizado";
}

function updateModalBody() {
  const updates = state.updates;
  if (updates.error) return updates.error;
  if (updates.downloaded) {
    return state.language === "en"
      ? `SimMarket ${updates.latestVersion || ""} is already downloaded and ready to install.`
      : `SimMarket ${updates.latestVersion || ""} ya está descargada y lista para instalar.`;
  }
  if (updates.downloading) {
    return state.language === "en"
      ? `SimMarket ${updates.latestVersion || ""} is downloading. Once it finishes you will be able to install it.`
      : `Se está descargando SimMarket ${updates.latestVersion || ""}. Cuando termine vas a poder instalarla.`;
  }
  if (updates.available) {
    if (updates.platform === "win32") {
      return state.language === "en"
        ? `SimMarket ${updates.latestVersion || ""} was detected and Windows will download it automatically.`
        : `Se detectó SimMarket ${updates.latestVersion || ""} y Windows va a descargarla automáticamente.`;
    }
    return state.language === "en"
      ? `SimMarket ${updates.latestVersion || ""} was detected. We can open the official GitHub download if you want.`
      : `Se detectó SimMarket ${updates.latestVersion || ""}. Si querés, abrimos la descarga oficial desde GitHub.`;
  }
  if (updates.checking) {
    return state.language === "en"
      ? "We are checking GitHub to see if there is a newer version."
      : "Estamos consultando GitHub para ver si hay una versión más nueva.";
  }
  return state.language === "en"
    ? `You are already on the latest available version (${updates.currentVersion || "current"}).`
    : `Ya estás en la última versión disponible (${updates.currentVersion || "actual"}).`;
}

function updatePrimaryButtonLabel() {
  const updates = state.updates;
  if (updates.error) return t("close");
  if (updates.downloaded) return updates.platform === "win32" ? (state.language === "en" ? "Install now" : "Instalar ahora") : t("close");
  if (updates.available) return updates.platform === "win32" ? (state.language === "en" ? "Downloading..." : "Descargando...") : t("download");
  return t("close");
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
  if (updates.currentVersion) metaBits.push(state.language === "en" ? `Current ${updates.currentVersion}` : `Actual ${updates.currentVersion}`);
  if (updates.latestVersion) metaBits.push(state.language === "en" ? `New ${updates.latestVersion}` : `Nueva ${updates.latestVersion}`);
  if (updates.lastCheckedAt) metaBits.push(state.language === "en" ? `Checked ${formatCompactReading(updates.lastCheckedAt)}` : `Revisado ${formatCompactReading(updates.lastCheckedAt)}`);
  meta.textContent = metaBits.join(" · ");

  const showProgress = Boolean(updates.downloading || updates.downloaded);
  progressWrap.classList.toggle("hidden", !showProgress);
  progressFill.style.width = `${Math.max(0, Math.min(100, Number(updates.progress || 0)))}%`;
  progressLabel.textContent = updates.downloaded ? "100%" : `${Math.round(updates.progress || 0)}%`;

  primary.textContent = updatePrimaryButtonLabel();
  primary.disabled = Boolean((updates.platform === "win32" && updates.downloading) || (!updates.downloaded && !updates.available && !updates.error));
  dismiss.textContent = updates.downloaded && updates.platform === "win32"
    ? (state.language === "en" ? "Later" : "Más tarde")
    : t("notNow");
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
  const suffix = monitor.affectedAlerts
    ? (state.language === "en"
      ? ` · ${monitor.affectedAlerts} affected alert${monitor.affectedAlerts === 1 ? "" : "s"}`
      : ` · ${monitor.affectedAlerts} alerta${monitor.affectedAlerts === 1 ? "" : "s"} afectada${monitor.affectedAlerts === 1 ? "" : "s"}`)
    : "";
  banner.className = `market-health-banner ${toneClass}`;
  banner.innerHTML = `
    <div class="market-health-title">${escapeHtml(monitor.marketTitle || (state.language === "en" ? "Market status" : "Estado del mercado"))}</div>
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

  const steps = onboardingSteps();
  const step = steps[state.onboardingStep] || steps[0];
  title.textContent = step.title;
  body.textContent = step.body;
  points.innerHTML = step.points.map((point) => `<div class="onboarding-point">${escapeHtml(point)}</div>`).join("");
  progress.innerHTML = steps.map((_item, index) => `<span class="onboarding-dot${index === state.onboardingStep ? " active" : ""}"></span>`).join("");
  back.style.visibility = state.onboardingStep === 0 ? "hidden" : "visible";
  next.textContent = step.finalAction ? t("onboardingCreateAlert") : t("onboardingNext");
}

function renderSelectedRuntime() {
  const alert = selectedAlert();
  if (!alert) {
    byId("selectedRuntime").innerHTML = `<div class="empty-card">${escapeHtml(state.language === "en" ? "There are no alerts yet." : "Todavía no hay alertas.")}</div>`;
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
        <div class="summary-meta">${escapeHtml(resourceLabel(item.resourceId))} · ${escapeHtml(qualityLabel(item.quality))} · ID ${escapeHtml(item.resourceId)}</div>
      </div>
      <span class="badge ${actionBadgeClass(item.actionKey)}">${escapeHtml(item.actionLabel)}</span>
    </div>
    <div class="summary-metrics">
      <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Current price" : "Precio actual")}</span><strong>${escapeHtml(item.priceDisplay)}</strong></div>
      <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Your target" : "Tu objetivo")}</span><strong>${escapeHtml(item.targetDisplay)}</strong></div>
      <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Remaining gap" : "Cuánto falta")}</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
    </div>
    <div class="summary-line"><strong>${escapeHtml(state.language === "en" ? "Status:" : "Estado:")}</strong> ${escapeHtml(item.statusText)}</div>
    <div class="summary-line"><strong>${escapeHtml(state.language === "en" ? "Reading:" : "Lectura:")}</strong> ${escapeHtml(item.gapSentence)}</div>
    <div class="summary-line"><strong>${escapeHtml(state.language === "en" ? "Last review:" : "Última revisión:")}</strong> ${escapeHtml(item.lastSeenLocal)}</div>
    ${firstError ? `<div class="summary-line summary-line-error"><strong>${escapeHtml(state.language === "en" ? "Review:" : "Revisar:")}</strong> ${escapeHtml(firstError)}</div>` : ""}
  `;
}

function resourceSelectionSummary(alert) {
  const selectedItem = resourceEntry(alert.resourceId);
  if (selectedItem) {
    return {
      title: catalogItemLabel(selectedItem),
      subtitle: `${catalogItemGroup(selectedItem)} · ${selectedItem.apiName} · ID ${selectedItem.id}`
    };
  }
  return {
    title: state.language === "en" ? "Select asset" : "Seleccionar activo",
    subtitle: state.language === "en" ? "Choose a product for this alert" : "Elegí un producto para esta alerta"
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
      title: state.language === "en" ? "Greater than" : "Mayor que"
    };
  }
  if (normalized === "between") {
    return {
      value: "between",
      title: state.language === "en" ? "Between two prices" : "Entre dos precios"
    };
  }
  return {
    value: "<",
    title: state.language === "en" ? "Less than" : "Menor que"
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
    return `<div class="selector-empty">${escapeHtml(langText("No hay otras opciones disponibles.", "There are no other options available."))}</div>`;
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
      return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No groups match the search." : "No hay rubros que coincidan con la búsqueda.")}</div>`;
    }
    const selectedGroup = resourceEntry(alert.resourceId)?.groupKey || resourceEntry(alert.resourceId)?.group || "";
    const normalizedQuery = normalizeSearch(state.resourceSearch);
    return groups.map((entry) => {
      const active = entry.key === selectedGroup;
      let helper = state.language === "en"
        ? `${entry.items.length} asset${entry.items.length === 1 ? "" : "s"}`
        : `${entry.items.length} activos`;
      if (normalizedQuery) {
        helper = normalizeSearch(entry.name).includes(normalizedQuery) && entry.matchedItems.length === entry.items.length
          ? helper
          : state.language === "en"
            ? `${entry.visibleCount} match${entry.visibleCount === 1 ? "" : "es"}`
            : `${entry.visibleCount} coincidencia${entry.visibleCount === 1 ? "" : "s"}`;
      }
      return `
        <button class="selector-option${active ? " active" : ""}" type="button" data-action="open-resource-group" data-resource-group="${escapeHtml(entry.key)}">
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
    return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No assets match the search." : "No hay activos que coincidan con la búsqueda.")}</div>`;
  }

  return items.map((item) => {
    const active = Number(item.id) === Number(alert.resourceId);
    return `
      <button class="selector-option${active ? " active" : ""}" type="button" data-action="select-resource" data-resource-id="${item.id}">
        <div class="selector-option-main">
          ${avatarMarkup({ resourceId: item.id, resourceName: catalogItemLabel(item), logoUrl: item.logoUrl }, "A")}
          <span>${escapeHtml(catalogItemLabel(item))}</span>
        </div>
        <small>${escapeHtml(item.apiName)} · ID ${item.id}</small>
      </button>
    `;
  }).join("");
}

function editorMarkup(alert) {
  if (!alert) return `<div class="empty-card">${escapeHtml(state.language === "en" ? "Select an alert to edit it." : "Selecciona una alerta para editarla.")}</div>`;
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
          <div class="summary-name">${escapeHtml(alert.label || (state.language === "en" ? "New alert" : "Nueva alerta"))}</div>
          <div class="summary-meta">${escapeHtml(resourceLabel(alert.resourceId))} · ${escapeHtml(qualityLabel(alert.quality))} · ID ${escapeHtml(alert.resourceId)}</div>
        </div>
        <span class="badge ${statusBadgeClass(merged.statusTone, alert.enabled)}">${escapeHtml(merged.statusText)}</span>
      </div>

      <div class="editor-preview">
        <div class="editor-preview-label">${escapeHtml(state.language === "en" ? "Interpretation" : "Así se interpreta")}</div>
        <div class="editor-preview-title">${escapeHtml(merged.triggerSentence || (state.language === "en" ? "No reading" : "Sin lectura"))}</div>
        <div class="editor-preview-subtitle">${escapeHtml(merged.gapSentence || "")}</div>
      </div>

      <div class="input-group">
        <label for="editorLabel">${escapeHtml(state.language === "en" ? "Visible name" : "Nombre visible")}</label>
        <input id="editorLabel" class="styled-input" data-field="label" type="text" value="${escapeHtml(alert.label)}" />
      </div>

      <div class="input-group">
        <label>${escapeHtml(state.language === "en" ? "Asset" : "Activo")}</label>
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
              ${state.resourceActiveGroup ? `<button type="button" class="selector-action-btn" data-action="back-resource-groups">${escapeHtml(state.language === "en" ? "Back to groups" : "Volver a rubros")}</button>` : ""}
            </div>
            <div class="selector-list">${resourceSelectorOptionsMarkup(alert)}</div>
          </div>
        </div>
        ${errors.resourceId ? `<div class="input-error-copy">${escapeHtml(errors.resourceId)}</div>` : ""}
      </div>

      <div class="form-row">
        <div class="input-group${errors.quality ? " error" : ""}">
          <label for="editorQuality">${escapeHtml(state.language === "en" ? "Quality (Q)" : "Calidad (Q)")}</label>
          <input id="editorQuality" class="styled-input no-spinner${errors.quality ? " is-invalid" : ""}" data-field="quality" type="number" min="0" max="12" step="1" value="${escapeHtml(alert.quality)}" />
          ${errors.quality ? `<div class="input-error-copy">${escapeHtml(errors.quality)}</div>` : ""}
        </div>
        <div class="input-group">
          <label>${escapeHtml(state.language === "en" ? "Alert type" : "Tipo de alerta")}</label>
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
      </div>

      <div class="input-group${errors.targetPrice ? " error" : ""}">
        <label for="editorTarget">${escapeHtml(state.language === "en" ? "Trigger price" : "Precio gatillo")}</label>
        <input id="editorTarget" class="styled-input${errors.targetPrice ? " is-invalid" : ""}" data-field="targetPrice" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPrice)}" />
        ${errors.targetPrice ? `<div class="input-error-copy">${escapeHtml(errors.targetPrice)}</div>` : ""}
      </div>

      <div id="editorTargetMaxGroup" class="input-group ${targetMaxClass}${errors.targetPriceMax ? " error" : ""}">
        <label for="editorTargetMax">${escapeHtml(state.language === "en" ? "Maximum price" : "Precio máximo")}</label>
        <input id="editorTargetMax" class="styled-input${errors.targetPriceMax ? " is-invalid" : ""}" data-field="targetPriceMax" type="number" min="0" step="0.001" value="${escapeHtml(alert.targetPriceMax)}" />
        ${errors.targetPriceMax ? `<div class="input-error-copy">${escapeHtml(errors.targetPriceMax)}</div>` : ""}
      </div>

      <label class="inline-toggle">
        <span>${escapeHtml(state.language === "en" ? "Alert enabled" : "Alerta activa")}</span>
        <input data-field="enabled" type="checkbox" ${alert.enabled ? "checked" : ""} />
      </label>

      <label class="inline-toggle">
        <span>${escapeHtml(state.language === "en" ? "Notify on every scan while it stays in zone" : "Avisar en cada escaneo mientras siga en zona")}</span>
        <input data-field="repeatWhileMatched" type="checkbox" ${alert.repeatWhileMatched ? "checked" : ""} />
      </label>

      <div class="editor-actions">
        <button id="removeAlertButton" class="action-btn action-btn-danger" type="button">${escapeHtml(state.language === "en" ? "Delete alert" : "Eliminar alerta")}</button>
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

function alertPageCount(totalItems) {
  return Math.max(1, Math.ceil(totalItems / ALERTS_PER_PAGE));
}

function clampAlertPage(totalItems) {
  state.alertPage = Math.min(Math.max(1, state.alertPage), alertPageCount(totalItems));
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
  return normalizeSearch([item.label, merged.resourceName, item.resourceId, qualityLabel(item.quality)].join(" ")).includes(query);
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
          <div class="contact-meta">${escapeHtml(resourceLabel(item.resourceId))} · ${escapeHtml(qualityLabel(item.quality))} · ID ${escapeHtml(item.resourceId)}</div>
        </div>
        <span class="badge ${actionBadgeClass(item.actionKey)}">${escapeHtml(item.actionLabel)}</span>
      </div>
      <div class="market-grid">
        <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Current price" : "Precio actual")}</span><strong>${escapeHtml(item.priceDisplay)}</strong></div>
        <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Target" : "Objetivo")}</span><strong>${escapeHtml(item.targetDisplay)}</strong></div>
        <div class="metric-box"><span>${escapeHtml(state.language === "en" ? "Gap" : "Brecha")}</span><strong>${escapeHtml(item.gapDisplay)}</strong></div>
      </div>
      <hr class="card-divider" />
      <div class="alert-body">
        <div class="alert-copy${item.chart ? " with-chart" : ""}">
          <div class="copy-main">
          <div class="card-perception">${escapeHtml(item.triggerSentence)}</div>
          <div class="card-notes">${escapeHtml(item.gapSentence)}</div>
          </div>
          <div class="card-tags">
            <span class="tag">${escapeHtml(item.statusText)}</span>
            <span class="tag">${escapeHtml(state.language === "en" ? "Last reading" : "Última lectura")} ${escapeHtml(item.lastSeenCompact)}</span>
            <span class="tag">${escapeHtml(state.language === "en" ? "Gap" : "Brecha")} ${escapeHtml(item.gapPercentDisplay)}</span>
            ${hasErrors ? `<span class="tag tag-error">${escapeHtml(state.language === "en" ? "Review data" : "Revisar datos")}</span>` : ""}
          </div>
        </div>
        ${item.chart ? alertSparklineMarkup(item.chart, item.actionKey) : ""}
      </div>
    </article>
  `;
}

function renderAlertList() {
  const items = state.draft.alerts.filter(passesFilter);
  const container = byId("alertsList");
  const countInfo = byId("alertsCountInfo");
  const pagination = byId("alertsPagination");
  if (!container || !countInfo || !pagination) return;
  clampAlertPage(items.length);
  const totalPages = alertPageCount(items.length);
  const pageStart = (state.alertPage - 1) * ALERTS_PER_PAGE;
  const paged = items.slice(pageStart, pageStart + ALERTS_PER_PAGE);
  countInfo.textContent = items.length
    ? items.length < state.draft.alerts.length
      ? (state.language === "en"
        ? `${items.length} of ${state.draft.alerts.length} alerts · Page ${state.alertPage} of ${totalPages}`
        : `${items.length} de ${state.draft.alerts.length} alertas · Página ${state.alertPage} de ${totalPages}`)
      : (state.language === "en"
        ? `Page ${state.alertPage} of ${totalPages}`
        : `Página ${state.alertPage} de ${totalPages}`)
    : "";
  container.innerHTML = items.length
    ? paged.map(alertCardMarkup).join("")
    : `<div class="empty-card">${escapeHtml(state.language === "en" ? "There are no alerts for that filter." : "No hay alertas para ese filtro.")}</div>`;
  pagination.innerHTML = items.length > ALERTS_PER_PAGE
    ? contactPaginationMarkup(items.length, state.alertPage, ALERTS_PER_PAGE, "alert")
    : "";
  stabilizePagedListHeight(container, {
    itemSelector: ":scope > .contact-card",
    perPage: ALERTS_PER_PAGE,
    fallbackItemHeight: 164,
    fallbackGap: 10
  });
}

function eventBadgeClass(type) {
  if (type === "trigger") return "badge-match";
  if (type === "error") return "badge-error";
  if (type === "cleared") return "badge-watch";
  return "badge-idle";
}

function eventDescription(item) {
  if (item.type === "trigger") return item.body || (state.language === "en" ? `${item.label}: alert triggered.` : `${item.label}: alerta disparada.`);
  if (item.type === "cleared") return state.language === "en" ? `${item.label}: left the watched zone.` : `${item.label}: salió de la zona vigilada.`;
  if (item.type === "error") return item.error || (state.language === "en" ? "Error without details." : "Error sin detalle.");
  return state.language === "en" ? "Monitor event." : "Evento del monitor.";
}

function renderEvents() {
  const events = state.dashboard?.events || [];
  const feed = byId("eventsFeed");
  if (!feed) return;
  feed.innerHTML = events.length
    ? events.map((item) => `
        <article class="event-card" data-event-id="${escapeHtml(item.eventId)}">
          <div class="event-head">
            <div class="event-title">${escapeHtml(item.label || item.alertId || item.type || (state.language === "en" ? "Event" : "Evento"))}</div>
            <div class="event-actions">
              <span class="badge ${eventBadgeClass(item.type)}">${escapeHtml(item.type || (state.language === "en" ? "event" : "evento"))}</span>
              <button class="mini-btn mini-btn-danger delete-event-btn" type="button">${escapeHtml(state.language === "en" ? "Delete" : "Eliminar")}</button>
            </div>
          </div>
          <div class="event-body">${escapeHtml(eventDescription(item))}</div>
          <div class="event-time">${escapeHtml(formatDateTime(item.time))}</div>
        </article>
      `).join("")
    : `<div class="empty-card">${escapeHtml(state.language === "en" ? "There are no recent movements yet." : "Todavía no hay movimientos recientes.")}</div>`;
  renderNotificationsButton();
}

function renderNotificationsButton() {
  const dot = byId("notificationsDot");
  const button = byId("notificationsButton");
  if (!dot || !button) return;
  dot.classList.toggle("hidden", !state.notificationsUnread);
  button.classList.toggle("has-unread", state.notificationsUnread);
  button.setAttribute(
    "aria-label",
    state.notificationsUnread
      ? (state.language === "en" ? "Open new notifications" : "Abrir notificaciones nuevas")
      : (state.language === "en" ? "Open notifications" : "Abrir notificaciones")
  );
}

function renderNotificationsModal() {
  const modal = byId("notificationsModal");
  if (!modal) return;
  modal.classList.toggle("visible", state.notificationsOpen);
}

function openNotificationsModal() {
  state.notificationsOpen = true;
  markNotificationsSeen();
  state.notificationsUnread = false;
  renderNotificationsButton();
  renderNotificationsModal();
  renderEvents();
}

function closeNotificationsModal() {
  state.notificationsOpen = false;
  renderNotificationsModal();
}

async function clearNotifications() {
  const dashboard = await callDesktop("clearEvents");
  markNotificationsSeen([]);
  state.notificationsUnread = false;
  state.dashboard = dashboard;
  renderAll();
  showToast(state.language === "en" ? "Inbox cleared" : "Casilla limpiada");
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
    return selections.map((selection) => {
      const rubro = displayGroupName(selection.rubro);
      if (!selection.products.length) {
        return `${rubro} · ${state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL}`;
      }
      return `${rubro} · ${selection.products.map(localizedProductName).join(", ")}`;
    }).join(" | ");
  }
  if (contact.productDisplay && contact.productDisplay !== VARIOS_LABEL) {
    return contact.productDisplay.split("|").map((chunk) => {
      const pieces = chunk.split("·").map((item) => item.trim()).filter(Boolean);
      if (!pieces.length) return chunk.trim();
      const [group, ...products] = pieces;
      const displayGroup = displayGroupName(group);
      if (!products.length) return displayGroup;
      return `${displayGroup} · ${products.join(" · ").split(",").map((item) => localizedProductName(item.trim())).join(", ")}`;
    }).join(" | ");
  }
  if (contact.resourceId !== "" && contact.resourceId !== null && contact.resourceId !== undefined) {
    const match = resourceEntry(contact.resourceId);
    if (match) {
      return `${catalogItemGroup(match)} · ${catalogItemLabel(match)}`;
    }
  }
  return localizedProductName(contact.productDisplay || contact.product || (state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL));
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
    return `<span class="selector-tag">${escapeHtml(state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL)}</span>`;
  }
  return selection.selections.map((item) => {
    if (!item.products.length) {
      return `<span class="selector-tag">${escapeHtml(`${displayGroupName(item.rubro)} · ${state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL}`)}</span>`;
    }
    return [
      `<span class="selector-tag">${escapeHtml(displayGroupName(item.rubro))}</span>`,
      ...item.products.map((product) => `<span class="selector-tag">${escapeHtml(localizedProductName(product))}</span>`)
    ].join("");
  }).join("");
}

function contactSelectionSummary() {
  const selection = getContactHierarchySelection();
  const rubroCount = selection.selections.length;
  const productCount = selection.selections.reduce((total, item) => total + item.products.length, 0);
  const localizedTitle = rubroCount
    ? contactResolvedProductDisplay({ selections: selection.selections, productDisplay: selection.productDisplay })
    : (state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL);
  return {
    title: localizedTitle,
    subtitle: rubroCount === 0
      ? (state.language === "en" ? "No specific selection" : "Sin selección específica")
      : state.language === "en"
        ? `${rubroCount} group${rubroCount === 1 ? "" : "s"} · ${productCount ? `${productCount} product${productCount === 1 ? "" : "s"}` : VARIOS_LABEL_EN}`
        : `${rubroCount} rubro${rubroCount === 1 ? "" : "s"} · ${productCount ? `${productCount} producto${productCount === 1 ? "" : "s"}` : VARIOS_LABEL}`
  };
}

function contactTypeSelectionSummary() {
  return { title: contactTypeLabel(state.contactDraft.type) };
}

function contactCrumbsMarkup() {
  if (!state.contactActiveGroup) {
    return `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Groups" : "Rubros")}</span>`;
  }
  return [
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Group" : "Rubro")}</span>`,
    `<span class="selector-tag">${escapeHtml(displayGroupName(state.contactActiveGroup))}</span>`,
    `<span class="selector-tag">${escapeHtml(state.language === "en" ? "Products" : "Productos")}</span>`
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
    return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No other options are available." : "No hay otras opciones disponibles.")}</div>`;
  }
  return options.map((option) => `
    <button class="selector-option" type="button" data-contact-action="select-type" data-contact-type="${escapeHtml(option)}">
      <div class="selector-option-main">
        <span>${escapeHtml(contactTypeLabel(option))}</span>
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
        helper: state.language === "en" ? "General" : "General",
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
          helper: state.contactSelectedRubros[entry.name]
            ? (state.language === "en" ? "Selected" : "Seleccionado")
            : (state.language === "en" ? `${entry.products.length} products` : `${entry.products.length} productos`),
          active: Boolean(state.contactSelectedRubros[entry.name])
        });
      }
    });

    if (!options.length) {
      return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No groups match the search." : "No hay rubros que coincidan con la búsqueda.")}</div>`;
    }

    return options.map((option) => `
      <button class="selector-option${option.active ? " active" : ""}" type="button" data-contact-action="open-group" data-resource-group="${escapeHtml(option.rubro)}">
        <div class="selector-option-main">
          <span>${escapeHtml(displayGroupName(option.rubro))}</span>
        </div>
        <small>${escapeHtml(option.helper)}</small>
      </button>
    `).join("");
  }

  const activeProducts = state.contactSelectedRubros[state.contactActiveGroup] || [];
  const products = [VARIOS_LABEL, ...contactProductsForGroup(state.contactActiveGroup)]
    .filter((product) => !normalizedQuery || normalizeSearch(product).includes(normalizedQuery));

  if (!products.length) {
    return `<div class="selector-empty">${escapeHtml(state.language === "en" ? "No products match the search." : "No hay productos que coincidan con la búsqueda.")}</div>`;
  }

  return products.map((product) => {
    const active = product === VARIOS_LABEL ? activeProducts.length === 0 : activeProducts.includes(product);
    const label = product === VARIOS_LABEL
      ? (state.language === "en" ? "All products in the group" : "Todos los productos del rubro")
      : (state.language === "en" ? "Product" : "Producto");
    return `
      <button class="selector-option${active ? " active" : ""}" type="button" data-contact-action="select-product" data-product-name="${escapeHtml(product)}">
        <div class="selector-option-main">
          <span>${escapeHtml(product === VARIOS_LABEL ? (state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL) : localizedProductName(product))}</span>
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
        ${contactTypeIconMarkup(draft.type, "lg")}
        <div class="summary-title">
          <div class="summary-name">${escapeHtml(draft.name || (state.language === "en" ? "New contact" : "Nuevo contacto"))}</div>
          <div class="summary-meta">${escapeHtml(contactTypeLabel(draft.type))} · ${escapeHtml(selectorSummary.title)}</div>
        </div>
        <span class="badge ${contactTrustClass(draft.trust)}">${escapeHtml(contactTrustLabel(draft.trust))}</span>
      </div>

      <div class="input-group">
        <label for="contactName">${escapeHtml(state.language === "en" ? "Contact name" : "Nombre del contacto")}</label>
        <input id="contactName" class="styled-input" data-contact-field="name" type="text" value="${escapeHtml(draft.name)}" placeholder="${escapeHtml(state.language === "en" ? "Enter company name" : "Ingrese el nombre de la empresa")}" />
      </div>

      <div class="input-group">
        <label>${escapeHtml(state.language === "en" ? "Contact type" : "Tipo de contacto")}</label>
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
        <label>${escapeHtml(state.language === "en" ? "Product / Group" : "Producto / Rubro")}</label>
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
            <input id="contactResourceSearch" class="selector-search" data-contact-field="resource-search" type="text" value="${escapeHtml(state.contactResourceSearch)}" placeholder="${escapeHtml(state.language === "en" ? "Search group or product..." : "Buscar rubro o producto...")}" />
            <div class="selector-crumbs">${contactCrumbsMarkup()}</div>
            <div class="selector-actions">
              <button type="button" class="selector-action-btn" data-contact-action="clear-selection">${escapeHtml(state.language === "en" ? VARIOS_LABEL_EN : VARIOS_LABEL)}</button>
              ${state.contactActiveGroup ? `<button type="button" class="selector-action-btn" data-contact-action="back-groups">${escapeHtml(state.language === "en" ? "Add group" : "Agregar rubro")}</button>` : ""}
              ${state.contactActiveGroup ? `<button type="button" class="selector-action-btn" data-contact-action="remove-rubro">${escapeHtml(state.language === "en" ? "Remove group" : "Quitar rubro")}</button>` : ""}
            </div>
            <div class="selector-list">${contactSelectorOptionsMarkup()}</div>
          </div>
        </div>
      </div>

      <div class="input-group">
        <label for="contactPerception">${escapeHtml(state.language === "en" ? "Perception" : "Percepción")}</label>
        <textarea id="contactPerception" class="styled-input" data-contact-field="perception" placeholder="${escapeHtml(state.language === "en" ? "Describe the company" : "Describa a la empresa")}">${escapeHtml(draft.perception)}</textarea>
      </div>

      <div class="input-group">
        <label for="contactNotes">${escapeHtml(state.language === "en" ? "Additional notes" : "Notas adicionales")}</label>
        <textarea id="contactNotes" class="styled-input" data-contact-field="notes" placeholder="${escapeHtml(state.language === "en" ? "Agreed prices, conditions, important details..." : "Precios acordados, condiciones, detalles importantes...")}">${escapeHtml(draft.notes)}</textarea>
      </div>

      <div class="input-group">
        <label>${escapeHtml(state.language === "en" ? "Trust level" : "Nivel de confianza")}</label>
        <div class="trust-options">
          ${CONTACT_TRUST_OPTIONS.map((option) => `
            <button class="trust-opt ${escapeHtml(option.tone)}${draft.trust === option.value ? " selected" : ""}" type="button" data-contact-action="select-trust" data-trust="${escapeHtml(option.value)}">${escapeHtml(contactTrustLabel(option.value))}</button>
          `).join("")}
        </div>
      </div>

      <div class="editor-actions">
        <button class="save-btn" type="button" data-contact-action="save-contact">${escapeHtml(state.language === "en" ? "Save contact" : "Guardar contacto")}</button>
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
    ? `<div class="card-notes register-card-notes"><div class="card-notes-label">${escapeHtml(state.language === "en" ? "Notes" : "Notas")}</div>${escapeHtml(contact.notes)}</div>`
    : "";
  const latestHistory = latestContactHistory(contact);
  const historyMarkup = latestHistory
    ? `
      <div class="history-preview">
        <div class="history-preview-head">
          <div class="history-preview-title">${escapeHtml(state.language === "en" ? "Latest interaction" : "Última interacción")}</div>
          <div class="history-preview-date">${escapeHtml(latestHistory.date || "")}</div>
        </div>
        <div class="history-preview-body">${escapeHtml(latestHistory.summary || "")}</div>
      </div>
    `
    : "";
  return `
    <article class="contact-card register-contact-card" data-contact-id="${escapeHtml(contact.id)}">
      <div class="card-top">
        ${contactTypeIconMarkup(contact.type, "md")}
        <div class="card-title">
          <div class="contact-name">${escapeHtml(contact.name)}</div>
          <div class="contact-meta">${escapeHtml([contactTypeLabel(contact.type), contactResolvedProductDisplay(contact)].join(" · "))}</div>
        </div>
        <span class="badge ${contactTrustClass(contact.trust)}">${escapeHtml(contactTrustLabel(contact.trust))}</span>
      </div>
      <hr class="card-divider" />
      <div class="card-perception">${escapeHtml(contact.perception || (state.language === "en" ? "No observations loaded yet." : "Sin observaciones cargadas todavía."))}</div>
      ${notesMarkup}
      ${historyMarkup}
      <div class="card-footer">
        <span class="card-date">${escapeHtml(state.language === "en" ? "Recorded:" : "Registrado:")} ${escapeHtml(contact.date || formatContactDate(contact.createdAt))}</span>
        <div class="card-actions">
          <button class="manage-btn" type="button" data-contact-action="open-history" data-contact-id="${escapeHtml(contact.id)}">${escapeHtml(state.language === "en" ? "History" : "Historial")}${contact.history?.length ? ` (${contact.history.length})` : ""}</button>
          <button class="delete-btn" type="button" data-contact-action="delete-contact" data-contact-id="${escapeHtml(contact.id)}">${escapeHtml(state.language === "en" ? "Delete" : "Eliminar")}</button>
        </div>
      </div>
    </article>
  `;
}

function renderContactTypeFilters() {
  const container = byId("contactTypeFilters");
  if (!container) return;
  const options = [
    { value: "todos", label: state.language === "en" ? "All" : "Todos" },
    { value: "Proveedor", label: contactTypeLabel("Proveedor", true) },
    { value: "Cliente", label: contactTypeLabel("Cliente", true) },
    { value: "Desconocido", label: contactTypeLabel("Desconocido", true) },
    { value: "Social", label: contactTypeLabel("Social", true) },
    { value: "Socio", label: contactTypeLabel("Socio", true) }
  ];
  container.innerHTML = options.map((option) => `
    <button class="filter-btn${state.contactTypeFilter === option.value ? " active" : ""}" data-contact-filter-group="type" data-contact-filter="${escapeHtml(option.value)}" type="button">${escapeHtml(option.label)}</button>
  `).join("");
}

function renderContactTrustFilters() {
  const container = byId("contactTrustFilters");
  if (!container) return;
  const options = [
    { value: "todos", label: state.language === "en" ? "All trust levels" : "Toda confianza" },
    { value: "Alto", label: contactTrustLabel("Alto") },
    { value: "Medio", label: contactTrustLabel("Medio") },
    { value: "Bajo", label: contactTrustLabel("Bajo") },
    { value: "Neutro", label: contactTrustLabel("Neutro") }
  ];
  container.innerHTML = options.map((option) => `
    <button class="filter-btn${state.contactTrustFilter === option.value ? " active" : ""}" data-contact-filter-group="trust" data-contact-filter="${escapeHtml(option.value)}" type="button">${escapeHtml(option.label)}</button>
  `).join("");
}

function renderContactRubroFilters() {
  const container = byId("contactRubroFilters");
  if (!container) return;
  const options = ["todos", ...contactHierarchyGroups().map((entry) => entry.name), VARIOS_LABEL];
  const uniqueOptions = uniqueList(options);
  container.innerHTML = uniqueOptions.map((option) => {
    const label = option === "todos"
      ? (state.language === "en" ? "All groups" : "Todos los rubros")
      : displayGroupName(option);
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
    countLabel.textContent = t("recordsCount", { count: total });
  }
  container.innerHTML = `
    <div class="stat-pill">${escapeHtml(state.language === "en" ? "Total" : "Total")} <span>${total}</span></div>
    <div class="stat-pill">${escapeHtml(contactTypeLabel("Proveedor", true))} <span>${providers}</span></div>
    <div class="stat-pill">${escapeHtml(state.language === "en" ? "High trust" : "Confianza alta")} <span>${trustHigh}</span></div>
  `;
}

function renderContactEditor() {
  const container = byId("contactEditorContainer");
  if (!container) return;
  container.innerHTML = contactEditorMarkup();
}

function contactPageCount(totalItems) {
  return Math.max(1, Math.ceil(totalItems / CONTACTS_PER_PAGE));
}

function clampContactPage(totalItems) {
  state.contactPage = Math.min(Math.max(1, state.contactPage), contactPageCount(totalItems));
}

function contactPaginationMarkup(totalItems, currentPage = state.contactPage, perPage = CONTACTS_PER_PAGE, scope = "contact") {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  return paginationMarkup(totalPages, currentPage, scope);
}

function numericCssValue(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value || ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stabilizePagedListHeight(container, {
  itemSelector,
  perPage,
  fallbackItemHeight,
  fallbackGap = 10,
  headerSelector = "",
  fallbackHeaderHeight = 0
} = {}) {
  if (!(container instanceof Element) || !itemSelector || !Number.isFinite(Number(perPage))) return;
  window.requestAnimationFrame(() => {
    const style = window.getComputedStyle(container);
    const gap = numericCssValue(style.rowGap, numericCssValue(style.gap, fallbackGap));
    const itemHeights = Array.from(container.querySelectorAll(itemSelector))
      .map((item) => item.getBoundingClientRect().height)
      .filter((height) => Number.isFinite(height) && height > 0);
    const measuredAverage = itemHeights.length
      ? itemHeights.reduce((total, height) => total + height, 0) / itemHeights.length
      : 0;
    const itemHeight = Math.max(fallbackItemHeight || 0, measuredAverage || 0);
    const header = headerSelector ? container.querySelector(headerSelector) : null;
    const headerHeight = header instanceof Element
      ? Math.max(fallbackHeaderHeight || 0, header.getBoundingClientRect().height || 0)
      : fallbackHeaderHeight || 0;
    const totalHeight = headerHeight
      + (itemHeight * Number(perPage))
      + (gap * Math.max(0, Number(perPage) - 1));
    if (Number.isFinite(totalHeight) && totalHeight > 0) {
      container.style.minHeight = `${Math.ceil(totalHeight)}px`;
    }
  });
}

function renderContactList() {
  const container = byId("contactsRegisterList");
  const countInfo = byId("contactCountInfo");
  const pagination = byId("contactPagination");
  if (!container || !countInfo || !pagination) return;
  const filtered = filteredContacts();
  clampContactPage(filtered.length);
  const totalPages = contactPageCount(filtered.length);
  const pageStart = (state.contactPage - 1) * CONTACTS_PER_PAGE;
  const paged = filtered.slice(pageStart, pageStart + CONTACTS_PER_PAGE);

  if (!state.contacts.length) {
    countInfo.textContent = "";
    pagination.innerHTML = "";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◈</div>
        <div class="empty-text">${escapeHtml(state.language === "en" ? "There are no registered contacts yet." : "Aún no hay contactos registrados.")}</div>
      </div>
    `;
    stabilizePagedListHeight(container, {
      itemSelector: ":scope > .register-contact-card",
      perPage: CONTACTS_PER_PAGE,
      fallbackItemHeight: 152,
      fallbackGap: 10
    });
    return;
  }

  if (!filtered.length) {
    countInfo.textContent = state.language === "en" ? "0 results" : "0 resultados";
    pagination.innerHTML = "";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◈</div>
        <div class="empty-text">${escapeHtml(state.language === "en" ? "No contacts were found<br>with the current filters." : "No se encontraron contactos<br>con los filtros actuales.")}</div>
      </div>
    `;
    stabilizePagedListHeight(container, {
      itemSelector: ":scope > .register-contact-card",
      perPage: CONTACTS_PER_PAGE,
      fallbackItemHeight: 152,
      fallbackGap: 10
    });
    return;
  }

  countInfo.textContent = filtered.length < state.contacts.length
    ? (state.language === "en"
      ? `${filtered.length} of ${state.contacts.length} contacts · Page ${state.contactPage} of ${totalPages}`
      : `${filtered.length} de ${state.contacts.length} contactos · Página ${state.contactPage} de ${totalPages}`)
    : (state.language === "en"
      ? `Page ${state.contactPage} of ${totalPages}`
      : `Página ${state.contactPage} de ${totalPages}`);
  container.innerHTML = paged.map(contactCardMarkup).join("");
  pagination.innerHTML = contactPaginationMarkup(filtered.length, state.contactPage, CONTACTS_PER_PAGE, "contact");
  stabilizePagedListHeight(container, {
    itemSelector: ":scope > .register-contact-card",
    perPage: CONTACTS_PER_PAGE,
    fallbackItemHeight: 152,
    fallbackGap: 10
  });
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
    list.innerHTML = `<div class="selector-empty">${escapeHtml(state.language === "en" ? "There are no interactions loaded for this contact yet." : "Todavía no hay interacciones cargadas para este contacto.")}</div>`;
    return;
  }

  list.innerHTML = contact.history.map((entry) => {
    const chatMarkup = entry.messages?.length
      ? `
        <div class="history-chat">
          ${entry.messages.map((message) => `
            <div class="chat-message ${message.speaker}">
              ${escapeHtml(message.text)}
              ${message.time ? `<span class="chat-meta">${escapeHtml(message.speaker === "me" ? (state.language === "en" ? "Your message · " : "Tu mensaje · ") : (state.language === "en" ? "Received message · " : "Mensaje recibido · "))}${escapeHtml(message.time)}</span>` : ""}
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
          <span class="history-tag">${entry.messages?.length ? (state.language === "en" ? `${entry.messages.length} message${entry.messages.length === 1 ? "" : "s"}` : `${entry.messages.length} mensaje${entry.messages.length === 1 ? "" : "s"}`) : (state.language === "en" ? "Manual note" : "Nota manual")}</span>
          <button class="history-delete" type="button" data-contact-action="delete-history-entry" data-history-id="${escapeHtml(entry.id)}">${escapeHtml(state.language === "en" ? "Delete" : "Eliminar")}</button>
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
  title.textContent = state.language === "en" ? `History for ${contact.name}` : `Historial de ${contact.name}`;
  subtitle.textContent = state.language === "en"
    ? "Add new interactions without touching the base contact card. You can paste full conversations and they will turn into readable bubbles."
    : "Agregá nuevas interacciones sin tocar la ficha base del contacto. Podés pegar conversaciones completas y se convierten en burbujas legibles.";
  renderHistoryList();
}

function clearHistoryForm() {
  const dateInput = byId("historyDateInput");
  const noteInput = byId("historyNoteInput");
  const conversationInput = byId("historyConversationInput");
  if (dateInput) dateInput.value = new Date().toLocaleDateString(numberLocale(), { day: "2-digit", month: "short", year: "numeric" });
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
    || new Date().toLocaleDateString(numberLocale(), { day: "2-digit", month: "short", year: "numeric" });
  const note = String(byId("historyNoteInput")?.value || "").trim();
  const conversationText = String(byId("historyConversationInput")?.value || "").trim();
  const parsedMessages = conversationText ? parseConversationText(conversationText) : [];
  const summary = buildHistorySummary(parsedMessages, note);

  if (!summary && !note && !parsedMessages.length) {
    showToast(state.language === "en" ? "Add a summary, a note, or paste a conversation before saving" : "Cargá un resumen, una nota o pegá una conversación antes de guardar", "error");
    return;
  }

  contact.history = contact.history || [];
  contact.history.unshift({
    id: `history-${Date.now()}`,
    date,
    summary: summary || (state.language === "en" ? "Saved interaction" : "Interacción guardada"),
    note,
    messages: parsedMessages
  });

  persistContacts();
  renderContactList();
  renderHistoryList();
  clearHistoryForm();
  showToast(state.language === "en" ? "Interaction saved" : "Interacción guardada");
}

function deleteHistoryEntry(entryId) {
  const contact = state.currentHistoryContactId ? findContactById(state.currentHistoryContactId) : null;
  if (!contact) return;
  contact.history = (contact.history || []).filter((entry) => entry.id !== entryId);
  persistContacts();
  renderContactList();
  renderHistoryList();
  showToast(state.language === "en" ? "Interaction deleted" : "Interacción eliminada");
}

function renderContactView() {
  const searchInput = byId("contactSearchInput");
  if (searchInput) {
    searchInput.value = state.contactSearch;
  }
  renderContactStats();
  renderContactEditor();
  renderContactFilters();
  renderContactList();
  renderHistoryModal();
}

function executiveSummaryMarkup() {
  const data = executiveDataset();
  const analysis = state.executive.analysis;
  const stale = analysis && executiveNeedsRefresh();
  if (analysis?.type === "match") {
    const roleMeta = executiveRoleMeta(analysis.displayRole.key);
    const band = executiveAnalysisBand(analysis);
    const confidence = executiveAnalysisConfidence(analysis);
    return `
      <div class="executive-summary-head">
        <div class="executive-summary-copy">
          <div class="executive-summary-kicker">${escapeHtml(langText("Lectura activa", "Active read"))}</div>
          <div class="executive-summary-title">${escapeHtml(roleMeta.short)} · ${escapeHtml(band.label)}</div>
          <div class="executive-summary-meta">${escapeHtml(confidence.label)} · ${analysis.totalMatches} ${escapeHtml(langText(`coincidencia${analysis.totalMatches === 1 ? "" : "s"} útiles`, `useful match${analysis.totalMatches === 1 ? "" : "es"}`))}</div>
        </div>
        <span class="executive-summary-role ${executiveRoleAccentClass(analysis.displayRole.key)}">${escapeHtml(roleMeta.short)}</span>
      </div>
      <div class="executive-summary-feedback">${escapeHtml(analysis.best.feedback)}</div>
      ${stale ? `<div class="executive-summary-alert">${escapeHtml(langText("Hay cambios sin analizar.", "There are unanalyzed changes."))}</div>` : ""}
    `;
  }

  if (analysis?.type === "no-match") {
    return `
      <div class="executive-summary-head">
        <div class="executive-summary-copy">
          <div class="executive-summary-kicker">${escapeHtml(langText("Radar sin match", "Radar without match"))}</div>
          <div class="executive-summary-title">${escapeHtml(langText("Sin coincidencia convincente", "No convincing match"))}</div>
          <div class="executive-summary-meta">${escapeHtml(langText("Conviene pegar el feedback completo para mejorar la señal", "It helps to paste the full feedback to improve the signal"))}</div>
        </div>
      </div>
      <div class="executive-summary-feedback">${escapeHtml(langText("La base está cargada, pero este texto todavía no se parece lo suficiente a un patrón mapeado.", "The base is loaded, but this text still does not resemble a mapped pattern enough."))}</div>
      <div class="card-tags executive-summary-tags">
        <span class="tag">${data.summary.profileCount} ${escapeHtml(langText("perfiles", "profiles"))}</span>
        <span class="tag">COO · CFO · CMO · CTO</span>
      </div>
    `;
  }

  return `
    <div class="executive-summary-head">
      <div class="executive-summary-copy">
        <div class="executive-summary-kicker">${escapeHtml(langText("Motor local", "Local engine"))}</div>
        <div class="executive-summary-title">${escapeHtml(langText("Radar ejecutivo listo", "Executive radar ready"))}</div>
        <div class="executive-summary-meta">${escapeHtml(langText("Dataset privado empaquetado dentro de SimMarket", "Private dataset bundled inside SimMarket"))}</div>
      </div>
    </div>
    <div class="summary-metrics executive-summary-metrics">
      <div class="metric-box"><span>${escapeHtml(langText("Perfiles", "Profiles"))}</span><strong>${data.summary.profileCount}</strong></div>
      <div class="metric-box"><span>${escapeHtml(langText("Motor", "Engine"))}</span><strong>${escapeHtml(langText("Local", "Local"))}</strong></div>
      <div class="metric-box"><span>${escapeHtml(langText("Roles cubiertos", "Covered roles"))}</span><strong>COO · CFO · CMO · CTO</strong></div>
    </div>
    <div class="executive-summary-feedback">${escapeHtml(langText("Pegá un feedback completo y abrí el radar ejecutivo.", "Paste the full feedback and open the executive radar."))}</div>
  `;
}

function executiveResultsMarkup() {
  const analysis = state.executive.analysis;
  if (!analysis) {
    return `
      <div class="empty-card executive-empty-card">
        <div class="executive-empty-kicker">${escapeHtml(langText("Inteligencia ejecutiva", "Executive intelligence"))}</div>
        <div class="executive-empty-title">${escapeHtml(langText("Pegá un feedback para abrir el radar", "Paste feedback to open the radar"))}</div>
        <div class="executive-empty-copy">${escapeHtml(langText("La lectura combina similitud textual, peso del feedback y los vectores locales ya mapeados dentro de tu copia privada.", "This read combines textual similarity, feedback weight, and the local vectors already mapped inside your private copy."))}</div>
      </div>
    `;
  }

  if (analysis.type === "no-match") {
    return `
      <div class="empty-card executive-empty-card">
        <div class="executive-empty-kicker">${escapeHtml(langText("Sin match útil", "No useful match"))}</div>
        <div class="executive-empty-title">${escapeHtml(langText("No encontramos una señal suficientemente parecida", "We did not find a close enough signal"))}</div>
        <div class="executive-empty-copy">${escapeHtml(langText("Probá pegar el feedback completo, sin recortes. Este motor funciona mejor cuando respeta el texto tal como aparece en el juego.", "Try pasting the full feedback without trimming it. This engine works better when the text stays exactly as it appears in the game."))}</div>
      </div>
    `;
  }

  const suggestedRole = executiveRoleMeta(analysis.displayRole.key);
  const band = executiveAnalysisBand(analysis);
  return `
    <section class="executive-hero-card">
      <div class="executive-hero-frame">
        <div class="executive-empty-kicker">${escapeHtml(langText("Coincidencia principal", "Primary match"))}</div>
        <div class="executive-hero-meta-line">${escapeHtml(`${suggestedRole.short} · ${Math.round(analysis.score * 100)}% · ${band.label}`)}</div>
        <h3>${escapeHtml(analysis.best.feedback)}</h3>
        <p>${escapeHtml(band.copy)}</p>
      </div>
    </section>

    <section class="executive-grid">
      <article class="executive-detail-card">
        <div class="section-label">${escapeHtml(langText("Vector de habilidades", "Skill vector"))}</div>
        <div class="executive-skill-grid">
          ${executiveSkillCardsMarkup(analysis.displaySkills)}
        </div>
      </article>
      <article class="executive-detail-card">
        <div class="section-label">${escapeHtml(langText("Resumen operativo", "Operational summary"))}</div>
        <div class="executive-operational-list">
          <div class="executive-operational-item">
            <span>${escapeHtml(langText("Rol sugerido", "Suggested role"))}</span>
            <strong>${escapeHtml(suggestedRole.short)}</strong>
          </div>
          <div class="executive-operational-item">
            <span>${escapeHtml(langText("Nivel base", "Base tier"))}</span>
            <strong>${escapeHtml(band.label)}</strong>
          </div>
          <div class="executive-operational-item">
            <span>${escapeHtml(langText("Feedbacks cercanos", "Nearby feedbacks"))}</span>
            <strong>${analysis.totalMatches}</strong>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderExecutiveView() {
  const summary = byId("executiveSummaryCard");
  const results = byId("executiveResults");
  const info = byId("executiveResultsInfo");
  const feedbackInput = byId("executiveFeedbackInput");
  if (!summary || !results || !info || !feedbackInput) return;
  summary.innerHTML = executiveSummaryMarkup();
  feedbackInput.value = state.executive.feedback;
  results.innerHTML = executiveResultsMarkup();

  const analysis = state.executive.analysis;
  if (!analysis) {
    info.textContent = state.language === "en"
      ? `${executiveDataset().summary.profileCount} local profiles ready`
      : `${executiveDataset().summary.profileCount} perfiles locales listos`;
    return;
  }

  if (analysis.type === "no-match") {
    info.textContent = langText("Sin coincidencias suficientemente útiles para este texto.", "No sufficiently useful matches for this text.");
    return;
  }

  const roleMeta = executiveRoleMeta(analysis.displayRole.key);
  const band = executiveAnalysisBand(analysis);
  const confidence = executiveAnalysisConfidence(analysis);
  info.textContent = `${roleMeta.short} · ${band.label} · ${confidence.label}`;
}

function runExecutiveAnalysis() {
  const feedback = String(state.executive.feedback || "").trim();
  if (normalizeSearch(feedback).length < 12) {
    showToast(state.language === "en" ? "Paste a slightly more complete feedback so the radar can read it properly" : "Pegá un feedback un poco más completo para poder leerlo bien", "error");
    return;
  }
  state.executive.analysis = analyzeExecutiveQuery(feedback);
  state.executive.lastQuery = feedback;
  persistExecutiveState();
  renderExecutiveView();
  showToast(state.executive.analysis?.type === "match"
    ? (state.language === "en" ? "Executive radar updated" : "Radar ejecutivo actualizado")
    : (state.language === "en" ? "No clear match appeared" : "No apareció una coincidencia clara"));
}

function clearExecutiveAnalysis() {
  state.executive = emptyExecutiveState();
  persistExecutiveState();
  renderExecutiveView();
}

function saveContact() {
  const draft = {
    ...state.contactDraft,
    name: state.contactDraft.name.trim(),
    perception: state.contactDraft.perception.trim(),
    notes: state.contactDraft.notes.trim()
  };
  if (!draft.name || !draft.perception) {
    showToast(state.language === "en" ? "Complete the name and perception before saving" : "Completá el nombre y la percepción antes de guardar", "error");
    return;
  }

  const hierarchySelection = getContactHierarchySelection();
  state.contacts.unshift(normalizeContactRecord({
    ...draft,
    ...hierarchySelection,
    history: [],
    date: new Date().toLocaleDateString(numberLocale(), { day: "2-digit", month: "short", year: "numeric" })
  }));
  state.contactPage = 1;
  persistContacts();
  state.contactDraft = emptyContactDraft();
  state.contactTypeSelectorOpen = false;
  clearContactHierarchySelection(false);
  renderContactView();
  showToast(state.language === "en" ? "Contact saved" : "Contacto guardado");
}

function deleteContact(contactId) {
  state.contacts = state.contacts.filter((contact) => contact.id !== contactId);
  if (state.currentHistoryContactId === contactId) {
    state.currentHistoryContactId = null;
  }
  clampContactPage(filteredContacts().length);
  persistContacts();
  renderContactView();
  showToast(state.language === "en" ? "Contact deleted" : "Contacto eliminado");
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
  renderStaticLanguage();
  renderActiveView();
  renderThemeToggle();
  renderLanguageToggle();
  renderRealmToggle();
  renderHeader();
  renderUpdateModal();
  renderMarketHealthBanner();
  renderSelectedRuntime();
  renderEditor();
  renderChannels();
  renderFilterButtons();
  renderAlertList();
  renderPortfolioView();
  renderEvents();
  renderNotificationsModal();
  syncCalculatorInputs();
  recalculateCalculator();
  renderContactView();
  renderExecutiveView();
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

function handlePagination(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const pageButton = target.closest("[data-page]");
  if (pageButton instanceof HTMLElement) {
    const nextPage = Number(pageButton.dataset.page || "1");
    const scope = pageButton.dataset.paginationScope || "contact";
    if (Number.isFinite(nextPage) && nextPage >= 1) {
      if (scope === "contact") {
        state.contactPage = nextPage;
        renderContactList();
      } else if (scope === "portfolio") {
        state.portfolioPage = nextPage;
        renderPortfolioList();
      } else if (scope === "calc") {
        const nextCalculator = state.calculatorBook.pages[nextPage - 1];
        if (nextCalculator) {
          setActiveCalculatorPage(nextCalculator.id);
        }
      } else {
        state.alertPage = nextPage;
        renderAlertList();
      }
    }
    return;
  }
  const navButton = target.closest("[data-page-nav]");
  if (!(navButton instanceof HTMLElement)) return;
  const direction = navButton.dataset.pageNav;
  const scope = navButton.dataset.paginationScope || "contact";
  if (scope === "contact") {
    const totalPages = contactPageCount(filteredContacts().length);
    if (direction === "prev" && state.contactPage > 1) state.contactPage -= 1;
    if (direction === "next" && state.contactPage < totalPages) state.contactPage += 1;
    renderContactList();
    return;
  }
  if (scope === "portfolio") {
    const totalPages = portfolioPageCount(filteredPortfolioGroups().length);
    if (direction === "prev" && state.portfolioPage > 1) state.portfolioPage -= 1;
    if (direction === "next" && state.portfolioPage < totalPages) state.portfolioPage += 1;
    renderPortfolioList();
    return;
  }
  if (scope === "calc") {
    const totalPages = Math.max(1, state.calculatorBook.pages.length);
    let nextPage = calculatorPageIndex() + 1;
    if (direction === "prev" && nextPage > 1) nextPage -= 1;
    if (direction === "next" && nextPage < totalPages) nextPage += 1;
    const nextCalculator = state.calculatorBook.pages[nextPage - 1];
    if (nextCalculator) {
      setActiveCalculatorPage(nextCalculator.id);
    }
    return;
  }
  const totalPages = alertPageCount(state.draft.alerts.filter(passesFilter).length);
  if (direction === "prev" && state.alertPage > 1) state.alertPage -= 1;
  if (direction === "next" && state.alertPage < totalPages) state.alertPage += 1;
  renderAlertList();
}

async function handlePortfolioMutation(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const actionTarget = target.closest("[data-portfolio-action]");
  const portfolioAction = actionTarget?.dataset.portfolioAction || "";
  if (event.type === "mousemove" && portfolioAction !== "hover-chart-surface") return;

  if (portfolioAction === "set-view-mode") {
    if (event.type !== "click") return;
    event.preventDefault();
    const nextMode = normalizePortfolioValuationMode(actionTarget.dataset.portfolioView);
    if (state.portfolioValuationMode !== nextMode) {
      state.portfolioValuationMode = nextMode;
      state.portfolioChartSelectedTime = "";
      state.portfolioChartHoverTime = "";
      persistPortfolioViewPreferences();
      renderPortfolioView();
    }
    return;
  }

  if (portfolioAction === "set-chart-range") {
    if (event.type !== "click") return;
    event.preventDefault();
    const nextRange = normalizePortfolioChartRange(actionTarget.dataset.chartRange);
    if (state.portfolioChartRange !== nextRange) {
      state.portfolioChartRange = nextRange;
      state.portfolioChartSelectedTime = "";
      state.portfolioChartHoverTime = "";
      persistPortfolioViewPreferences();
      renderPortfolioOverview();
    }
    return;
  }

  if (portfolioAction === "hover-chart-surface") {
    const nextHoverTime = portfolioChartTimeFromPointer(event, actionTarget);
    if (!nextHoverTime) return;
    if (event.type === "mousemove") {
      if (state.portfolioChartHoverTime !== nextHoverTime) {
        state.portfolioChartHoverTime = nextHoverTime;
        renderPortfolioOverview();
      }
    } else if (event.type === "click") {
      event.preventDefault();
      state.portfolioChartSelectedTime = nextHoverTime;
      state.portfolioChartHoverTime = nextHoverTime;
      renderPortfolioOverview();
    }
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "toggle-selector") {
    event.preventDefault();
    event.stopPropagation();
    state.portfolioResourceSelectorOpen = !state.portfolioResourceSelectorOpen;
    if (!state.portfolioResourceSelectorOpen) {
      resetPortfolioResourceSelectorState();
    }
    renderPortfolioEditor();
    if (state.portfolioResourceSelectorOpen) {
      focusPortfolioResourceSearch();
    }
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "back-groups") {
    event.preventDefault();
    event.stopPropagation();
    state.portfolioResourceActiveGroup = null;
    state.portfolioResourceSearch = "";
    renderPortfolioEditor();
    focusPortfolioResourceSearch();
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "open-group") {
    event.preventDefault();
    event.stopPropagation();
    state.portfolioResourceActiveGroup = actionTarget.dataset.resourceGroup || null;
    state.portfolioResourceSearch = "";
    renderPortfolioEditor();
    focusPortfolioResourceSearch();
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "select-resource") {
    event.preventDefault();
    event.stopPropagation();
    applyPortfolioProductSelection(Number(actionTarget.dataset.resourceId)).catch((error) => {
      showToast(error.message, "error");
    });
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "clear-resource") {
    event.preventDefault();
    event.stopPropagation();
    state.portfolioDraft.resourceId = "";
    state.portfolioDirty = true;
    resetPortfolioResourceSelectorState();
    renderPortfolioEditor();
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "save") {
    event.preventDefault();
    savePortfolioHolding().catch((error) => showToast(error.message, "error"));
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "reset") {
    event.preventDefault();
    if (state.selectedPortfolioId) {
      populatePortfolioDraft(selectedPortfolioHolding());
    } else {
      populatePortfolioDraft(null);
    }
    renderPortfolioView();
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "delete") {
    event.preventDefault();
    deletePortfolioHolding().catch((error) => showToast(error.message, "error"));
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "delete-group") {
    event.preventDefault();
    deletePortfolioGroup().catch((error) => showToast(error.message, "error"));
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "parse-import") {
    event.preventDefault();
    try {
      state.portfolioImportRows = parsePortfolioImportRows(state.portfolioImportText);
      const importResourceIds = uniqueList(state.portfolioImportRows.map((row) => row.resourceId))
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (importResourceIds.length) {
        await Promise.allSettled(importResourceIds.map((resourceId) => ensurePortfolioResourceMeta(resourceId, {
          allowNetwork: true,
          silent: true
        })));
      }
      renderPortfolioImport();
      showToast(langText("Texto analizado", "Text analyzed"));
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "clear-import") {
    event.preventDefault();
    state.portfolioImportText = "";
    state.portfolioImportRows = [];
    renderPortfolioImport();
    return;
  }

  if (actionTarget?.dataset.portfolioAction === "apply-import") {
    event.preventDefault();
    applyPortfolioImportRows().catch((error) => showToast(error.message, "error"));
    return;
  }

  if (target instanceof HTMLInputElement && target.id === "portfolioResourceSearch") {
    state.portfolioResourceSearch = target.value;
    renderPortfolioEditor();
    focusPortfolioResourceSearch();
    return;
  }

  if (target instanceof HTMLTextAreaElement && target.id === "portfolioImportTextarea") {
    state.portfolioImportText = target.value;
    return;
  }

  const importField = target.dataset.portfolioImportField;
  if (importField === "quality" && target instanceof HTMLSelectElement) {
    if (event.type !== "change") return;
    const rowId = target.dataset.importRowId;
    state.portfolioImportRows = state.portfolioImportRows.map((row) => (
      String(row.id) === String(rowId)
        ? { ...row, quality: target.value }
        : row
    ));
    renderPortfolioImport();
    return;
  }

  const field = target.dataset.portfolioField;
  if (!field) return;
  state.portfolioDraft[field] = target.value;
  state.portfolioDirty = true;
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
    syncNotificationState(dashboard);
    state.dashboard = dashboard;
    renderAll();
    showToast(dashboard.scan?.errors?.length
      ? langText(`Escaneo con ${dashboard.scan.errors.length} error(es)`, `Scan finished with ${dashboard.scan.errors.length} error(s)`)
      : langText("Escaneo terminado", "Scan finished"));
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
    syncNotificationState(dashboard);
    state.dashboard = dashboard;
    state.draft.config.scanEnabled = dashboard.config?.scanEnabled !== false;
    renderAll();
    showToast(nextEnabled
      ? langText("Escaneo automático reanudado", "Automatic scan resumed")
      : langText("Escaneo automático detenido", "Automatic scan stopped"));
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

async function switchRealm() {
  if (state.realmSwitching) return;
  const nextRealm = nextRealmOption();
  state.realmSwitching = true;
  renderRealmToggle();
  try {
    persistCalculatorState();
    persistContacts();
    if (state.dirty) {
      await persistDraft(false);
    }
    const dashboard = await callDesktop("switchRealm", nextRealm.id);
    syncDraftFromDashboard(dashboard);
    renderAll();
    showToast(langText(`Servidor activo: ${localizedRealmLabel(realmOption())}`, `Active server: ${localizedRealmLabel(realmOption())}`));
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    state.realmSwitching = false;
    renderRealmToggle();
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
      showToast(langText("Ya tenés la última versión", "You already have the latest version"));
    }
    if (manual && state.updates.status === "error") {
      showToast(state.updates.error || langText("No se pudieron revisar las actualizaciones", "Could not check for updates"), "error");
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
      showToast(langText("Descarga abierta en GitHub", "Download opened on GitHub"));
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
    label: state.language === "en" ? "New alert" : "Nueva alerta",
    resourceId: "",
    quality: 0,
    condition: "<",
    targetPrice: "",
    targetPriceMax: "",
    enabled: true,
    repeatWhileMatched: true,
    notificationKindOverride: ""
  });
  state.alertPage = 1;
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
  clampAlertPage(state.draft.alerts.filter(passesFilter).length);
  state.selectedAlertId = state.draft.alerts[Math.max(0, index - 1)]?.id || state.draft.alerts[0]?.id || null;
  setDirty(true);
  renderAll();
}

function discardDraft() {
  if (!state.dashboard) return;
  syncDraftFromDashboard(state.dashboard);
  renderAll();
  showToast(state.language === "en" ? "Changes discarded" : "Cambios descartados");
}

async function deleteEvent(eventId) {
  const dashboard = await callDesktop("deleteEvent", eventId);
  syncNotificationState(dashboard);
  state.dashboard = dashboard;
  if (state.notificationsOpen) {
    markNotificationsSeen(dashboard.events);
    state.notificationsUnread = false;
  }
  renderAll();
  showToast(state.language === "en" ? "Event deleted" : "Evento eliminado");
}

async function loadDashboard({ quiet = false } = {}) {
  try {
    const dashboard = await callDesktop("getDashboard");
    cacheResourceCatalog(dashboard.resourceCatalog);
    if (!state.dirty) {
      syncDraftFromDashboard(dashboard);
      renderAll();
    } else {
      syncNotificationState(dashboard);
      state.dashboard = dashboard;
      syncPortfolioStateFromDashboard(dashboard);
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
      renderPortfolioView();
      renderEvents();
      renderNotificationsModal();
    }
    const nextWarningSignature = warningSignature(dashboard.warnings);
    if (dashboard.warnings?.length && nextWarningSignature !== state.warningSignature) {
      state.warningSignature = nextWarningSignature;
      showToast(
        dashboard.warnings.length === 1
          ? (state.language === "en"
            ? "1 saved alert was skipped because it had invalid data."
            : "Se omitió 1 alerta guardada porque tenía datos inválidos.")
          : (state.language === "en"
            ? `${dashboard.warnings.length} saved alerts were skipped because they had invalid data.`
            : `Se omitieron ${dashboard.warnings.length} alertas guardadas porque tenían datos inválidos.`),
        "error"
      );
      return;
    }
    if (!dashboard.warnings?.length) {
      state.warningSignature = "";
    }
    if (!quiet) showToast(state.language === "en" ? "Dashboard updated" : "Panel actualizado");
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
  state.calculatorBook.activeId = state.calculator?.id || state.calculatorBook.pages[0]?.id || "calc-1";
  const payload = {
    activeId: state.calculatorBook.activeId,
    pages: state.calculatorBook.pages.map((page) => ({
      id: page.id,
      resourceId: page.resourceId === "" || page.resourceId === null || page.resourceId === undefined ? "" : Number(page.resourceId),
      buyPrice: page.buyPrice ?? "",
      quantity: page.quantity ?? "",
      transportPrice: page.transportPrice ?? "",
      transportUnits: page.transportUnits ?? "0",
      sellCheck: page.sellCheck ?? ""
    }))
  };
  localStorage.setItem(realmCalculatorStorageKey(state.localRealmId), JSON.stringify(payload));
}

function syncCalculatorInputs() {
  [
    ["calc-buy-price", "buyPrice"],
    ["calc-qty", "quantity"],
    ["calc-transport-price", "transportPrice"],
    ["calc-sell-check", "sellCheck"]
  ].forEach(([id, key]) => {
    const element = byId(id);
    if (element) element.value = state.calculator[key] ?? "";
  });
  renderCalculatorPages();
  renderCalculatorResourceSelector();
  renderCalculatorUnitsSelector();
}

function recalculateCalculator() {
  const buyPrice = parseLocaleDecimal(state.calculator.buyPrice);
  const qty = parseIntegerInput(state.calculator.quantity) || 1;
  const transportPrice = parseLocaleDecimal(state.calculator.transportPrice) || 0;
  const transportUnits = parseLocaleDecimal(state.calculator.transportUnits) || 0;
  const sellCheck = parseLocaleDecimal(state.calculator.sellCheck);
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
      <div class="calc-target-pct">+${pct}% ${escapeHtml(state.language === "en" ? "profit" : "ganancia")}</div>
      <div class="calc-target-price">${formatCurrency(targetSellPrice)}</div>
      <div class="calc-target-gain gain-pos">+${formatCurrency(gainTotal)} ${escapeHtml(state.language === "en" ? "total" : "total")}</div>
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
    if (Math.abs(netPerUnit) < 0.000001) {
      verdict.className = "calc-verdict breakeven-v";
      verdict.textContent = state.language === "en" ? "Exact breakeven" : "Breakeven exacto";
      verdictDetail.textContent = state.language === "en" ? "You neither win nor lose." : "No ganás ni perdés.";
    } else if (netPerUnit > 0) {
      verdict.className = "calc-verdict ganancia";
      verdict.textContent = `+${pctGain.toLocaleString(numberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · ${state.language === "en" ? "Profit" : "Ganancia"}`;
      verdictDetail.innerHTML = state.language === "en"
        ? `<span class="gain-pos">+${formatCurrency(netTotal)}</span> total · <span class="gain-pos">+${formatCurrency(netPerUnit)}</span> per unit`
        : `<span class="gain-pos">+${formatCurrency(netTotal)}</span> total · <span class="gain-pos">+${formatCurrency(netPerUnit)}</span> por unidad`;
    } else {
      verdict.className = "calc-verdict perdida";
      verdict.textContent = `${pctGain.toLocaleString(numberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% · ${state.language === "en" ? "Loss" : "Pérdida"}`;
      verdictDetail.innerHTML = state.language === "en"
        ? `<span class="gain-neg">-${formatCurrency(Math.abs(netTotal))}</span> total · <span class="gain-neg">-${formatCurrency(Math.abs(netPerUnit))}</span> per unit`
        : `<span class="gain-neg">-${formatCurrency(Math.abs(netTotal))}</span> total · <span class="gain-neg">-${formatCurrency(Math.abs(netPerUnit))}</span> por unidad`;
    }
  } else {
    checker.style.display = "none";
    verdict.className = "calc-verdict";
    verdict.textContent = t("enterPrice");
    verdictDetail.textContent = "";
  }
}

function bindStaticUi() {
  window.simcoDesktop?.onUpdateState?.((payload) => {
    state.updates = {
      ...state.updates,
      ...(payload || {})
    };
    renderHeader();
    renderUpdateModal();
    renderOnboarding();
  });
  window.simcoDesktop?.onDashboardUpdated?.(() => {
    loadDashboard({ quiet: true });
  });
  byId("themeToggleButton").addEventListener("click", () => {
    applyTheme(state.theme === "light" ? "dark" : "light");
  });
  byId("languageToggleButton")?.addEventListener("click", async () => {
    toggleLanguage(state.language === "en" ? "es" : "en");
    try {
      await callDesktop("setLanguage", state.language);
    } catch (_error) {
      // Renderer can still switch local copy if desktop bridge is unavailable.
    }
    renderAll();
    loadDashboard({ quiet: true });
  });
  byId("realmToggleButton")?.addEventListener("click", switchRealm);
  [byId("supporterCooperButton"), byId("supporterSimcoToolsButton")].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", () => {
      openSupporterUrl(button.dataset.supporterUrl || "");
    });
  });
  byId("notificationsButton").addEventListener("click", openNotificationsModal);
  byId("tab-mercado").addEventListener("click", () => switchView("mercado"));
  byId("tab-calculadora").addEventListener("click", () => switchView("calculadora"));
  byId("tab-cartera").addEventListener("click", () => switchView("cartera"));
  byId("tab-ejecutivos").addEventListener("click", () => switchView("ejecutivos"));
  byId("tab-registro").addEventListener("click", () => switchView("registro"));
  const scanNowButton = byId("scanNowButton");
  if (scanNowButton) {
    scanNowButton.addEventListener("click", scanNow);
  }
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
    const steps = onboardingSteps();
    const step = steps[state.onboardingStep];
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
    state.onboardingStep = Math.min(steps.length - 1, state.onboardingStep + 1);
    renderOnboarding();
  });
  byId("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    state.alertPage = 1;
    renderAlertList();
  });
  byId("portfolioSearchInput").addEventListener("input", (event) => {
    state.portfolioSearch = event.target.value;
    state.portfolioPage = 1;
    state.portfolioChartHoverTime = "";
    renderPortfolioList();
  });
  byId("portfolioNewButton").addEventListener("click", startNewPortfolioDraft);
  byId("portfolioRefreshButton").addEventListener("click", () => {
    refreshPortfolioPrices().catch((error) => showToast(error.message, "error"));
  });
  byId("portfolioFilterAllButton").addEventListener("click", () => {
    state.portfolioFilter = "all";
    state.portfolioPage = 1;
    state.portfolioChartHoverTime = "";
    renderPortfolioFilterButtons();
    renderPortfolioList();
  });
  byId("portfolioFilterGainButton").addEventListener("click", () => {
    state.portfolioFilter = "gain";
    state.portfolioPage = 1;
    state.portfolioChartHoverTime = "";
    renderPortfolioFilterButtons();
    renderPortfolioList();
  });
  byId("portfolioFilterLossButton").addEventListener("click", () => {
    state.portfolioFilter = "loss";
    state.portfolioPage = 1;
    state.portfolioChartHoverTime = "";
    renderPortfolioFilterButtons();
    renderPortfolioList();
  });
  byId("portfolioEditorContainer").addEventListener("click", handlePortfolioMutation);
  byId("portfolioEditorContainer").addEventListener("input", handlePortfolioMutation);
  byId("portfolioEditorContainer").addEventListener("change", handlePortfolioMutation);
  byId("portfolioImportContainer").addEventListener("click", handlePortfolioMutation);
  byId("portfolioImportContainer").addEventListener("input", handlePortfolioMutation);
  byId("portfolioImportContainer").addEventListener("change", handlePortfolioMutation);
  byId("portfolioSelectedCard").addEventListener("click", handlePortfolioMutation);
  byId("portfolioOverview").addEventListener("click", handlePortfolioMutation);
  byId("portfolioOverview").addEventListener("mousemove", handlePortfolioMutation);
  byId("portfolioOverview").addEventListener("mouseleave", () => {
    if (!state.portfolioChartHoverTime) return;
    state.portfolioChartHoverTime = "";
    renderPortfolioOverview();
  });
  byId("portfolioList").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const qualityRow = target.closest("[data-portfolio-id]");
    if (qualityRow instanceof HTMLElement) {
      state.selectedPortfolioId = qualityRow.dataset.portfolioId;
      state.selectedPortfolioGroupKey = qualityRow.dataset.portfolioGroupKey || state.selectedPortfolioGroupKey;
      state.portfolioChartHoverTime = "";
      populatePortfolioDraft(selectedPortfolioHolding());
      renderPortfolioView();
      return;
    }
    const groupRow = target.closest("[data-portfolio-group-key]");
    if (!(groupRow instanceof HTMLElement)) return;
    const groupKey = groupRow.dataset.portfolioGroupKey || "";
    state.selectedPortfolioGroupKey = groupKey;
    state.selectedPortfolioId = null;
    state.portfolioChartHoverTime = "";
    state.portfolioExpandedKeys = state.portfolioExpandedKeys.includes(groupKey)
      ? state.portfolioExpandedKeys.filter((item) => item !== groupKey)
      : [...state.portfolioExpandedKeys, groupKey];
    renderPortfolioView();
  });
  byId("portfolioPagination").addEventListener("click", handlePagination);

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.alertPage = 1;
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
    const calcProductSelector = byId("calcProductSelector");
    const calcUnitsSelector = byId("calcUnitsSelector");
    const portfolioResourceSelector = byId("portfolioResourceSelector");
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
    if (state.calculatorResourceSelectorOpen && calcProductSelector && !calcProductSelector.contains(target)) {
      resetCalculatorResourceSelectorState();
      shouldRender = true;
    }
    if (state.calculatorUnitsSelectorOpen && calcUnitsSelector && !calcUnitsSelector.contains(target)) {
      state.calculatorUnitsSelectorOpen = false;
      shouldRender = true;
    }
    if (state.portfolioResourceSelectorOpen && portfolioResourceSelector && !portfolioResourceSelector.contains(target)) {
      resetPortfolioResourceSelectorState();
      shouldRender = true;
    }
    if (shouldRender) {
      renderEditor();
      renderContactEditor();
      renderCalculatorResourceSelector();
      renderCalculatorUnitsSelector();
      renderPortfolioEditor();
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
    if (state.calculatorResourceSelectorOpen) {
      resetCalculatorResourceSelectorState();
      shouldRender = true;
    }
    if (state.calculatorUnitsSelectorOpen) {
      state.calculatorUnitsSelectorOpen = false;
      shouldRender = true;
    }
    if (state.portfolioResourceSelectorOpen) {
      resetPortfolioResourceSelectorState();
      shouldRender = true;
    }
    if (state.currentHistoryContactId) {
      closeHistoryModal();
    }
    if (shouldRender) {
      renderEditor();
      renderContactEditor();
      renderCalculatorResourceSelector();
      renderCalculatorUnitsSelector();
      renderPortfolioEditor();
    }
  });

  byId("calcProductSelector").addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const actionTarget = target.closest("[data-calc-product-action]");
    if (!(actionTarget instanceof HTMLElement)) return;
    const action = actionTarget.dataset.calcProductAction || "";
    if (action === "toggle-product-selector") {
      state.calculatorResourceSelectorOpen = !state.calculatorResourceSelectorOpen;
      if (!state.calculatorResourceSelectorOpen) {
        resetCalculatorResourceSelectorState();
      } else {
        state.calculatorResourceActiveGroup = null;
        state.calculatorResourceSearch = "";
      }
      renderCalculatorResourceSelector();
      if (state.calculatorResourceSelectorOpen) {
        focusCalculatorResourceSearch();
      }
      return;
    }
    if (action === "back-groups") {
      state.calculatorResourceActiveGroup = null;
      state.calculatorResourceSearch = "";
      renderCalculatorResourceSelector();
      focusCalculatorResourceSearch();
      return;
    }
    if (action === "open-group") {
      state.calculatorResourceActiveGroup = actionTarget.dataset.resourceGroup || null;
      state.calculatorResourceSearch = "";
      renderCalculatorResourceSelector();
      focusCalculatorResourceSearch();
      return;
    }
    if (action === "select-product") {
      const nextResourceId = Number(actionTarget.dataset.resourceId);
      applyCalculatorProductSelection(nextResourceId);
      return;
    }
    if (action === "clear-product") {
      state.calculator.resourceId = "";
      resetCalculatorResourceSelectorState();
      persistCalculatorState();
      syncCalculatorInputs();
      recalculateCalculator();
    }
  });

  byId("calcProductSelector").addEventListener("input", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.id !== "calcProductSearch") return;
    state.calculatorResourceSearch = target.value;
    renderCalculatorResourceSelector();
    focusCalculatorResourceSearch();
  });

  byId("calcUnitsSelector").addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const actionTarget = target.closest("[data-calc-action]");
    if (!(actionTarget instanceof HTMLElement)) return;
    const action = actionTarget.dataset.calcAction || "";
    if (action === "toggle-units-selector") {
      state.calculatorUnitsSelectorOpen = !state.calculatorUnitsSelectorOpen;
      renderCalculatorUnitsSelector();
      return;
    }
    if (action === "select-transport-units") {
      const nextValue = actionTarget.dataset.calcUnit || "0";
      state.calculator.transportUnits = CALC_TRANSPORT_UNIT_OPTIONS.includes(nextValue) ? nextValue : "0";
      state.calculatorUnitsSelectorOpen = false;
      persistCalculatorState();
      renderCalculatorResourceSelector();
      renderCalculatorUnitsSelector();
      recalculateCalculator();
    }
  });

  byId("calcAddButton").addEventListener("click", addCalculatorPage);
  byId("calcDeleteButton").addEventListener("click", deleteActiveCalculatorPage);
  byId("calcWorkspacePagination").addEventListener("click", handlePagination);

  byId("eventsFeed").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("delete-event-btn")) return;
    const card = target.closest("[data-event-id]");
    if (!card?.dataset.eventId) return;
    deleteEvent(card.dataset.eventId);
  });
  byId("notificationsModal").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "notificationsModal" || target.dataset.action === "close-notifications-modal") {
      closeNotificationsModal();
      return;
    }
    if (target.dataset.action === "clear-notifications") {
      clearNotifications();
    }
  });

  ["channelDesktop", "channelDiscord", "channelTelegramToken", "channelTelegramChat"].forEach((id) => {
    const element = byId(id);
    element.addEventListener("input", handleChannelsChange);
    element.addEventListener("change", handleChannelsChange);
  });

  byId("contactSearchInput").addEventListener("input", (event) => {
    state.contactSearch = event.target.value;
    state.contactPage = 1;
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
      state.contactPage = 1;
      renderContactFilters();
      renderContactList();
    });
  });

  byId("contactEditorContainer").addEventListener("input", handleContactMutation);
  byId("contactEditorContainer").addEventListener("change", handleContactMutation);
  byId("contactEditorContainer").addEventListener("click", handleContactMutation);
  byId("contactsRegisterList").addEventListener("click", handleContactMutation);
  byId("contactPagination").addEventListener("click", handlePagination);
  byId("alertsPagination").addEventListener("click", handlePagination);
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

  byId("executiveFeedbackInput").addEventListener("input", (event) => {
    state.executive.feedback = event.target.value;
    persistExecutiveState();
    renderExecutiveView();
  });
  byId("executiveAnalyzeButton").addEventListener("click", runExecutiveAnalysis);
  byId("executiveClearButton").addEventListener("click", clearExecutiveAnalysis);
}

async function boot() {
  document.body.dataset.platform = state.platform;
  applyTheme(state.theme);
  renderStaticLanguage();
  bindStaticUi();
  try {
    await callDesktop("setLanguage", state.language);
  } catch (_error) {
    // The desktop API is optional during development previews.
  }
  try {
    const resourceCatalog = await callDesktop("getResourceCatalog");
    cacheResourceCatalog(resourceCatalog);
  } catch (error) {
    // Seguimos con el dashboard normal si el catálogo directo no está disponible.
  }
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
  if (state.executive.lastQuery) {
    state.executive.analysis = analyzeExecutiveQuery(state.executive.lastQuery);
  }
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
