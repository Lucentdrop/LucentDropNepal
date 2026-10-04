"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { Chart } from "@/components/charts/chart";
import nepal from "@/data/insights/nepal.json";
import type businessData from "../../../public/data/lucent-demo-summary.json";
import manifest from "@/data/insights/manifest.json";
import { matchesPeriod, planWater, sum } from "@/lib/insights";

const colours = [
  "#0067c5",
  "#009dbb",
  "#41b89b",
  "#785ec9",
  "#f0a34d",
  "#d06b85",
  "#667ea0",
  "#93bac9",
  "#af9373",
];
const number = (n: number) =>
  new Intl.NumberFormat("en-NP", { maximumFractionDigits: 1 }).format(n);
const money = (n: number) => `NPR ${number(n / 1000000)}m`;
const censusUrl =
  "https://censusresults.nsonepal.gov.np/downloads/census-dataset";
const reportUrl =
  "https://giwmscdnone.gov.np/media/app/public/36/posts/1710821571_6.pdf";
const surveyUrl =
  "https://www.unicef.org/nepal/reports/multiple-indicator-cluster-survey-2024-25";
type Series = { name: string; values: number[] };

function bars(
  labels: string[],
  series: Series[],
  unit = "",
  stacked = false,
  horizontal = false,
): EChartsOption {
  const crowded = labels.length > 12;
  return {
    color: colours,
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => `${number(Number(v))}${unit}`,
    },
    legend: { type: "scroll", bottom: 0, textStyle: { fontSize: 10 } },
    grid: {
      top: 18,
      left: horizontal ? 105 : 58,
      right: crowded ? 38 : 18,
      bottom: horizontal ? 55 : 82,
    },
    xAxis: horizontal
      ? { type: "value", name: unit }
      : {
          type: "category",
          data: labels,
          axisLabel: { rotate: labels.length > 4 ? 25 : 0, fontSize: 10 },
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: labels,
          inverse: true,
          axisLabel: { fontSize: 10 },
        }
      : { type: "value", name: unit },
    dataZoom: crowded
      ? [
          {
            type: "slider",
            orient: horizontal ? "vertical" : "horizontal",
            start: 0,
            end: Math.min(100, (12 / labels.length) * 100),
            right: horizontal ? 0 : undefined,
            bottom: horizontal ? undefined : 30,
          },
        ]
      : undefined,
    series: series.map((s) => ({
      name: s.name,
      type: "bar",
      stack: stacked ? "total" : undefined,
      data: s.values,
      barMaxWidth: 36,
    })),
  };
}
function lines(
  labels: string[],
  series: Series[],
  unit: string,
): EChartsOption {
  return {
    ...bars(labels, series, unit),
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { fontSize: 10 },
      boundaryGap: false,
    },
    series: series.map((s) => ({
      name: s.name,
      type: "line",
      data: s.values,
      smooth: false,
      showSymbol: labels.length < 15,
    })),
  };
}
function pie(labels: string[], values: number[]): EChartsOption {
  return {
    color: colours,
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { type: "scroll", bottom: 0, textStyle: { fontSize: 10 } },
    series: [
      {
        type: "pie",
        radius: ["38%", "67%"],
        center: ["50%", "43%"],
        label: { show: false },
        data: labels.map((name, i) => ({ name, value: values[i] })),
      },
    ],
  };
}
function DataChart({
  title,
  description,
  labels,
  series,
  option,
  source = "census",
  unit = "",
}: {
  title: string;
  description: string;
  labels: string[];
  series: Series[];
  option: EChartsOption;
  source?: "census" | "region" | "survey" | "demo" | "model";
  unit?: string;
}) {
  const sourceText = {
    census: "NSO census 2021 · household source, not water safety",
    region: "NSO census 2021 · Table 4.10 · published rounded percentages",
    survey: "NSO / UNICEF MICS 2024–25 · weighted survey estimates",
    demo: "Synthetic Lucent demo · 2023–2025 · not company results",
    model:
      "Illustrative scenario · assumptions below · not measured unmet need",
  }[source];
  return (
    <div className="insight-chart">
      <Chart
        title={title}
        description={description}
        option={option}
        empty={!labels.length}
      />
      <div className="insight-chart-foot">
        <span
          className={`data-badge ${source === "demo" || source === "model" ? "is-demo" : ""}`}
        >
          {sourceText}
        </span>
        <details>
          <summary>View data table</summary>
          <div
            className="insight-table-scroll"
            tabIndex={0}
            role="region"
            aria-label={`${title} data table`}
          >
            <table>
              <caption>
                {title}
                {unit ? ` (${unit})` : ""}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Location / category</th>
                  {series.map((s) => (
                    <th scope="col" key={s.name}>
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label, i) => (
                  <tr key={`${label}-${i}`}>
                    <th scope="row">{label}</th>
                    {series.map((s) => (
                      <td key={s.name}>{number(s.values[i])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
function Metrics({
  items,
}: {
  items: { label: string; value: string; detail: string }[];
}) {
  return (
    <div className="insight-metrics">
      {items.map((i) => (
        <div key={i.label}>
          <span>{i.label}</span>
          <strong>{i.value}</strong>
          <small>{i.detail}</small>
        </div>
      ))}
    </div>
  );
}
function Downloads({ files }: { files: [string, string][] }) {
  return (
    <div className="insight-downloads">
      {files.map(([name, file]) => (
        <a key={file} href={`/data/${file}`} download>
          {name} CSV ↓
        </a>
      ))}
    </div>
  );
}

function NepalWater() {
  const [province, setProvince] = useState(0);
  const [districtId, setDistrictId] = useState(1);
  const [search, setSearch] = useState("");
  const districts = nepal.districts.filter(
    (d) =>
      (!province || d.province === province) &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const district = nepal.districts.find((d) => d.district === districtId)!;
  const localRows = nepal.locals.filter((r) => r.district === districtId);
  const sorted = [...districts].sort(
    (a, b) =>
      (b.sources[0] + b.sources[1]) / b.households -
      (a.sources[0] + a.sources[1]) / a.households,
  );
  const piped = (r: { sources: number[]; households: number }) =>
    ((r.sources[0] + r.sources[1]) / r.households) * 100;
  const provLabels = nepal.provinces.map((p) => p.name);
  const sourceSeries = nepal.sourceLabels.map((name, i) => ({
    name,
    values: nepal.provinces.map((p) => (p.sources[i] / p.households) * 100),
  }));
  const survey = nepal.survey.slice(1);
  const safety = [
    {
      name: "Safely managed (E. coli + arsenic ≤10 ppb)",
      values: survey.map((p) => p.safelyManaged),
    },
    {
      name: "E. coli-free improved source",
      values: survey.map((p) => p.ecoliFree),
    },
  ];
  const availability = [
    {
      name: "Available last month",
      values: survey.map((p) => p.availableMonth),
    },
    {
      name: "Available last 12 months",
      values: survey.map((p) => p.availableYear),
    },
  ];
  const districtSeries = [
    { name: "Tap/piped source", values: sorted.map(piped) },
  ];
  const regionSeries = nepal.regionLabels.map((name, i) => ({
    name,
    values: nepal.regions.map((r) => r.shares[i]),
  }));
  return (
    <>
      <div className="insight-intro">
        <span className="eyebrow">Official Nepal water evidence</span>
        <h2>Access is the starting point. Safety is a separate measure.</h2>
        <p>
          The 2021 census records household drinking-water sources. MICS 2024–25
          measures safety and availability at province level. These are
          different years, populations and methods; they are not a trend series.
        </p>
      </div>
      <Metrics
        items={[
          {
            label: "2021 population",
            value: number(nepal.national.population),
            detail: "Official census · planning baseline",
          },
          {
            label: "Households in source table",
            value: number(nepal.national.households),
            detail: "2021 · source-table denominator",
          },
          {
            label: "Districts / local levels",
            value: "77 / 753",
            detail: "All seven provinces covered",
          },
          {
            label: "Safely managed water",
            value: "47.3%",
            detail: "MICS WS.1.12S · arsenic ≤10 ppb",
          },
        ]}
      />
      <Downloads
        files={[
          ["Official water sources", "nepal-water-sources-2021.csv"],
          ["Official population", "nepal-population-2021.csv"],
          ["Official ecological regions", "nepal-regions-2021.csv"],
          [
            "Transcribed MICS province table",
            "nepal-mics-provinces-2024-25.csv",
          ],
        ]}
      />
      <div className="charts-grid">
        <DataChart
          title="Drinking-water sources by ecological region"
          description="Mountain, Hill and Tarai household source shares. Published percentages may not sum to exactly 100 because of rounding."
          labels={nepal.regions.map((r) => r.name)}
          series={regionSeries}
          option={bars(
            nepal.regions.map((r) => r.name),
            regionSeries,
            "%",
            true,
          )}
          source="region"
          unit="%"
        />
        <DataChart
          title="Drinking-water sources by province"
          description="Source composition of census households. A piped, bottled or covered-well source alone does not certify safe water."
          labels={provLabels}
          series={sourceSeries}
          option={bars(provLabels, sourceSeries, "%", true)}
          unit="%"
        />
        <DataChart
          title="Water safety by province"
          description="Safely managed requires an improved source on premises, available when needed, E. coli-free and arsenic ≤10 ppb. WS.1.12S, printed page 320."
          labels={provLabels}
          series={safety}
          option={bars(provLabels, safety, "%", false, true)}
          source="survey"
          unit="%"
        />
        <DataChart
          title="Year-round water availability"
          description="Share of household population with sufficient water when needed in the preceding month and 12 months. All sources; WS.1.5, printed page 304."
          labels={provLabels}
          series={availability}
          option={bars(provLabels, availability, "%", false, true)}
          source="survey"
          unit="%"
        />
        <DataChart
          title="Population by province"
          description="2021 census population, used as the baseline for the demand planner. This is not a current population projection."
          labels={provLabels}
          series={[
            {
              name: "People",
              values: nepal.provinces.map((p) => p.population),
            },
          ]}
          option={bars(
            provLabels,
            [
              {
                name: "People",
                values: nepal.provinces.map((p) => p.population),
              },
            ],
            "people",
            false,
            true,
          )}
          unit="people"
        />
        <DataChart
          title="Urban and rural water safety"
          description="Weighted survey shares of safely managed water and E. coli-free improved source water. The first includes arsenic ≤10 ppb."
          labels={nepal.residence.map((r) => r.name)}
          series={[
            {
              name: "Safely managed",
              values: nepal.residence.map((r) => r.safelyManaged),
            },
            {
              name: "E. coli-free source",
              values: nepal.residence.map((r) => r.ecoliFree),
            },
          ]}
          option={bars(
            nepal.residence.map((r) => r.name),
            [
              {
                name: "Safely managed",
                values: nepal.residence.map((r) => r.safelyManaged),
              },
              {
                name: "E. coli-free source",
                values: nepal.residence.map((r) => r.ecoliFree),
              },
            ],
            "%",
          )}
          source="survey"
          unit="%"
        />
      </div>
      <div className="insight-toolbar">
        <label>
          Province for district charts
          <select
            value={province}
            onChange={(e) => {
              const p = Number(e.target.value);
              setProvince(p);
              setDistrictId(
                nepal.districts.find((d) => !p || d.province === p)!.district,
              );
            }}
          >
            <option value={0}>All provinces</option>
            {nepal.provinces.map((p) => (
              <option value={p.province} key={p.province}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search districts
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kathmandu, Kaski, Jumla…"
          />
        </label>
        <label>
          District detail
          <select
            value={districtId}
            onChange={(e) => setDistrictId(Number(e.target.value))}
          >
            {nepal.districts
              .filter((d) => !province || d.province === province)
              .map((d) => (
                <option value={d.district} key={d.district}>
                  {d.name}
                </option>
              ))}
          </select>
        </label>
        <span>{districts.length} districts in comparison</span>
      </div>
      <div className="charts-grid">
        <DataChart
          title="Tap/piped sources by district"
          description="Share of census households using tap/piped water inside or outside premises. Scroll the chart to compare all matching districts. This measures source type, not safe water access."
          labels={sorted.map((d) => d.name)}
          series={districtSeries}
          option={bars(
            sorted.map((d) => d.name),
            districtSeries,
            "%",
            false,
            true,
          )}
          unit="%"
        />
        <DataChart
          title={`${district.name}: drinking-water source mix`}
          description={`${number(district.households)} census households; ${number(district.population)} people. Exact household counts across nine source categories.`}
          labels={nepal.sourceLabels}
          series={[{ name: "Households", values: district.sources }]}
          option={pie(nepal.sourceLabels, district.sources)}
          unit="households"
        />
        <DataChart
          title={`${district.name}: local-level source access`}
          description="Tap/piped household shares by municipality or rural municipality. Local labels follow the official source file."
          labels={localRows.map((r) => r.name)}
          series={[{ name: "Tap/piped source", values: localRows.map(piped) }]}
          option={bars(
            localRows.map((r) => r.name),
            [{ name: "Tap/piped source", values: localRows.map(piped) }],
            "%",
            false,
            true,
          )}
          unit="%"
        />
        <DataChart
          title="District household scale"
          description="Total census households for every matching district. Use the slider to explore the full comparison."
          labels={districts.map((d) => d.name)}
          series={[
            { name: "Households", values: districts.map((d) => d.households) },
          ]}
          option={bars(
            districts.map((d) => d.name),
            [
              {
                name: "Households",
                values: districts.map((d) => d.households),
              },
            ],
            "households",
            false,
            true,
          )}
          unit="households"
        />
      </div>
      <p className="insight-note">
        District water-safety estimates are not published in the tables used
        here. Province survey percentages are not copied onto districts.
        Ecological regions use their own official aggregate table; districts are
        not assigned to a single ecological belt.
      </p>
    </>
  );
}

function BusinessLoader() {
  const query = useQuery({
    queryKey: ["public-business-demo"],
    queryFn: async () => {
      const response = await fetch("/data/lucent-demo-summary.json");
      if (!response.ok) throw new Error("Unable to load demo data");
      return response.json() as Promise<typeof businessData>;
    },
    staleTime: Infinity,
  });
  if (query.isPending)
    return <p role="status">Loading the synthetic business dataset…</p>;
  if (query.isError)
    return (
      <div role="alert">
        Unable to load the demo dataset.{" "}
        <button className="text-link" onClick={() => query.refetch()}>
          Try again
        </button>
      </div>
    );
  return <BusinessDemo business={query.data} />;
}

function BusinessDemo({ business }: { business: typeof businessData }) {
  const [year, setYear] = useState("2025");
  const [province, setProvince] = useState(0);
  const filtered = useMemo(
    () => business.monthly.filter((r) => matchesPeriod(r, year, province)),
    [business, year, province],
  );
  const selected = <T extends { month: string; province: number }>(rows: T[]) =>
    rows.filter((r) => matchesPeriod(r, year, province));
  const months = [...new Set(filtered.map((r) => r.month))].sort();
  const totals = (key: keyof (typeof filtered)[number]) =>
    months.map((m) =>
      sum(
        filtered.filter((r) => r.month === m),
        (r) => Number(r[key]),
      ),
    );
  const revenue = sum(filtered, (r) => r.revenue),
    cost = sum(filtered, (r) => r.cost),
    orders = sum(filtered, (r) => r.orders);
  const dist = selected(business.distribution),
    marketing = selected(business.marketing),
    atm = selected(business.atm);
  const product = selected(business.productsMonthly),
    channel = selected(business.channelsMonthly);
  const provinceRows = nepal.provinces.filter(
    (p) => !province || p.province === province,
  );
  const districts = nepal.districts.filter(
    (d) => !province || d.province === province,
  );
  const districtRevenue = districts
    .map((d) => ({
      name: d.name,
      value:
        sum(
          filtered.filter((r) => r.district === d.district),
          (r) => r.revenue,
        ) / 1000000,
    }))
    .sort((a, b) => b.value - a.value);
  const funnel = [
    sum(marketing, (r) => r.leads),
    sum(marketing, (r) => r.qualified),
    sum(marketing, (r) => r.converted),
  ];
  const productValues = business.products.map(
    (_, i) =>
      sum(
        product.filter((r) => r.product === i),
        (r) => r.revenue,
      ) / 1000000,
  );
  const channelValues = business.channels.map(
    (_, i) =>
      sum(
        channel.filter((r) => r.channel === i),
        (r) => r.revenue,
      ) / 1000000,
  );
  const monthlyDistribution = (key: "shipments" | "delivered" | "onTime") =>
    months.map((m) =>
      sum(
        dist.filter((r) => r.month === m),
        (r) => r[key],
      ),
    );
  const monthlyAtm = (
    key: "dispensedLitres" | "downtimeHours" | "operatingHours",
  ) =>
    months.map((m) =>
      sum(
        atm.filter((r) => r.month === m),
        (r) => r[key],
      ),
    );
  const chart = (
    title: string,
    description: string,
    labels: string[],
    series: Series[],
    option: EChartsOption,
    unit: string,
  ) => (
    <DataChart
      key={title}
      {...{ title, description, labels, series, option, unit }}
      source="demo"
    />
  );
  const revenueSeries = [
    { name: "Revenue", values: totals("revenue").map((n) => n / 1000000) },
    {
      name: "Gross profit",
      values: months.map(
        (m) =>
          sum(
            filtered.filter((r) => r.month === m),
            (r) => r.revenue - r.cost,
          ) / 1000000,
      ),
    },
  ];
  const orderSeries = [
    { name: "Orders", values: totals("orders") },
    { name: "Repeat orders", values: totals("repeatOrders") },
  ];
  const annualLabels = ["2023", "2024", "2025"];
  const annualValues = annualLabels.map(
    (y) =>
      sum(
        business.monthly.filter((r) => matchesPeriod(r, y, province)),
        (r) => r.revenue,
      ) / 1000000,
  );
  return (
    <>
      <div className="insight-intro">
        <span className="eyebrow">Lucent business demonstration</span>
        <h2>Explore a growing water business.</h2>
        <p>
          Every figure here is synthetic, generated with a fixed seed for
          realistic dashboard exploration. These are fictional transactions and
          operations, not Lucent Drop Nepal’s revenue, customers or installed
          systems.
        </p>
      </div>
      <div className="notice">
        Synthetic dataset · {number(manifest.syntheticRows)} records · January
        2023–December 2025 · seed {business.seed}. Revenue excludes tax; gross
        profit is revenue minus modeled product cost, before marketing and
        overhead.
      </div>
      <div className="insight-toolbar">
        <label>
          Business year
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All three years</option>
            {annualLabels.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label>
          Business province
          <select
            value={province}
            onChange={(e) => setProvince(Number(e.target.value))}
          >
            <option value={0}>All provinces</option>
            {nepal.provinces.map((p) => (
              <option key={p.province} value={p.province}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Metrics
        items={[
          {
            label: "Demo revenue",
            value: money(revenue),
            detail: `${year === "all" ? "2023–2025" : year} · selected geography`,
          },
          {
            label: "Demo gross margin",
            value: `${number(((revenue - cost) / revenue) * 100)}%`,
            detail: "Before marketing and overhead",
          },
          {
            label: "Demo sales orders",
            value: number(orders),
            detail: "Matches the downloadable order ledger",
          },
          {
            label: "Demo delivery rate",
            value: `${number((sum(dist, (r) => r.delivered) / sum(dist, (r) => r.shipments)) * 100)}%`,
            detail: "Delivered shipments / all shipments",
          },
        ]}
      />
      <Downloads
        files={[
          ["32,892 demo orders", "lucent-demo-orders.csv"],
          ["2,310 demo customers", "lucent-demo-customers.csv"],
          ["Marketing", "lucent-demo-marketing.csv"],
          ["Distribution & service", "lucent-demo-distribution-service.csv"],
          ["Water ATM operations", "lucent-demo-water-atm.csv"],
        ]}
      />
      <div className="charts-grid">
        {chart(
          "Revenue and gross profit",
          "Monthly sales revenue and product gross profit. NPR millions.",
          months,
          revenueSeries,
          lines(months, revenueSeries, "NPR m"),
          "NPR m",
        )}
        {chart(
          "Company revenue growth",
          "Full-year comparison across all three demo years for the selected province. This chart intentionally keeps all years visible.",
          annualLabels,
          [{ name: "Revenue", values: annualValues }],
          bars(
            annualLabels,
            [{ name: "Revenue", values: annualValues }],
            "NPR m",
          ),
          "NPR m",
        )}
        {chart(
          "Sales and customer retention",
          "Repeat orders follow an earlier order by the same synthetic customer ID; they are a subset of total orders.",
          months,
          orderSeries,
          lines(months, orderSeries, "orders"),
          "orders",
        )}
        {chart(
          "Revenue by product",
          "Contribution of six fictional product and maintenance categories.",
          business.products,
          [{ name: "Revenue", values: productValues }],
          pie(business.products, productValues),
          "NPR m",
        )}
        {chart(
          "Sales channel mix",
          "Revenue by direct sales, dealer network, website and institutional sales.",
          business.channels,
          [{ name: "Revenue", values: channelValues }],
          bars(
            business.channels,
            [{ name: "Revenue", values: channelValues }],
            "NPR m",
          ),
          "NPR m",
        )}
        {chart(
          "Distribution of sales by province",
          "Sales revenue for the selected year and geography.",
          provinceRows.map((p) => p.name),
          [
            {
              name: "Revenue",
              values: provinceRows.map(
                (p) =>
                  sum(
                    filtered.filter((r) => r.province === p.province),
                    (r) => r.revenue,
                  ) / 1000000,
              ),
            },
          ],
          bars(
            provinceRows.map((p) => p.name),
            [
              {
                name: "Revenue",
                values: provinceRows.map(
                  (p) =>
                    sum(
                      filtered.filter((r) => r.province === p.province),
                      (r) => r.revenue,
                    ) / 1000000,
                ),
              },
            ],
            "NPR m",
            false,
            true,
          ),
          "NPR m",
        )}
        {chart(
          "District sales distribution",
          "All matching districts ranked by revenue. Scroll to explore the complete district comparison.",
          districtRevenue.map((d) => d.name),
          [{ name: "Revenue", values: districtRevenue.map((d) => d.value) }],
          bars(
            districtRevenue.map((d) => d.name),
            [{ name: "Revenue", values: districtRevenue.map((d) => d.value) }],
            "NPR m",
            false,
            true,
          ),
          "NPR m",
        )}
        {chart(
          "Marketing lead funnel",
          "Campaign-generated leads, qualified leads and converted leads. These are a separate fictional campaign cohort, not the entire sales ledger.",
          ["Leads", "Qualified", "Converted"],
          [{ name: "People", values: funnel }],
          {
            color: colours,
            tooltip: { trigger: "item" },
            series: [
              {
                type: "funnel",
                left: "20%",
                width: "60%",
                top: 20,
                bottom: 20,
                data: ["Leads", "Qualified", "Converted"].map((name, i) => ({
                  name,
                  value: funnel[i],
                })),
                label: { position: "inside" },
              },
            ],
          },
          "leads",
        )}
        {chart(
          "Marketing cost per converted lead",
          "Campaign spend divided by converted leads for each channel. This is not company-wide customer acquisition cost.",
          business.channels,
          [
            {
              name: "Cost per converted lead",
              values: business.channels.map(
                (c) =>
                  sum(
                    marketing.filter((r) => r.channel === c),
                    (r) => r.spendNpr,
                  ) /
                  sum(
                    marketing.filter((r) => r.channel === c),
                    (r) => r.converted,
                  ),
              ),
            },
          ],
          bars(
            business.channels,
            [
              {
                name: "Cost per converted lead",
                values: business.channels.map(
                  (c) =>
                    sum(
                      marketing.filter((r) => r.channel === c),
                      (r) => r.spendNpr,
                    ) /
                    sum(
                      marketing.filter((r) => r.channel === c),
                      (r) => r.converted,
                    ),
                ),
              },
            ],
            "NPR",
          ),
          "NPR",
        )}
        {chart(
          "Delivery performance",
          "Delivered and on-time shipments are subsets of all shipments; do not add these lines together.",
          months,
          [
            { name: "Shipments", values: monthlyDistribution("shipments") },
            { name: "Delivered", values: monthlyDistribution("delivered") },
            { name: "On time", values: monthlyDistribution("onTime") },
          ],
          lines(
            months,
            [
              { name: "Shipments", values: monthlyDistribution("shipments") },
              { name: "Delivered", values: monthlyDistribution("delivered") },
              { name: "On time", values: monthlyDistribution("onTime") },
            ],
            "shipments",
          ),
          "shipments",
        )}
        {chart(
          "Installation growth",
          "Cumulative units sold in installation categories during the selected period. Assumes each unit is installed; not verified commissioning records.",
          months,
          [
            {
              name: "Modeled installations",
              values: totals("installations").map((_, i) =>
                sum(
                  filtered.filter((r) => r.month <= months[i]),
                  (r) => r.installations,
                ),
              ),
            },
          ],
          lines(
            months,
            [
              {
                name: "Modeled installations",
                values: totals("installations").map((_, i) =>
                  sum(
                    filtered.filter((r) => r.month <= months[i]),
                    (r) => r.installations,
                  ),
                ),
              },
            ],
            "units",
          ),
          "units",
        )}
        {chart(
          "After-sales service resolution",
          "Resolved tickets are a subset of tickets created in each fictional monthly cohort.",
          months,
          [
            {
              name: "Tickets",
              values: months.map((m) =>
                sum(
                  dist.filter((r) => r.month === m),
                  (r) => r.serviceTickets,
                ),
              ),
            },
            {
              name: "Resolved",
              values: months.map((m) =>
                sum(
                  dist.filter((r) => r.month === m),
                  (r) => r.resolved,
                ),
              ),
            },
          ],
          bars(
            months,
            [
              {
                name: "Tickets",
                values: months.map((m) =>
                  sum(
                    dist.filter((r) => r.month === m),
                    (r) => r.serviceTickets,
                  ),
                ),
              },
              {
                name: "Resolved",
                values: months.map((m) =>
                  sum(
                    dist.filter((r) => r.month === m),
                    (r) => r.resolved,
                  ),
                ),
              },
            ],
            "tickets",
          ),
          "tickets",
        )}
        {chart(
          "Water ATM dispensing",
          "Fictional station dispensing totals. These stations are not an inventory of real Nepal Water ATMs.",
          months,
          [
            {
              name: "Dispensed",
              values: monthlyAtm("dispensedLitres").map((n) => n / 1000),
            },
          ],
          lines(
            months,
            [
              {
                name: "Dispensed",
                values: monthlyAtm("dispensedLitres").map((n) => n / 1000),
              },
            ],
            "kL",
          ),
          "kL",
        )}
        {chart(
          "Water ATM operational uptime",
          "Total modeled operating hours minus downtime, divided by operating hours; weighted across stations.",
          months,
          [
            {
              name: "Uptime",
              values: monthlyAtm("operatingHours").map(
                (n, i) => ((n - monthlyAtm("downtimeHours")[i]) / n) * 100,
              ),
            },
          ],
          lines(
            months,
            [
              {
                name: "Uptime",
                values: monthlyAtm("operatingHours").map(
                  (n, i) => ((n - monthlyAtm("downtimeHours")[i]) / n) * 100,
                ),
              },
            ],
            "%",
          ),
          "%",
        )}
      </div>
    </>
  );
}

function Planner() {
  const [province, setProvince] = useState(0),
    [litres, setLitres] = useState(3),
    [coverage, setCoverage] = useState(10),
    [capacity, setCapacity] = useState(2000),
    [uptime, setUptime] = useState(90);
  const districts = nepal.districts.filter(
    (d) => !province || d.province === province,
  );
  const calculate = (population: number) =>
    planWater({
      population,
      litresPerPerson: litres,
      coveragePercent: coverage,
      stationCapacity: capacity,
      uptimePercent: uptime,
    });
  const total = calculate(sum(districts, (d) => d.population));
  const ps = nepal.provinces.filter(
    (p) => !province || p.province === province,
  );
  const districtDemand = districts
    .map((d) => ({ name: d.name, ...calculate(d.population) }))
    .sort((a, b) => b.targetLitres - a.targetLitres);
  const ss = [
    {
      name: "Scenario target demand",
      values: ps.map((p) => calculate(p.population).targetLitres / 1000000),
    },
  ];
  return (
    <>
      <div className="insight-intro">
        <span className="eyebrow">Demand and Water ATM planning</span>
        <h2>Turn assumptions into a transparent scenario.</h2>
        <p>
          Use official 2021 population as a baseline and choose drinking-only
          volume, service coverage and station capacity. This estimates
          consumption under your assumptions; it does not measure Nepal’s unmet
          water requirement or identify viable Water ATM locations.
        </p>
      </div>
      <div className="insight-toolbar planner-controls">
        <label>
          Planning province
          <select
            value={province}
            onChange={(e) => setProvince(Number(e.target.value))}
          >
            <option value={0}>All provinces</option>
            {nepal.provinces.map((p) => (
              <option value={p.province} key={p.province}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Drinking litres / person / day: {litres}
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={litres}
            onChange={(e) => setLitres(Number(e.target.value))}
          />
        </label>
        <label>
          Target coverage: {coverage}%
          <input
            type="range"
            min={1}
            max={100}
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
          />
        </label>
        <label>
          Station capacity (litres / day)
          <input
            type="number"
            min={100}
            max={50000}
            step={100}
            value={capacity}
            onChange={(e) =>
              setCapacity(
                Math.min(50000, Math.max(100, Number(e.target.value))),
              )
            }
          />
        </label>
        <label>
          Assumed uptime: {uptime}%
          <input
            type="range"
            min={50}
            max={100}
            value={uptime}
            onChange={(e) => setUptime(Number(e.target.value))}
          />
        </label>
      </div>
      <Metrics
        items={[
          {
            label: "Modeled total consumption",
            value: `${number(total.totalLitres / 1000000)} ML/day`,
            detail: "Population × litres per person",
          },
          {
            label: "Target service volume",
            value: `${number(total.targetLitres / 1000000)} ML/day`,
            detail: "Consumption × target coverage",
          },
          {
            label: "Pooled capacity equivalent",
            value: number(total.stations),
            detail: "Ceiling(target volume / effective station capacity)",
          },
          {
            label: "Baseline",
            value: "2021",
            detail: "No population growth forecast applied",
          },
        ]}
      />
      <div className="charts-grid">
        <DataChart
          title="Modeled demand by province"
          description="Target drinking-only volume using the selected coverage. ML = one million litres. Inputs are illustrative, not a government requirement standard."
          labels={ps.map((p) => p.name)}
          series={ss}
          option={bars(
            ps.map((p) => p.name),
            ss,
            "ML/day",
            false,
            true,
          )}
          source="model"
          unit="ML/day"
        />
        <DataChart
          title="Modeled demand by ecological region"
          description="National Mountain, Hill and Tarai scenarios using official 2021 region populations (NSO Table 3.1). Uses the consumption and coverage controls; the province filter does not apply to this national region comparison."
          labels={nepal.regions.map((r) => r.name)}
          series={[
            {
              name: "Target volume",
              values: nepal.regions.map(
                (r) => calculate(r.population).targetLitres / 1000000,
              ),
            },
          ]}
          option={bars(
            nepal.regions.map((r) => r.name),
            [
              {
                name: "Target volume",
                values: nepal.regions.map(
                  (r) => calculate(r.population).targetLitres / 1000000,
                ),
              },
            ],
            "ML/day",
          )}
          source="model"
          unit="ML/day"
        />
        <DataChart
          title="Modeled demand by district"
          description="All selected districts use the same visible assumptions. Scroll to explore the complete list."
          labels={districtDemand.map((d) => d.name)}
          series={[
            {
              name: "Target volume",
              values: districtDemand.map((d) => d.targetLitres / 1000),
            },
          ]}
          option={bars(
            districtDemand.map((d) => d.name),
            [
              {
                name: "Target volume",
                values: districtDemand.map((d) => d.targetLitres / 1000),
              },
            ],
            "kL/day",
            false,
            true,
          )}
          source="model"
          unit="kL/day"
        />
        <DataChart
          title="Station capacity equivalents by province"
          description="Each province is rounded up independently, so the sum can exceed the pooled national equivalent. Not a deployment recommendation."
          labels={ps.map((p) => p.name)}
          series={[
            {
              name: "Capacity equivalents",
              values: ps.map((p) => calculate(p.population).stations),
            },
          ]}
          option={bars(
            ps.map((p) => p.name),
            [
              {
                name: "Capacity equivalents",
                values: ps.map((p) => calculate(p.population).stations),
              },
            ],
            "stations",
            false,
            true,
          )}
          source="model"
          unit="stations"
        />
      </div>
      <div className="insight-method">
        <h3>What is needed before a real Water ATM rollout?</h3>
        <p>
          Validate local water quality, current providers, affordability,
          footfall, collection distances, source yield, electricity, treatment
          recovery, maintenance and regulatory permissions. A capacity
          calculation alone cannot establish demand or safety.
        </p>
        <p>
          No comprehensive, verified national or district Water ATM inventory
          was found in the sources reviewed for this dashboard. Operational
          station counts and volumes appear only in the labelled Lucent demo.
          Real deployment data can be connected later.
        </p>
        <p>
          Formula: population × drinking litres/person/day × coverage ÷ (station
          litres/day × uptime). Coverage is a chosen scenario and is not derived
          from the MICS unsafe-water share.
        </p>
      </div>
    </>
  );
}

function Sources() {
  return (
    <div className="insight-sources">
      <span className="eyebrow">Evidence and transparency</span>
      <h2>Where every number comes from</h2>
      <article>
        <h3>National Population and Housing Census 2021</h3>
        <p>
          National Statistics Office, Nepal. Household source CSV and
          population-by-sex CSV: national, province, district and local levels.
          English province names use current names; the original CSV retains the
          original labels.
        </p>
        <a href={censusUrl} target="_blank" rel="noreferrer">
          Open official census dataset catalogue ↗
        </a>
        <p>
          The source table contains 6,660,841 households; the population table
          reports a different household total. Source-share calculations use the
          source table denominator. Counts are aggregated before percentages are
          calculated.
        </p>
        <p>
          The bundled local-level population rows sum to 28,925,480, below the
          published district/national total of 29,164,578. We preserve those
          source values. Demand planning uses official district aggregates, not
          reconstructed local totals.
        </p>
      </article>
      <article>
        <h3>Ecological regions: Housing and Household Dynamics</h3>
        <p>
          NSO census thematic report, Table 4.10, printed page 53 (PDF page
          112). Mountain, Hill and Tarai source shares are the published
          one-decimal percentages. Tap/piped categories are combined in this
          table. Rounding can leave totals slightly above or below 100%.
        </p>
        <p>
          Region population totals are from Table 3.1, printed page 31 (PDF page
          90), in the same NSO report. They reconcile to the national population
          and provide the demand scenario baseline.
        </p>
        <a href={reportUrl} target="_blank" rel="noreferrer">
          Open official household report ↗
        </a>
      </article>
      <article>
        <h3>Nepal Multiple Indicator Cluster Survey 2024–25</h3>
        <p>
          NSO and UNICEF, published February 2026. Water availability: WS.1.5,
          printed page 304. Safety: WS.1.12S, printed page 320. These are
          weighted household-population survey estimates, not census counts.
        </p>
        <a href={surveyUrl} target="_blank" rel="noreferrer">
          Open UNICEF report and full tables ↗
        </a>
        <p>
          Our safely managed metric includes E. coli-free water and arsenic ≤10
          ppb, on-premises improved source and availability. Its national
          estimate is 47.3%. The report’s separate E. coli-only indicator uses a
          different sample and reports 47.5%; those indicators are not
          interchangeable. Province estimates must not be treated as district
          observations.
        </p>
      </article>
      <article>
        <h3>Lucent synthetic business data</h3>
        <p>
          {number(manifest.syntheticRows)} fictional records generated using
          seed 20261002. 2,310 customers, 32,892 orders, 2,772
          distribution/service records, 1,008 campaign records and 2,772
          station-operation records. Dates cover January 2023–December 2025.
        </p>
        <p>
          Order revenue, cost, products, channels and repeats reconcile with the
          charts. Marketing is a separate campaign cohort. Station sites and
          sales installation assumptions are separate demo models. No real
          customer contacts or confidential business data are included.
        </p>
      </article>
      <article>
        <h3>Demand scenario</h3>
        <p>
          Official 2021 population multiplied by user-selected consumption and
          coverage. Drinking-only volume is not total domestic water demand.
          Capacity excludes location, affordability, treatment loss and
          peak-hour constraints. All input defaults are illustrative
          assumptions.
        </p>
      </article>
      <p className="insight-note">
        Sources retrieved October 2, 2026. This is a bundled historical
        snapshot, not a live feed. Data and charts work without API credentials.
        The current demo downloads are intentionally public; actual company
        records should use authenticated, server-enforced access.
      </p>
    </div>
  );
}

export function InsightsExplorer() {
  const [tab, setTab] = useState("water");
  return (
    <section className="container section insights-explorer">
      <div
        className="insight-tabs"
        role="tablist"
        aria-label="Insights sections"
      >
        {[
          ["water", "Nepal water"],
          ["business", "Lucent business demo"],
          ["planner", "Demand planner"],
          ["sources", "Sources & methods"],
        ].map(([id, name]) => (
          <button
            id={`insight-tab-${id}`}
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls="insight-panel"
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(event) => {
              const tabs = ["water", "business", "planner", "sources"];
              const index = tabs.indexOf(id);
              const next =
                event.key === "ArrowRight"
                  ? tabs[(index + 1) % tabs.length]
                  : event.key === "ArrowLeft"
                    ? tabs[(index + tabs.length - 1) % tabs.length]
                    : event.key === "Home"
                      ? tabs[0]
                      : event.key === "End"
                        ? tabs[tabs.length - 1]
                        : null;
              if (next) {
                event.preventDefault();
                setTab(next);
                document.getElementById(`insight-tab-${next}`)?.focus();
              }
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        id="insight-panel"
        role="tabpanel"
        aria-labelledby={`insight-tab-${tab}`}
        tabIndex={0}
      >
        {tab === "water" ? (
          <NepalWater />
        ) : tab === "business" ? (
          <BusinessLoader />
        ) : tab === "planner" ? (
          <Planner />
        ) : (
          <Sources />
        )}
      </div>
    </section>
  );
}
