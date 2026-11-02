# Vad vi skulle göra annorlunda i ett riktigt projekt

Här samlar vi förenklingar i kursprojektet och vad vi skulle ändra i en produktionslösning. Punkterna är förslag, inte genomförda ändringar eller krav för nuvarande MVP.

## Gemensam hantering av ärendedata

**Nuvarande lösning:** [handleCreated i App.tsx](../packages/web/src/App.tsx#L28) sparar det skapade ärendet i komponentens lokala state och ökar räknaren `listRefresh`. Räknaren skickas till ärendelistan för att utlösa en ny hämtning.

**I ett riktigt projekt:** Vi skulle ersätta den manuella synkroniseringen via callback och uppdateringsräknare med gemensam state-/server-state-hantering för ärenden. När ett ärende skapas skulle den gemensamma cachen uppdateras eller markeras som inaktuell så att berörda vyer får aktuell data.

**Varför:** Det minskar kopplingen mellan formuläret och listan och gör det enklare att hålla flera vyer synkroniserade när projektet växer. Lokal komponentstate skulle fortfarande användas för lokala UI-behov.

## Tydligare och mer vägledande felmeddelanden

**Nuvarande lösning:** [CaseDetail](../packages/web/src/CaseDetail.tsx) skiljer på saknat ärende och övriga hämtningsfel. Nätverksfel, serverfel och ogiltiga API-svar visas däremot med samma generella felmeddelande.

**I ett riktigt projekt:** Vi skulle ge mer specifika felmeddelanden utifrån vad vi säkert kan avgöra, exempelvis att anslutningen misslyckades, att tjänsten har ett tillfälligt problem eller att svaret inte kunde läsas. Meddelandet skulle också ge ett relevant nästa steg, som att kontrollera anslutningen, försöka igen eller kontakta support med ett fel-ID. Tekniska detaljer skulle loggas för felsökning utan att exponeras för användaren.

**Varför:** Användaren får lättare att förstå vad som hänt och hur arbetet kan fortsätta, samtidigt som support och utvecklare får bättre underlag för felsökning.
