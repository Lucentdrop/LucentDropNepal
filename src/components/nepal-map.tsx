"use client";

import { useRef, useState } from "react";
import provinces from "@/data/nepal-map.json";
import { provinceActivity } from "@/data/province-activity";
import { X, Pin, BarChart3 } from "lucide-react";

export function NepalMap({
  attribution,
  children,
}: {
  attribution: React.ReactNode;
  children: React.ReactNode;
}) {
  const mapRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastProvince, setLastProvince] = useState(3);
  const active = hovered ?? focused ?? selected;
  const displayed = selected ?? hovered ?? focused;
  const visible = displayed !== null;
  const displayedId = displayed ?? lastProvince;
  const province = provinces.find((p) => p.id === displayedId)!;
  const data = provinceActivity.find((p) => p.id === displayedId)!;
  const choose = (id: number) => {
    setLastProvince(id);
    setSelected(id);
    if (window.matchMedia("(max-width: 900px)").matches)
      mapRef.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  };
  const close = () => {
    if (displayed !== null) setLastProvince(displayed);
    setSelected(null);
    setHovered(null);
    setFocused(null);
    mapRef.current?.focus({ preventScroll: true });
  };
  const format = (value: number) =>
    new Intl.NumberFormat("en-NP").format(value);
  const rows = [
    ["Projects completed", format(data.projects)],
    ["Water ATMs installed", format(data.waterAtms)],
    ["Satisfaction rate", `${data.satisfaction}%`],
    ["Projects in progress", format(data.activeProjects)],
    ["Service partners", format(data.servicePartners)],
    ["Water dispensed / month", `${format(data.monthlyLitres / 1000)} kL`],
  ];
  const layers = [...provinces].sort(
    (a, b) => Number(a.id === active) - Number(b.id === active),
  );

  return (
    <div
      className="coverage-grid province-coverage"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
    >
      <div className="nepal-map">
        <div className="interactive-nepal-map">
          <svg
            ref={mapRef}
            tabIndex={-1}
            viewBox="0 0 900 420"
            role="group"
            aria-labelledby="nepal-map-title nepal-map-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
            }}
          >
            <title id="nepal-map-title">Nepal’s seven provinces</title>
            <desc id="nepal-map-description">
              Hover or focus a province to lift it. Click, tap, Enter or Space
              to pin province demo statistics beside the map. Escape closes the
              panel. Service availability requires confirmation.
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
                  aria-controls="province-statistics"
                  className="province-hit"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "touch") {
                      setLastProvince(p.id);
                      setHovered(p.id);
                    }
                  }}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => {
                    setLastProvince(p.id);
                    setFocused(p.id);
                  }}
                  onBlur={() => setFocused(null)}
                  onClick={() => choose(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      choose(p.id);
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
              ? `${provinces.find((p) => p.id === selected)?.name} pinned · Click another province to compare`
              : "Hover for demo statistics · Click or tap to keep them open"}
          </p>
        </div>
        {attribution}
      </div>
      <div className="coverage-side">
        <div className="province-activity-space">
          <div className="province-activity-placeholder" aria-hidden={visible}>
            <span className="province-popup-icon">
              <BarChart3 size={22} />
            </span>
            <span className="eyebrow">Province activity</span>
            <h3>Explore the map</h3>
            <p>
              Hover over a province for a quick preview, or click to keep its
              demo statistics open.
            </p>
            <small>Separate illustrative data for all seven provinces.</small>
          </div>
          <div
            className={`province-popup-slot ${visible ? "is-open" : ""}`}
            aria-hidden={!visible}
            inert={!visible}
          >
            <div className="province-popup-clip">
              <section
                id="province-statistics"
                className="province-popup"
                role="region"
                aria-labelledby="province-statistics-title"
              >
                <div className="province-popup-header">
                  <span className="province-popup-icon">
                    <BarChart3 size={19} />
                  </span>
                  <div>
                    <span className="province-demo-label">
                      Demo province activity
                    </span>
                    <h3 id="province-statistics-title">{province.name}</h3>
                  </div>
                  {selected && (
                    <span className="province-pinned">
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                  <button
                    type="button"
                    className="province-popup-close"
                    aria-label="Close province statistics"
                    onClick={close}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div key={displayedId} className="province-popup-data">
                  <table>
                    <caption className="sr-only">
                      {province.name} illustrative activity statistics
                    </caption>
                    <tbody>
                      {rows.map(([label, value]) => (
                        <tr key={label}>
                          <th scope="row">{label}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="province-popup-note">
                  Illustrative figures only · Not actual Lucent results or
                  verified Water ATM locations.
                </p>
              </section>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
