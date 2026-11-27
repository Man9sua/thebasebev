"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { fold, type PlaceOption } from "@/data/places";
import styles from "./Autocomplete.module.css";

const LIMIT = 8;

export function Autocomplete({
  className,
  label,
  name,
  value,
  onChange,
  options,
  initial = [],
  required,
  placeholder,
}: {
  className?: string;
  label: ReactNode;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly PlaceOption[];
  initial?: readonly PlaceOption[];
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = fold(value);
  const matches = useMemo(() => suggest(query, options, initial), [query, options, initial]);
  const shown = matches.length === 1 && fold(matches[0].value) === query ? [] : matches;
  const expanded = open && shown.length > 0;

  useEffect(() => {
    if (expanded) listRef.current?.scrollIntoView({ block: "nearest" });
  }, [expanded]);

  useEffect(() => {
    if (active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (option: PlaceOption) => {
    onChange(option.value);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!expanded) {
        setOpen(true);
        setActive(event.key === "ArrowDown" ? 0 : shown.length - 1);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + shown.length) % shown.length);
    } else if (event.key === "Enter" && expanded && active >= 0) {
      event.preventDefault();
      choose(shown[active]);
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !expanded) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      setActive(-1);
    };
    input.addEventListener("keydown", onEscape);
    return () => input.removeEventListener("keydown", onEscape);
  }, [expanded]);

  return (
    <div className={`${className ?? ""} ${styles.box}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        name={name}
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        required={required}
        data-tilda-req={required ? "1" : undefined}
        onChange={(event) => {
          onChange(event.currentTarget.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
      />
      <ul ref={listRef} id={listId} role="listbox" className={styles.list} hidden={!expanded}>
        {expanded &&
          shown.map((option, index) => (
            <li
              key={`${option.value}-${option.hint ?? ""}`}
              id={`${id}-${index}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? styles.optionActive : styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option)}
            >
              <Highlight text={option.value} query={query} />
              {option.hint && <span className={styles.hint}>{option.hint}</span>}
            </li>
          ))}
      </ul>
    </div>
  );
}

function suggest(query: string, options: readonly PlaceOption[], initial: readonly PlaceOption[]) {
  if (!query) return initial.slice(0, LIMIT);
  const ranked: { option: PlaceOption; rank: number }[] = [];
  for (const option of options) {
    const name = fold(option.value);
    const rank = option.hint
      ? fold(option.hint).startsWith(query) ? 0 : -1
      : name.startsWith(query) ? 0 : name.includes(` ${query}`) || name.includes(`-${query}`) ? 1 : name.includes(query) ? 2 : -1;
    if (rank >= 0) ranked.push({ option, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank);
  const seen = new Set<string>();
  const result: PlaceOption[] = [];
  for (const { option } of ranked) {
    if (seen.has(option.value)) continue;
    seen.add(option.value);
    result.push(option);
    if (result.length === LIMIT) break;
  }
  return result;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = fold(text).indexOf(query);
  if (!query || at < 0 || fold(text).length !== text.length) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, at)}
      <strong>{text.slice(at, at + query.length)}</strong>
      {text.slice(at + query.length)}
    </span>
  );
}
