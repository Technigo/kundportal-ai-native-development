import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../api/arendenApi";
import { KATEGORIER, PRIORITETER, STATUSAR } from "../constants/arende";
import type { Arende, ArendeCreate, ArendeStatus } from "../types/arende";
import { seedArenden } from "./data";

// In-memory store that mirrors backend/app/repositories/arende_repository.py.
export const db = {
  arenden: seedArenden(),
  reset(arenden: Arende[] = seedArenden()) {
    this.arenden = arenden;
  },
};

const NOT_FOUND = { detail: "Ärendet hittades inte" };

// Rules and texts decided for the backend in
// docs/agentuppdrag/2026-11-02-backend-status-och-varden.md ("Plan och vårt beslut").
const MESSAGES = {
  missing: "Måste fyllas i",
  invalid: "Ogiltigt värde",
  empty: "Får inte vara tomt eller bara mellanslag",
  kategori: "Ogiltig kategori. Välj Fakturering, Teknik, Leverans eller Övrigt.",
  prioritet: "Ogiltig prioritet. Välj Låg, Medel eller Hög.",
  status: "Ogiltig status",
} as const;

interface FieldError {
  type: string;
  loc: string[];
  msg: string;
}

function fieldError(field: string, type: string, msg: string): FieldError {
  return { type, loc: ["body", field], msg };
}

function validationError(errors: FieldError[]) {
  return HttpResponse.json({ detail: errors }, { status: 422 });
}

function asObject(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
}

// Like FastAPI, every invalid field is reported at once, in field order.
function validateCreate(input: unknown): ArendeCreate | Response {
  const body = asObject(input);
  const errors: FieldError[] = [];

  for (const field of ["rubrik", "beskrivning"] as const) {
    const value = body[field];
    if (!(field in body)) {
      errors.push(fieldError(field, "missing", MESSAGES.missing));
    } else if (typeof value !== "string") {
      errors.push(fieldError(field, "string_type", MESSAGES.invalid));
    } else if (!value.trim()) {
      errors.push(fieldError(field, "value_error", MESSAGES.empty));
    }
  }

  // Any value outside the list is rejected with the field's own text, also null and numbers.
  const allowed = { kategori: KATEGORIER, prioritet: PRIORITETER };
  for (const field of ["kategori", "prioritet"] as const) {
    if (!(field in body)) {
      errors.push(fieldError(field, "missing", MESSAGES.missing));
    } else if (!allowed[field].includes(body[field] as string)) {
      errors.push(fieldError(field, "value_error", MESSAGES[field]));
    }
  }

  if (errors.length > 0) {
    return validationError(errors);
  }
  const values = body as unknown as ArendeCreate;
  return {
    rubrik: values.rubrik.trim(),
    beskrivning: values.beskrivning.trim(),
    kategori: values.kategori,
    prioritet: values.prioritet,
  };
}

export const handlers = [
  http.get(`${API_BASE_URL}/arenden`, () => HttpResponse.json(db.arenden)),

  http.get(`${API_BASE_URL}/arenden/:id`, ({ params }) => {
    const arende = db.arenden.find((a) => a.id === Number(params.id));
    return arende ? HttpResponse.json(arende) : HttpResponse.json(NOT_FOUND, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/arenden`, async ({ request }) => {
    const result = validateCreate(await request.json());
    if (result instanceof Response) {
      return result;
    }
    const arende: Arende = {
      id: Math.max(0, ...db.arenden.map((a) => a.id)) + 1,
      ...result,
      status: "Nytt",
      skapad: new Date().toISOString(),
    };
    db.arenden.push(arende);
    return HttpResponse.json(arende, { status: 201 });
  }),

  // Mirrors POST /arenden/:id/status in the backend.
  // Like FastAPI, the body is checked before the id, so an invalid status gives 422, not 404.
  http.post(`${API_BASE_URL}/arenden/:id/status`, async ({ params, request }) => {
    const body = asObject(await request.json());
    if (!("status" in body)) {
      return validationError([fieldError("status", "missing", MESSAGES.missing)]);
    }
    const status = body.status as ArendeStatus;
    if (!STATUSAR.includes(status)) {
      return validationError([fieldError("status", "value_error", MESSAGES.status)]);
    }
    const index = db.arenden.findIndex((a) => a.id === Number(params.id));
    if (index === -1) {
      return HttpResponse.json(NOT_FOUND, { status: 404 });
    }
    const updated = { ...db.arenden[index], status };
    db.arenden[index] = updated;
    return HttpResponse.json(updated);
  }),
];
