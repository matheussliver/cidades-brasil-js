const test = require("node:test");
const assert = require("node:assert/strict");

const { fetchMunicipiosFromIBGE } = require("../src/ibge-client");
const {
  filterMunicipios,
  findMunicipioById,
} = require("../src/municipios-service");

const sampleIbgeMunicipios = [
  {
    id: 3550308,
    nome: "S\u00e3o Paulo",
    microrregiao: {
      id: 35061,
      nome: "S\u00e3o Paulo",
      mesorregiao: {
        id: 3506,
        nome: "Metropolitana de S\u00e3o Paulo",
        UF: {
          id: 35,
          sigla: "SP",
          nome: "S\u00e3o Paulo",
          regiao: {
            id: 3,
            sigla: "SE",
            nome: "Sudeste",
          },
        },
      },
    },
  },
  {
    id: 3304557,
    nome: "Rio de Janeiro",
    microrregiao: {
      id: 33018,
      nome: "Rio de Janeiro",
      mesorregiao: {
        id: 3306,
        nome: "Metropolitana do Rio de Janeiro",
        UF: {
          id: 33,
          sigla: "RJ",
          nome: "Rio de Janeiro",
          regiao: {
            id: 3,
            sigla: "SE",
            nome: "Sudeste",
          },
        },
      },
    },
  },
];

test("fetchMunicipiosFromIBGE normaliza o retorno oficial", async () => {
  const snapshot = await fetchMunicipiosFromIBGE({
    fetchImpl: async () => ({
      ok: true,
      json: async () => sampleIbgeMunicipios,
    }),
  });

  assert.equal(snapshot.total, 2);
  assert.equal(snapshot.municipios[0].nome, "Rio de Janeiro");
  assert.deepEqual(snapshot.municipios[1].uf, {
    id: 35,
    sigla: "SP",
    nome: "S\u00e3o Paulo",
  });
});

test("filterMunicipios aplica busca sem diferenciar acentos e pagina", async () => {
  const snapshot = await fetchMunicipiosFromIBGE({
    fetchImpl: async () => ({
      ok: true,
      json: async () => sampleIbgeMunicipios,
    }),
  });

  const filtered = filterMunicipios(snapshot.municipios, {
    q: "sao",
    uf: "sp",
    limit: "1",
    offset: "0",
  });

  assert.equal(filtered.meta.filteredTotal, 1);
  assert.equal(filtered.data[0].id, 3550308);
});

test("findMunicipioById encontra municipio pelo codigo do IBGE", async () => {
  const snapshot = await fetchMunicipiosFromIBGE({
    fetchImpl: async () => ({
      ok: true,
      json: async () => sampleIbgeMunicipios,
    }),
  });

  const municipio = findMunicipioById(snapshot.municipios, "3304557");
  assert.equal(municipio.nome, "Rio de Janeiro");
});
