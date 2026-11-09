---
name: verify-issue-requirements
description: Gå igenom ett färdigt issue, en PR eller task i Kundserviceportalen mot berörda krav och acceptanskriterier, granska implementation och testresultat och låt teammedlemmen bekräfta varje punkt innan verifieringsstatus dokumenteras i kravspecifikationen. Använd vid kravavstämning efter genomfört arbete, inte för att implementera funktionen eller ändra kraven för att passa koden.
---

# Verifiera ett issues krav

Hjälp teammedlemmen att dokumentera vad arbetet faktiskt uppfyller. Arbeta på svenska. Följ projektets [code-design](../code-design/SKILL.md), särskilt [testreglerna](../code-design/references/tester.md), och tillämpliga AGENTS.md.

Flödet är: identifiera kraven → granska arbetet och testerna → visa en bedömning per acceptanskriterium → invänta teammedlemmens svar på alla punkter → uppdatera dokumentationen lokalt.

## 1. Bestäm uppgift och version

- Använd issue-nummer/länk, PR eller taskbeskrivning från användaren. Om uppgiften saknas, fråga vilken som ska granskas. Fråga bara efter sådant som inte går att hitta i underlagen.
- Läs issuebeskrivning, kommentarer, länkade PR:er, ändringar och tidigare verifiering. Använd GitHub-anslutningen om den finns; annars tillgänglig läsåtkomst, exempelvis GitHub CLI. Om fjärråtkomst saknas, använd lokala underlag och be om saknad uppgiftstext. Låtsas inte ha läst otillgängligt material.
- Notera repo, branch, commit-SHA och lokala ändringar. Jämför uppgiftens version med arbetskopian. Blanda inte testresultat från en version med implementation från en annan. Byt inte branch eller skriv över användarens arbete automatiskt.
- Läs aktuell `docs/kravspecifikation.md`, `docs/api-kontrakt.md`, `docs/verifieringsplan.md`, README och relevanta code-design-referenser från samma arbetsversion. Redovisa versionsskillnader eller dokumentkonflikter innan slutsatser dras. Fastställ inte öppna produkt- eller teknikbeslut på egen hand.
- Hämta uppgiftens aktuella status men behandla inte Done, stängt issue eller mergad PR som testbevis. GitHub Projects-status och issue-status kan skilja sig.

## 2. Kartlägg alla berörda krav

- Utgå från uppgiftens krav-ID:n och kontrollera mot dess beskrivning, diff, implementation och tester. Ta med ytterligare krav som arbetet faktiskt påverkar, inklusive kvalitetskrav. Motivera tillagda krav; hitta inte på nya krav-ID:n.
- Dela varje berört K-/Q-krav i dess verkliga acceptanskriterier. Ge punkterna tillfälliga granskningsnummer, exempelvis `K1 punkt 1`. Behåll kravtextens innebörd och koppla varje punkt till källan.
- Visa hela det berörda kravet även om uppgiften bara gör backenddelen. Märk övriga punkter som utanför uppgiftens del eller återstående, så att hela kravet inte blir godkänt av misstag.
- Skilj mellan godkänt beslut/API-kontrakt, implementerat beteende, testat beteende och granskad leverans. En beslutsuppgift som länkar K1–K8 bevisar inte att alla dessa funktioner fungerar.

## 3. Granska implementation och faktiska tester

- Följ varje acceptanskriterium till relevant kod och kontroller. Läs vad testernas påståenden verkligen kontrollerar; en testfil, test-ID eller grön svit är inte i sig bevis för alla krav.
- Sammanställ automatiserade tester, manuella kontroller, CI och mänsklig granskning separat. Notera källa, datum, utförare, testad version, miljö, kommando eller manuella steg, förväntat/observerat resultat och begränsningar. Skriv `saknas` när uppgifter saknas.
- Kör projektets dokumenterade backend- och frontendtester samt typkontroll/bygge när miljön tillåter. Kontrollera testkonfiguration och isolerad testlagring först. Använd aldrig utvecklingsdatabasen och dölj inte misslyckade eller överhoppade tester genom att ändra urval eller konfiguration.
- Starta befintlig separat testtjänst när det behövs och är möjligt. Installera inte nya verktyg och ändra inte kod, beroenden eller tester inom denna avstämning. Om en körning inte är möjlig: redovisa exakt vad som saknas och fortsätt granskningen med tillgängligt underlag.
- Befintliga spårbara körningar får användas som evidens; en ny körning gäller bara den version och miljö den faktiskt använder. Märk äldre resultat och testresultat utan känd version tydligt. En tidigare CI-körning bevisar inte att en ändrad arbetskopia är grön.
- Redovisa godkända, misslyckade, överhoppade och ej körda tester separat för varje svit samt typkontroll/bygge. Säg bara att alla obligatoriska tester är godkända när samtliga relevanta obligatoriska kontroller för den bedömda versionen är godkända. Rapportera även andra misslyckade obligatoriska sviter; dölj dem inte för att de verkar orelaterade.
- Simulerade frontendtester bevisar inte verklig integration. API-test bevisar inte gränssnittsbeteende. Återöppnad anslutning bevisar inte fullständig applikations-/databasomstart. Kontrollera K3/K7 mot verklig MySQL enligt testreglerna.
- Användarens beskrivning av tidigare manuell verifiering är ett underlag: återge den som rapporterad av personen, med steg och observerat utfall. Hitta inte på loggar, datum, godkännare eller testresultat. Begär bara omtest när en konkret lucka eller motsägelse kräver det.

## 4. Visa bedömning och invänta svar

Presentera först uppgift/version och testöversikten. Lista sedan alla berörda krav och deras acceptanskriterier i en numrerad tabell:

| Punkt | Krav/acceptanskriterium | Vad som är gjort | Testbevis och luckor | Föreslagen status | Teammedlemmens svar |
| --- | --- | --- | --- | --- | --- |

Använd statusarna `Uppfyllt`, `Delvis uppfyllt`, `Inte uppfyllt`, `Ej verifierat` och `Utanför uppgiftens del`. Redovisa eventuell oenighet mellan kod, testbevis och dokumentation. Lämna svarskolumnen obesvarad tills personen faktiskt svarat; förifyll inte ett godkännande.

Be personen svara för varje numrerad punkt: **uppfyllt, delvis, inte uppfyllt, ej verifierat eller utanför uppgiftens del**. Samla också in namn och uppgifter om manuella kontroller som saknas. Tillåt ett samlat svar, exempelvis: ”Punkt 1–4 uppfyllda, 5 delvis, 6 ej verifierad”, om det tydligt täcker punkterna. Enbart ”klart” är inte ett godkännande av alla kriterier.

- Vänta på svar; ändra ännu inte kravspecifikation eller verifieringsplan. Uteblivet svar är inte godkännande.
- Om bara några punkter besvarats, behåll dem och fråga bara om resterande. `Ej verifierat` är ett giltigt svar och kräver inte att alla tester först blir gröna för att luckan ska kunna dokumenteras.
- Om personen säger uppfyllt men ett test eller koden visar motsatsen: förklara avvikelsen och be om precisering för den punkten. Dokumentera inte ett konstaterat fel som uppfyllt. Särredovisa personens uppgift och den observerade avvikelsen om den kvarstår.
- Teammedlemmens bekräftelse av sitt eget arbete är inte oberoende granskning. Registrera separat vem som faktiskt har granskat och vad som godkänts. Tillämpa projektets färdigkriterier för hela leveransen.
- Om befintlig Markdown-text måste ändras, visa nuvarande och föreslagen text samt varför i denna genomgång och be om uttryckligt godkännande enligt code-design. Svar om verifieringsstatus ger inte i sig rätt att skriva om krav eller fatta öppna beslut.

## 5. Uppdatera efter att alla punkter besvarats

När svar och eventuella motsägelser är utredda, skriv de bekräftade resultaten lokalt. Fråga inte igen om rena tillägg som redan ingår i detta flöde. Gör bara uttryckligen godkända ändringar i befintliga meningar.

1. Lägg en avgränsad verifieringspost i `docs/verifieringsplan.md`, under faktiska resultat eller ett tillagt underavsnitt. Använd ett unikt stabilt ankare för posten. Dokumentera issue/task och PR, datum, verifierare, granskare om känd, commit och lokala ändringar, miljö, exakta kommandon/manuella steg, observerade resultat och testantal samt varje punkts bekräftade status och kvarvarande luckor. Skilj ny körning, tidigare logg och personens efterhandsrapport åt.
2. Lägg till en kort daterad statuspost i `docs/kravspecifikation.md` under en separat rubrik, exempelvis `Verifieringsstatus per uppgift`. Behåll kravdefinitioner och acceptanskriterier. Länka till verifieringsposten och ange uppgift, K-/Q-ID, berörd del, bekräftad status, verifierare och återstående delar. Om samma krav har flera punkter får helheten bara anges uppfylld när alla dess obligatoriska kriterier är verifierade; annars ange delvis eller ej verifierat med precisering. Skilj kravuppfyllelse från leveransens gransknings-/CI-status.
3. Bevara tidigare historik och andra uppgifters status. Vid omtest lägg till en daterad post som hänvisar till och ersätter den tidigare bedömningen för just denna uppgift/version; duplicera inte en identisk post. Ett misslyckat omtest ska synas även om ett äldre test var grönt.
4. Kontrollera diffen: varje slutsats motsvarar svar och evidens, relativa länkar/ankare fungerar och inga orelaterade krav eller andra personers ändringar har skrivits om. Om arbetsversionen ändrats under genomgången, stäm av vilka bedömningar som påverkas innan du skriver status för den nya versionen.
5. Sammanfatta ändrade dokument och vad som uppfyllts, vad som återstår och eventuella test-/granskningshinder. Säg tydligt om applikationstester inte kunde köras. En dokumentationsändring kräver inte att samma applikationstester körs om utan anledning.

Ändra inte GitHub-issues, kommentarer, Projects-status, PR-status, commits eller fjärrrepo inom detta flöde. Att använda skillen innebär att granska och dokumentera lokalt; externa uppdateringar kräver en separat uttrycklig instruktion.
