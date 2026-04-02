const http = require("node:http");
const { URL } = require("node:url");

const {
  filterMunicipios,
  findMunicipioById,
  loadMunicipiosSnapshot,
  syncMunicipios,
} = require("./municipios-service");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendMethodNotAllowed(response, allowedMethods) {
  response.writeHead(405, {
    allow: allowedMethods.join(", "),
    "content-type": "application/json; charset=utf-8",
  });
  response.end(
    JSON.stringify({
      error: "Metodo nao permitido.",
      allowedMethods,
    }),
  );
}

function createAppServer() {
  return http.createServer(async (request, response) => {
    const requestUrl = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";

    try {
      if (pathname === "/") {
        if (request.method !== "GET") {
          return sendMethodNotAllowed(response, ["GET"]);
        }

        return sendJson(response, 200, {
          name: "IBGE Municipios API",
          endpoints: {
            health: "GET /health",
            list: "GET /api/municipios",
            details: "GET /api/municipios/:id",
            sync: "POST /api/municipios/sync",
          },
          filters: {
            uf: "Filtra por sigla ou nome da UF. Ex.: /api/municipios?uf=SP",
            q: "Busca por municipio, UF, microrregiao, mesorregiao ou regiao.",
            limit: "Limita o numero de registros retornados.",
            offset: "Desloca a pagina de resultados.",
            refresh:
              "Quando true, tenta atualizar os dados no IBGE antes de responder.",
          },
        });
      }

      if (pathname === "/health") {
        if (request.method !== "GET") {
          return sendMethodNotAllowed(response, ["GET"]);
        }

        return sendJson(response, 200, {
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      }

      if (pathname === "/api/municipios") {
        if (request.method !== "GET") {
          return sendMethodNotAllowed(response, ["GET"]);
        }

        const refresh = requestUrl.searchParams.get("refresh") === "true";
        const result = await loadMunicipiosSnapshot({ refresh });
        const filtered = filterMunicipios(result.snapshot.municipios, {
          q: requestUrl.searchParams.get("q"),
          uf: requestUrl.searchParams.get("uf"),
          limit: requestUrl.searchParams.get("limit"),
          offset: requestUrl.searchParams.get("offset"),
        });

        return sendJson(response, 200, {
          data: filtered.data,
          meta: {
            generatedAt: result.snapshot.generatedAt,
            source: result.snapshot.source,
            sourceType: result.sourceType,
            stale: result.stale,
            syncError: result.syncError,
            snapshotTotal: result.snapshot.total,
            filteredTotal: filtered.meta.filteredTotal,
            returned: filtered.meta.returned,
            offset: filtered.meta.offset,
            limit: filtered.meta.limit,
            query: filtered.meta.query,
          },
        });
      }

      if (pathname === "/api/municipios/sync") {
        if (request.method !== "POST") {
          return sendMethodNotAllowed(response, ["POST"]);
        }

        const snapshot = await syncMunicipios();

        return sendJson(response, 200, {
          message: "Snapshot de municipios atualizado com sucesso.",
          meta: {
            generatedAt: snapshot.generatedAt,
            source: snapshot.source,
            total: snapshot.total,
          },
        });
      }

      if (pathname.startsWith("/api/municipios/")) {
        if (request.method !== "GET") {
          return sendMethodNotAllowed(response, ["GET"]);
        }

        const municipioId = pathname.slice("/api/municipios/".length);
        const result = await loadMunicipiosSnapshot();
        const municipio = findMunicipioById(result.snapshot.municipios, municipioId);

        if (!municipio) {
          return sendJson(response, 404, {
            error: "Municipio nao encontrado.",
            id: municipioId,
          });
        }

        return sendJson(response, 200, {
          data: municipio,
          meta: {
            generatedAt: result.snapshot.generatedAt,
            source: result.snapshot.source,
            sourceType: result.sourceType,
          },
        });
      }

      return sendJson(response, 404, {
        error: "Rota nao encontrada.",
        path: pathname,
      });
    } catch (error) {
      return sendJson(response, 502, {
        error: "Falha ao processar a solicitacao.",
        details: error.message,
      });
    }
  });
}

module.exports = {
  createAppServer,
};
