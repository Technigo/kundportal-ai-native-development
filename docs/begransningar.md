# Begränsningar, risker och fortsatt utveckling

Kursen kräver att gruppens underlag beskriver kända begränsningar, risker och förslag på fortsatt utveckling. Begränsningar i testningen står i [verifieringsplan.md](verifieringsplan.md).

## Kända begränsningar

### Medvetna val

Det här har vi valt bort, se "Ingår inte" i [kravspec.md](specs/kravspec.md).

- **Ingen inloggning.** Alla som kan öppna appen kan se och ändra alla ärenden.
- **Bara lokal körning.** Appen körs på den egna datorn och är inte gjord för flera användare samtidigt.
- **Ärenden kan inte raderas, och bara status kan ändras.** Ett felaktigt ärende ligger kvar.
- **Ingen historik.** Det syns inte vem som ändrade en status eller när.
- **Sökningen sker i webbläsaren** på listan som redan är hämtad (SF-Q6 i [sok-filter.md](specs/sok-filter.md)). Med väldigt många ärenden kan det bli långsamt.
- **Ett värde åt gången i varje filter** (SF-Q5). Man kan till exempel inte visa både *Nytt* och *Pågående* på en gång.

### Läget just nu

- Rubrik och beskrivning har ingen maxlängd, så mycket lång text avvisas inte (Q3 i [kravspec.md](specs/kravspec.md)).
- En lokal databasfil som skapades innan de tillåtna värdena lades in kan innehålla andra kategorier och prioriteter, till exempel "Support". Backend visar dem som de är, men nya ärenden kan bara få tillåtna värden. Den som vill börja om raderar `backend/app/data/nors.db`, se [beslut.md](beslut.md).
- När Nytt ärende öppnas stannar fokus på knappen. Den som använder tangentbord måste tabba förbi sökfältet, filtren och listan för att komma till Rubrik. K1 är ändå godkänd, och teamet valde att inte ändra det, se [K1 i verifieringsplanen](verifieringsplan.md#k1--bara-tangentbord).

## Risker

| Risk | Vad kan hända | Hur vi minskar risken |
| --- | --- | --- |
| AI skriver kod som ser rätt ut men gör fel | Fel kommer in i `main` utan att någon märker det | Varje ändring granskas i en PR och kontrolleras med tester mot specen |
| Frontendens tester skrevs efter koden | Ett test kan gå igenom även om koden gör fel | Varje test har jämförts med specen och setts misslyckas med ett tillfälligt fel, se [frontenduppdraget](agentuppdrag/2026-11-03-frontend-mot-spec.md). Svagheterna som en senare granskning med en checklista hittade i A2–A4 är rättade, se [skill-uppdraget](agentuppdrag/2026-11-05-skill-checklista.md) och [A2–A4-uppdraget](agentuppdrag/2026-11-09-a2-a4-form-tests.md) |
| Granskningsrutinen följs inte alltid | Kod kommer in i `main` utan ett godkännande som syns på GitHub. PR #2, som lade till SQLite-lagringen, granskades muntligt men godkändes inte på GitHub. Dessutom pushades `386ee26` direkt till `main`, och några PR:er, till exempel #13, mergades av en annan i teamet utan ett godkännande på GitHub. De ändrade bara dokumentationen, och teamet hade diskuterat och godkänt ändringarna | Rutinen står i [beslut.md](beslut.md), men GitHub stoppar inte en merge utan godkännande. Se förslaget om att skydda `main` nedan |
| Krockar när flera ändrar samma fil | Ändringar skrivs över eller blir fel vid merge | Hämta det senaste innan man börjar, gör små PR:er och skriv i "sin" fil |
| Databasfilen `nors.db` raderas eller går sönder | Alla ärenden försvinner, eftersom det inte finns någon säkerhetskopia | Godtagbart för en lokal kursuppgift med påhittad data |
| Tiden räcker inte | Delar av kraven blir inte klara eller testade | Kärnflödet (skapa, lista, detaljer, status) och dess tester görs först |

## Förslag på fortsatt utveckling

- **Inloggning och roller**, så att varje handläggare har ett eget konto.
- **Ärendehistorik**, så att det syns vem som ändrade vad och när.
- **Interna anteckningar och tilldelning till handläggare.** De tilläggen valde vi bort, se [beslut.md](beslut.md).
- **Sökning i backend**, så att den går snabbt även med många ärenden.
- **Flera värden i samma filter**, till exempel både *Nytt* och *Pågående*.
- **Tester genom hela gränssnittet**, som klickar i webbläsaren som en riktig användare.
- **Fokus till formuläret** när Nytt ärende öppnas, så att den som använder tangentbord kommer direkt till Rubrik (K1).
- **Kundreferens på ärendet**, så att handläggaren ser vem som ska kontaktas när ett ärende väntar på kund. Kunduppgifter valdes bort (Q5 i [kravspec.md](specs/kravspec.md)) och skulle kräva egna regler, till exempel för e-post och telefon.
- **Skydda `main` på GitHub**, så att en PR inte kan mergas utan godkännande och ingen kan pusha direkt till `main`.
- **Backendtesterna i CI**, så att `pytest` körs på varje PR. I dag kör GitHub Actions bara frontendens `npm run check`.
- **Granska resten av frontendtesterna med checklistan** i skillen `verifiera-mot-spec`. Hittills är bara A1–A4 granskade med den.
