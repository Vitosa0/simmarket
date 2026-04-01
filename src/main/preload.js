const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("simcoDesktop", {
  getDashboard: () => ipcRenderer.invoke("dashboard:get"),
  saveConfig: (payload) => ipcRenderer.invoke("config:save", payload),
  scanNow: () => ipcRenderer.invoke("scan:now"),
  setScanEnabled: (enabled) => ipcRenderer.invoke("monitor:set-enabled", enabled),
  deleteEvent: (eventId) => ipcRenderer.invoke("event:delete", eventId),
  openDataDirectory: () => ipcRenderer.invoke("data:open-directory"),
  onAlertTriggered: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("alert:triggered", listener);
    return () => ipcRenderer.removeListener("alert:triggered", listener);
  }
});
