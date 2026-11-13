// Tre sorters fel som handlers får kasta. app.js översätter dem till HTTP-svar.

/** Ogiltig inmatning → HTTP 400. `faltfel` = { fältnamn: "meddelande" }. */
export class ValidationError extends Error {
  constructor(faltfel, message = 'Ärendet kunde inte sparas. Rätta de markerade fälten.') {
    super(message);
    this.name = 'ValidationError';
    this.faltfel = faltfel;
  }
}

/** Ärendet finns inte → HTTP 404. */
export class NotFoundError extends Error {
  constructor(message = 'Ärendet hittades inte.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Skelettets platshållare → HTTP 501. Ta bort anropet när ni bygger funktionen. */
export class NotImplementedError extends Error {
  constructor(what) {
    super(`Inte byggt ännu: ${what}`);
    this.name = 'NotImplementedError';
  }
}

export function notImplemented(what) {
  throw new NotImplementedError(what);
}
