"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { getAnalytics } from "@/lib/api/analytics.service";
import { useAuth } from "@/components/providers";
import { DashboardHeading } from "./dashboard-shell";
import { Chart } from "@/components/charts/chart";
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
  const options = useMemo(() => {
    const d = query.data;
    const axis = {
      axisLine: { lineStyle: { color: "#d9e6ef" } },
      axisTick: { show: false },
      axisLabel: { color: "#71849a", fontSize: 10 },
      splitLine: { lineStyle: { color: "#edf3f8" } },
    };
    const base = {
      color: ["#0067c5", "#00a9c7", "#5eaee2", "#b8ddf5"],
      grid: { left: 43, right: 16, top: 25, bottom: 35 },
      tooltip: { trigger: "axis" as const },
      xAxis: {
        type: "category" as const,
        data: d?.months ?? [],
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
            data: d?.production ?? [],
            smooth: true,
            symbolSize: 6,
            areaStyle: { color: "#e9f4ff" },
            lineStyle: { width: 3 },
          },
        ],
      },
      installations: {
        ...base,
        xAxis: {
          type: "category",
          data: d?.regions ?? [],
          ...axis,
          axisLabel: { color: "#71849a", fontSize: 9, rotate: 25 },
        },
        series: [
          {
            name: "Illustrative installations",
            type: "bar",
            data: d?.installations ?? [],
            barMaxWidth: 28,
            itemStyle: { borderRadius: [4, 4, 0, 0] },
          },
        ],
      },
      categories: {
        color: base.color,
        tooltip: { trigger: "item" },
        legend: { bottom: 0, textStyle: { fontSize: 10, color: "#526b81" } },
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
            data: d?.performance[metric] ?? [],
            smooth: true,
            lineStyle: { width: 3 },
            itemStyle: { color: "#009dbb" },
          },
        ],
      },
    } as Record<string, EChartsOption>;
  }, [query.data, metric]);
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
      <div className="notice warning">
        Local mock data only. These charts do not report actual plant
        performance and must not be used for water safety or operational
        decisions.
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
          description="Illustrative distribution across Nepal's provinces"
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
              {query.data?.months.map((m, i) => (
                <tr key={m}>
                  <th scope="row">{m}</th>
                  <td>{query.data?.production[i]}</td>
                  <td>{query.data?.performance.tds[i]}</td>
                  <td>{query.data?.performance.turbidity[i]}</td>
                  <td>{query.data?.performance.ph[i]}</td>
                  <td>{query.data?.performance.flow[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
