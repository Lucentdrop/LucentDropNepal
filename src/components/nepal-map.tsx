"use client";

import { useState } from "react";
import provinces from "@/data/nepal-map.json";

export function NepalMap() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const active = hovered ?? focused ?? selected;
  const toggle = (id: number) =>
    setSelected((current) => (current === id ? null : id));
  const layers = [...provinces].sort(
    (a, b) => Number(a.id === active) - Number(b.id === active),
  );

  return (
    <div className="interactive-nepal-map">
      <svg
        viewBox="0 0 900 420"
        role="group"
        aria-labelledby="nepal-map-title nepal-map-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") setSelected(null);
        }}
      >
        <title id="nepal-map-title">Nepal’s seven provinces</title>
        <desc id="nepal-map-description">
          Hover or focus a province to lift it. Click, tap, Enter or Space to
          toggle selection. Escape clears selection. Service availability
          requires confirmation.
        </desc>
        {/* Stationary silhouettes and hit areas keep hover stable while visuals lift. */}
        <g aria-hidden="true" className="province-foundations">
          {provinces.map((p) => (
            <path key={p.id} d={p.path} fill="#acd0e6" />
          ))}
        </g>
        <g aria-hidden="true" className="province-visuals">
          {layers.map((p) => (
            <g
              key={p.id}
              className={`province-surface ${p.id === active || p.id === selected ? "is-lifted" : ""}`}
            >
              <path d={p.path} fill={p.fill} />
              <text x={p.x} y={p.y}>
                {p.name}
              </text>
            </g>
          ))}
        </g>
        <g>
          {provinces.map((p) => (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} province`}
              aria-pressed={selected === p.id}
              className="province-hit"
              onPointerEnter={(e) => {
                if (e.pointerType !== "touch") setHovered(p.id);
              }}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setFocused(p.id)}
              onBlur={() => setFocused(null)}
              onClick={() => toggle(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(p.id);
                }
              }}
            >
              <path d={p.path} fill="transparent" />
            </g>
          ))}
        </g>
      </svg>
      <p className="map-interaction-hint" aria-live="polite">
        {selected
          ? `${provinces.find((p) => p.id === selected)?.name} selected · Click again or press Escape to clear`
          : "Hover to lift · Click or tap to select a province"}
      </p>
    </div>
  );
}
