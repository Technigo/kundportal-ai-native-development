from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator


class ArendeStatus(str, Enum):
    NYTT = "Nytt"
    PAGAENDE = "Pågående"
    VANTAR_PA_KUND = "Väntar på kund"
    AVSLUTAT = "Avslutat"


TILLATNA_KATEGORIER = ("Fakturering", "Teknik", "Leverans", "Övrigt")
TILLATNA_PRIORITETER = ("Låg", "Medel", "Hög")


def _lista(varden: tuple[str, ...]) -> str:
    return ", ".join(varden[:-1]) + " eller " + varden[-1]


def _giltigt_varde(
    value: object, falt: str, tillatna_varden: tuple[str, ...]
) -> object:
    if value not in tillatna_varden:
        raise ValueError(f"Ogiltig {falt}. Välj {_lista(tillatna_varden)}.")
    return value


class ArendeCreate(BaseModel):
    """Det handläggaren anger vid skapande. Status och skapad sätts automatiskt."""

    rubrik: str
    beskrivning: str
    kategori: str
    prioritet: str

    @field_validator("rubrik", "beskrivning")
    @classmethod
    def inte_tom(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Får inte vara tomt eller bara mellanslag")
        try:
            value.encode("utf-8")
        except UnicodeEncodeError:
            raise ValueError("Texten innehåller ogiltiga Unicode-tecken") from None
        return value

    # mode="before" så att även null och tal får den svenska texten.
    @field_validator("kategori", mode="before")
    @classmethod
    def giltig_kategori(cls, value: object) -> object:
        return _giltigt_varde(value, "kategori", TILLATNA_KATEGORIER)

    @field_validator("prioritet", mode="before")
    @classmethod
    def giltig_prioritet(cls, value: object) -> object:
        return _giltigt_varde(value, "prioritet", TILLATNA_PRIORITETER)


class ArendeStatusUpdate(BaseModel):
    status: ArendeStatus

    # mode="before" så att även null och tal får den svenska texten.
    @field_validator("status", mode="before")
    @classmethod
    def giltig_status(cls, value: object) -> object:
        if value not in [s.value for s in ArendeStatus]:
            raise ValueError("Ogiltig status")
        return value


class Arende(BaseModel):
    """Ett sparat ärende. Oföränderligt, så 'skapad' kan aldrig ändras."""

    model_config = ConfigDict(frozen=True)

    id: int
    rubrik: str
    beskrivning: str
    kategori: str
    prioritet: str
    status: ArendeStatus
    skapad: datetime
