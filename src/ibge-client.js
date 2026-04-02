const { FETCH_TIMEOUT_MS, IBGE_URL } = require("./config");

function normalizeMunicipio(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Municipio invalido recebido do IBGE.");
  }

  const microrregiao = item.microrregiao ?? null;
  const mesorregiao = microrregiao?.mesorregiao ?? null;
  const uf = mesorregiao?.UF ?? null;
  const regiao = uf?.regiao ?? null;

  return {
    id: item.id,
    nome: item.nome,
    microrregiao: microrregiao
      ? {
          id: microrregiao.id,
          nome: microrregiao.nome,
        }
      : null,
    mesorregiao: mesorregiao
      ? {
          id: mesorregiao.id,
          nome: mesorregiao.nome,
        }
      : null,
    uf: uf
      ? {
          id: uf.id,
          sigla: uf.sigla,
          nome: uf.nome,
        }
      : null,
    regiao: regiao
      ? {
          id: regiao.id,
          sigla: regiao.sigla,
          nome: regiao.nome,
        }
      : null,
  };
}

async function fetchMunicipiosFromIBGE({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch nao disponivel nesta versao do Node.");
  }

  const response = await fetchImpl(IBGE_URL, {
    headers: {
      accept: "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `IBGE respondeu com status ${response.status} ao listar municipios.`,
    );
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("IBGE retornou um payload inesperado para municipios.");
  }

  const municipios = payload
    .map(normalizeMunicipio)
    .sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));

  return {
    generatedAt: new Date().toISOString(),
    source: {
      name: "IBGE API de localidades",
      url: IBGE_URL,
    },
    total: municipios.length,
    municipios,
  };
}

module.exports = {
  fetchMunicipiosFromIBGE,
  normalizeMunicipio,
};
