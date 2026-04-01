#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");
const PRODUCT_LOGOS_DIR = path.join(SRC_DIR, "assets", "product-logos");
const CATALOG_PATH = path.join(SRC_DIR, "shared", "resource-catalog.json");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");

function listFiles(dirPath, matcher, output = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const nextPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      listFiles(nextPath, matcher, output);
      continue;
    }
    if (matcher(nextPath)) {
      output.push(nextPath);
    }
  }
  return output;
}

function relative(filePath) {
  return path.relative(ROOT_DIR, filePath) || ".";
}

function checkJavaScriptSyntax() {
  const jsFiles = listFiles(SRC_DIR, (filePath) => filePath.endsWith(".js"));
  for (const filePath of jsFiles) {
    execFileSync(process.execPath, ["--check", filePath], { stdio: "pipe" });
  }
  return `${jsFiles.length} archivos JS validados`;
}

function checkCatalog() {
  const payload = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const resources = Array.isArray(payload.resources) ? payload.resources : [];
  if (resources.length !== 142) {
    throw new Error(`El catálogo debería tener 142 activos y tiene ${resources.length}.`);
  }

  const ids = new Set();
  const labels = new Set();
  for (const item of resources) {
    if (ids.has(item.id)) {
      throw new Error(`ID duplicado en catálogo: ${item.id}`);
    }
    if (labels.has(item.label)) {
      throw new Error(`Nombre duplicado en catálogo: ${item.label}`);
    }
    ids.add(item.id);
    labels.add(item.label);

    const logoPath = path.join(PRODUCT_LOGOS_DIR, String(item.logo_file || ""));
    if (!item.logo_file || !fs.existsSync(logoPath)) {
      throw new Error(`Falta logo para ${item.label}: ${relative(logoPath)}`);
    }
  }
  return `${resources.length} activos y logos verificados`;
}

function checkPackageScripts() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
  const requiredScripts = ["check", "start", "dist:mac", "dist:pkg"];
  for (const script of requiredScripts) {
    if (!pkg.scripts?.[script]) {
      throw new Error(`Falta script requerido en package.json: ${script}`);
    }
  }
  return "scripts de package.json presentes";
}

function checkPortableCommands() {
  const commandFiles = [
    path.join(ROOT_DIR, "run_simmarket.command"),
    path.join(ROOT_DIR, "build_simmarket_dmg.command"),
    path.join(ROOT_DIR, "build_simmarket_pkg.command")
  ];
  for (const filePath of commandFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    if (/\/Users\/[^/]+\//.test(content)) {
      throw new Error(`El script sigue hardcodeado a una ruta local: ${relative(filePath)}`);
    }
    if (!content.includes('ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"')) {
      throw new Error(`El script no resuelve la raíz en forma portable: ${relative(filePath)}`);
    }
  }
  return "scripts .command portables";
}

function main() {
  const checks = [
    ["Sintaxis JS", checkJavaScriptSyntax],
    ["Catálogo", checkCatalog],
    ["Package scripts", checkPackageScripts],
    ["Launchers", checkPortableCommands]
  ];

  const results = [];
  for (const [label, fn] of checks) {
    const detail = fn();
    results.push(`OK  ${label}: ${detail}`);
  }

  console.log(results.join("\n"));
}

try {
  main();
} catch (error) {
  console.error(`ERROR  ${error.message}`);
  process.exit(1);
}
