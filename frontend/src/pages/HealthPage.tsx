import { useEffect, useState } from "react"

import type { components, operations } from "@/api/schema"
import { Button } from "@/components/ui/button"

// Shown when the browser cannot reach the backend at all (KSP-29 reuses this on the list).
export const BACKEND_UNREACHABLE =
  "Kunde inte nå backenden. Starta den på port 8010 (se README)."

type Health =
  | { state: "loading" }
  | { state: "ok"; database: string }
  | { state: "error"; message: string }

type HealthBody =
  operations["health_health_get"]["responses"][200]["content"]["application/json"]
type ErrorBody = components["schemas"]["ErrorResponse"]

// Fetches /health through the Vite proxy (see vite.config.ts) and maps the response to a state.
async function fetchHealth(): Promise<Health> {
  try {
    const response = await fetch("/api/health")
    if (response.ok) {
      const data = (await response.json()) as HealthBody
      return { state: "ok", database: data.database }
    }
    // On errors the backend always responds with {"detail": "<Swedish message>"}.
    const data = (await response.json()) as ErrorBody
    return { state: "error", message: data.detail }
  } catch {
    return { state: "error", message: BACKEND_UNREACHABLE }
  }
}

export function HealthPage() {
  const [health, setHealth] = useState<Health>({ state: "loading" })

  useEffect(() => {
    let active = true
    void fetchHealth().then((result) => {
      if (active) setHealth(result)
    })
    return () => {
      active = false
    }
  }, [])

  function checkAgain() {
    setHealth({ state: "loading" })
    void fetchHealth().then(setHealth)
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Kundserviceportalen</h1>
          <p className="text-muted-foreground">
            Fullstackgrunden: gränssnitt, backend och databas.
          </p>
        </div>
        <div role="status" aria-live="polite">
          {health.state === "loading" && <p>Kontrollerar backenden …</p>}
          {health.state === "ok" && (
            <p>
              Backenden svarar. Databasen:{" "}
              {health.database === "ok" ? "ansluten" : health.database}.
            </p>
          )}
          {health.state === "error" && (
            <p className="text-destructive">{health.message}</p>
          )}
        </div>
        <Button
          className="self-start"
          onClick={checkAgain}
          disabled={health.state === "loading"}
        >
          Kontrollera igen
        </Button>
      </div>
    </div>
  )
}
