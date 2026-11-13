# Kundserviceportalen NORS

Teamet NORS kundserviceportal. En handläggare registrerar ärenden, ser listan
och detaljerna, ändrar status och söker och filtrerar bland ärendena. Backend i
Python/FastAPI med SQLite, frontend i React/TypeScript.

All projektdokumentation finns i [docs/](docs/README.md).

## Krav

- Git
- Python 3.10 eller senare
- Node.js 20.19+ eller 22.12+
- npm

## Hämta koden

```powershell
git clone https://github.com/Ottowski/nors-kundportal-development.git
cd nors-kundportal-development
```

## Kör API:t

Från projektets rot, sätt upp backendmiljön och starta API:t:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

På macOS och Linux aktiverar du miljön med `source .venv/bin/activate` i
stället för `.\.venv\Scripts\Activate.ps1`.

Den virtuella miljön och beroendena behöver bara skapas första gången.
Senare räcker det att öppna en terminal i projektets rot och köra:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

API:t finns på <http://127.0.0.1:8000>. För att prova det interaktivt, öppna
<http://127.0.0.1:8000/docs>. Fäll ut **POST `/arenden`**, klicka på
**Try it out**, fyll i ett exempel och klicka på **Execute**:

```json
{
  "rubrik": "Problem med inloggning",
  "beskrivning": "Användaren kan inte logga in.",
  "kategori": "Teknik",
  "prioritet": "Medel"
}
```

Svaret ska ha status `201 Created`. API:t sätter id, status och
skapad-tid automatiskt. Använd **GET `/arenden`** för att lista ärenden eller
**GET `/arenden/{arende_id}`** för att hämta ett ärende. Ärendena lagras i en
SQLite-fil (`backend/app/data/nors.db`, eller sökvägen i `NORS_DB_PATH`) och
finns kvar när API-servern startas om.

Stoppa servern genom att gå till terminalen där den körs och trycka **Ctrl+C**.

## Kör frontenden

I en andra terminal, från projektets rot:

```powershell
cd frontend
npm install
npm run dev
```

Öppna den lokala adressen som Vite skriver ut (normalt <http://localhost:5173>).

## Kör testerna

Med backendmiljön aktiverad, från `backend`:

```powershell
python -m pytest
```

Testerna startar en egen API-server mot en temporär databas, så servern behöver
inte vara igång och `nors.db` ändras inte. Vilka tester som finns och vad de
kontrollerar står i [docs/verifieringsplan.md](docs/verifieringsplan.md).

Frontendtesterna går mot påhittad data (MSW-mockar), så backend behöver inte
vara igång. Från `frontend`:

```powershell
npm run test:run
```

Fler kommandon från `frontend`:

| Kommando | Vad det gör |
| --- | --- |
| `npm run dev:mock` | Kör gränssnittet mot påhittad data (MSW-mockar). Ingen backend behövs. |
| `npm test` | Kör testerna och kör om dem när koden ändras (Vitest och Testing Library). |
| `npm run check` | Hela kontrollen: Prettier, ESLint, TypeScript, testerna och bygget. Körs också i GitHub Actions. |
| `npm run format` | Formaterar koden med Prettier. |

### Radslut på Windows

Prettier väntar sig LF-radslut. Därför checkar `.gitattributes` ut alla textfiler
med LF, även på Windows. Klonade du repot innan filen fanns kvar har filerna
CRLF, och då fallerar `npm run check` på Prettier. Kör en gång från `frontend`:

```powershell
npm run format
```

Filerna får då LF. Git ser ingen ändring, eftersom innehållet är detsamma som i
repot.

`.editorconfig` gör att editorn skapar nya filer med LF. JetBrains-IDE:er och
Visual Studio läser den direkt, VS Code behöver tillägget *EditorConfig for VS
Code*. Skapar din editor ändå en fil med CRLF hjälper `npm run format`.

## API-tester (Postman)

Importera `docs/api/kundportal.postman_collection.json` och
`docs/api/kundportal.postman_environment.json` i Postman, eller kör dem från
terminalen. Se [docs/api/README.md](docs/api/README.md).

## Utveckling i teamet

- Lägg API-kod i `backend/app` och UI-kod i `frontend/src`.
- Skapa och aktivera Pythons virtuella miljö innan du installerar
  backendberoenden.
- Committa inte virtuella miljöer, `node_modules` eller lokala `.env`-filer;
  de ignoreras av Git.
- Lägg till beroenden i `backend/requirements.txt` eller
  `frontend/package.json` så att resten av teamet kan installera dem.
