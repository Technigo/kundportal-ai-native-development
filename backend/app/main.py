from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.fel import hantera_valideringsfel
from app.repositories.arende_repository import get_arende_repository
from app.repositories.sqlite_arende_repository import SqliteArendeRepository
from app.routers.arende_router import router as arende_router

app = FastAPI(
    title="Kundserviceportalen NORS API",
    description="Backend API for the Kundserviceportalen NORS team project.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(arende_router)
app.add_exception_handler(RequestValidationError, hantera_valideringsfel)


async def hantera_http_fel(
    _: Request, exc: StarletteHTTPException
) -> JSONResponse:
    detail = exc.detail
    if detail == "Not Found":
        detail = "Sidan hittades inte"
    elif detail == "Method Not Allowed":
        detail = "Metoden är inte tillåten"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail},
        headers=exc.headers,
    )


app.add_exception_handler(StarletteHTTPException, hantera_http_fel)

# Lokal koppling mot SQLite. Ta bort de här raderna för att gå tillbaka till minneslagring.
_sqlite_repository = SqliteArendeRepository()
app.dependency_overrides[get_arende_repository] = lambda: _sqlite_repository


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to Kundserviceportalen NORS API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
