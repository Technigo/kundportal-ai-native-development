---
name: design
description: Designregler för CSS och markup i frontend/index.html (Del 3 och Del 4). Använd innan utseende, layout, formulär, lista eller detaljvy ändras.
---

# Designregler för frontend

Gäller CSS och markup i `frontend/index.html`. Följ skelettet. Beteende, API och vilken zon du får röra står i `AGENTS.md`.

## Skelettet

Färger på `:root`: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--error`, `--ok`. En ny färg tas upp i en skelett-PR. Text på `--accent` är `#fff`, som i menyn. Återanvänd färger som redan står i filen. Skriv ingen ny.

- `section[data-view]` är kortet. Lägg inte ett likadant kort inuti. Detaljvyn är undantaget: en overlay med `position: fixed` och `.detail-dialog` som kort.
- Fältfel visas med `.field-error` via `showFieldErrors()`. Röd kant kommer av `[aria-invalid="true"]`.
- Allmänt meddelande visas i `#global-message` via `showGlobalMessage()`.
- `:focus-visible` har outline. Ta inte bort den. `main` har `max-width: 60rem`. Ändra inte det.
- Egen CSS hör hemma under `DEL 3` eller `DEL 4`. Klassnamn på engelska, som `.case-` och `.detail-`.

## Avstånd och layout

Nya avstånd: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`. Värden som redan finns får återanvändas, till exempel kortens `1.25rem` och menyknapparnas `0.4rem 0.9rem`.

Stapla med `gap`. Använd inte `<br>`, och lägg inte extra marginal på rubriker i en sådan stapel. `h2` har `margin-top: 0`.

Sätt ingen fast `height` på text. Lägg ingen ny `position: absolute` eller `fixed`.

Den gemensamma brytpunkten är `40rem`, samma som i skelettet. Listan har också ett mellanläge upp till `52rem`. Det får vara kvar. Under `40rem` staplas listan. `.case-table-wrap` har `overflow-x: hidden`. Sidan ska inte scrolla i sidled.

Behållare får `max-width`, `%`, `rem` eller `fr`, inte fast bredd i `px`. Knapprader använder `flex-wrap` och `gap`.

Användardata får `overflow-wrap: anywhere`, så att en lång text utan mellanslag inte spränger layouten. I listan får rubriken klippas efter två rader (`line-clamp: 2`). I detaljen visas beskrivningen med `white-space: pre-wrap` och klipps inte.

## Typografi och formulär

Typsnitt och `line-height: 1.5` ärvs från skelettet. Hjälptext är `0.9rem` i `var(--muted)`. Underrubrik är `h3`, `1rem`, fet.

Etiketten står ovanför fältet, sedan fältet, sedan `<span class="field-error" data-error-for="...">`. Felraden har `min-height: 1.25rem`.

Fält har `width: 100%`, `font: inherit`, padding minst `0.5rem 0.75rem`, `1px solid var(--border)` och `border-radius: 6px`. Nya knappar och dropdowns är minst `2.75rem` höga. Menyknapparna i skelettet är lägre och ska inte ändras.

En primärknapp per vy (`Registrera`, `Spara`): `background: var(--accent)` och `#fff`. Övriga knappar är vita med kant, som menyn. Sätt `disabled` medan anropet pågår.

## Lista och detalj

Tom lista visar `Inga ärenden ännu.` i `.case-list-empty`.

Listraden är `tr.case-row` med `tabindex="0"`. Nya klickbara kontroller är `<button>`.

Status visas som text. Färg får bara förstärka.

Detaljen är `<dl class="detail-fields">` med alla åtta fält. Etikett i `var(--muted)`, värde i `var(--text)`. `arendenummer` och `skapad` är text, inte fält.

## Innan du säger klar

Rapportera vad du sett. Kan du inte öppna sidan, säg det och lista det okontrollerade.

1. 375, 768 och 1280 px: inget krockar, ingen horisontell scroll.
2. En rubrik på 100 tecken utan mellanslag spränger inte layouten. I listan får den klippas efter två rader. I detaljen ska den synas.
3. En beskrivning på ca 5000 tecken syns. Sidan eller detaljvyn scrollar.
4. Tom lista visar `Inga ärenden ännu.`
5. Fältfel står vid rätt fält och övriga fält hoppar inte.
6. Inga nya färger eller avstånd utöver skalan och värden som redan finns.

Ändringar i den här filen görs via en liten PR som någon annan granskar.
