# Specifikation: Registrera ett nytt ärende och validera obligatorisk information (AC1)

Ägare: Alexandra Petersson · Granskare: Jessica Swahn
Bygger på avsnitt 1 i [project-brief.md](../project-brief.md) (AC1.1–AC1.7).
Täcker också kravet "Handle at least one invalid use case with a clear message to the user" i [team.md](../team.md) genom AC1.3 och AC1.4.

## Läget i dag

- Registrering av ärenden är redan byggd och markerad som **Done** i briefen. Den kom med boilerplaten (`08e3e48`) och anpassades för handläggare (`4391680`). AC1.1–AC1.6 skrevs i efterhand utifrån den befintliga koden (`809b577`).
- Formuläret är `src/components/TicketForm.tsx` på `/tickets/new`. Det använder `noValidate`, så servern står för den egentliga valideringen. Fälten har `maxLength`, så en användare i webbläsaren kan inte skriva förbi gränserna.
- Valideringen görs av zod-schemat `newTicketSchema` i `src/tickets/ticketSchema.ts`. Server action `submitTicket` i `src/app/(portal)/tickets/actions.ts` returnerar fältfel och de inmatade värdena, eller sparar ärendet och skickar handläggaren till `/tickets`.
- Felmeddelandena finns bara i koden. De är inte dokumenterade någon annanstans.
- Prioriteten väljs i en lista där `normal` är förvalt, så handläggaren kan inte välja en okänd prioritet. Skickas en okänd prioritet ändå via en direkt förfrågan avvisar servern den med zods standardmeddelande.
- Om sparandet i databasen misslyckas visas inget meddelande för handläggaren.
- Kategori finns inte i dag, varken i databasen (`src/db/schema.ts`), i zod-schemat eller i formuläret.

## Specifikation

**Vad handläggaren gör:** öppnar **New ticket**, fyller i vem som kontaktade företaget, ämne, beskrivning, kategori och prioritet och klickar på **Register ticket**. Är uppgifterna giltiga sparas ärendet med status `open`, och handläggaren hamnar i ärendelistan med det nya ärendet överst. Annars sparas ingenting, varje ogiltigt fält visar sitt meddelande och allt handläggaren har skrivit finns kvar.

**Fält:**

| Fält | Obligatoriskt | Regler (efter att blanksteg trimmats bort) | Standardvärde |
|---|---|---|---|
| Namn på den som kontaktade (requester name) | Ja | 1–120 tecken | – |
| E-post (requester email) | Nej | En giltig e-postadress, högst 254 tecken. Tomt betyder ingen e-post. | – |
| Ämne (subject) | Ja | 3–120 tecken | – |
| Beskrivning (description) | Ja | 1–5000 tecken | – |
| Kategori (category) | Ja | Fritext, 1–50 tecken | – |
| Prioritet (priority) | Nej | `low`, `normal` eller `high` | `normal` |

**Regler:**

- All inmatning valideras på servern, oavsett vad webbläsaren skickar (AC1.5).
- Blanksteg runt varje textfält trimmas bort innan värdet kontrolleras och sparas, så ett fält med bara mellanslag räknas som tomt.
- Gränserna gäller det trimmade värdet. `maxLength` i webbläsaren räknar med blankstegen, så ett värde med blanksteg runt kan vara för långt för formuläret men ändå godkännas av servern.
- En tom prioritet räknas som att ingen prioritet valts, och ärendet får `normal`.
- En status som skickas med formuläret ignoreras. Ett nytt ärende börjar alltid som `open` (AC1.6).
- Ärenden som fanns innan kategori infördes får kategorin `General`.
- Medan formuläret skickas är knappen inaktiv och visar "Registering…", så ett ärende kan inte skickas två gånger genom dubbelklick.
- Felen visas vid respektive fält och kopplas med `aria-describedby`, och fältet markeras med `aria-invalid`.

**Felmeddelanden** (visas under fältet, med texten som den står i koden, eller ska stå när kategori är byggd):

| Fall | Meddelande |
|---|---|
| Namn saknas | Please enter who contacted us. |
| Namn över 120 tecken | Name must be at most 120 characters. |
| Ogiltig e-post | Please enter a valid email address. |
| E-post över 254 tecken | Email must be at most 254 characters. |
| Ämne saknas eller under 3 tecken | Subject must be at least 3 characters. |
| Ämne över 120 tecken | Subject must be at most 120 characters. |
| Beskrivning saknas | Please describe the problem. |
| Beskrivning över 5000 tecken | Description must be at most 5000 characters. |
| Kategori saknas | Please enter a category. |
| Kategori över 50 tecken | Category must be at most 50 characters. |
| Okänd prioritet (bara möjligt via en direkt förfrågan) | zods standardmeddelande, se beslut |

## Acceptanskriterier

- **AC1.1 (happy path):** Givet ett giltigt namn, ämne, beskrivning och kategori, när handläggaren klickar på Register ticket, så sparas ärendet med status `open`, prioritet `normal` och tidpunkten då det skapades, och handläggaren skickas till ärendelistan med ärendet överst.
- **AC1.2 (prioritet):** Prioriteten är `low`, `normal` eller `high`. En tom prioritet ger `normal`. I gränssnittet kan bara de tre värdena väljas. Om servern ändå tar emot prioriteten `urgent` i en direkt förfrågan sparas ingenting, och ett fel för prioritet returneras tillsammans med de inmatade värdena.
- **AC1.3 (valfri e-post):** Ett ärende kan sparas utan e-post. En e-post som bara innehåller mellanslag räknas som ingen e-post. Anges en e-postadress sparas den trimmad. Givet e-postadressen `not-an-email`, när handläggaren skickar formuläret, så sparas ingenting och "Please enter a valid email address." visas.
- **AC1.4 (error path, obligatoriskt fält saknas):** Givet ett tomt namn, ämne, beskrivning eller kategori, eller ett fält som bara innehåller mellanslag, när handläggaren skickar formuläret, så sparas ingenting, fältets meddelande från tabellen visas och de inmatade värdena finns kvar.
- **AC1.5 (kantfall, gränser):** Värden precis på gränserna godkänns: ämne 3 och 120 tecken, namn 120, beskrivning 5000, kategori 50 och e-post 254. Gränserna gäller det trimmade värdet. I gränssnittet hindrar `maxLength` handläggaren från att skriva fler tecken än gränsen. Om servern ändå tar emot ett värde som är ett tecken över gränsen i en direkt förfrågan avvisas det med fältets meddelande.
- **AC1.6 (status ignoreras):** Formuläret har inget fält för status. Om servern ändå tar emot `status=closed` i en direkt förfrågan tillsammans med ett i övrigt giltigt ärende sparas ärendet som `open`.
- **AC1.7 (kategori):** Kategorin är obligatorisk fritext på högst 50 tecken och sparas trimmad. Ärenden som fanns innan kategori infördes har kategorin `General`.

## Uppdelning i små steg (test-först enligt `ticket-change`)

1. **Kartlägg befintliga tester:** koppla varje AC1.x till de tester som redan täcker det i `docs/verification.md`, och lista luckorna.
2. **Schematester för luckorna:** värden precis på gränserna, gränsen på 254 tecken för e-post, fält med bara mellanslag och den exakta meddelandetexten för varje fall. Testas med Vitest i `ticketSchema.test.ts`.
3. **Kategori (test-först):** skriv först tester som misslyckas: schematester i `ticketSchema.test.ts`, ett action-test, ett komponenttest för fältet och ett e2e-test för ett ärende med kategori. Lägg sedan till `category` i `src/db/schema.ts` med `General` som värde för befintliga ärenden (ägarna kör `npm run db:generate`), i `newTicketSchema`, i `submitTicket` och i `TicketForm`, och ge seed-datan kategorier.
4. **End-to-end:** ett Playwright-test för ett obligatoriskt fält som saknas (AC1.4), om de befintliga testerna inte täcker det.
5. **Dokumentation:** uppdatera `project-brief.md` (länk till den här specen), `verification.md` och tabellen i `team.md`.

## Beslut

| Fråga | Beslut | Motivering |
|---|---|---|
| Är detta en ny funktion? | Delvis. Registreringen finns redan och dokumenteras här. Kategori är ny | AC1 var markerat Done, men inget utanför koden beskrev meddelandena, kantfallen eller gränserna. Kategori krävs i uppgiftens ärendemodell |
| Hur ser kategorin ut? | Obligatorisk fritext, 1–50 tecken | Uppgiften kräver kategori i ärendemodellen. Fritext går att bygga och testa utan att teamet först måste enas om en fast lista. Nackdelen är att samma kategori kan stavas på olika sätt |
| Vilken kategori får befintliga ärenden? | `General` | Kategori är obligatorisk, så ärenden som redan finns behöver ett värde. Vyer och specar som inte tar med kategori, till exempel ärendelistan (AC2), detaljvyn (AC4) och statusändring (AC5), undantas och påverkas inte |
| Var valideras inmatningen? | På servern, med zod | Webbläsarens kontroller kan kringgås. Formuläret använder `noValidate`, så det är serverns meddelanden som handläggaren ser |
| Behövs ett eget meddelande för okänd prioritet? | Nej, zods standardmeddelande behålls | `normal` är förvalt i listan, så en okänd prioritet kan inte väljas i gränssnittet. Den kan bara komma via en direkt förfrågan, och då avvisar servern den |
| Vilket språk har gränssnitt och felmeddelanden? | Engelska | Beslutat av teamet i ett gruppsamtal på Slack den 21 oktober 2026, där alla i teamet var med |
| Ska handläggaren se ett meddelande om sparandet i databasen misslyckas? | Nej, utanför scope. Står i [limitations.md](../limitations.md) | Kravet "Handle at least one invalid use case with a clear message to the user" uppfylls redan av valideringsfelen (AC1.3, AC1.4). Databasen är en lokal SQLite-fil, så ett misslyckat sparande är ovanligt |

## Öppna frågor

Inga just nu.
