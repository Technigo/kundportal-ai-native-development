# Verifieringsplan

Kravspecifikationerna beskriver funktionella acceptanskriterier. Varje krav-ID ska ha minst ett automatiserat test; nya krav ska också få nya tester. CI kör både kravkontroll och projektets testsviter vid PR. Se [kravindexet](../features/README.md) och [PR #25](https://github.com/misael86/kundportal-ai-native-development/pull/25).

## Senast rapporterade resultat

Resultaten nedan kommer från projektets verifieringssessioner och PR-arbetet. De är teamresultat, inte bevis på vem som personligen körde eller granskade varje kommando.

| Kommando | Resultat | Vad det verifierar |
|---|---|---|
| `npm test` | **Godkänt:** API 106/106 och webb 95/95. | Automatiserade tester i API och webb. Omfattar både lyckade och relevanta felutfall. |
| `npm run test:requirements` | **Godkänt:** 6/6 kravchecker-tester. | Testar checkerlogik, inklusive kravtäckning, nytillkomna krav och PR-konfiguration. |
| `npm run check:requirements -- HEAD` | **Godkänt:** 84 krav har testtitlar. | Kontrollerar att dokumenterade krav-ID:n finns i automatiserade testtitlar. PR-workflow kör kontrollen mot PR:ens basgren för att också upptäcka nya krav utan nya tester. |
| `npm run build` | **Godkänt:** API TypeScript-build och Vite-produktionsbygge. | Projektets build. |

Resultaten kördes om mot nuvarande kod i arbetet med detta underlag. De är teamresultat, inte bevis på vem som personligen körde eller granskade varje kommando. Kontrollera PR #25 för aktuell status på GitHub innan rapportering.

## Riskfokuserad kontroll av krav-ID

På Misaels begäran prövade Copilot-assistenten om kravkontrollen fångar ett krav-ID som saknas i en testtitel. Endast den unika testtiteln för `CI-REQ-COVERAGE-003` ändrades tillfälligt; därefter återställdes den.

| Steg | Kommando | Faktiskt resultat |
|---|---|---|
| Testtiteln saknade krav-ID:t | `npm run check:requirements -- HEAD` | **Förväntat underkänt:** `CI-REQ-COVERAGE-003 has no matching test title in the automated test files.` |
| Testtiteln återställd | `npm run check:requirements -- HEAD` | **Godkänt:** 84 krav har testtitlar. |

Testfilen är återställd och mutationens ändring finns inte kvar. Kontrollen visar att checker hittar det saknade ID:t i testtiteln. Den verifierar inte att kravet är fullständigt, att rätt beteende testas eller att testet har tillräcklig kvalitet. Assistenten körde kommandona; detta är inte i sig belägg för att studenten själv utförde dem.

## Omfattning och spårning

De funktionella ticketsen i [featureindexet](../features/README.md) omfattar skapa, lista, visa detalj, redigera, ta bort, ändra status, hantera intern anteckning och funktionell feedback/tillgänglighet. CI kontrollerar krav-ID:n mot tester i stället för att duplicera en manuell testkolumn i varje spec.

Exempel på spårbar testning:

- CASE-CREATE-003/004 verifierar tillåtna kategori-/prioritetsvärden i UI och avvisning av ogiltiga värden i API.
- CASE-CREATE-006 verifierar att sparad data kan läsas efter ny databasanslutning.
- CASE-CREATE-007 verifierar avvisning av ogiltiga indata, att inget ärende sparas och att fel visas.
- CASE-LIST-002/003 verifierar tomlista respektive hämtningsfel; fel ska inte framstå som tomlista.
- CASE-DELETE har separata krav/tester för lyckad och misslyckad radering.

Kravindexet och checkerresultatet är rätt källa för den fullständiga, aktuella krav-till-test-mappningen. För kursredovisningen ska länkas till relevanta testfiler/kravspecar för det egna bidraget i stället för att anta att teamets samlade testsvit bevisar individuellt arbete.

## Begränsningar och återstående evidens

- API-/UI-tester kontrollerar avgränsade lager; de bevisar inte alla beteenden i en verklig användares kompletta resa.
- Tester visar inte att användaren själv har förstått eller manuellt granskat implementationen.
- Ingen särskild riskfokuserad negativ kontroll/mutation är dokumenterad för VG. Planera ett tydligt feltest, visa att en avsiktligt felaktig variant fallerar av rätt anledning, återställ och kör grönt.
- Inga resultat här bedömer produktionsdrift, autentisering eller externa integrationer; detta ligger utanför uppgiftens scope.
- Skilj automatiserade resultat från manuella UI-/tillgänglighetskontroller och från kontroller som bara är planerade.
