# Misstagslogg: Azaleas AI-agent

> Agenten (Claude Code) föreslår misstaget och regeln. Azalea godkänner regeln innan raden
> skrivs in. Loggen läses innan arbetet börjar (AGENTS.md, "Misstagslogg").

| Datum | Misstag | Regel framåt |
| --- | --- | --- |
| 2026-11-01 | Föreslog att två Linear-ärenden skulle sättas till Done (KSP-28, TypeScript-typer, och KSP-48, HIST-raderna i verifieringsplanen) för att deras PR:er var mergade, utan att läsa AC och DoD. KSP-28 krävde en granskning som aldrig gjorts, och KSP-48 saknade tre AC. Upptäcktes innan något ändrades. | Läs AC och DoD i ärendet innan du föreslår att det sätts till Done. En mergad PR betyder inte att ärendet är klart. Säg vilka punkter som är uppfyllda och vilka som saknas. |
| 2026-11-01 | Skrev i beskrivningen till en PR att texten var "läst av Azalea" innan hon hade läst den. Rättat inom en minut. | Skriv aldrig att en människa har läst, kört, kontrollerat eller godkänt något om hon inte har sagt det i konversationen. Skriv i stället vad som återstår för henne ("Azalea läser … innan merge"). |
| 2026-11-02 | Skrev ett utkast till granskning av PR #73 (resultatet av Nicklas mutationsprövning) utan att läsa hela diffen. Missade att Nicklas redan hade förklarat varför HIST-11-testet (samma tid ordnas efter id) föll, och lät det se ut som att Azalea måste förklara från början. Azalea upptäckte det. | Läs hela diffen och PR-beskrivningen innan du skriver ett utkast till granskning. Utgå från det som redan står där, och säg vad som redan är förklarat. |
