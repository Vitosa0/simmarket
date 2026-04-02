const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("simcoDesktop", {
  platform: process.platform,
  getDashboard: () => ipcRenderer.invoke("dashboard:get"),
  saveConfig: (payload) => ipcRenderer.invoke("config:save", payload),
  scanNow: () => ipcRenderer.invoke("scan:now"),
  setScanEnabled: (enabled) => ipcRenderer.invoke("monitor:set-enabled", enabled),
  deleteEvent: (eventId) => ipcRenderer.invoke("event:delete", eventId),
  openDataDirectory: () => ipcRenderer.invoke("data:open-directory"),
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
  }
});
