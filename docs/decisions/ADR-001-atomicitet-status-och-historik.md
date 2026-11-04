# ADR-001: Hur garanterar vi att status och historik aldrig hamnar i otakt?

- **Status:** Accepterad 2026-10-26 (PR #19, granskad av Nicklas). Prövad 2026-11-03, se "Hur beslutet ska prövas"
- **Datum:** 2026-10-22 (utkast), 2026-10-25 (i repot)
- **Beslutsfattare:** Azalea (förslag), teamet (godkännande)
- **Kopplar till:** HIST-02, HIST-06, HIST-09, HIST-10 i [SPEC-arendehistorik.md](../specs/SPEC-arendehistorik.md)

## Kontext

När status ändras måste två saker ske: ärendets `status` uppdateras och en post skrivs i
`ticket_history`. Om bara det ena lyckas visar tidslinjen något annat än ärendet. Det
bryter kärnvärdet ("historiken är aldrig i otakt"). Lagringen är SQLite via SQLAlchemy 2.0.
Lösningen ska gå att testa, vara lätt att förstå för teamet och rymmas i en lokal app.

## Krav som avgör valet

| Krav | Vikt |
|---|---|
| Atomicitet: båda ändringarna eller ingen (HIST-09, HIST-10) | Måste |
| Ett fel kan injiceras i test för att bevisa att rollback sker | Måste |
| Regler (giltig status, samma status) syns i kod som teamet läser | Hög |
| Fungerar med SQLite utan extra infrastruktur | Måste |
| Låg komplexitet för en grupp på fyra med fyra veckor | Hög |
| Går att bygga ut till anteckningar, tilldelning m.m. | Medel |

## Alternativ

### A. Transaktion i tjänstelagret (förslag)
`TicketService.change_status()` öppnar en transaktion, validerar, uppdaterar
`tickets.status`, infogar historikposten och gör `commit`. Vid fel görs `rollback`.

- **+** Reglerna ligger på ett ställe i vanlig Python, lätta att läsa och enhetstesta.
- **+** Fel går att injicera (monkeypatch på repository) och rollback kan verifieras.
- **+** Ingen databasspecifik magi, byggs ut med fler eventtyper.
- **−** Atomiciteten gäller bara så länge all skrivning går via tjänsten. Någon som
  skriver direkt i `tickets` kringgår historiken. Måste mötas med konvention och test.

### B. Databastrigger
En `AFTER UPDATE`-trigger på `tickets` skriver historikposten.

- **+** Kan inte kringgås från applikationskod, eftersom databasen garanterar det.
- **−** Logiken göms i SQL utanför kodgranskning och Python-tester.
- **−** `from_status` finns bara via `OLD.status`, och validering och meddelanden måste
  ändå ligga i appen, så reglerna delas på två ställen.
- **−** Svårare att injicera fel och att migrera. Passar sämre för ett nybörjarteam.

### C. Event sourcing (status härleds ur historiken)
Ingen `status`-kolumn. Aktuell status är senaste historikposten.

- **+** Atomicitet blir trivial: det finns bara en skrivning. Historiken är sanningen.
- **−** Alla läsningar (lista, filter, sök) måste räkna ut senaste status. Det komplicerar
  det teamets kärna redan bygger (`GET /tickets`).
- **−** Kräver att teamet ändrar sin kärnmodell. Klart överdimensionerat för kravet.

## Beslut

**Alternativ A** med två kompletterande skydd:
1. Skrivning till `tickets.status` sker enbart i `TicketService`, och det dokumenteras som
   regel i spec och i AI-instruktionerna.
2. Ett test hävdar att historikens senaste `to_status` alltid är lika med ärendets
   status (invariant), kört efter varje scenario i integrationstesterna.

## Konsekvenser

- Tjänstelagret blir testets fokus. Fel injiceras mellan statusuppdatering och
  historikinsättning för att visa rollback (HIST-09).
- När historikposten inte kan sparas gör tjänsten `rollback`, så sessionen kan användas
  igen och nästa statusändring lyckas. API:t svarar **503** med "Statusen kunde inte
  ändras. Försök igen."

  **Beslut om statuskoden (Azalea, 2026-10-25): 503 i stället för 500.**

  | | 500 Internal Server Error | 503 Service Unavailable |
  |---|---|---|
  | För | En generell hanterare för alla oväntade fel | `/health` använder redan 503 när databasen inte går att nå, så samma sorts fel får samma kod. "Försök igen" passar ett tillfälligt fel. Frontend kan visa ett försök-igen-besked utan att tolka texten |
  | Emot | Säger "något gick fel hos oss" och ger ingen ledning om att ett nytt försök kan lyckas | Kräver en egen hanterare i tjänsten/routern, skild från den generella 500-hanteraren |

  Valet följer av beslutet ovan: eftersom atomiciteten ligger i tjänstelagret (alternativ A)
  kan tjänsten fånga felet, rulla tillbaka och svara med en bestämd kod. Med en trigger
  (alternativ B) hade felet kommit från databasen och varit svårare att skilja från andra
  fel. Kontrolleras i HIST-09-testerna (statuskod 503, oförändrad status, nästa byte lyckas).

  **Tillägg efter prövningen (2026-11-02, KSP-36):** 503 gäller databasfel (`SQLAlchemyError`),
  som när historikposten inte kan sparas. Andra, oväntade fel ger 500. I båda fallen görs
  `rollback`, så statusen är oförändrad och sessionen kan användas igen. Beslutet om 503 ovan
  gäller alltså databasfel, inte alla fel.
- **Kvarstående risk:** en kodväg som kringgår tjänsten fångas inte av databasen, eftersom vi
  valde bort trigger (B). Kontrollen är invarianttestet och granskning.
- **Kvarstående risk (från prövningen):** invarianten upptäcker otakt men inte förlorad data.
  Vid M3b (ingen `commit` i `change_status`) höll den, eftersom status och post försvann
  tillsammans. Det täcks av kontrollen för utebliven sparning i tabellen nedan.
- **Kvarstående risk (från prövningen):** databasfel som ger 503 loggas inte. Orsaken sparas i
  felkedjan men skrivs aldrig ut ([agentuppdraget KSP-36](../ai/agentuppdrag/KSP-36.md)).
- **Test som motbevisar beslutet:** om mutation (historikskrivningen avstängd, eller
  `commit` före historiken) inte får minst ett test att falla, är beslutet inte belagt och
  ska omprövas (kopplas till VG: kritisk granskning).
  **Skärpt 2026-11-03:** det räcker inte att något test faller. Det test som påståendet pekar
  på ska falla, och av rätt anledning, det vill säga på det beslutet lovar, till exempel
  oförändrad status. Vid M2 föll 9 tester 2026-11-01 utan att något kontrollerade statusen
  (se Utfall).
- Om en senare funktion (t.ex. tilldelning) kräver historik utan tjänstegräns kan
  alternativ B omprövas.

## Hur beslutet ska prövas (spårbarhet)

| Påstående | Kontroll | Resultat |
|---|---|---|
| Rollback sker vid fel | HIST-09, injicerat fel | **Belagt.** `test_atomicity.py`, 9 passed. Före koden föll 3 (500 i stället för 503, ingen rollback efter misslyckat byte). Statusen är oförändrad även med ny engine, och nästa byte lyckas. [PR #77](https://github.com/desiboli/kundportal-ai-native-development/pull/77) |
| Invariant håller | Test efter varje scenario | **Belagt, med en gräns.** Kontrolleras efter varje HIST-scenario ([PR #61](https://github.com/desiboli/kundportal-ai-native-development/pull/61)) och via API:t i `conftest.py` ([PR #75](https://github.com/desiboli/kundportal-ai-native-development/pull/75)). Föll vid M1 och M1b. Vid M3b höll den, eftersom status och post försvann tillsammans |
| Testen fångar utebliven historik | Mutation: ta bort insättningen (HIST-01/02/03 ska falla) | **Fångad.** M1b: 11 failed. M1: 9 failed. HIST-01, 02 och 03 föll i båda |
| Testen fångar commit utanför transaktionen | Mutation: `commit` före historiken (HIST-09 ska falla) | **Fångad, av rätt skäl först efter KSP-41.** Före: 9 failed, bara för att posten aldrig commitades. Efter (`59bb5fc`): 37 failed, varav 7 av 9 i `test_atomicity.py` på statusen |
| Testen fångar utebliven sparning | Mutation: ta bort `commit` (HIST-04 ska falla) | **Delvis.** M3 (`create`): 52 failed, bland annat `test_core02_ticket_survives_restart`. M3b (`change_status`): 32 failed. Testet för HIST-04 (omstart) saknas, så historiken efter omstart kontrolleras inte (KSP-40) |

Mutationerna och körresultaten står i [verifieringsplanen](../verifiering.md), avsnitt 5.

**Utfall (2026-11-03).** Beslut A står kvar, men kriteriet för att pröva det var för svagt. M2
(`commit` före historikposten) fick 9 tester att falla 2026-11-01, fast inget test kontrollerade
att statusen var oförändrad. Först testerna för HIST-09 (KSP-41) skilde en fungerande rollback
från en trasig. Före koden föll 3, och vid M2 efter KSP-36 föll 7 av 9 på statusen. Kriteriet är
därför skärpt (se Konsekvenser). Prövningen preciserade också beslutet: databasfel ger 503 och
andra fel 500, båda med rollback, och invarianten behöver en kontroll av att data sparas (M3b).
Raden om utebliven sparning är delvis belagd tills HIST-04 är testat (KSP-40).
