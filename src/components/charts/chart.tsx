"use client";
import { useEffect, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { Button } from "@/components/ui/button";
export function Chart({
  title,
  description,
  option,
  loading = false,
  error = false,
  empty = false,
  retry,
  children,
}: {
  title: string;
  description: string;
  option: EChartsOption;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  retry?: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);
  useEffect(() => {
    if (loading || error || empty || !ref.current) return;
    let active = true;
    let chart: import("echarts").ECharts | undefined;
    const observer = new ResizeObserver(() => chart?.resize());
    observer.observe(ref.current);
    (async () => {
      const echarts = await import("echarts");
      if (!active || !ref.current) return;
      chart = echarts.init(ref.current, undefined, { renderer: "canvas" });
      chart.setOption({
        ...option,
        aria: { enabled: true },
        textStyle: { fontFamily: "Inter, Arial" },
        animation: false,
      });
    })().catch(() => {
      if (active) setRenderError(true);
    });
    return () => {
      active = false;
      observer.disconnect();
      chart?.dispose();
    };
  }, [option, loading, error, empty]);
  return (
    <section className="chart-card">
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
      {loading ? (
        <div key="loading" className="chart-state skeleton" role="status">
          Loading chart…
        </div>
      ) : error || renderError ? (
        <div key="error" className="chart-state" role="alert">
          Unable to load chart
          {retry && (
            <Button size="sm" variant="outline" onClick={retry}>
              Try again
            </Button>
          )}
        </div>
      ) : empty ? (
        <div key="empty" className="chart-state">
          No data available for this period.
        </div>
      ) : (
        <div
          key="canvas"
          ref={ref}
          className="chart-canvas"
          role="img"
          aria-label={title + " — " + description}
        />
      )}
    </section>
  );
}
