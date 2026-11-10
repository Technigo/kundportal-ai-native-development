from typing import NoReturn, Optional

from fastapi import APIRouter, Depends, Path, Response
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api_errors import ApiError
from app.database import get_session
from app.models import Ticket
from app.schemas import Status, TicketCreate, TicketResponse, TicketStatusUpdate


router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def fail_safe_write(session: Session, error: SQLAlchemyError) -> NoReturn:
    try:
        session.rollback()
    except SQLAlchemyError as rollback_error:
        raise ApiError(
            500,
            "save_outcome_unknown",
            "Sparandet kunde inte bekräftas.",
        ) from rollback_error
    raise ApiError(
        503,
        "storage_unavailable",
        "Lagringen kunde inte genomföras.",
    ) from error


def commit_write(session: Session) -> None:
    try:
        session.flush()
    except SQLAlchemyError as error:
        fail_safe_write(session, error)

    try:
        session.commit()
    except SQLAlchemyError as error:
        raise ApiError(
            500,
            "save_outcome_unknown",
            "Sparandet kunde inte bekräftas.",
        ) from error


def storage_unavailable() -> ApiError:
    return ApiError(
        503,
        "storage_unavailable",
        "Lagringen är tillfälligt otillgänglig.",
    )


@router.post("", response_model=TicketResponse, status_code=201)
def create_ticket(
    payload: TicketCreate,
    response: Response,
    session: Session = Depends(get_session),
) -> Ticket:
    ticket = Ticket(
        customer_id=payload.customer_id,
        customer_name=payload.customer_name,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
    )
    session.add(ticket)
    commit_write(session)
    response.headers["Location"] = f"/api/tickets/{ticket.id}"
    return ticket


@router.get("", response_model=list[TicketResponse])
def list_tickets(
    status: Optional[Status] = None,
    session: Session = Depends(get_session),
) -> list[Ticket]:
    statement = select(Ticket).order_by(Ticket.created_at.desc(), Ticket.id.desc())
    if status is not None:
        statement = statement.where(Ticket.status == status)
    try:
        return list(session.scalars(statement))
    except SQLAlchemyError as error:
        raise storage_unavailable() from error


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int = Path(gt=0),
    session: Session = Depends(get_session),
) -> Ticket:
    try:
        ticket = session.get(Ticket, ticket_id)
    except SQLAlchemyError as error:
        raise storage_unavailable() from error
    if ticket is None:
        raise ApiError(404, "not_found", "Ärendet kunde inte hittas.")
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    payload: TicketStatusUpdate,
    ticket_id: int = Path(gt=0),
    session: Session = Depends(get_session),
) -> Ticket:
    try:
        ticket = session.get(Ticket, ticket_id)
    except SQLAlchemyError as error:
        raise storage_unavailable() from error
    if ticket is None:
        raise ApiError(404, "not_found", "Ärendet kunde inte hittas.")

    ticket.status = payload.status
    commit_write(session)
    return ticket
