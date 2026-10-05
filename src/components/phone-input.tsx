"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { PHONE_COUNTRY_ROWS } from "@/lib/phone-countries";

type Country = { iso: string; dial: string; name: string; nameVi: string; search: string };

/** Shown first: SPILL's home market, then where guests most often come from. */
const POPULAR = ["VN", "JP", "KR", "CN", "TH", "SG", "AU", "US", "GB", "FR", "DE"];

/** Lowercase, strip accents (Việt Nam → viet nam, Đức → duc). */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

/**
 * Flag image (SVGs from country-flag-icons, MIT — see public/assets/flags/LICENSE.txt).
 * Images, not emoji: Windows doesn't draw flag emoji, it shows "VN" instead.
 */
function Flag({ iso }: { iso: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="phoneFlag" src={`/assets/flags/${iso}.svg`} alt="" width={21} height={14} loading="lazy" decoding="async" />
  );
}

const COUNTRIES: Country[] = PHONE_COUNTRY_ROWS.map(([iso, dial, name, nameVi]) => ({
  iso,
  dial,
  name,
  nameVi,
  search: normalize(`${name} ${nameVi} ${iso} +${dial}`),
}));
const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));
/** Codes shared by several countries — which one people usually mean. */
const MAIN_FOR_CODE: Record<string, string> = { "1": "US", "7": "RU", "44": "GB", "47": "NO", "61": "AU", "262": "RE", "290": "SH", "358": "FI", "590": "GP", "599": "CW", "212": "MA" };

/**
 * Country code picker + number field.
 * Submits two fields: `${name}Country` (ISO, e.g. "VN") and `${name}` (the number as typed).
 */
export function PhoneInput({
  name,
  label,
  defaultCountry = "VN",
  optional = false,
}: {
  name: string;
  label: string;
  defaultCountry?: string;
  optional?: boolean;
}) {
  const [country, setCountry] = useState<Country>(BY_ISO.get(defaultCountry) ?? COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const results = useMemo(() => {
    const q = normalize(query.trim()).replace(/^\+/, "");
    if (!q) {
      const popular = POPULAR.map((iso) => BY_ISO.get(iso)).filter((c): c is Country => Boolean(c));
      return [...popular, ...COUNTRIES.filter((c) => !POPULAR.includes(c.iso))];
    }
    // Typing digits searches by dial code; letters search by name (EN or VI) or ISO code.
    if (/^\d+$/.test(q)) {
      // Shortest code first; among shared codes (+1, +44, +7…) the main country first.
      const rank = (c: Country) => (POPULAR.includes(c.iso) ? POPULAR.indexOf(c.iso) : POPULAR.length);
      return COUNTRIES.filter((c) => c.dial.startsWith(q)).sort(
        (a, b) => a.dial.length - b.dial.length || rank(a) - rank(b) || (MAIN_FOR_CODE[a.dial] === a.iso ? -1 : MAIN_FOR_CODE[b.dial] === b.iso ? 1 : 0),
      );
    }
    const starts = COUNTRIES.filter((c) => normalize(c.name).startsWith(q) || normalize(c.nameVi).startsWith(q));
    const contains = COUNTRIES.filter((c) => !starts.includes(c) && c.search.includes(q));
    return [...starts, ...contains];
  }, [query]);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    searchRef.current?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted row in view while using the arrow keys.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(next: Country) {
    setCountry(next);
    setOpen(false);
    setQuery("");
    setActive(0);
    numberRef.current?.focus();
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const listId = `${id}-countries`;

  return (
    <div className="phoneField" ref={wrapRef}>
      <label htmlFor={`${id}-number`}>
        <span>
          {label} {optional && <small>(optional)</small>}
        </span>
      </label>
      <div className="phoneRow">
        <button
          type="button"
          className="phoneCountry"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${country.name} +${country.dial}. Change`}
          onClick={() => setOpen((v) => !v)}
        >
          <Flag iso={country.iso} />
          <span>+{country.dial}</span>
          <i aria-hidden="true">▾</i>
        </button>
        <input
          ref={numberRef}
          id={`${id}-number`}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={20}
          placeholder={country.iso === "VN" ? "901 234 567" : "Phone number"}
          required={!optional}
        />
        <input type="hidden" name={`${name}Country`} value={country.iso} />
      </div>
      {open && (
        <div className="phonePanel">
          <input
            ref={searchRef}
            className="phoneSearch"
            type="search"
            placeholder="Search country or code"
            aria-label="Search country or code"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${id}-opt-${results[active].iso}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onSearchKey}
          />
          <ul className="phoneList" role="listbox" id={listId} ref={listRef}>
            {results.length === 0 && <li className="phoneEmpty">No country found</li>}
            {results.map((c, index) => (
              <li
                key={c.iso}
                id={`${id}-opt-${c.iso}`}
                role="option"
                data-index={index}
                aria-selected={c.iso === country.iso}
                className={`${index === active ? "active" : ""} ${!query && index === POPULAR.length - 1 ? "divider" : ""}`}
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(c)}
              >
                <Flag iso={c.iso} />
                <span className="phoneName">
                  {c.name}
                  {c.nameVi !== c.name && <small>{c.nameVi}</small>}
                </span>
                <b>+{c.dial}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
