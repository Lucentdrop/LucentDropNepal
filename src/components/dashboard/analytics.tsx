"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { getAnalytics } from "@/lib/api/analytics.service";
import { useAuth } from "@/components/providers";
import { DashboardHeading } from "./dashboard-shell";
import { Chart } from "@/components/charts/chart";
import Link from "next/link";
export function Analytics() {
  const { member } = useAuth();
  const query = useQuery({
    queryKey: ["analytics", member?.id],
    queryFn: getAnalytics,
    enabled: !!member,
  });
  const [metric, setMetric] = useState<"tds" | "turbidity" | "ph" | "flow">(
    "tds",
  );
  const [period, setPeriod] = useState(36);
  const start = Math.max(0, (query.data?.months.length ?? 0) - period);
  const options = useMemo(() => {
    const d = query.data;
    const axis = {
      axisLine: { lineStyle: { color: "#d9e6ef" } },
      axisTick: { show: false },
      axisLabel: { color: "#71849a", fontSize: 10 },
      splitLine: { lineStyle: { color: "#edf3f8" } },
    };
    const base = {
      color: [
        "#0067c5",
        "#00a9c7",
        "#5eaee2",
        "#7c67c8",
        "#279d7d",
        "#d59329",
        "#cf6487",
        "#71849a",
      ],
      grid: { left: 43, right: 16, top: 25, bottom: 35 },
      tooltip: { trigger: "axis" as const },
      xAxis: {
        type: "category" as const,
        data: d?.months.slice(start) ?? [],
        boundaryGap: false,
        ...axis,
      },
      yAxis: { type: "value" as const, ...axis },
    };
    return {
      production: {
        ...base,
        series: [
          {
            name: "Water production (kL)",
            type: "line",
            data: d?.production.slice(start) ?? [],
            smooth: true,
            symbolSize: 6,
            areaStyle: { color: "#e9f4ff" },
            lineStyle: { width: 3 },
          },
        ],
      },
      installations: {
        ...base,
        grid: { left: 43, right: 16, top: 40, bottom: 58 },
        legend: { top: 0, type: "scroll", textStyle: { fontSize: 10 } },
        xAxis: {
          type: "category",
          data: d?.regions ?? [],
          ...axis,
          axisLabel: { color: "#71849a", fontSize: 9, rotate: 25 },
        },
        series: (
          d?.installationTypes ?? [
            {
              name: "Illustrative installations",
              values: d?.installations ?? [],
            },
          ]
        ).map((series) => ({
          name: series.name,
          type: "bar",
          stack: "installations",
          data: series.values,
          barMaxWidth: 28,
        })),
      },
      categories: {
        color: base.color,
        tooltip: { trigger: "item" },
        legend: {
          bottom: 0,
          type: "scroll",
          textStyle: { fontSize: 10, color: "#526b81" },
        },
        series: [
          {
            name: "Product mix (%)",
            type: "pie",
            radius: ["43%", "68%"],
            center: ["50%", "43%"],
            label: { show: false },
            data: d?.categories ?? [],
          },
        ],
      },
      performance: {
        ...base,
        yAxis: {
          ...base.yAxis,
          name:
            metric === "tds"
              ? "mg/L"
              : metric === "turbidity"
                ? "NTU"
                : metric === "ph"
                  ? "pH"
                  : "L/min",
          nameTextStyle: { color: "#71849a", fontSize: 10 },
        },
        series: [
          {
            name: metric.toUpperCase(),
            type: "line",
            data: d?.performance[metric].slice(start) ?? [],
            smooth: true,
            lineStyle: { width: 3 },
            itemStyle: { color: "#009dbb" },
          },
        ],
      },
    } as Record<string, EChartsOption>;
  }, [query.data, metric, start]);
  const state = {
    loading: query.isPending,
    error: query.isError,
    retry: () => query.refetch(),
    empty:
      !query.isPending && !query.isError && query.data?.months.length === 0,
  };
  return (
    <>
      <DashboardHeading
        title="Water Analytics"
        description="Explore illustrative trends and treatment performance."
      />
      <p className="insight-note">
        <Link className="text-link analytics-insights-link" href="/insights">
          Explore public Nepal water insights, the demand planner and the full
          Lucent business demo →
        </Link>
      </p>
      <div className="notice warning">
        {process.env.NEXT_PUBLIC_API_PROVIDER === "external"
          ? "Data supplied by the configured analytics provider."
          : "Local mock data only. These charts do not report actual plant performance."}{" "}
        These figures must not be used for water safety or operational
        decisions.
      </div>
      <div className="dashboard-panel mt-6 mb-6">
        <label htmlFor="analytics-period">Trend history </label>
        <select
          id="analytics-period"
          value={period}
          onChange={(event) => setPeriod(Number(event.target.value))}
          className="chip"
        >
          <option value={12}>Last 12 months</option>
          <option value={24}>Last 24 months</option>
          <option value={36}>Last 36 months</option>
          <option value={10000}>All available history</option>
        </select>
        <p className="mt-3 text-sm text-slate-600">
          {query.data?.months[start]} – {query.data?.months.at(-1)} ·{" "}
          {query.data?.months.slice(start).length ?? 0} monthly readings per
          metric. Province totals and product mix show the complete dataset; the
          time range applies to production and performance.
        </p>
      </div>
      <div className="charts-grid">
        <Chart
          title="Water Production Trend"
          description="Illustrative monthly production in kilolitres (kL)"
          option={options.production}
          {...state}
        />
        <Chart
          title="Installations by Region"
          description="Demo installations across all seven provinces, split by system type"
          option={options.installations}
          {...state}
        />
        <Chart
          title="Product Category Distribution"
          description="Illustrative product mix by category (%)"
          option={options.categories}
          {...state}
        />
        <Chart
          title="Treatment Performance"
          description="Select a water-quality or flow metric"
          option={options.performance}
          {...state}
        >
          <div className="metric-chips">
            {(["tds", "turbidity", "ph", "flow"] as const).map((m) => (
              <button
                className={`chip ${metric === m ? "active" : ""}`}
                aria-pressed={metric === m}
                onClick={() => setMetric(m)}
                key={m}
              >
                {m === "tds"
                  ? "TDS"
                  : m === "ph"
                    ? "pH"
                    : m === "flow"
                      ? "Flow Rate"
                      : "Turbidity"}
              </button>
            ))}
          </div>
        </Chart>
      </div>
      <details className="dashboard-panel mt-6">
        <summary className="text-link">View accessible chart data</summary>
        <div className="overflow-x-auto mt-4">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Production (kL)</th>
                <th>TDS (mg/L)</th>
                <th>Turbidity (NTU)</th>
                <th>pH</th>
                <th>Flow (L/min)</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.months.slice(start).map((m, offset) => {
                const i = start + offset;
                return (
                  <tr key={m}>
                    <th scope="row">{m}</th>
                    <td>{query.data?.production[i]}</td>
                    <td>{query.data?.performance.tds[i]}</td>
                    <td>{query.data?.performance.turbidity[i]}</td>
                    <td>{query.data?.performance.ph[i]}</td>
                    <td>{query.data?.performance.flow[i]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto mt-6">
          <table className="spec-table">
            <caption>Installations by province — complete dataset</caption>
            <thead>
              <tr>
                <th>Province</th>
                {query.data?.installationTypes?.map((type) => (
                  <th key={type.name}>{type.name}</th>
                ))}
                <th>Total installations</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.regions.map((region, i) => (
                <tr key={region}>
                  <th scope="row">{region}</th>
                  {query.data?.installationTypes?.map((type) => (
                    <td key={type.name}>{type.values[i]}</td>
                  ))}
                  <td>{query.data?.installations[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto mt-6">
          <table className="spec-table">
            <caption>Product category distribution — complete dataset</caption>
            <thead>
              <tr>
                <th>Product category</th>
                <th>Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.categories.map((category) => (
                <tr key={category.name}>
                  <th scope="row">{category.name}</th>
                  <td>{category.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
