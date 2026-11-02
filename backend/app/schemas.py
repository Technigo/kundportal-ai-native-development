from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator


WHITE_SPACE = (
    "\u0009\u000a\u000b\u000c\u000d\u0020\u0085\u00a0\u1680"
    "\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a"
    "\u2028\u2029\u202f\u205f\u3000"
)

Category = Literal["billing", "technical_support", "other"]
Priority = Literal["low", "normal", "high"]
Status = Literal["new", "in_progress", "waiting_for_customer", "closed"]


class TicketCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    customer_id: str = Field(min_length=1, max_length=100)
    customer_name: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=5000)
    category: Category
    priority: Priority

    @field_validator(
        "customer_id", "customer_name", "title", "description", mode="before"
    )
    @classmethod
    def trim_text_fields(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip(WHITE_SPACE)
        return value


class TicketStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Status


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: str
    customer_name: str
    title: str
    description: str
    category: Category
    priority: Priority
    status: Status
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        utc_value = (
            value.replace(tzinfo=timezone.utc)
            if value.tzinfo is None
            else value.astimezone(timezone.utc)
        )
        return utc_value.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
