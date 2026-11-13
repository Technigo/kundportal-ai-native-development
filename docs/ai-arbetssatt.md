# AI-arbetssätt

Här beskriver vi hur teamet använder AI i projektet: vilka verktyg, vilka gemensamma instruktioner, när AI används och hur vi granskar det AI gör.

## Verktyg vi använder

- **Claude Code** i VS Code: för kod, tester, dokumentation och avgränsade agentuppdrag.
- **Claude** i webbläsaren: för att diskutera och granska specar.

AI används bara som stöd i utvecklingen. Produkten har ingen AI-funktion. Varför vi valde Claude står i [beslut.md](beslut.md).

## Gemensamma instruktioner

[CLAUDE.md](../CLAUDE.md) i repots rot läses automatiskt av Claude Code. Den ger alla i teamet samma utgångsläge:

- **Arkitektur:** hur backend och frontend är uppbyggda och var ny kod ska ligga.
- **Regler:** en uppgift i taget, tydliga förklaringar, och ifrågasätt antaganden innan du ger råd.
- **Begränsningar:** AI får inte köra git-kommandon och får inte läsa hemliga filer (`.env`). En människa granskar och committar alltid.
- **Dokumentation:** var specar, beslut och tester finns.
- **Integritet:** våra personuppgifter, som namn och e-post, ska inte skickas vidare till andra tjänster. Om AI behöver använda dem måste den fråga oss först.
- **Mappen Hämtade filer (`~/Downloads`):** där kan det ligga privata filer som inte hör till projektet. AI måste därför fråga innan den rör något där, och ett ja gäller bara en fil åt gången. Vill vi att AI ska använda en fil därifrån kan vi också flytta in den i repot.

## Arbetsflöde

Vi arbetar spec-drivet enligt "Så arbetar vi i NORS" i [spec-driven-dev.md](specs/spec-driven-dev.md). AI används i varje steg, men vi fattar besluten:

| Steg | Vad AI gör | Vad vi gör |
| --- | --- | --- |
| 1. Spec | Ställer frågor med startprompten och granskar utkastet med granskningsprompten. | Beslutar vad som blir krav (R#, A#). Skriver kort varför vi tog eller avvisade AI:s förslag. |
| 2. Agentuppdrag och plan | Föreslår en plan i små steg utifrån ett agentuppdrag i [agentuppdrag/](agentuppdrag/). Skriver ingen kod. | Skriver uppdraget: mål (R#, A#), vad AI får och inte får ändra, och att AI stannar efter planen och före PR:en. Godkänner eller ändrar planen. |
| 3. Kod och test | Skriver koden och minst ett test per A#. Visar att varje nytt test kan misslyckas. | Kör testerna själva och kontrollerar att de prövar det kriteriet kräver. Skriver resultatet i [verifieringsplan.md](verifieringsplan.md). |
| 4. Granskning | Kan hjälpa till att förklara eller granska en ändring. | Granskar varandras PR:er innan något kommer in i `main`, och fyller i Granskning i agentuppdraget. |
| 5. Dokumentation | Skriver utkast till docs-filer. | Läser, rättar och committar. Sammanfattar veckan i [veckostatus.md](veckostatus.md) med länkar. |

Exempel på ett genomfört agentuppdrag: [2026-10-29-docs-struktur.md](agentuppdrag/2026-10-29-docs-struktur.md).

## Återanvändbara moment

### Startprompt: få hjälp med frågor

Används när vi börjar på en ny spec.

```text
Jag vill beskriva en funktion innan jag bygger den.

## Min första beskrivning
[Skriv vad du vill åstadkomma.]

## Din uppgift
Hjälp mig att reda ut syfte, utgångsläge och beteenden.
Ställ en konkret fråga i taget och börja med det som mest påverkar
vad som ska byggas. Föreslå inte nya funktioner. Fråga när något
är oklart och vänta med kod och teknisk lösning.
```

När vi har svarat kan vi be AI sammanställa svaren till en kort spec. Kontrollera att texten skiljer våra beslut från förslag, antaganden och öppna frågor.

### Granskningsprompt: innehåll och struktur

Används när ett utkast till spec finns. Klistra in både uppgiftsbeskrivningen och specen.

```text
Granska min specifikation. Skriv ingen kod och gör ingen omskrivning ännu.

## Underlag
Jag skickar uppgiftsbeskrivningen och min specifikation nedan.
Utgå från dem. Presentera inte egna antaganden som mina beslut.

## Granska innehållet
Leta efter:
- formuleringar som kan tolkas på olika sätt
- motstridiga beteendekrav
- situationer där förväntat resultat saknas
- acceptanskriterier som saknar tydlig koppling till ett krav

Ge konkreta exempel och hänvisa till berörd formulering.
Skilj frågor inom uppgiften från förslag som utökar den.

## Granska strukturen
Kontrollera om tydliga rubriker hjälper läsaren att skilja mellan:
- vad som ingår
- avgränsning: vad som inte ingår
- beteendekrav: vad som ska hända
- acceptanskriterier: konkreta exempel att kontrollera
- antaganden och öppna frågor

Om strukturen gör något svårt att hitta eller förstå, föreslå
en rubrik eller uppdelning och förklara vad den skulle förtydliga.
Lägg inte till rubriker som inte behövs.

## Format på ditt svar
Använd tydliga rubriker:
1. Oklarheter och motexempel
2. Struktur och rubriker
3. Frågor jag behöver ta ställning till

Om du inte hittar en brist, säg det. Hitta inte på problem.

## Uppgiftsbeskrivning
[Klistra in underlaget här.]

## Min specifikation
[Klistra in ditt utkast här.]
```

### Skill och agent: verifiera mot specen

Används när ett test eller en del av frontenden ska kontrolleras mot ett acceptanskriterium.

- **Skillen [`verifiera-mot-spec`](../.claude/skills/verifiera-mot-spec/SKILL.md)** går igenom de sex stegen i [verifieringsplan.md](verifieringsplan.md#kod-som-byggdes-före-specen-frontend-v2), ett acceptanskriterium i taget, och har en checklista för varje test. Claude Code använder den när uppgiften stämmer med skillens beskrivning. Den kan också startas med `/verifiera-mot-spec`.
- **Agenten [`frontend-developer`](../.claude/agents/frontend-developer.md)** är en underagent för frontenduppgifter i ett agentuppdrag. Den använder skillen.

Skillen användes i [frontenduppdraget](agentuppdrag/2026-11-03-frontend-mot-spec.md), i [A8- och A9-testerna](agentuppdrag/2026-11-04-a9-test.md) och i [statusöversikten](agentuppdrag/2026-11-05-statusoversikt.md). I [skill-uppdraget](agentuppdrag/2026-11-05-skill-checklista.md) jämförde vi skillen före och efter checklistan. Med checklistan hittade agenten 6 av 7 kända svagheter i A4-testet, och utan den 2–5 av 7. Varje variant kördes bara en eller två gånger, och AI svarar olika varje gång, så resultatet är inte säkert.

### Mallar

- [Spec](mallar/spec.md)
- [Agentuppdrag](mallar/agentuppdrag.md)

## Granskning av AI-förslag

- **Specar:** återkoppling från AI bedöms enligt steg 2 i [spec-driven-dev.md](specs/spec-driven-dev.md). Vi väljer vad vi använder, nyanserar eller avvisar, och skriver kort varför. En AI-synpunkt blir inte automatiskt ett krav.
- **Kod och tester:** allt som AI har skrivit går via en egen branch och en PR. Minst en annan i teamet granskar PR:en innan den mergas till `main` (se [beslut.md](beslut.md)). Granskaren kontrollerar att ändringen följer specen och att testerna går igenom.
- **Körresultat gäller:** att AI säger att något fungerar räcker inte. Vi kör testerna själva och skriver in resultatet i [verifieringsplan.md](verifieringsplan.md).
