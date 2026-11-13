# API tests with Postman

Postman collection for the Ärenden API in `backend/`. The API tests follow the requirements in [kravspec.md](../specs/kravspec.md) and [sok-filter.md](../specs/sok-filter.md).

## Files

- `kundportal.postman_collection.json` – all requests with test scripts.
- `kundportal.postman_environment.json` – environment with `baseUrl = http://127.0.0.1:8000`.

## Run in Postman

1. Start the backend (see the project README).
2. In Postman: **Import** → select both files.
3. Select the environment **Kundportal local** in the top right corner.
4. Run the **Health** and **Ärenden** folders. The **Not implemented in backend** folder contains requests that are not part of the runnable API tests.

Run the **Ärenden** folder in order: "A1 Create valid case" saves `arendeId`, which "A7 Get case by id" uses.

## Run from the terminal (Newman)

```bash
npx newman run docs/api/kundportal.postman_collection.json \
  -e docs/api/kundportal.postman_environment.json \
  --folder Health --folder Ärenden
```

The **Not implemented in backend** folder contains proposed search/filter and out-of-scope requests. The status-change requests (A8 and A9) are implemented and are in the **Ärenden** folder.

## OpenAPI

FastAPI also publishes an OpenAPI spec at <http://127.0.0.1:8000/openapi.json>. You can import it directly in Postman (**Import → Link**) as a complement.
