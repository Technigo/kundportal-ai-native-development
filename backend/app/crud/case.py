"""
CRUD operations for cases.
"""
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.case import Case


def create_case(db: Session, case_data: dict) -> Case:
    """Create a new case."""
    db_case = Case(**case_data)
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


def get_cases(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
) -> List[Case]:
    """Get cases, optionally filtered by search text and exact (case-insensitive) field values."""
    query = db.query(Case)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            func.lower(Case.title).like(term)
            | func.lower(Case.description).like(term)
            | func.lower(Case.customer_email).like(term)
        )

    if status and status.strip():
        query = query.filter(func.lower(Case.status) == status.strip().lower())
    if category and category.strip():
        query = query.filter(func.lower(Case.category) == category.strip().lower())
    if priority and priority.strip():
        query = query.filter(func.lower(Case.priority) == priority.strip().lower())

    return query.offset(skip).limit(limit).all()


def get_case(db: Session, case_id: str) -> Optional[Case]:
    """Get a case by ID."""
    return db.query(Case).filter(Case.id == case_id).first()


def update_case(db: Session, case_id: str, case_data: dict) -> Optional[Case]:
    """Update a case."""
    db_case = get_case(db, case_id)
    if not db_case:
        return None
    for key, value in case_data.items():
        if value is not None:
            setattr(db_case, key, value)
    db.commit()
    db.refresh(db_case)
    return db_case


def delete_case(db: Session, case_id: str) -> bool:
    """Delete a case."""
    db_case = get_case(db, case_id)
    if not db_case:
        return False
    db.delete(db_case)
    db.commit()
    return True