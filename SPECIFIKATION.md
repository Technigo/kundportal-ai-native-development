# Specifikation: Kundserviceportalen (utkast 3)

## Syfte och bakgrund

Arbetsförmedlingen (en fiktiv kontext) tar emot kundärenden genom flera kanaler. Informationen hamnar på olika platser och handläggarna har svårt att få en gemensam överblick. Kundserviceportalen ska låta en handläggare registrera ett ärende, se vad det gäller och följa det genom ett enkelt arbetsflöde.

Endast påhittade kunduppgifter används.

## Målgrupp

Handläggare i Arbetsförmedlingens kundtjänst.

## Teknikval

- Frontend: JavaScript i en HTML-fil.
- Backend: Node.js med SQLite som databas.
- Tester: Vitest.
- Backend och frontend i samma projekt men i separata mappar. Varje mapp har en egen testmapp.
- Inga andra externa tjänster eller betaltjänster.

## Avgränsning

### Ingår

- Registrera ett nytt kundärende och validera obligatorisk information.
- Spara ärenden så att de finns kvar när applikationen startas om.
- Visa en lista över ärenden och detaljer för ett valt ärende.
- Ändra status på ett ärende.
- ndra övriga fält i ett ärende.
- Hantera felaktiga användningsfall med begripliga felmeddelanden.
- Kompletterande funktion: deadline på ärenden.
- Automatiserade tester för happy paths, error paths och gränsfall.
- Kunna köras och demonstreras av någon annan med hjälp av instruktioner.

### Ingår inte

- Inloggning och behörigheter.
- Notiser eller e-post till kund.
- Historik över tidigare statusar.

## Datamodell

| Fält         | Inmatning          | Obligatoriskt | Regel                                                                                                                                                    |
| ------------ | ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ärendenummer | Skapas av systemet | Automatiskt   | Unikt. Löpnummer "Årets årtal"-1, "Årets årtal"-2, "Årets årtal"-3 …                                                                                     |
| Rubrik       | Textfält           | Ja            | 1–100 tecken                                                                                                                                             |
| Beskrivning  | Textarea           | Ja            | 1–5000 tecken                                                                                                                                            |
| Kategori     | Dropdown           | Ja            | En av: Anmälan och inskrivning, Aktivitetsrapport, Ersättning och stöd, Jobb och sökning, Utbildning och insatser, Digital tjänst och inloggning, Övrigt |
| Prioritet    | Dropdown           | Ja            | Heltal 1–5, där 1 är lägst och 5 högst                                                                                                                   |
| Status       | Dropdown           | Ja            | En av: Nytt, Pågående, Väntar på kund, Avslutat                                                                                                          |
| Skapad       | Skapas av systemet | Automatiskt   | Tidpunkt då ärendet skapades. Kan inte ändras.                                                                                                           |
| Deadline     | Datum              | Ja            | Datum som inte har passerat                                                                                                                              |

## Statusar

Statusarna är **Nytt**, **Pågående**, **Väntar på kund** och **Avslutat**. Status väljs i en dropdown både när ärendet registreras och när det ändras. Ingen historik över tidigare statusar sparas.

Man kan byta fritt mellan alla statusar (till exempel från Avslutat tillbaka till Pågående).

## Acceptanskriterier

Varje kriterium är markerat som happy path, error path eller gränsfall.

### A. Registrera ärende

**AK1: Registrera ett giltigt ärende** (happy path)

- **Given:** Handläggaren har formuläret för nytt ärende öppet.
- **When:** Handläggaren fyller i rubrik, beskrivning, kategori, prioritet, status och en deadline som inte har passerat och klickar ”Registrera”.
- **Then:** Ärendet sparas med ett unikt ärendenummer och en automatiskt skapad tidpunkt, och visas i ärendelistan.

**AK2: Obligatoriskt fält saknas** (error path)

- **Given:** Formuläret är öppet.
- **When:** Handläggaren klickar ”Registrera” med ett av de obligatoriska fälten tomt (rubrik, beskrivning, kategori, prioritet, status eller deadline).
- **Then:** Inget ärende sparas, ärendelistan är oförändrad och ett meddelande vid det tomma fältet anger vilket fält som ska fyllas i, till exempel ”Rubrik måste fyllas i”.

**AK3: Rubrikens längdgräns** (gränsfall)

- **Given:** Formuläret är öppet och övriga fält är giltiga.
- **When:** Handläggaren registrerar med en rubrik på exakt 100 tecken, och därefter med en rubrik på 101 tecken.
- **Then:** Rubriken på 100 tecken godtas och ärendet sparas. Rubriken på 101 tecken avvisas med ett meddelande om högst 100 tecken, och inget ärende sparas.

**AK4: Beskrivningens längdgräns** (gränsfall)

- **Given:** Formuläret är öppet och övriga fält är giltiga.
- **When:** Handläggaren registrerar med en beskrivning på exakt 5000 tecken, och därefter med 5001 tecken.
- **Then:** 5000 tecken godtas. 5001 tecken avvisas med ett meddelande om högst 5000 tecken, och inget ärende sparas.

**AK5: Text med enbart mellanslag** (gränsfall)

- **Given:** Formuläret är öppet.
- **When:** Handläggaren anger enbart mellanslag i rubrik eller beskrivning.
- **Then:** Fältet räknas som tomt: inget ärende sparas och samma meddelande som i AK2 visas.

### B. Deadline (kompletterande funktion)

**AK6: Deadline saknas** (error path)

- **Given:** Formuläret är öppet och övriga fält är giltiga.
- **When:** Handläggaren klickar ”Registrera” utan deadline.
- **Then:** Inget ärende sparas och meddelandet ”Deadline måste fyllas i” visas.

**AK7: Deadline har passerat** (error path)

- **Given:** Formuläret är öppet och övriga fält är giltiga.
- **When:** Handläggaren anger ett datum före dagens datum och klickar ”Registrera”.
- **Then:** Inget ärende sparas och meddelandet ”Deadline kan inte ligga före dagens datum” visas.

**AK8: Deadline är dagens datum** (gränsfall)

- **Given:** Formuläret är öppet och övriga fält är giltiga.
- **When:** Handläggaren anger dagens datum som deadline.
- **Then:** Ärendet sparas.

### C. Lagring, lista och detalj

**AK9: Ärenden finns kvar efter omstart** (happy path)

- **Given:** Ett ärende har registrerats.
- **When:** Applikationen startas om (databasen öppnas på nytt).
- **Then:** Ärendet finns kvar med samma uppgifter, samma ärendenummer och samma skapad-tidpunkt.

**AK10: Lista över ärenden** (happy path)

- **Given:** Det finns flera registrerade ärenden.
- **When:** Handläggaren öppnar ärendelistan.
- **Then:** Alla ärenden visas i listan.

**AK11: Detaljer för ett ärende** (happy path)

- **Given:** Ärendelistan visas.
- **When:** Handläggaren väljer ett ärende.
- **Then:** Alla ärendets fält visas: ärendenummer, rubrik, beskrivning, kategori, prioritet, status, skapad-tidpunkt och deadline.

### D. Ändra status

**AK12: Ändra status** (happy path)

- **Given:** Ett ärende har status Nytt.
- **When:** Handläggaren väljer status Pågående och bekräftar.
- **Then:** Ärendet visas med status Pågående, och statusen finns kvar när applikationen startas om.

**AK13: Ogiltig status avvisas** (error path)

- **Given:** Ett ärende har status Nytt.
- **When:** Ett statusvärde som inte är ett av de fyra tillåtna skickas in.
- **Then:** Ändringen avvisas med ett begripligt felmeddelande och ärendets status är fortfarande Nytt.

### E. Ändra övriga fält

**AK14: Ändra ett fält** (happy path)

- **Given:** Ett ärende finns med kategori ”Övrigt” och prioritet 2.
- **When:** Handläggaren ändrar kategori till ”Ersättning och stöd” och prioritet till 4 och sparar.
- **Then:** Ärendet visar de nya värdena, övriga fält är oförändrade, och ändringen finns kvar efter omstart.

**AK15: Ogiltig ändring avvisas** (error path)

- **Given:** Ett ärende finns.
- **When:** Handläggaren tömmer rubriken, eller anger prioritet 6, eller en kategori som inte finns i listan, och sparar.
- **Then:** Ändringen avvisas med ett begripligt felmeddelande och ärendets sparade uppgifter är oförändrade.

**AK16: Fält som inte kan ändras** (error path)

- **Given:** Ett ärende finns.
- **When:** Någon försöker ändra ärendenummer eller skapad-tidpunkt.
- **Then:** Ändringen avvisas eller ignoreras, och värdena är oförändrade.

## Koppling mellan krav, kriterier och testtyp

| Krav i uppgiften                   | Kriterier                           | Typer                             |
| ---------------------------------- | ----------------------------------- | --------------------------------- |
| Registrera och validera            | AK1–AK5                             | happy path, error path, gränsfall |
| Kompletterande funktion (deadline) | AK6–AK8                             | error path, gränsfall             |
| Lagring                            | AK9                                 | happy path                        |
| Lista och detalj                   | AK10–AK11                           | happy path                        |
| Ändra status                       | AK12–AK13                           | happy path, error path            |
| Ändra övriga fält                  | AK14–AK16                           | happy path, error path            |
| Begripligt besked vid fel          | AK2, AK3, AK4, AK6, AK7, AK13, AK15 | error path                        |

## Öppna frågor

1. **Passerad deadline på sparat ärende:** När ett sparat ärende får en passerad deadline och inte är avslutat, ska det markeras i listan? Det är ett tydligt beteende som kan testas, men det ska bara in i specen om ni vill ha det.
2. **Deadline vid redigering:** Får deadline ändras? Måste ett nytt datum då ligga i dag eller framåt? Vad händer när ett ärende vars deadline redan har passerat redigeras i ett annat fält utan att deadline ändras?
