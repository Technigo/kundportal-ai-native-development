# Instruktion för testförslag (v1)

> Version: **v1** · Ansvarig: Nicklas (yrrving) · Granskare: Azalea · 2026-10-25
> Gemensam instruktion för teamet. Fungerar i alla AI-verktyg: hänvisa till filen i prompten,
> t.ex. *"Föreslå tester för CORE-07 enligt docs/ai/testforslag-v1.md"*.
> Var och en gör senare en egen, namngiven förbättring som jämförs med v1 (se Teststrategin).

## Syfte

Få fram ett genomtänkt förslag på tester för ett krav **innan** testerna skrivs, så att
granskningen sker på förslaget och inte på färdig kod.

## Indata

- Ett eller flera krav-id, t.ex. `CORE-07` eller `HIST-06`.
- Specen där kravet står (`docs/specs/`) och `AGENTS.md`.

## Gör så här

1. Läs kravet i specen, och de delar av specen som kravet hänvisar till (felmeddelanden,
   beslut, API-kontrakt).
2. Föreslå tester för kravet. Ta med:
   - minst ett **happy path**-fall,
   - de **error paths** som kravet nämner,
   - relevanta **gränsfall**.
3. Välj testnivå enligt [Teststrategin](../teststrategi.md) (avsnitt 2, Testnivåer)
   och säg varför.
4. Ange för varje test **vilken mutation** i koden som ska få testet att falla.
5. Skriv **inte** testkoden än. Förslaget granskas först.

## Utdata

En tabell, en rad per test:

| Testnamn | Krav-id | Givet / När / Då | Förväntat resultat | Nivå | Ska falla om … |
| --- | --- | --- | --- | --- | --- |
| `test_core07_missing_description_is_rejected` | CORE-07 | Givet att beskrivning saknas, när ärendet skapas, då … | 422, `{"detail": "Beskrivning måste fyllas i."}`, inget ärende i databasen | Integration | valideringen av beskrivning tas bort |

Efter tabellen: en kort lista med **frågor** om något i specen är otydligt.

## Gränser

- Hitta inte på krav. Allt som testas ska gå att peka på i specen.
- Ändra inte specen. Är den otydlig: skriv en fråga.
- Håll dig till den spec som kravet står i. Där CORE och HIST gränsar till varandra
  (t.ex. CORE-06 och HIST-10) föreslås fallet bara för det krav som äger beteendet.
  Nämn det andra kravet i en fråga i stället för att föreslå samma test två gånger.
- Förväntade felmeddelanden ska vara **exakt** de som står i specen.
- Bara påhittade uppgifter.

## Granskning (görs av människan)

- [ ] Varje test går att koppla till ett krav-id.
- [ ] Förväntat resultat är exakt (statuskod, meddelande, vad som finns i databasen).
- [ ] Varje test har en mutation som får det att falla.
- [ ] Inget test kontrollerar något som specen inte säger.
