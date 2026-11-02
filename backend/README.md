# Backend - Case Management API

Simple CRUD API for support cases using FastAPI and SQLite. No authentication required.

## Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at http://localhost:8000/docs

## Test

```bash
pytest -v
```

## API Endpoints

- POST /cases - Create case
- GET /cases - List all cases
- GET /cases/{case_id} - Get case by id
- PUT /cases/{case_id} - Update case
- DELETE /cases/{case_id} - Delete case
