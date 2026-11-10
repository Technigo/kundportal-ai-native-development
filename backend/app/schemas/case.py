"""
Case schemas for request/response validation.
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class CaseStatus(str, Enum):
    """Allowed case statuses."""
    NEW = "new"
    IN_PROGRESS = "in_progress"
    WAITING_FOR_CUSTOMER = "waiting_for_customer"
    CLOSED = "closed"


class CaseCategory(str, Enum):
    """Allowed case categories (kept in sync with the frontend)."""
    ACCOUNT = "Account"
    BILLING = "Billing"
    TECHNICAL_SUPPORT = "Technical support"
    OTHER = "Other"


class CasePriority(str, Enum):
    """Allowed case priorities (kept in sync with the frontend)."""
    LOW = "Low"
    NORMAL = "Normal"
    HIGH = "High"
    URGENT = "Urgent"


class CaseBase(BaseModel):
    """Base case schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: CaseCategory
    priority: CasePriority
    status: CaseStatus
    customer_email: EmailStr

    @field_validator("title", "description", mode="before")
    @classmethod
    def _strip_and_require_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
        if value == "" or value is None:
            raise ValueError("This field is required.")
        return value

    @field_validator("customer_email", mode="before")
    @classmethod
    def _strip_email(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CaseCreate(CaseBase):
    """Schema for creating a case."""
    pass


class CaseUpdate(BaseModel):
    """Schema for updating a case."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[CaseCategory] = None
    priority: Optional[CasePriority] = None
    status: Optional[CaseStatus] = None
    customer_email: Optional[EmailStr] = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def _strip_and_require_text(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            value = value.strip()
        if value == "":
            raise ValueError("This field is required.")
        return value

    @field_validator("customer_email", mode="before")
    @classmethod
    def _strip_email(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class Case(BaseModel):
    """Schema for case response."""
    id: str
    title: str
    description: str
    category: CaseCategory
    priority: CasePriority
    status: CaseStatus
    customer_email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
