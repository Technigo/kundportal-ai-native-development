# Dokumentation – Kundserviceportalen (NORS)

Här samlar teamet all dokumentation för projektet. `docs/` är enda källan: samma sak skrivs inte på två ställen, vi länkar i stället. Varje ämne har en egen fil så att vi kan skriva samtidigt utan att krocka.

## Innehåll

| Fil                                                  | Innehåll                                                          | Ansvarig                |
| ---------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| [uppdrag.md](uppdrag.md)                             | Kursens uppgiftsbeskrivning, ordagrant                            | –                       |
| [specs/kravspec.md](specs/kravspec.md)               | Kärnflödet: krav, acceptanskriterier, kvalitetskrav, öppna frågor | Den som äger delen      |
| [specs/sok-filter.md](specs/sok-filter.md)           | Tillägget sökning och filtrering                                  | Den som äger delen      |
| [specs/statusoversikt.md](specs/statusoversikt.md)   | Tillägget statusöversikt                                          | Nathalie                |
| [specs/spec-driven-dev.md](specs/spec-driven-dev.md) | Vad spec-driven utveckling är och hur vi arbetar                  | Alla                    |
| [teknikval.md](teknikval.md)                         | Teknikval och arbetsfördelning                                    | Alla                    |
| [beslut.md](beslut.md)                               | Projektövergripande beslut med motivering och alternativ          | Alla                    |
| [ai-arbetssatt.md](ai-arbetssatt.md)                 | Hur teamet arbetar med AI, återanvändbara prompter                | Alla                    |
| [agentuppdrag/](agentuppdrag/)                       | Ett dokument per avgränsat agentuppdrag                           | Den som leder uppdraget |
| [verifieringsplan.md](verifieringsplan.md)           | Tester: spårbarhet, hur de körs, resultat, begränsningar          | Alla                    |
| [testing/](testing/README.md)                        | QA-uppgifter, testbevis och felrapporter (på engelska)            | Sravani                 |
| [veckostatus.md](veckostatus.md)                     | Veckostatus vecka 4–8                                             | Alla                    |
| [begransningar.md](begransningar.md)                 | Kända begränsningar, risker och fortsatt utveckling               | Alla                    |
| [historik/](historik/)                               | Historiskt underlag som inte gäller längre: frontend- och testspec samt arkitekturbeskrivning för den ursprungliga frontenden | Sravani |
| [mallar/spec.md](mallar/spec.md)                     | Mall för en ny spec                                               | Alla                    |
| [mallar/agentuppdrag.md](mallar/agentuppdrag.md)     | Mall för ett agentuppdrag                                         | Alla                    |

## Gruppens underlag vid inlämning

Kursen kräver följande underlag, nåbart via teamets löpande PR:

| Underlag                                                                                              | Var                                                                 |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Fork, löpande PR och markerad slutversion                                                             | PR-beskrivningen                                                    |
| Instruktioner för att köra lösningen och testerna                                                     | [README.md](../README.md)                                           |
| Specifikationer och acceptanskriterier                                                                | [specs/](specs/)                                                    |
| Automatiserade tester och verifieringsplan med testurval, motiveringar, körresultat och begränsningar | [verifieringsplan.md](verifieringsplan.md)                          |
| AI-instruktioner                                                                                      | [CLAUDE.md](../CLAUDE.md), [ai-arbetssatt.md](ai-arbetssatt.md)     |
| Tekniska beslut                                                                                       | [beslut.md](beslut.md)                                              |
| Spårbar historik över förändringar och granskningar                                                   | Commits och PR:er på GitHub, [agentuppdrag/](agentuppdrag/)         |
| Veckostatus                                                                                           | [veckostatus.md](veckostatus.md)                                    |
| Gemensamt AI-arbetsflöde och återanvändbart arbetsmoment                                              | [ai-arbetssatt.md](ai-arbetssatt.md)                                |
| Kända begränsningar, risker och förslag på fortsatt utveckling                                        | [begransningar.md](begransningar.md)                                |

## Markera slutversionen

1. Se till att kod, tester och dokumentation är pushade till teamets repository.
2. Kopiera länken till commiten som innehåller slutversionen.
3. Lägg länken överst i den löpande PR:ens beskrivning, under rubriken "Slutversion för examination".

## Så här skriver vi

- Ändra i den fil som gäller ditt ämne. Samma sak skrivs inte på två ställen; länka i stället.
- Specar: bara ägaren ändrar i sin egen spec.
- Individuella redovisningar lämnas i Disco och läggs aldrig i repot.
- Hämta senaste (`git pull`) innan du börjar skriva.
