# Frontend

The React app lives in this folder. It sends new cases to the FastAPI backend through Vite's `/cases` proxy.

## Run locally

1. Start the backend in a separate terminal using the instructions in `../backend/README.md`.
2. In this folder, install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

The frontend expects the backend at `http://127.0.0.1:8000` during development.

## Cases overview behavior

The overview requests up to 100 cases from `GET /cases/`. Search matches the case title and customer email; status and priority filters apply to the fetched list and can be combined with search. The summary cards show counts for the full fetched list, while the table shows the filtered results. Search and filtering are handled in the browser and do not change the backend data.
