import { useState, type FormEvent } from "react";
import { KATEGORIER, PRIORITETER, STATUSAR } from "../constants/arende";
import type { ArendeFilter } from "../types/arende";

interface Props {
  onChange: (filter: ArendeFilter) => void;
}

const SELECTS = [
  { key: "status", label: "Filtrera status", options: STATUSAR },
  { key: "kategori", label: "Filtrera kategori", options: KATEGORIER },
  { key: "prioritet", label: "Filtrera prioritet", options: PRIORITETER },
] as const;

// Text search applies on Enter or the Sök button; select filters apply at once (SF-R9).
export function SearchFilterBar({ onChange }: Props) {
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<ArendeFilter>({});

  function apply(next: ArendeFilter) {
    setFilter(next);
    onChange(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    apply({ ...filter, q: text });
  }

  return (
    <form className="filters" role="search" onSubmit={handleSubmit}>
      <div className="field filters__search">
        <label htmlFor="search">Sök</label>
        <input
          id="search"
          type="search"
          maxLength={100}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Rubrik eller beskrivning"
        />
      </div>
      <button type="submit" className="button button--secondary">
        Sök
      </button>
      {SELECTS.map(({ key, label, options }) => (
        <div className="field" key={key}>
          <label htmlFor={`filter-${key}`}>{label}</label>
          <select
            id={`filter-${key}`}
            value={filter[key] ?? ""}
            onChange={(e) => apply({ ...filter, [key]: e.target.value || undefined })}
          >
            <option value="">Alla</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}
    </form>
  );
}
