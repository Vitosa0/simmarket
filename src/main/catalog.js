const fs = require("node:fs");
const path = require("node:path");
const { groupForLabel, groupOrderIndex } = require("../shared/resource-groups");

const manifestPath = path.join(__dirname, "..", "shared", "resource-catalog.json");

function loadCatalog() {
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const items = Array.isArray(raw.resources) ? raw.resources : [];
  return items
    .map((item) => ({
      id: Number(item.id),
      key: String(item.key || "").trim(),
      label: String(item.label || "").trim(),
      apiName: String(item.api_name || "").trim(),
      logoFile: String(item.logo_file || "").trim(),
      logoUrl: `../assets/product-logos/${encodeURIComponent(String(item.logo_file || "").trim())}`,
      group: groupForLabel(item.label)
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
