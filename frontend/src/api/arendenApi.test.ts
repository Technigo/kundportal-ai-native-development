import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../mocks/node";
import type { ArendeCreate } from "../types/arende";
import { ApiError, NETWORK_ERROR_MESSAGE, VALIDATION_ERROR_MESSAGE } from "./apiError";
import { API_BASE_URL, createArende, getArende, listArenden, updateStatus } from "./arendenApi";

const valid = { rubrik: "Ny", beskrivning: "Text", kategori: "Teknik", prioritet: "Hög" };

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("Expected promise to reject");
}

describe("arendenApi", () => {
  it("lists all cases", async () => {
    const arenden = await listArenden();
    expect(arenden.map((a) => a.rubrik)).toEqual([
      "Faktura saknas",
      "Kan inte logga in",
      "Fel på faktura",
    ]);
  });

  it("gets one case by id", async () => {
    expect((await getArende(2)).rubrik).toBe("Kan inte logga in");
  });

  it("maps 404 to the backend message (R10)", async () => {
    const error = await catchError(getArende(999));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("Ärendet hittades inte");
  });

  it("creates a case with status Nytt (R1)", async () => {
    const created = await createArende(valid);
    expect(created).toMatchObject({ ...valid, status: "Nytt" });
    expect(created.id).toBe(4);
    expect(created.skapad).toBeTruthy();
  });

  it("maps 422 to field errors (R3)", async () => {
    const error = await catchError(createArende({ ...valid, rubrik: "   " }));
    expect(error.status).toBe(422);
    expect(error.message).toBe(VALIDATION_ERROR_MESSAGE);
    expect(error.fieldErrors).toEqual({ rubrik: "Får inte vara tomt eller bara mellanslag" });
  });

  // backend/app/fel.py already strips the prefix; the client strips it too (apiError.ts).
  it("strips Pydantic's prefix 'Value error, ' from field errors (R12)", async () => {
    server.use(
      http.post(`${API_BASE_URL}/arenden`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                type: "value_error",
                loc: ["body", "rubrik"],
                msg: "Value error, Får inte vara tomt eller bara mellanslag",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );
    const error = await catchError(createArende(valid));
    expect(error.fieldErrors).toEqual({ rubrik: "Får inte vara tomt eller bara mellanslag" });
  });

  it("maps network failure to a Swedish message", async () => {
    server.use(http.get(`${API_BASE_URL}/arenden`, () => HttpResponse.error()));
    const error = await catchError(listArenden());
    expect(error.status).toBe(0);
    expect(error.message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("maps a non-JSON server error to a generic message", async () => {
    server.use(
      http.get(`${API_BASE_URL}/arenden`, () => new HttpResponse("boom", { status: 500 })),
    );
    const error = await catchError(listArenden());
    expect(error.status).toBe(500);
    expect(error.message).toBe("Något gick fel. Försök igen.");
  });

  it("updates status and rejects invalid status (R8, R9)", async () => {
    expect((await updateStatus(1, "Pågående")).status).toBe("Pågående");
    // @ts-expect-error invalid status on purpose
    const error = await catchError(updateStatus(1, "Ogiltig"));
    expect(error.status).toBe(422);
    expect(error.fieldErrors.status).toBe("Ogiltig status");
  });
});

// The mocks answer as decided for the backend in
// docs/agentuppdrag/2026-11-02-backend-status-och-varden.md ("Plan och vårt beslut").
describe("mocks follow the backend decisions", () => {
  it("rejects a category and a priority that are not allowed, with the decided texts", async () => {
    const error = await catchError(
      createArende({ ...valid, kategori: "teknik", prioritet: "hög" }),
    );
    expect(error.status).toBe(422);
    expect(error.fieldErrors).toEqual({
      kategori: "Ogiltig kategori. Välj Fakturering, Teknik, Leverans eller Övrigt.",
      prioritet: "Ogiltig prioritet. Välj Låg, Medel eller Hög.",
    });
  });

  it("reports a missing field as 'Måste fyllas i'", async () => {
    const missing = { ...valid, kategori: undefined } as unknown as ArendeCreate;
    const error = await catchError(createArende(missing));
    expect(error.status).toBe(422);
    expect(error.fieldErrors).toEqual({ kategori: "Måste fyllas i" });
  });

  it("checks the status before the id: 422 before 404", async () => {
    // @ts-expect-error invalid status on purpose
    const invalid = await catchError(updateStatus(999, "Ogiltig"));
    expect(invalid.status).toBe(422);
    expect(invalid.fieldErrors.status).toBe("Ogiltig status");

    const missing = await catchError(updateStatus(999, "Pågående"));
    expect(missing.status).toBe(404);
    expect(missing.message).toBe("Ärendet hittades inte");
  });
});
