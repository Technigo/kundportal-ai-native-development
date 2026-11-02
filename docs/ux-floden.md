# UX-flöden och gränssnittsförslag – Kundserviceportalen

## Syfte

Detta dokument beskriver föreslagna användarflöden och gränssnittslösningar baserade på projektets kravspecifikation.

Syftet är att konkretisera hur handläggaren kan använda systemet innan implementationen påbörjas. Dokumentet används som underlag för design, utveckling, testning och vidare diskussion inom teamet.

Förslagen i dokumentet kan justeras under implementation och verifiering.

---

# Målgrupp

Den primära användaren är en handläggare som arbetar med kundärenden.

Handläggaren ska kunna:

- Registrera nya ärenden

- Se registrerade ärenden

- Öppna ärendedetaljer

- Ändra ärendestatus

- Filtrera ärenden utifrån status

---

# Översikt över vyer

Förslaget utgår från tre huvudsakliga vyer:

1. Ärendelista
2. Nytt ärende
3. Ärendedetaljer
---

# Flöde 1 – Registrera nytt ärende

## Mål

Handläggaren ska kunna registrera ett nytt kundärende.

## Flöde

```text
Ärendelista
↓
Klicka på "Nytt ärende"
↓
Formulär visas
↓
Ange kundinformation
↓
Ange ärendeinformation
↓
Spara ärende
↓
Validering genomförs
↓
Ärendet registreras
```

# Förslag på gränssnitt
## Vy 1 – Ärendelista
Syfte:
Ge handläggaren en översikt över registrerade ärenden.

Föreslaget innehåll:
- Knapp för "Nytt ärende"
- Statusfilter
- Lista med registrerade ärenden
 
Föreslagna kolumner:
- Ärende-ID
- Kundnamn
- Rubrik
- Kategori
- Prioritet
- Status
- Skapad tidpunkt

### Enkel wireframe
```text
+--------------------------------------------------+
| Kundserviceportalen |
+--------------------------------------------------+
 
Filter:
[ Alla ▼ ]
+--------------------------------------------------+
| ID | Kundnamn | Rubrik | Status | Prioritet |
+--------------------------------------------------+
| 1 | Anna | Faktura| Nytt | Hög |
| 2 | Erik | Leverans| Pågående | Medel |
+--------------------------------------------------+

[ Nytt ärende ]
```
---

## Vy 2 – Registrera nytt ärende
Syfte:
Låta handläggaren skapa ett nytt kundärende.

Föreslagna fält:
- Kund-ID
- Kundnamn
- Rubrik
- Beskrivning
- Kategori
- Prioritet
 
Föreslagna knappar:
- Skapa ärende
- Avbryt
 
### Enkel wireframe
```text
+--------------------------+
| Registrera nytt ärende |
+--------------------------+

Kund-ID *
[____________]

Kundnamn *
[____________]

Rubrik *
[____________]
 
Beskrivning *
[_____________________]
[_____________________]
 
Kategori *
[välj kategori]

Prioritet *
[välj prioritet]
 
[ Skapa ärende ]
[ Avbryt ]
```

### Felvisning (exempel)

```text
Rubrik *
[____________]

⚠ Rubrik är obligatorisk.
```
 
## Vy 3 – Ärendedetaljer
Syfte:
Visa all information om ett enskilt ärende.

Föreslagen information:
- Ärende-ID
- Kund-ID
- Kundnamn
- Rubrik
- Beskrivning
- Kategori
- Prioritet
- Status
- Skapad tidpunkt
 
Föreslagna funktioner:
- Ändra status
- Tillbaka till ärendelista

### Enkel wireframe
```text
Ärende-ID: 1
 
Kund-ID: 1001
Kundnamn: Anna Andersson

Rubrik:
Problem med faktura

Beskrivning:
Dubbel debitering på senaste fakturan.

Kategori:
Fakturering

Prioritet:
Hög

Status:
[Nytt ▼]

[ Uppdatera status ]
[ Tillbaka till lista ]
```

## Designfrågor att besluta senare

- Exakt layout för ärendelistan
- Exakt layout för detaljvyn
- Placering av filter
- Utformning av bekräftelsemeddelanden
- Visuell profil och färger
- Mobilanpassning eller endast desktopstöd
 
## Förslag på felmeddelanden

## Sammanfattning

| Situation | Felmeddelande |
|------------|---------------|
| Kund-ID saknas | Kund-ID är obligatoriskt. |
| Kundnamn saknas | Kundnamn är obligatoriskt. |
| Rubrik saknas | Rubrik är obligatorisk. |
| Beskrivning saknas | Beskrivning är obligatorisk. |
| Rubrik överstiger maxlängd | Rubriken får vara högst 100 tecken. |
| Beskrivning överstiger maxlängd | Beskrivningen får vara högst 5000 tecken. |

## Obligatoriska fält
Om ett obligatoriskt fält lämnas tomt visas följande meddelanden:
 
- Kund-ID är obligatoriskt.
- Kundnamn är obligatoriskt.
- Rubrik är obligatorisk.
- Beskrivning är obligatorisk.
- Välj en kategori.
- Välj en prioritet.

## Felaktig inmatning
 
- Rubriken får inte bara innehålla blanksteg.
- Beskrivningen får inte bara innehålla blanksteg.
- Rubriken får vara högst 100 tecken.
- Beskrivningen får vara högst 5000 tecken.
- Kategorin är inte giltig.
- Prioriteten är inte giltig.
 
## Sparfel
Om ärendet inte kan sparas:
 
- Ärendet kunde inte sparas. Försök igen.
- Något gick fel vid sparningen. Försök igen senare.
 
## Statusändring

Om status inte kan ändras:
 
- Status kunde inte uppdateras.
- Den valda statusen är inte giltig.
 

## Ärende saknas
Om ett ärende inte kan hittas:

- Ärendet kunde inte hittas.
- Ärendet finns inte längre.


## Filtrering
Om inga ärenden matchar filtret:

- Inga ärenden matchar det valda filtret.

## Bekräftelsemeddelanden
 
Efter lyckade operationer visas:
 
- Ärendet har registrerats.
- Statusen har uppdaterats.
 
# UX-principer för felmeddelanden

- Felmeddelanden visas nära det fält där felet uppstod.
- Felmeddelanden ska vara enkla att förstå.
- Felmeddelanden ska beskriva problemet utan tekniska termer.
- Tidigare inmatad information ska finnas kvar efter valideringsfel.
- Användaren ska kunna rätta felet utan att behöva börja om.
- Bekräftelsemeddelanden ska visas efter lyckade operationer.



## Dokumentinformation

Ansvarig: Nora Aljuburi Masamra

Syftet med dokumentet är att fungera som ett UX-underlag för vidare design, implementation och verifiering av Kundserviceportalen. Dokumentet baseras på projektets kravspecifikation och kan uppdateras under utvecklingsarbetet.

