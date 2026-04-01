const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const sourcePng = path.join(projectRoot, "src", "assets", "branding", "simmarket-mark-1024.png");
const outputIco = path.join(projectRoot, "src", "assets", "branding", "simmarket-mark.ico");
const sizes = [16, 24, 32, 48, 64, 128, 256];

function buildIco(buffersBySize) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(buffersBySize.length, 4);

  const directory = Buffer.alloc(buffersBySize.length * 16);
  const imageBuffers = [];
  let offset = 6 + directory.length;

  buffersBySize.forEach(({ size, buffer }, index) => {
    const entryOffset = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset);
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    directory.writeUInt8(0, entryOffset + 2);
    directory.writeUInt8(0, entryOffset + 3);
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(buffer.length, entryOffset + 8);
    directory.writeUInt32LE(offset, entryOffset + 12);
    offset += buffer.length;
    imageBuffers.push(buffer);
  });

  return Buffer.concat([header, directory, ...imageBuffers]);
}

function ensureWindowsIcon() {
  if (!fs.existsSync(sourcePng)) {
    throw new Error(`No existe el archivo fuente: ${sourcePng}`);
  }

  if (process.platform !== "darwin") {
    if (fs.existsSync(outputIco)) {
      console.log(`Icono de Windows ya disponible en ${outputIco}`);
      return;
    }
    throw new Error("La generación automática del .ico requiere macOS (sips) o un .ico ya existente en src/assets/branding.");
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "simmarket-ico-"));
  try {
    const pngBuffers = sizes.map((size) => {
      const tempPng = path.join(tempDir, `simmarket-${size}.png`);
      execFileSync("/usr/bin/sips", ["-z", String(size), String(size), sourcePng, "--out", tempPng], {
        stdio: "ignore"
      });
      return {
        size,
        buffer: fs.readFileSync(tempPng)
      };
    });

    fs.writeFileSync(outputIco, buildIco(pngBuffers));
    console.log(`Icono de Windows generado en ${outputIco}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

try {
  ensureWindowsIcon();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
