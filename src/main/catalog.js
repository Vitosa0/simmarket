const fs = require("node:fs");
const path = require("node:path");
const {
  groupEnglishForLabel,
  groupForLabel,
  groupKeyForLabel,
  groupOrderIndex
} = require("../shared/resource-groups");

const manifestPath = path.join(__dirname, "..", "shared", "resource-catalog.json");
const transportPath = path.join(__dirname, "..", "shared", "resource-transport.json");

function loadTransportMap() {
  try {
    const raw = JSON.parse(fs.readFileSync(transportPath, "utf8"));
    const items = Array.isArray(raw.transports) ? raw.transports : [];
    return new Map(items.map((item) => [Number(item.id), Number(item.transportUnits || 0)]));
  } catch (error) {
    return new Map();
  }
}

function loadCatalog() {
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const items = Array.isArray(raw.resources) ? raw.resources : [];
  const transportMap = loadTransportMap();
  return items
    .map((item) => ({
      id: Number(item.id),
      key: String(item.key || "").trim(),
      label: String(item.label || "").trim(),
      labelEs: String(item.label || "").trim(),
      labelEn: String(item.api_name || "").trim(),
      apiName: String(item.api_name || "").trim(),
      logoFile: String(item.logo_file || "").trim(),
      logoUrl: `../assets/product-logos/${encodeURIComponent(String(item.logo_file || "").trim())}`,
      groupKey: groupKeyForLabel(item.label),
      group: groupForLabel(item.label),
      groupEn: groupEnglishForLabel(item.label),
      transportUnits: Number(transportMap.get(Number(item.id)) || 0)
    }))
    .sort((left, right) => {
      const groupDiff = groupOrderIndex(left.group) - groupOrderIndex(right.group);
      if (groupDiff !== 0) return groupDiff;
      return left.label.localeCompare(right.label, "es", { sensitivity: "base" });
    });
}

const RESOURCE_CATALOG = loadCatalog();
const RESOURCE_BY_ID = new Map(RESOURCE_CATALOG.map((item) => [item.id, item]));

function getResourceById(resourceId) {
  return RESOURCE_BY_ID.get(Number(resourceId)) || null;
}

module.exports = {
  RESOURCE_CATALOG,
  RESOURCE_BY_ID,
  getResourceById
};
