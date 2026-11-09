# Tydligt meddelande när ett ärende inte kan sparas (AC1.8)

Ägare: Alexandra Petersson · Granskare: Jessica Swahn
Täcker kravet "Handle at least one invalid use case with a clear message to the user" i [team.md](../team.md). I dag visas Next.js standardfelsida om sparandet i databasen misslyckas (se [limitations.md](../limitations.md)).

## Checklista

### Uppgift två: meddelande när sparandet misslyckas

**Förberedelse**

- [x] Skapa branchen `Alexandra/secondTask`.
- [ ] Bestäm det exakta meddelandet (engelska, enligt teamets beslut den 21 oktober 2026).
- [ ] Ändra beslutsraden "Ska handläggaren se ett meddelande om sparandet i databasen misslyckas?" i [register-ticket.md](register-ticket.md). Den säger i dag "Nej, utanför scope".

**Spec**

- [ ] Skriv ett nytt AC (AC1.8) här och i [project-brief.md](../project-brief.md): givet att sparandet misslyckas, så sparas ingenting, ett tydligt meddelande visas och de inmatade värdena finns kvar.
- [ ] Lägg till den nya raden i felmeddelandetabellen i [register-ticket.md](register-ticket.md).
- [ ] Låt Jessica granska specen innan kod skrivs.

**Test-först (`/test-cases`, sedan `/ticket-change`)**

- [ ] Kör `/test-cases AC1.8` och välj testfall.
- [ ] Action-test: repositoryt kastar ett fel, meddelandet returneras och värdena behålls. Se testet misslyckas först.
- [ ] Komponenttest i `TicketForm`: meddelandet visas (till exempel med `role="alert"`).
- [ ] Minimal kod i `submitTicket` i `src/app/(portal)/tickets/actions.ts`: fånga felet och returnera meddelandet. Läs först `node_modules/next/dist/docs/` enligt `AGENTS.md`.
- [ ] Kör `npm test`, `npm run lint`, `npm run typecheck` och `npm run test:e2e`.
- [ ] Överväg en ny mutation i `scripts/mutation-check.mjs`.

**Dokumentation**

- [ ] [verification.md](../verification.md): testmappning för AC1.8 och uppdaterad "Latest run results".
- [ ] [limitations.md](../limitations.md): ta bort punkten om standardfelsidan och punkt 7 under "Proposed further development".
- [ ] [ai/README.md](../ai/README.md): exempel på användning av `ticket-change` för AC1.8. Kan också dokumentera den längre agentuppgiften för vecka 7 (checkpoints och hinder).
- [ ] Granska ändringarna med `git status` och `git diff`, committa och öppna en PR med Jessica som granskare.

### Annat som är öppet

- [ ] AC1.7 i [project-brief.md](../project-brief.md): ändra "(Planned)" och "Done, except AC1.7" till Done. AC1.7 är byggd och testad.
- [ ] PR #10 (interna anteckningar, Marie): granskning postad 2026-11-09. Granska igen när Marie har rättat.
- [ ] [verification.md](../verification.md): kör om de manuella kontrollerna för AC4.2 (lång URL) och AC4.4 (`/tickets/01`, `/tickets/1e0`, `/tickets/0x1`), som står som "to be re-checked".
- [ ] [status/week-8.md](../status/week-8.md): fyll i Done och Open inför demon på torsdag.
- [ ] [status/week-7.md](../status/week-7.md): kryssa i den längre agentuppgiften när ai/README är uppdaterad.
- [ ] Individuell rapport i Disco (inte i repot).
