const { DATA_FILE } = require("./config");
const { syncMunicipios } = require("./municipios-service");

async function main() {
  const snapshot = await syncMunicipios();
  console.log(
    `Snapshot salvo em ${DATA_FILE} com ${snapshot.total} municipios.`,
  );
}

main().catch((error) => {
  console.error(`Falha ao sincronizar municipios: ${error.message}`);
  process.exitCode = 1;
});
