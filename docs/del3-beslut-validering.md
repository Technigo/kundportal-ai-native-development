Filen är återställd och allt är rent: `nothing to commit, working tree clean`.

**Steg 4:** Skapa beslutsdokumentet.
1. Högerklicka på mappen **`docs`** i vänstermenyn och välj **New File**.
2. Skriv `del3-beslut-validering.md` och tryck Enter.
3. Klistra in texten nedan och spara med **Ctrl+S**.

```
# Del 3: Beslut om hur formuläret hanterar validering

**Ansvarig:** Selin (SelinCoder) · **Datum:** 2026-11-10 · **PR:** #14

## Frågan
Registreringsformuläret tar emot sex fält. Vem ska avgöra om en inmatning är giltig: servern, formuläret eller webbläsarens inbyggda kontroller?

## Alternativen
- **A. Servern bestämmer.** Formuläret skickar fälten som användaren skrev dem och visar de fältfel som servern svarar med.
- **B. Servern och egna regler i formuläret.** Formuläret kontrollerar längd, tomma fält och deadline innan det skickar.
- **C. Webbläsarens inbyggda kontroller.** `required`, `maxlength` och `min` på datumfältet.

## Avvägning

| | A: servern | B: egna regler + servern | C: webbläsarens kontroller |
|---|---|---|---|
| Reglerna finns på ett ställe | Ja, i backend | Nej, två ställen som kan glida isär | Nej, webbläsaren och backend |
| Samma meddelanden som API:t | Ja, texten kommer från servern | Risk för olika formuleringar | Nej, webbläsarens egna texter |
| Svar utan att servern behövs | Nej | Ja | Ja |
| Mer kod att underhålla | Minst | Mest | Lite |
| Testbart med det vi har (jsdom + låtsas-server) | Ja | Ja | Svårt, jsdom visar inte webbläsarens egna felrutor |

Skäl för A, som är mitt val:
- Backend har redan reglerna och testerna för dem. Att upprepa dem i formuläret ger två sanningar att hålla i synk.
- Enligt `docs/API.md` är det servern som räknar längden på den trimmade texten och avgör vad "dagens datum" är (svensk tid). En `maxlength` eller `min` i webbläsaren skulle räkna på annat sätt och kunde stoppa eller släppa igenom fel inmatningar.
- Med `novalidate` och utan `required`/`maxlength` visar formuläret alltid serverns meddelande vid rätt fält.

## Ärlig bakgrund
Skelettet (`showFieldErrors`, `data-error-for` och kontraktet i `index.html`) var redan byggt för alternativ A. Jag valde alltså inte A från noll. Jag vägde alternativen mot varandra och kom fram till att A passar API:t, men skelettet gjorde det till det naturliga vägvalet.

## Nackdelar med A som jag accepterar
- Användaren får inget svar förrän servern svarat.
- Om servern inte nås finns inget stöd för att kontrollera inmatningen. Det fallet hanteras med ett begripligt meddelande ("Kunde inte nå servern") och är testat.

## Vad som är kontrollerat
- **Tester (jsdom, låtsas-server)**, 2026-11-10 10:43: frontend 12 godkända, 5 väntande, 0 misslyckade. Testerna täcker AK1, AK2, AK3/AK4, AK6/AK7 och "servern nås inte".
- **Kontrollexperiment**, 2026-11-10 10:41: jag kommenterade bort `showFieldErrors(form, res.data?.faltfel)`. Då blev AK2, AK3/AK4 och AK6/AK7 röda (3 misslyckade, 9 godkända, 5 väntande). När jag tog bort kommentaren blev alla gröna igen (10:43). Det visar att testerna märker om serverns fältfel inte visas vid rätt fält.
- **Manuella prov mot riktiga servern**, 2026-11-05: korrekt ifyllt formulär registrerades. Tomt formulär gav röda meddelanden vid fälten. 101 tecken i rubriken gav "Rubrik får vara högst 100 tecken" vid rubrikfältet. Deadline före idag gav "Deadline kan inte ligga före dagens datum" vid deadline-fältet. Båda gav också "Ärendet kunde inte sparas. Rätta de markerade fälten." överst.
- **Efter sammanslagning med `origin/main`**, 2026-11-10 11:18: backend 179 godkända/12 väntande, frontend 14 godkända/4 väntande, 0 misslyckade. Konflikten i `index.html` (platshållaren mot mitt formulär) löstes genom att behålla mitt formulär.

## Vad som inte är kontrollerat
- Alternativ B och C har jag inte byggt eller mätt. Jämförelsen ovan är mina slutsatser från specifikationen och API:t, inte provade resultat.
- Meddelandena i testerna är låtsassvar. Den riktiga serverns formuleringar har jag bara sett i de manuella proven, inte i automatiska tester.
- Beskrivningen med över 5000 tecken har jag inte provat manuellt.
- Jag har inte skrivit egna tester för AK5 och AK8.
- Jag har inte provat i andra webbläsare eller på mobil.
- De manuella proven gjordes före sammanslagningen med `main`. Jag har inte upprepat dem efteråt.
```
