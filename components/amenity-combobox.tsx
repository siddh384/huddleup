"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, Check } from "lucide-react";
import { cx } from "@/utils/cx";

interface AmenityComboboxProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  options: readonly string[];
  placeholder?: string;
}

export function AmenityCombobox({
  selected,
  onChange,
  options,
  placeholder = "Select amenities...",
}: AmenityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open) {
      // Small delay so the DOM renders before focus
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [open]);

  // Close on outside click
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, handleOutsideClick]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (amenity: string) => {
    if (selected.includes(amenity)) {
      onChange(selected.filter((s) => s !== amenity));
    } else {
      onChange([...selected, amenity]);
    }
  };

  const remove = (amenity: string) => {
    onChange(selected.filter((s) => s !== amenity));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {/* {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-accent-400/10 px-2.5 py-1 text-caption-1-medium text-accent-600"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="inline-flex items-center justify-center text-accent-600/60 transition-colors hover:text-accent-600"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )} */}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cx(
          "flex h-10 w-full items-center justify-between rounded-2lg border px-3 text-left transition-colors",
          open
            ? "border-border-button-active"
            : "border-border-button-default hover:border-border-button-hover",
          "bg-background-primary-default shadow-xs",
        )}
      >
        <span
          className={cx(
            "truncate text-body-regular",
            selected.length > 0 ? "text-text-primary" : "text-text-tertiary",
          )}
        >
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={cx(
            "size-4 shrink-0 text-text-secondary transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <path
            d="M4 7L7.29289 10.2929C7.68342 10.6834 8.31658 10.6834 8.70711 10.2929L12 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default shadow-dropdown">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <Search className="size-4 shrink-0 text-text-tertiary" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search amenities..."
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-body-regular text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length > 0 ? (
              filtered.map((amenity) => {
                const isSelected = selected.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggle(amenity)}
                    className={cx(
                      "flex w-full items-center gap-2.5 rounded-2lg px-2.5 py-2 text-left text-body-regular transition-colors",
                      isSelected
                        ? "bg-accent-400/10 text-accent-600"
                        : "text-text-primary hover:bg-dropdown-item-hover-background",
                    )}
                  >
                    <span
                      className={cx(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        isSelected
                          ? "border-accent-600 bg-accent-600 text-white"
                          : "border-border-checkbox-default bg-background-primary-default",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-2.5 py-4 text-center text-body-2-regular text-text-tertiary">
                No amenities found
              </p>
            )}
          </div>
        </div>
      )}
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-accent-400/10 px-2.5 py-1 text-caption-1-medium text-accent-600"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="inline-flex items-center justify-center text-accent-600/60 transition-colors hover:text-accent-600"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}