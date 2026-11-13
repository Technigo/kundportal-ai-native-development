from fastapi import APIRouter, Depends, HTTPException, status

from app.repositories.arende_repository import (
    ArendeRepository,
    get_arende_repository,
)
from app.schemas.arende import Arende, ArendeCreate, ArendeStatusUpdate

router = APIRouter(prefix="/arenden", tags=["Ärenden"])

# Funktion för att kontrollera att ett ärende-id är inom giltigt intervall.
def kontrollera_id(arende_id: int) -> None:
    if not -(2**63) <= arende_id <= 2**63 - 1:
        raise HTTPException(status_code=404, detail="Ärendet hittades inte")


@router.post("", response_model=Arende, status_code=status.HTTP_201_CREATED)
def skapa_arende(
    data: ArendeCreate,
    repo: ArendeRepository = Depends(get_arende_repository),
) -> Arende:
    return repo.create(data)


@router.get("", response_model=list[Arende])
def hamta_arenden(
    repo: ArendeRepository = Depends(get_arende_repository),
) -> list[Arende]:
    return repo.get_all()


@router.get("/{arende_id}", response_model=Arende)
def hamta_arende(
    arende_id: int,
    repo: ArendeRepository = Depends(get_arende_repository),
) -> Arende:
    kontrollera_id(arende_id)
    arende = repo.get_by_id(arende_id)
    if arende is None:
        raise HTTPException(status_code=404, detail="Ärendet hittades inte")
    return arende


@router.post("/{arende_id}/status", response_model=Arende)
def andra_status(
    arende_id: int,
    data: ArendeStatusUpdate,
    repo: ArendeRepository = Depends(get_arende_repository),
) -> Arende:
    kontrollera_id(arende_id)
    arende = repo.update_status(arende_id, data.status)
    if arende is None:
        raise HTTPException(status_code=404, detail="Ärendet hittades inte")
    return arende
