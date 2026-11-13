> **Mall.** Kopiera filen till `docs/specs/<namn>.md` och ersätt texten inom hakparentes. Ta bort rubriker som inte behövs; fler rubriker gör inte specen bättre. Arbetssättet beskrivs i [spec-driven-dev.md](../specs/spec-driven-dev.md).

# [Namn på funktionen]

**Id-prefix:** [inget för kärnspecen, annars ett eget, t.ex. `SF-`]

## Syfte och användare

[Vilket resultat behövs och för vem? Markera om syftet är ett eget förslag.]

## Omfattning och icke-mål

### Ingår

[Vilka delar och beteenden beskriver vi?]

### Ingår inte

[Vad lämnar vi uttryckligen utanför? Hitta inte på avgränsningar och presentera dem som givna.]

## Förutsättningar

[Vad gäller innan en åtgärd påbörjas?]

## Beteendekrav

[Numrerade, observerbara regler. Kravet beskriver regeln generellt.]

- **R1 – [kort namn]:** [regel]

## Acceptanskriterier

[Konkreta situationer som prövar en regel. Varje kriterium kopplas till minst ett krav. Ett krav kan behöva flera exempel.]

### A1

- **Utgångsläge:** [vad gäller innan]
- **Handling:** [vad användaren gör]
- **Förväntat resultat:** [vad som ska hända, och vad som inte ska försvinna eller ändras]
- **Kontrollerar:** R1

Samma sak kan skrivas som Given/When/Then om det hjälper. Det är ett beskrivande format, inte ett körbart test:

```gherkin
Scenario: [namn]
  Given [utgångsläge]
  When [handling]
  Then [förväntat resultat]
```

## Kvalitetskrav

[Minst ett kontrollerbart icke-funktionellt krav, märkt som eget förslag, med hur det kontrolleras. "Det ska vara lätt att använda" går inte att kontrollera; "alla knappar kan nås och aktiveras med tangentbord, utan mus" går.]

- **K1 – [kort namn]:** [krav] *Förslag ([namn]).* **Kontrolleras genom:** [hur]

## Antaganden och öppna frågor

[Våra val, varför de behövs och vad som fortfarande är oklart. Vi hittar inte på svar.]

- **Q1 – [fråga]**
  - **Varför det spelar roll:** [vilket krav som påverkas]
  - **Status:** Öppen *(eller: Besvarad ÅÅÅÅ-MM-DD, namn: [svar])*

## Checklista: när är specen klar?

- [ ] Varje regel har ett nummer.
- [ ] Varje regel har minst ett konkret exempel.
- [ ] Exemplen säger vad som inte ska försvinna eller ändras.
- [ ] Det som saknar svar står som öppen fråga.
- [ ] Egna förslag är märkta.
- [ ] En annan person kan bygga och kontrollera utifrån specen utan att fråga oss.
