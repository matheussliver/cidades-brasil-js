const { fetchMunicipiosFromIBGE } = require("./ibge-client");
const { readMunicipiosSnapshot, writeMunicipiosSnapshot } = require("./store");
const { normalizeSearchText } = require("./text");

async function syncMunicipios() {
  const snapshot = await fetchMunicipiosFromIBGE();
  await writeMunicipiosSnapshot(snapshot);
  return snapshot;
}

async function loadMunicipiosSnapshot({ refresh = false } = {}) {
  if (refresh) {
    try {
      return {
        snapshot: await syncMunicipios(),
        sourceType: "ibge",
        stale: false,
        syncError: null,
      };
    } catch (error) {
      const cachedSnapshot = await readMunicipiosSnapshot();

      if (!cachedSnapshot) {
        throw error;
      }

      return {
        snapshot: cachedSnapshot,
        sourceType: "cache",
        stale: true,
        syncError: error.message,
      };
    }
  }

  const cachedSnapshot = await readMunicipiosSnapshot();

  if (cachedSnapshot) {
    return {
      snapshot: cachedSnapshot,
      sourceType: "cache",
      stale: false,
      syncError: null,
    };
  }

  return {
    snapshot: await syncMunicipios(),
    sourceType: "ibge",
    stale: false,
    syncError: null,
  };
}

function parsePositiveInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeInteger(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function filterMunicipios(municipios, query = {}) {
  const search = normalizeSearchText(query.q);
  const ufFilter = normalizeSearchText(query.uf);
  const limit = parsePositiveInteger(query.limit);
  const offset = parseNonNegativeInteger(query.offset);

  let filtered = municipios;

  if (ufFilter) {
    filtered = filtered.filter((municipio) => {
      const ufSigla = normalizeSearchText(municipio.uf?.sigla);
      const ufNome = normalizeSearchText(municipio.uf?.nome);
      return ufSigla === ufFilter || ufNome === ufFilter;
    });
  }

  if (search) {
    filtered = filtered.filter((municipio) => {
      const searchableFields = [
        municipio.nome,
        municipio.uf?.sigla,
        municipio.uf?.nome,
        municipio.microrregiao?.nome,
        municipio.mesorregiao?.nome,
        municipio.regiao?.nome,
      ];

      return searchableFields.some((value) =>
        normalizeSearchText(value).includes(search),
      );
    });
  }

  const paginated = filtered.slice(offset, limit ? offset + limit : undefined);

  return {
    data: paginated,
    meta: {
      filteredTotal: filtered.length,
      returned: paginated.length,
      offset,
      limit,
      query: {
        q: query.q ?? null,
        uf: query.uf ?? null,
      },
    },
  };
}

function findMunicipioById(municipios, id) {
  const targetId = Number.parseInt(String(id), 10);

  if (!Number.isInteger(targetId)) {
    return null;
  }

  return municipios.find((municipio) => municipio.id === targetId) ?? null;
}

module.exports = {
  filterMunicipios,
  findMunicipioById,
  loadMunicipiosSnapshot,
  syncMunicipios,
};
