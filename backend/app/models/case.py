"""
Case model.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.core.database import Base


class Case(Base):
    """Support case model."""
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True)
    priority = Column(String(20), nullable=True)
    status = Column(String(20), nullable=False, default="new")
    customer_email = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
