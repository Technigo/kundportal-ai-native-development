# Vad är spec-driven utveckling?

Spec-driven utveckling (Spec-Driven Development) **vänder på steken** jämfört med traditionell mjukvaruutveckling. I årtionden har koden varit kung – specifikationer var bara byggställningar som vi satte upp och sedan slängde när det "riktiga arbetet" med kodningen började. Spec-driven utveckling ändrar på detta: **specifikationer blir körbara** och genererar direkt fungerande implementationer i stället för att bara vägleda dem.

## Grundfilosofi

Spec-driven utveckling är en strukturerad process som betonar:

- **Avsiktsdriven utveckling** där specifikationerna definierar "_vad_" innan "_hur_"
- **Rik specifikationsframtagning** med hjälp av skyddsräcken och organisatoriska principer
- **Förfining i flera steg** i stället för kodgenerering i ett enda steg utifrån prompter
- **Stort beroende** av avancerade AI-modellers förmåga att tolka specifikationer

## Utvecklingsfaser

| Fas                                         | Fokus                       | Huvudaktiviteter                                                                                                                                                 |
| ------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Utveckling från 0 till 1** ("Greenfield") | Generera från grunden       | <ul><li>Börja med övergripande krav</li><li>Generera specifikationer</li><li>Planera implementationssteg</li><li>Bygg produktionsfärdiga applikationer</li></ul> |
| **Kreativ utforskning**                     | Parallella implementationer | <ul><li>Utforska olika lösningar</li><li>Stöd för flera tekniska stackar och arkitekturer</li><li>Experimentera med UX-mönster</li></ul>                         |
| **Iterativ förbättring** ("Brownfield")     | Modernisering av befintligt | <ul><li>Lägg till funktioner iterativt</li><li>Modernisera äldre system</li><li>Anpassa processer</li></ul>                                                      |

## Så arbetar vi i NORS

### 1. Skriv specen

Varje spec följer [specmallen](../mallar/spec.md) och är klar när checklistan där är uppfylld. Vi tar fram den i fyra steg:

1. **Beskriv behovet.** Vad vill vi åstadkomma, för vem och varför? Några meningar räcker som början.
2. **Red ut beteendet och vägvalen.** Vilket är utgångsläget, vad gör användaren och vad ska hända? Markera vägval och frågor.
3. **Gå igenom konkreta situationer.** Välj ett utgångsläge och en handling och försök beskriva resultatet med bara specen som stöd. Om vi behöver gissa markerar vi vad som saknar svar.
4. **Samla besluten och granska texten.** Kontrollera att texten återger besluten och markera det som fortfarande är oklart.

Vi behöver inte bygga ett gränssnitt eller köra kod för att upptäcka att en regel saknas. Exempel, om specen bara säger "När det finns en rapport ska användaren kunna ladda ner den med en knapp":

| Konkret situation                                | Ger specen ett tydligt svar?                                        |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| En rapport finns. Användaren klickar på knappen. | Ja: rapporten ska laddas ner.                                       |
| Ingen rapport finns. Användaren öppnar vyn.      | Nej: det framgår inte om knappen ska döljas eller vara inaktiverad. |

Vi hittar inte på ett svar för att göra texten komplett. En fråga utan beslut står kvar som öppen fråga.

### 2. Låt AI granska, och bedöm återkopplingen själva

Använd granskningsprompten i [ai-arbetssatt.md](../ai-arbetssatt.md). Jämför synpunkterna med [uppdraget](../uppdrag.md), välj vad vi använder, nyanserar eller avvisar och skriv kort varför. En AI-synpunkt blir inte automatiskt ett krav. Vi ansvarar för besluten även när AI hjälper oss att hitta frågor.

### 3. Besvara öppna frågor

- Skriv in regeln där den gäller i specen.
- Markera frågan i stället för att ta bort den: `Status: Besvarad 2026-10-30, namn: 200 tecken`.
- Bara specen ändras. Projektövergripande beslut (teknik, lagring, struktur, arbetssätt) skrivs i [beslut.md](../beslut.md), med de alternativ som valdes bort.

### 4. Id

- Kärnspecen använder R# (krav), A# (acceptanskriterier), K# (kvalitetskrav) och Q# (öppna frågor). En tilläggsspec sätter ett eget prefix, till exempel `SF-R1`.
- Varje spec numrerar själv, så ingen behöver läsa en annan spec för att välja nummer.
- Id:n numreras aldrig om. Ett krav som tas bort står kvar som "utgår" med en kort motivering.

### 5. Bygg med agentuppdrag

Ett avgränsat utvecklingsmoment som lämnas till en AI-agent dokumenteras i [agentuppdrag/](../agentuppdrag/) enligt [mallen](../mallar/agentuppdrag.md): mål (vilka R# och A#), avgränsning, behörigheter, kontrollpunkter, granskning och faktiska kontrollresultat.

### 6. Verifiera

Varje A# och K# har minst en rad i [verifieringsplan.md](../verifieringsplan.md). Testnamn börjar med id:t, till exempel `test_a2_...` eller `it("A2: ...")`. Ett AI-besked om att något fungerar räcker inte; det är körresultaten som gäller.
