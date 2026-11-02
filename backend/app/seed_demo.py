from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session_factory
from app.models import Ticket


DEMO_TICKETS = (
    {
        "customer_id": "DEMO-104",
        "customer_name": "Exempelkund Alfa",
        "title": "Fråga om en påhittad faktura",
        "description": "Kunden vill förstå en rad på en fiktiv faktura.",
        "category": "billing",
        "priority": "normal",
    },
    {
        "customer_id": "DEMO-208",
        "customer_name": "Exempelkund Beta",
        "title": "Problem med testinloggning",
        "description": "En påhittad användare kan inte logga in i testmiljön.",
        "category": "technical_support",
        "priority": "high",
    },
    {
        "customer_id": "DEMO-104",
        "customer_name": "Exempelkund Alfa",
        "title": "Önskemål om produktinformation",
        "description": "Kunden frågar om en fiktiv tjänst.",
        "category": "other",
        "priority": "low",
    },
)


def seed_demo_tickets(session: Session) -> int:
    created = 0
    for data in DEMO_TICKETS:
        exists = session.scalar(
            select(Ticket.id).where(
                *(getattr(Ticket, field) == value for field, value in data.items())
            )
        )
        if exists is None:
            session.add(Ticket(**data))
            created += 1

    if created:
        session.commit()
    return created


def main() -> None:
    with get_session_factory()() as session:
        created = seed_demo_tickets(session)
    print(f"Skapade {created} demonstrationsärenden.")


if __name__ == "__main__":
    main()
