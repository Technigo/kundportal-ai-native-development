"""
Case API endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import case as case_crud
from app.schemas.case import Case, CaseCreate, CaseUpdate

router = APIRouter()


@router.post("/", response_model=Case, status_code=status.HTTP_201_CREATED)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    """Create a new case."""
    try:
        case_data = case.dict()
    except Exception:
        case_data = case.model_dump()
    return case_crud.create_case(db=db, case_data=case_data)


@router.get("/", response_model=List[Case])
def read_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all cases."""
    return case_crud.get_cases(db=db, skip=skip, limit=limit)


@router.get("/{case_id}", response_model=Case)
def read_case(case_id: str, db: Session = Depends(get_db)):
    """Get a case by ID."""
    db_case = case_crud.get_case(db=db, case_id=case_id)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case


@router.put("/{case_id}", response_model=Case)
def update_case(case_id: str, case: CaseUpdate, db: Session = Depends(get_db)):
    """Update a case."""
    try:
        case_data = case.dict(exclude_unset=True)
    except Exception:
        try:
            case_data = case.model_dump(exclude_unset=True)
        except Exception:
            case_data = case.model_dump()
    db_case = case_crud.update_case(db=db, case_id=case_id, case_data=case_data)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: str, db: Session = Depends(get_db)):
    """Delete a case."""
    success = case_crud.delete_case(db=db, case_id=case_id)
    if not success:
        raise HTTPException(status_code=404, detail="Case not found")
    return None
