# Misstagslogg: Nicklas AI-agent

> Agenten (Claude Code) föreslår misstaget och regeln. Nicklas godkänner regeln innan raden
> skrivs in. Loggen läses innan arbetet börjar (AGENTS.md, "Misstagslogg").

| Datum | Misstag | Regel framåt |
| --- | --- | --- |
| 2026-10-28 | Ändrade titeln på en PR och lade till en mening i ett svar utan att visa texten först. | Allt som syns för gruppen (PR, kommentarer, titlar, Linear, Slack) visas ordagrant och godkänns innan det skickas. Ändras något efteråt visas det igen. |
| 2026-10-28 | Ett osynligt tecken (nollbreddsmellanslag, U+200B) hamnade i en fil när det skulle skrivas som text. Hände två gånger. | Efter varje skrivning av text som nämner osynliga tecken: räkna U+200B–U+200D i filen och rätta innan det sägs vara klart. |
| 2026-10-29 | Ett verktygsfel ("Could not resolve to a Repository") var nära att tolkas som att PR:erna inte fanns. | Ett felmeddelande från ett verktyg är inget svar. Ta reda på vad som gick fel innan något slutsatsas. |
| 2026-10-29 | `gh pr checkout 49` utan `-R` letade i kursens repo, eftersom klonen också har kursens repo som `upstream`. | Alla `gh`-kommandon får `-R desiboli/kundportal-ai-native-development`. |
| 2026-10-29 | Gav terminalkommandon med `# kommentar` på samma rad. I zsh blev kommentaren argument, så fyra extra Python-miljöer skapades. | Kommandon som ska klistras in har inga kommentarer på raden. Förklaringen står ovanför. |
| 2026-10-29 | Ett utkast påstod att något hade pågått "sedan i morse", men det började efter lunch. | Kontrollera tider och fakta i loggen innan ett utkast påstår när eller hur något hände. |
| 2026-10-29 | Anropade API:t utan att först läsa vilka fält som krävs, så första provet gav bara 422. | Läs `/openapi.json` eller specen innan anrop byggs. Ett oväntat fel är först det egna anropet tills motsatsen är visad. |
