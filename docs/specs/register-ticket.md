# Specifikation: Registrera ett nytt ärende och validera obligatorisk information (AC1)

Ägare: Alexandra Petersson · Granskare: Jessica Swahn
Bygger på avsnitt 1 i [project-brief.md](../project-brief.md) (AC1.1–AC1.6).

## Läget i dag

- Registrering av ärenden är redan byggd och markerad som **Done** i briefen. Den kom med boilerplaten (`08e3e48`) och anpassades för handläggare (`4391680`). AC1.1–AC1.6 skrevs i efterhand utifrån den befintliga koden (`809b577`).
- Formuläret är `src/components/TicketForm.tsx` på `/tickets/new`. Det använder `noValidate`, så servern står för den egentliga valideringen. Fälten har `maxLength`, så en användare i webbläsaren kan inte skriva förbi gränserna.
- Valideringen görs av zod-schemat `newTicketSchema` i `src/tickets/ticketSchema.ts`. Server action `submitTicket` i `src/app/(portal)/tickets/actions.ts` returnerar fältfel och de inmatade värdena, eller sparar ärendet och skickar handläggaren till `/tickets`.
- Felmeddelandena finns bara i koden. De är inte dokumenterade någon annanstans.
- Prioriteten väljs i en lista där `normal` är förvalt, så handläggaren kan inte välja en okänd prioritet. Skickas en okänd prioritet ändå via en direkt förfrågan avvisar servern den med zods standardmeddelande.
- Om sparandet i databasen misslyckas visas inget meddelande för handläggaren.

## Specifikation

**Vad handläggaren gör:** öppnar **New ticket**, fyller i vem som kontaktade företaget, ämne, beskrivning och prioritet och klickar på **Register ticket**. Är uppgifterna giltiga sparas ärendet med status `open`, och handläggaren hamnar i ärendelistan med det nya ärendet överst. Annars sparas ingenting, varje ogiltigt fält visar sitt meddelande och allt handläggaren har skrivit finns kvar.

**Fält:**

| Fält | Obligatoriskt | Regler (efter att blanksteg trimmats bort) | Standardvärde |
|---|---|---|---|
| Namn på den som kontaktade (requester name) | Ja | 1–120 tecken | – |
| E-post (requester email) | Nej | En giltig e-postadress, högst 254 tecken. Tomt betyder ingen e-post. | – |
| Ämne (subject) | Ja | 3–120 tecken | – |
| Beskrivning (description) | Ja | 1–5000 tecken | – |
| Prioritet (priority) | Nej | `low`, `normal` eller `high` | `normal` |

**Regler:**

- All inmatning valideras på servern, oavsett vad webbläsaren skickar (AC1.5).
- Blanksteg runt varje textfält trimmas bort innan värdet kontrolleras och sparas, så ett fält med bara mellanslag räknas som tomt.
- En status som skickas med formuläret ignoreras. Ett nytt ärende börjar alltid som `open` (AC1.6).
- Medan formuläret skickas är knappen inaktiv och visar "Registering…", så ett ärende kan inte skickas två gånger genom dubbelklick.
- Felen visas vid respektive fält och kopplas med `aria-describedby`, och fältet markeras med `aria-invalid`.

**Felmeddelanden** (visas under fältet, med texten som den står i koden):

| Fall | Meddelande |
|---|---|
| Namn saknas | Please enter who contacted us. |
| Namn över 120 tecken | Name must be at most 120 characters. |
| Ogiltig e-post | Please enter a valid email address. |
| E-post över 254 tecken | Email must be at most 254 characters. |
| Ämne under 3 tecken | Subject must be at least 3 characters. |
| Ämne över 120 tecken | Subject must be at most 120 characters. |
| Beskrivning saknas | Please describe the problem. |
| Beskrivning över 5000 tecken | Description must be at most 5000 characters. |
| Okänd prioritet (bara möjligt via en direkt förfrågan) | zods standardmeddelande, se beslut |

## Acceptanskriterier

- **AC-R1 (happy path):** Givet ett giltigt namn, ämne och beskrivning, när handläggaren klickar på Register ticket, så sparas ärendet med status `open` och prioritet `normal`, och handläggaren skickas till ärendelistan med ärendet överst (AC1.1, AC1.2).
- **AC-R2 (happy path, valfri e-post):** Ett ärende kan sparas utan e-post. Anges en e-postadress sparas den trimmad (AC1.3).
- **AC-R3 (error path, obligatoriskt fält saknas):** Givet ett tomt namn, ämne eller beskrivning, eller ett som bara innehåller mellanslag, när handläggaren skickar formuläret, så sparas ingenting, fältets meddelande från tabellen visas och de inmatade värdena finns kvar (AC1.4, AC1.5).
- **AC-R4 (error path, ogiltig e-post):** Givet e-postadressen `not-an-email`, när handläggaren skickar formuläret, så sparas ingenting och "Please enter a valid email address." visas (AC1.3, AC1.4).
- **AC-R5 (kantfall, gränser):** Värden precis på gränserna (ämne 3 och 120, namn 120, beskrivning 5000, e-post 254) godkänns. I gränssnittet hindrar `maxLength` handläggaren från att skriva fler tecken än gränsen. Om servern ändå tar emot ett värde som är ett tecken över i en direkt förfrågan avvisas det med fältets meddelande (AC1.5).
- **AC-R6 (error path, okänd prioritet via direkt förfrågan):** I gränssnittet kan bara `low`, `normal` och `high` väljas. Om servern ändå tar emot prioriteten `urgent` i en direkt förfrågan sparas ingenting (AC1.2, AC1.5).
- **AC-R7 (status ignoreras via direkt förfrågan):** Formuläret har inget fält för status. Om servern ändå tar emot `status=closed` i en direkt förfrågan tillsammans med ett i övrigt giltigt ärende sparas ärendet som `open` (AC1.6).

## Uppdelning i små steg (test-först enligt `ticket-change`)

1. **Kartlägg befintliga tester:** koppla varje AC-R till de tester som redan täcker det i `docs/verification.md`, och lista luckorna.
2. **Schematester för luckorna:** värden precis på gränserna, gränsen på 254 tecken för e-post, fält med bara mellanslag och den exakta meddelandetexten för varje fall. Testas med Vitest i `ticketSchema.test.ts`.
3. **End-to-end:** ett Playwright-test för ett obligatoriskt fält som saknas (AC-R3), om de befintliga testerna inte täcker det.
4. **Dokumentation:** uppdatera `project-brief.md` (länk till den här specen), `verification.md` och tabellen i `team.md`.

## Beslut

| Fråga | Beslut | Motivering |
|---|---|---|
| Är detta en ny funktion? | Nej. Specen dokumenterar och kontrollerar det som redan är byggt | AC1 är markerat Done, men inget utanför koden beskriver meddelandena, kantfallen eller gränserna |
| Var valideras inmatningen? | På servern, med zod | Webbläsarens kontroller kan kringgås. Formuläret använder `noValidate`, så det är serverns meddelanden som handläggaren ser |
| Behövs ett eget meddelande för okänd prioritet? | Nej, zods standardmeddelande behålls | `normal` är förvalt i listan, så en okänd prioritet kan inte väljas i gränssnittet. Den kan bara komma via en direkt förfrågan, och då avvisar servern den |
| Vilket språk har gränssnitt och felmeddelanden? | Engelska | Beslutat av teamet i ett gruppsamtal på Slack den 21 oktober 2026, där alla i teamet var med |
| Ska handläggaren se ett meddelande om sparandet i databasen misslyckas? | Ja. Det beskrivs i specifikationen för kravet "Handle at least one invalid use case with a clear message to the user" (inte skriven än) | Den specifikationen samlar felmeddelanden för fler fall än registreringen |

## Öppna frågor

Inga just nu.
