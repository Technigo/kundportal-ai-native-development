# Misstagslogg: Amalias AI-agent

> Agenten (Claude Code) föreslår misstaget och regeln. Amalia godkänner regeln innan raden
> skrivs in. Loggen läses innan arbetet börjar (AGENTS.md, "Misstagslogg").

| Datum | Misstag | Regel framåt |
| --- | --- | --- |
| 2026-11-05 | Påstod att KSP-75 (sidhuvud med navigation, Mustafa) måste vara mergad innan felmeddelandena i UI (KSP-38) byggs, för att undvika konflikter. Jämförde inte vilka filer de två ändrar. Det visade sig att länken tillbaka och tidslinjen ligger i `ticket-detail-page.tsx`, som KSP-75 inte rör. Amalia frågade varför, och då upptäcktes felet. | Innan du säger att en branch blockerar en annan, jämför vilka filer båda ändrar (`git diff --stat`). Ange vilka filer som överlappar, eller säg att inga gör det. |
