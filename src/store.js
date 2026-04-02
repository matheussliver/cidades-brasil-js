const fs = require("node:fs/promises");

const { DATA_DIR, DATA_FILE } = require("./config");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function writeMunicipiosSnapshot(snapshot) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

async function readMunicipiosSnapshot() {
  try {
    const fileContents = await fs.readFile(DATA_FILE, "utf8");
    const snapshot = JSON.parse(fileContents);

    if (!snapshot || !Array.isArray(snapshot.municipios)) {
      throw new Error("Snapshot de municipios invalido.");
    }

    return snapshot;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

module.exports = {
  readMunicipiosSnapshot,
  writeMunicipiosSnapshot,
};
