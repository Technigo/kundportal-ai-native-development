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
