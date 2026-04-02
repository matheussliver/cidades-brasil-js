# IBGE Municipios API

Projeto simples em JavaScript para baixar a lista oficial de municipios do IBGE, gerar um snapshot local em JSON e expor esse conteudo por HTTP.

## Fonte oficial

Este projeto usa a API oficial de localidades do IBGE:

- Documentacao: https://servicodados.ibge.gov.br/api/docs/localidades
- Endpoint de municipios: https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome

## Requisitos

- Node.js 18 ou superior

## Como usar

1. Gerar ou atualizar o arquivo `data/municipios.json`:

```bash
npm run sync
```

2. Subir a API:

```bash
npm start
```

Por padrao, o servidor sobe em `http://localhost:3000`.

## Endpoints

### `GET /health`

Retorna um status simples da aplicacao.

### `GET /api/municipios`

Retorna a lista de municipios carregada do snapshot local. Se o arquivo ainda nao existir, a API tenta sincronizar com o IBGE antes de responder.

Query params suportados:

- `uf`: filtra por sigla ou nome da UF
- `q`: busca textual por municipio, UF, microrregiao, mesorregiao ou regiao
- `limit`: limita a quantidade de registros
- `offset`: desloca a pagina
- `refresh=true`: tenta atualizar no IBGE antes de responder; se falhar e existir cache local, responde com cache e marca `stale: true`

Exemplos:

```bash
curl "http://localhost:3000/api/municipios?uf=SP&limit=10"
curl "http://localhost:3000/api/municipios?q=sao"
curl "http://localhost:3000/api/municipios?refresh=true"
```

### `GET /api/municipios/:id`

Retorna um municipio especifico pelo codigo oficial do IBGE.

### `POST /api/municipios/sync`

Forca uma nova sincronizacao com o IBGE e regrava o snapshot local.

## Estrutura do JSON

O arquivo `data/municipios.json` contem:

- `generatedAt`: data da ultima geracao
- `source`: metadados da origem oficial
- `total`: quantidade de municipios
- `municipios`: lista normalizada com `id`, `nome`, `microrregiao`, `mesorregiao`, `uf` e `regiao`

## Testes

```bash
npm test
```
