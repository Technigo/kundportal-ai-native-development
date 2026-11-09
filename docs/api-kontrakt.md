# API-kontrakt – utkast för granskning

Arbetsunderlag för React-klient och FastAPI-backend. **Maskinvärden, felstruktur och preciseringarna nedan är Danielles beslut för backendimplementationen och ska granskas av frontendgruppen. De är inte ett påstående om gruppgodkännande.** Produkt- och valideringsregler finns i [kravspecifikationen](kravspecifikation.md).

## Anrop

- Lokal basadress: `http://localhost:8000/api`.
- Anrop med innehåll i begäran skickas som JSON med `Content-Type: application/json`.
- Ärende-ID är ett positivt heltal som skapas av backend.
- Listan sorteras med nyast först (`created_at` fallande). Utan statusfilter returneras alla ärenden; en giltig status utan träffar ger en tom lista.
- API:t ska inte erbjuda radering eller ändring av andra fält än status.

| Metod | Endpoint | Funktion | Svarskoder |
|---|---|---|---|
| `POST` | `/tickets` | Registrera ett ärende; returnerar det skapade ärendet och `Location: /api/tickets/{id}`. | `201`, `422`, `503`, `500` (`save_outcome_unknown` vid oklart commitutfall, annars `internal_error`) |
| `GET` | `/tickets` | Lista ärenden. Valfri `?status={status}` filtrerar på exakt en status, exempelvis `/api/tickets?status=in_progress`; utelämnad parameter betyder Alla. | `200`, `422`, `503`, `500` |
| `GET` | `/tickets/{id}` | Hämta alla fält för ett ärende. | `200`, `404`, `503`, `500` |
| `PATCH` | `/tickets/{id}/status` | Ändra endast status; alla giltiga statusövergångar tillåts. | `200`, `404`, `422`, `503`, `500` (`save_outcome_unknown` vid oklart commitutfall, annars `internal_error`) |

`200` betyder lyckad läsning eller statusändring, `201` bekräftad registrering, `404` okänt giltigt ärende-ID och `422` ogiltig indata, JSON, statusfilter eller okända request-fält. `503` används för databasfel endast när skrivningen säkert har misslyckats. Om commitutfallet är oklart svarar backend `500` med `save_outcome_unknown`; det får inte beskrivas som säker rollback. Andra oväntade serverfel svarar `500` med `internal_error` på alla endpoints i tabellen; se felformatet nedan. Klienten skickar inte `id`, `status` eller `created_at` vid registrering.

## Värden i API:t och texter i gränssnittet

Backend använder de engelska värdena nedan i JSON och statusfilter. Gränssnittet visar motsvarande svenska text enligt kravspecifikationen.

| Fält | Värde i API:t | Text i gränssnittet |
|---|---|---|
| Status | `new` | Nytt |
| Status | `in_progress` | Pågående |
| Status | `waiting_for_customer` | Väntar på kund |
| Status | `closed` | Avslutat |
| Kategori | `billing` | Faktura |
| Kategori | `technical_support` | Teknisk support |
| Kategori | `other` | Övrigt |
| Prioritet | `low` | Låg |
| Prioritet | `normal` | Normal |
| Prioritet | `high` | Hög |

## JSON-exempel

Kund-ID och kundnamn är obligatorisk text efter trimning: kund-ID 1–100 och kundnamn 1–200 Unicode-kodpunkter. Inget särskilt formatmönster krävs, och samma kund-ID får förekomma på flera ärenden. Kund-ID, kundnamn, rubrik och beskrivning trimmas före validering och lagring enligt den uttryckliga Unicode `White_Space`-uppsättningen i [kravspecifikationens avsnitt 4](kravspecifikation.md#4-arendemodell-och-validering); samma uppsättning ska användas i frontend och backend.

### Registrering – `POST /api/tickets`

```json
{
  "customer_id": "K-104",
  "customer_name": "Exempelkund",
  "title": "Fråga om faktura",
  "description": "Jag behöver hjälp med en påhittad faktura.",
  "category": "billing",
  "priority": "normal"
}
```

### Fullständigt ärende – svar från API:t

```json
{
  "id": 42,
  "customer_id": "K-104",
  "customer_name": "Exempelkund",
  "title": "Fråga om faktura",
  "description": "Jag behöver hjälp med en påhittad faktura.",
  "category": "billing",
  "priority": "normal",
  "status": "new",
  "created_at": "2026-10-31T22:08:34.123456Z"
}
```

Listsvaret är en JSON-array av sådana ärenden. Tid lagras i UTC och skickas som ISO 8601 med UTC-markeringen `Z` och exakt sex decimalsiffror.

### Statusändring – `PATCH /api/tickets/{id}/status`

```json
{
  "status": "in_progress"
}
```

Lyckat svar innehåller det uppdaterade ärendet. Ogiltig/saknad status ger `422`; okänt ID ger `404`. Status sätts till `new` vid registrering och visas som ”Nytt” i gränssnittet.

## Fel

Backendens felstruktur:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Inmatningen kunde inte godkännas.",
    "fields": {
      "title": ["Ange en rubrik."]
    }
  }
}
```

`fields` tas bara med när felet gäller ett eller flera fält och använder samma fältnamn som JSON-begäran. Ogiltig JSON får `422` med `code: "validation_error"`. Ett okänt giltigt ID får `404` med `code: "not_found"`. Tillfälligt databasfel med säkert misslyckad operation får `503` med `code: "storage_unavailable"`. Skicka inte SQL, tekniska feldetaljer eller interna anslutningsuppgifter till klienten.

Om commit kastar ett fel vars utfall inte kan fastställas svarar backend `500` med `code: "save_outcome_unknown"` och ett generiskt besked om att sparandet inte kunde bekräftas. Detta är inte en bekräftad rollback.

Andra oväntade serverfel svarar backend med `500` och `code: "internal_error"` i samma felstruktur, utan tekniska detaljer.

Om klienten inte kan avgöra om ändringen sparades ska den behålla inmatningen och visa att sparandet inte kunde bekräftas. Den får inte visa att ändringen säkert sparats eller misslyckats och får inte automatiskt skicka samma skrivning igen. Användaren ska kunna hämta ärendelistan igen för att kontrollera resultatet. Om inget svar når klienten finns ingen HTTP-statuskod eller feltext från servern att tolka.

## Det här behöver vi bestämma tillsammans

Punkterna nedan är öppna beslut. AI:n ska inte behandla dem som godkända krav.

- **Frontendgranskning:** Bekräfta att frontendgruppen kan använda maskinvärdena, JSON-fälten, svarskoderna och felstrukturen som implementerade; återkoppla eventuella integrationsbehov. Detta är fortfarande backendbeslut, inte gruppgodkännande.
