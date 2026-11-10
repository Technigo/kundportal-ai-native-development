"""
Main FastAPI application.
"""
from fastapi import FastAPI

from app.api.v1 import cases
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Case Management API",
    description="Simple CRUD API for support cases (no authentication required)",
    version="1.0.0",
)

app.include_router(cases.router, prefix="/cases", tags=["cases"])


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Case Management API"}
