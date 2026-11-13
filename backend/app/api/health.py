from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_session

router = APIRouter()


@router.get("/health")
def health(session: Annotated[Session, Depends(get_session)]) -> dict[str, str]:
    # Frågar databasen så att svaret visar att hela kedjan fungerar, inte bara att appen lever.
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        # Svenskt meddelande utan databasdetaljer, enligt specens felformat.
        raise HTTPException(status_code=503, detail="Databasen går inte att nå just nu.")
    return {"status": "ok", "database": "ok"}
