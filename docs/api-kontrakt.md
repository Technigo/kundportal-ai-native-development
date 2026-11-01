# API-kontrakt – utkast för granskning

Utkast till gemensamt arbetsunderlag för React-klient och FastAPI-backend. **Mina förslag för gruppens granskning. Gruppen har ännu inte godkänt kontraktet.** Produkt- och valideringsregler finns i [kravspecifikationen](kravspecifikation.md).

## Anrop

- Lokal basadress: `http://localhost:8000/api`.
- Anrop med innehåll i begäran skickas som JSON med `Content-Type: application/json`.
- Ärende-ID är ett positivt heltal som skapas av backend.
- Listan sorteras med nyast först (`created_at` fallande). Utan statusfilter returneras alla ärenden; en giltig status utan träffar ger en tom lista.
- API:t ska inte erbjuda radering eller ändring av andra fält än status.

| Metod | Endpoint | Funktion | Svarskoder |
|---|---|---|---|
| `POST` | `/tickets` | Registrera ett ärende; returnerar det skapade ärendet och `Location: /api/tickets/{id}`. | `201`, `422`, `503` |
| `GET` | `/tickets` | Lista ärenden. Valfri `?status={status}` filtrerar på exakt en status, exempelvis `/api/tickets?status=in_progress`; utelämnad parameter betyder Alla. | `200`, `422`, `503` |
| `GET` | `/tickets/{id}` | Hämta alla fält för ett ärende. | `200`, `404`, `503` |
| `PATCH` | `/tickets/{id}/status` | Ändra endast status; alla giltiga statusövergångar tillåts. | `200`, `404`, `422`, `503` |

`200` betyder lyckad läsning eller statusändring, `201` bekräftad registrering, `404` okänt ärende-ID, `422` ogiltiga eller saknade fält/statusfilter och `503` bekräftat tillfälligt lagringsfel. Oväntade serverfel ger `500` med generiskt felmeddelande. Klienten skickar inte `id`, `status` eller `created_at` vid registrering.

## Värden i API:t och texter i gränssnittet

API:t föreslås använda de engelska värdena nedan i JSON och statusfilter. Gränssnittet visar motsvarande svenska text enligt kravspecifikationen.

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
  "created_at": "2026-10-31T22:08:34Z"
}
```

Listsvaret föreslås vara en JSON-array av sådana ärenden. Tidpunkter skickas i UTC som ISO 8601 med `Z`; exakt precision är ett öppet beslut.

### Statusändring – `PATCH /api/tickets/{id}/status`

```json
{
  "status": "in_progress"
}
```

Lyckat svar innehåller det uppdaterade ärendet. Ogiltig/saknad status ger `422`; okänt ID ger `404`. Status sätts till `new` vid registrering och visas som ”Nytt” i gränssnittet.

## Fel

Föreslagen gemensam struktur:

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

`fields` tas bara med när felet gäller ett eller flera fält och använder samma fältnamn som JSON-begäran. Skicka inte SQL, tekniska feldetaljer eller interna anslutningsuppgifter till klienten.

Om klienten inte kan avgöra om ändringen sparades ska den behålla inmatningen och visa att sparandet inte kunde bekräftas. Den får inte visa att ändringen säkert sparats eller misslyckats och får inte automatiskt skicka samma skrivning igen. Användaren ska kunna hämta ärendelistan igen för att kontrollera resultatet. Om inget svar når klienten finns ingen HTTP-statuskod eller feltext från servern att tolka.

## Det här behöver vi bestämma tillsammans

Punkterna nedan är öppna beslut. AI:n ska inte behandla dem som godkända krav.

- **Engelska värden:** Ska vi använda mina förslag på engelska värden i API:t och motsvarande svenska texter i gränssnittet?
- **Felsvar:** Ska vi använda den föreslagna felstrukturen och svarskoderna? Bestäm också hur vi hanterar ogiltig JSON, saknade eller felaktiga värden och extra fält som API:t inte förväntar sig.
- **Tid:** Ska skapandetiden skickas med hela sekunder eller även delar av en sekund?
- **Gemensam genomgång:** Gå igenom anrop, JSON-fält och felsvar med Lukas och frontendgruppen så att båda delarna följer samma kontrakt.
