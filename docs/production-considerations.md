# Vad vi skulle göra annorlunda i ett riktigt projekt

Här samlar vi förenklingar i kursprojektet och vad vi skulle ändra i en produktionslösning. Punkterna är förslag, inte genomförda ändringar eller krav för nuvarande MVP.

## Gemensam hantering av ärendedata

**Nuvarande lösning:** [handleCreated i App.tsx](../packages/web/src/App.tsx#L28) sparar det skapade ärendet i komponentens lokala state och ökar räknaren `listRefresh`. Räknaren skickas till ärendelistan för att utlösa en ny hämtning.

**I ett riktigt projekt:** Vi skulle ersätta den manuella synkroniseringen via callback och uppdateringsräknare med gemensam state-/server-state-hantering för ärenden. När ett ärende skapas skulle den gemensamma cachen uppdateras eller markeras som inaktuell så att berörda vyer får aktuell data.

**Varför:** Det minskar kopplingen mellan formuläret och listan och gör det enklare att hålla flera vyer synkroniserade när projektet växer. Lokal komponentstate skulle fortfarande användas för lokala UI-behov.
