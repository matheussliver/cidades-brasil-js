const path = require("node:path");

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.FETCH_TIMEOUT_MS ?? "30000",
  10,
);
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "municipios.json");
const IBGE_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

module.exports = {
  DATA_DIR,
  DATA_FILE,
  FETCH_TIMEOUT_MS,
  IBGE_URL,
  PORT,
};
