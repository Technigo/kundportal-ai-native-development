import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api_errors import ApiError
from app.database import DatabaseConfigurationError, check_database_connection
from app.tickets import router as tickets_router


app = FastAPI(title="Kundserviceportalen API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# Registreras före CORS-middleware så att den hamnar innanför den. Ett
# exception_handler för Exception körs utanför CORS, och då saknar felsvaret
# Access-Control-Allow-Origin så att webbläsaren inte låter React läsa det.
@app.middleware("http")
async def unexpected_error_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "internal_error",
                    "message": "Ett oväntat fel inträffade.",
                }
            },
        )


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)

app.include_router(tickets_router)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, error: ApiError) -> JSONResponse:
    details: dict[str, object] = {
        "code": error.code,
        "message": error.message,
    }
    if error.fields:
        details["fields"] = error.fields
    return JSONResponse(
        status_code=error.status_code,
        content={"error": details},
    )


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request,
    error: RequestValidationError,
) -> JSONResponse:
    fields: dict[str, list[str]] = {}
    invalid_json = False
    for issue in error.errors():
        issue_type = issue["type"]
        location = issue["loc"]
        if issue_type == "json_invalid":
            invalid_json = True
            continue
        field = str(location[-1]) if location else "request"
        message = {
            "missing": "Fältet är obligatoriskt.",
            "string_too_short": "Texten är för kort.",
            "string_too_long": "Texten är för lång.",
            "extra_forbidden": "Okänt fält.",
        }.get(issue_type, "Ogiltigt värde.")
        fields.setdefault(field, []).append(message)

    details: dict[str, object] = {
        "code": "validation_error",
        "message": (
            "Begäran innehåller ogiltig JSON."
            if invalid_json
            else "Inmatningen kunde inte godkännas."
        ),
    }
    if fields:
        details["fields"] = fields
    return JSONResponse(status_code=422, content={"error": details})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def database_health() -> dict[str, str]:
    try:
        check_database_connection()
    except (DatabaseConfigurationError, SQLAlchemyError) as error:
        raise HTTPException(
            status_code=503,
            detail={"status": "unavailable", "database": "unavailable"},
        ) from error

    return {"status": "ok", "database": "ok"}
