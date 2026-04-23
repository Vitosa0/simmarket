const { contextBridge, ipcRenderer } = require("electron");
const { version: APP_VERSION } = require("../../package.json");

contextBridge.exposeInMainWorld("simcoDesktop", {
  platform: process.platform,
  appVersion: APP_VERSION,
  getDashboard: () => ipcRenderer.invoke("dashboard:get"),
  getResourceCatalog: () => ipcRenderer.invoke("catalog:get"),
  setLanguage: (locale) => ipcRenderer.invoke("ui:set-language", locale),
  switchRealm: (realmId) => ipcRenderer.invoke("realm:switch", realmId),
  saveConfig: (payload) => ipcRenderer.invoke("config:save", payload),
  savePortfolio: (payload) => ipcRenderer.invoke("portfolio:save", payload),
  refreshPortfolio: () => ipcRenderer.invoke("portfolio:refresh"),
  getPortfolioResourceMeta: (payload) => ipcRenderer.invoke("portfolio:resource-meta", payload),
  scanNow: () => ipcRenderer.invoke("scan:now"),
  setScanEnabled: (enabled) => ipcRenderer.invoke("monitor:set-enabled", enabled),
  deleteEvent: (eventId) => ipcRenderer.invoke("event:delete", eventId),
  clearEvents: () => ipcRenderer.invoke("events:clear"),
  openDataDirectory: () => ipcRenderer.invoke("data:open-directory"),
  openExternalUrl: (url) => ipcRenderer.invoke("external:open", url),
  getUpdateState: () => ipcRenderer.invoke("updates:get-state"),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  runUpdatePrimaryAction: () => ipcRenderer.invoke("updates:primary-action"),
  dismissUpdatePrompt: () => ipcRenderer.invoke("updates:dismiss"),
  continueStartup: () => ipcRenderer.invoke("startup:continue"),
  onAlertTriggered: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("alert:triggered", listener);
    return () => ipcRenderer.removeListener("alert:triggered", listener);
  },
  onUpdateState: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("updates:state", listener);
    return () => ipcRenderer.removeListener("updates:state", listener);
  },
  onDashboardUpdated: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = () => callback();
    ipcRenderer.on("dashboard:updated", listener);
    return () => ipcRenderer.removeListener("dashboard:updated", listener);
  }
});
